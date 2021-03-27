const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { spawn } = require("child_process")

const NPM_KEY = 'NPM';
const GULP_KEY = 'gulp';

class TaskLoader {

    constructor(key, config, globalConfig) {

        this.key = key;
        this.glob = config.glob;
        this.enable = config.enable;
        this.excludesGlob = config.excludesGlob;

        this.taskList = [];

        //是否查找子目录
        if (globalConfig.searchTaskFileInSubdirectories === true) {
            if (this.glob.indexOf("**/") !== 0) {
                this.glob = "**/" + this.glob;
            }
        }

    }

    async loadTask(callback) {

        const foundList = await vscode.workspace.findFiles(this.glob, this.excludesGlob);
        return this.parseTasksFromFile(foundList, callback)
    }

    runTask(item, callback) {

        const { cmdLine, filePath } = item;

        const options = {
            cwd: path.dirname(filePath),
            detached: true
        }

        //运行bat文件或执行命令 ['npm', 'run', 'dev']
        const subProcess = spawn(this.platformShell(cmdLine[0]), cmdLine.slice(1), options);

        //出现错误结束子进程
        subProcess.stderr.on('data', (data) => {
            this.killSubProcess(subProcess);
            typeof callback === 'function' && callback();
        });
        //保护
        subProcess.on('close', () => {
            this.killSubProcess(subProcess);
            typeof callback === 'function' && callback();
        });


    }

    parseTasksFromFile(fileList, callback) {

        let packageScripts = [];

        if (!Array.isArray(fileList) || fileList.length === 0) {
            return [];
        }

        for (let item of fileList) {
            let fsPath = item.fsPath;
            if (this.pathExists(fsPath)) {
                this.handleFunc(fsPath)
            }
        }

        callback(this.taskList)
    }

    handleFunc() { }

    pathExists(p) {
        try {
            fs.accessSync(p);
        } catch (err) {
            return false;
        }
        return true;
    }

    platformShell(v) {
        return process.platform === "win32" ? (v + ".cmd") : v;
    }

    killSubProcess(subprocess) {
        if (!subprocess.killed) {
            console.log('kill :', subprocess.pid);
            subprocess.kill();
        }
    }
}





module.exports = TaskLoader

