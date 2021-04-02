const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { spawn, exec, execSync, execFile } = require("child_process")
const { NPM_KEY, GULP_KEY, SCRIPT_KEY } = require('./shared/loaderConfig')

class TaskLoader {

    constructor(key, config, globalConfig) {

        this.key = key;
        this.glob = config.glob;
        this.enable = config.enable;
        this.excludesGlob = config.excludesGlob;

        this.taskList = [];

        this.procession = new Set();

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


    runTerminal(item, callback) {

        const { cmdLineDesc, filePath, uid } = item;

        const dirname = path.dirname(filePath)

        const terminal = vscode.window.createTerminal({
            name: uid
        });

        terminal.show();

        terminal.sendText(`cd "${dirname}"`);

        terminal.sendText(cmdLineDesc);

        item.process = terminal;
        this.procession.add(item);

    }

    runTask(item, callback) {

        const { cmdLine, filePath } = item;

        const options = {
            cwd: path.dirname(filePath),
            detached: true,
            shell: true//process.env.ComSpec
        }

        //执行文件或执行系统命令 ['npm', 'run', 'dev']
        const command = (item.key === SCRIPT_KEY) ? cmdLine[0] : this.platformShell(cmdLine[0]);

        const subProcess = spawn(command, cmdLine.slice(1), options);

        item.process = subProcess;
        this.procession.add(item);

        //出现错误结束子进程
        subProcess.stderr.on('data', (data) => {
            console.log('data: ');
            this.killSubProcess(subProcess);
            typeof callback === 'function' && callback();
        });

        //保护
        subProcess.on('close', () => {
            console.log('close: ');
            this.killSubProcess(subProcess);
            typeof callback === 'function' && callback();
        });

    }

    stopTask(tree) {
        for (let item of this.procession) {
            if (item.key === tree.key) {
                this.killSubProcess(item.process);
                //item.process.dispose();
            }
        }

    }

    parseTasksFromFile(fileList, callback) {

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

    handleFunc(filePath) { console.log(filePath) }

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


    processIsExist(pid) {
        const checkTaskCmd = 'tasklist|findstr ' + pid;
        let isExist;
        try {
            isExist = execSync(checkTaskCmd);

        } catch (e) { }
        return !!isExist
    }

    killSubProcess(subprocess) {
        if (!subprocess.killed) {
            console.log('kill :', subprocess.pid);
            subprocess.kill();
        }
    }
}





module.exports = TaskLoader

