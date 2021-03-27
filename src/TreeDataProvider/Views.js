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
        this.changeTreeDataEmitter.fire(undefined);
    }
}


class ViewsItemTitle extends vscode.TreeItem {
    constructor(item) {
        const { name, description, children } = item;
        super(name);
        // this.description = description;
        this.contextValue = 'title';
        this.tooltip = description
        this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
    };

}

class ViewsItemContent extends vscode.TreeItem {
    constructor(item) {
        const { cmdLineDesc, filePath, fileName, active } = item;
        super(cmdLineDesc);
        this.contextValue = active ? 'running' : 'unstart';
        this.iconPath = active ? runningIcon : '';
        this.description = fileName;
        this.tooltip = filePath
    };

}

module.exports = Views;