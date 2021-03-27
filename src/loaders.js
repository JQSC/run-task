const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const TaskLoader = require('./TaskLoader')
const { spawn } = require("child_process")

const NPM_KEY = 'NPM';
const GULP_KEY = 'gulp';

function generateItem(type, fsPath, cmdLine, description) {
    const uid = Date.now();
    const cmdLineDesc = cmdLine.join(' ');
    return {
        key: type,
        uid,
        cmdLine,
        cmdLineDesc,
        description,
        filePath: fsPath,
        fileName: path.basename(fsPath),
    }
}

class NpmLoader extends TaskLoader {

    constructor(globalConfig) {

        super(NPM_KEY, {
            glob: globalConfig.npmGlob,
            enable: globalConfig.enableNpm,
            excludesGlob: globalConfig.excludesGlob
        }, globalConfig)

    }

    handleFunc(fsPath) {
        const file = JSON.parse(fs.readFileSync(fsPath, 'utf-8'));

        if (typeof file.scripts === "object") {
            for (let key of Object.keys(file.scripts)) {
                const cmdLine = ['npm', 'run', key];
                const cmdDesc = file.scripts[key];
                const task = generateItem(NPM_KEY, fsPath, cmdLine, cmdDesc);
                this.taskList.push(task);
            }
        }
    }

}

//gulp.task('scripts', function() {})
class GulpLoader extends TaskLoader {

    constructor(globalConfig) {

        super(GULP_KEY, {
            glob: globalConfig.gulpGlob,
            enable: globalConfig.enableGulp,
            excludesGlob: globalConfig.excludesGlob
        }, globalConfig)

    }

    handleFunc(fsPath) {
        const regexpMatcher = /gulp\.task\([\'\"][^\'\"]*[\'\"]/gi;
        const regexpReplacer = /gulp\.task\([\'\"]([^\'\"]*)[\'\"]/;

        try {
            const fileText = fs.readFileSync(fsPath, 'utf-8');

            for (let item of fileText.match(regexpMatcher)) {
                const cmdLine = ['gulp', item.replace(regexpReplacer, "$1")];
                const task = generateItem(GULP_KEY, fsPath, cmdLine, cmdLine);
                this.taskList.push(task);
            }
        }
        catch (e) {
            console.error("Invalid gulp file :" + e.message);
        }
    }

}



module.exports = {
    NpmLoader,
    GulpLoader
}

