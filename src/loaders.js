const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { spawn } = require("child_process")

const NPM_KEY = 'NPM';
const GULP_KEY = 'gulp';

class NpmLoader {

    constructor(globalConfig) {

        this.key = NPM_KEY;
        this.glob = globalConfig.npmGlob;
        this.enable = globalConfig.enableNpm;
        this.excludesGlob = globalConfig.excludesGlob;

        //是否查找子目录
        if (globalConfig.searchTaskFileInSubdirectories === true) {
            if (this.glob.indexOf("**/") !== 0) {
                this.glob = "**/" + this.glob;
            }
        }

    }

    async loadTask() {

        const foundList = await vscode.workspace.findFiles(this.glob, this.excludesGlob);
        return this.parseTasksFromFile(foundList)
    }

    runTask(item, callback) {

        const { cmdLineFormat, filePath } = item;

        const options = {
            cwd: path.dirname(filePath),
            detached: true
        }

        //运行bat文件或执行命令 ['npm', 'run', 'dev']
        const subProcess = spawn(this.platformShell(cmdLineFormat[0]), cmdLineFormat.slice(1), options);

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

    parseTasksFromFile(fileList) {

        let packageScripts = [];

        if (!Array.isArray(fileList) || fileList.length === 0) {
            return [];
        }

        for (let item of fileList) {
            let packageJsonPath = item.fsPath;
            if (this.pathExists(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                const scripts = packageJson.scripts ?
                    Object.keys(packageJson.scripts).map((key, index) => {
                        return {
                            key: this.key,
                            id: vscode.workspace.name + index,
                            cmdLine: 'npm run ' + key,
                            cmdLineFormat: ['npm', 'run', key],
                            cmdLineDesc: packageJson.scripts[key],
                            filePath: packageJsonPath,
                            fileName: path.basename(item.fsPath),
                        }
                    })
                    : [];
                packageScripts = packageScripts.concat(scripts);
            }
        }
        return packageScripts
    }

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





module.exports = {
    NpmLoader
}

