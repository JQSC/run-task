const vscode = require('vscode');
const path = require('path');
const runningIcon = path.join(__dirname, '..', '..', 'resources', 'running.svg');

class Views {

    constructor(data) {
        this.changeTreeDataEmitter = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.changeTreeDataEmitter.event;

        this.treeData = data || [];
    }

    getTreeItem(element) {
        if (element.children) {
            return new ViewsItemTitle(element);
        } else {
            return new ViewsItemContent(element);
        }
    }

    // 获取子节点
    getChildren(element) {
        if (!element) {
            return this.treeData;
        } else {
            return element.children;
        }
    }

    refresh() {
        this.sortForClicks();

        this.changeTreeDataEmitter.fire(undefined);
    }

    sortForClicks() {
        for (let workspace of this.treeData) {
            workspace.children.sort((a, b) => {
                let res = parseInt(b.clicks || 0) - parseInt(a.clicks || 0);
                return res
            })
        }
    }
}


class ViewsItemTitle extends vscode.TreeItem {
    constructor(item) {
        const { name, description, children } = item;
        super(name);
        // this.description = description;
        this.contextValue = 'title';
        this.description = '';
        this.tooltip = description
        this.collapsibleState = (name === vscode.workspace.name ? 2 : 1);
        //name === vscode.workspace.name ? 1 : 0
    };

}

class ViewsItemContent extends vscode.TreeItem {
    constructor(item) {
        const { cmdLineDesc, filePath, fileName, active, iconPath } = item;
        super(cmdLineDesc);
        this.contextValue = active ? 'running' : 'unstart';
        this.iconPath = iconPath;//active ? runningIcon : '';
        this.description = active ?'RUNNING':fileName;
        this.tooltip = filePath

    };

}

module.exports = Views;