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





module.exports = {
    NpmLoader
}

