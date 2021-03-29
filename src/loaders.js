const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const TaskLoader = require('./taskLoader');
const { NPM_KEY, GULP_KEY, SCRIPT_KEY } = require('./shared/loaderConfig')
const npmIcon = path.join(__dirname, '..', 'resources', 'icons', 'file_type_npm.svg');
const gulpIcon = path.join(__dirname, '..', 'resources', 'icons', 'file_type_gulp.svg');
const shellIcon = path.join(__dirname, '..', 'resources', 'icons', 'file_type_shell.svg');

let index = 0

function generateItem(type, filePath, cmdLine, description, iconPath) {
    const uid = Date.now() + '-' + index;
    const cmdLineDesc = cmdLine.join(' ');
    index++
    return {
        key: type,
        uid,
        cmdLine,
        cmdLineDesc,
        description,
        filePath,
        iconPath,
        fileName: path.basename(filePath),
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
                const task = generateItem(NPM_KEY, fsPath, cmdLine, cmdDesc, npmIcon);
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
                const task = generateItem(GULP_KEY, fsPath, cmdLine, cmdLine, gulpIcon);
                this.taskList.push(task);
            }
        }
        catch (e) {
            console.error("Invalid gulp file :" + e.message);
        }
    }

}

class ScriptLoader extends TaskLoader {

    constructor(globalConfig) {

        super(SCRIPT_KEY, {
            glob: '*.{bat,py,sh}',
            enable: true,
            excludesGlob: globalConfig.excludesGlob
        }, globalConfig)

    }

    handleFunc(fsPath) {
        try {
            const cmdLine = [path.basename(fsPath)];
            const task = generateItem(SCRIPT_KEY, fsPath, cmdLine, cmdLine, shellIcon);
            this.taskList.push(task);

        }
        catch (e) {
            console.error("Invalid gulp file :" + e.message);
        }
    }

}


module.exports = {
    NpmLoader,
    GulpLoader,
    ScriptLoader
}

