const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

class NpmLoader {

    constructor(globalConfig) {

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
                            id: 'npm' + index,
                            name: 'npm run ' + key,
                            description: 'package.json',
                            tooltip: packageJson.scripts[key]
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

    runTask() { }


}


module.exports = {
    NpmLoader
}

