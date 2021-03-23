const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const View = require('./Views');
class ViewsContainers {

    constructor(context) {
        this.workspaceName = vscode.workspace.name;
        this.workspaceRoot = vscode.workspace.rootPath;

        this.treeData = [
            this.getWorkspaceScript()
        ];

        this.working = new View(this.treeData);
        this.deprecated = new View();

    }

    getWorkspaceScript() {
        const workspaceScript = {
            name: this.workspaceName,
            description: this.workspaceRoot,
            children: []
        };

        const packageScripts = this.getPackageScripts();

        workspaceScript.children = packageJsonPath;

        return workspaceScript;
    }


    getPackageScripts() {
        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');

        if (this.pathExists(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const scripts = packageJson.scripts ?
                Object.keys(packageJson.scripts).map((key, index) => {
                    return {
                        id: this.workspaceName + index,
                        name: 'npm run ' + key,
                        description: 'package.json',
                        tooltip: packageJson.scripts[key]
                    }
                })
                : [];
            return scripts
        }
        return []
    }

    getBat(){}

    pathExists(p) {
        try {
            fs.accessSync(p);
        } catch (err) {
            return false;
        }
        return true;
    }


    run(item) {
        let tree = this._find(item);
        tree.active = true;
        this.working.refresh();
    }

    restart(item) {

    }


    stop(item) {
        let tree = this._find(item);
        tree.active = false;
        this.working.refresh();
    }

    _find(item) {
        for (let trees of this.treeData) {
            for (let tree of trees.children) {
                if (tree.id === item.id) {
                    return tree
                }
            }
        }
    }
}



module.exports = ViewsContainers;