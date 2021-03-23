const vscode = require('vscode');
const path = require('path');
const running = path.join(__dirname, '..', '..', 'resources', 'running.svg');

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
        const { name, description, tooltip, children } = item;
        super(name);
        // this.description = description;
        this.contextValue = 'title';
        this.tooltip = description
        this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
    };

}

class ViewsItemContent extends vscode.TreeItem {
    constructor(item) {
        const { name, description, tooltip, active } = item;
        super(name);
        this.contextValue = active ? 'running' : 'unstart';
        this.iconPath = active ? running : '';
        this.description = description;
        //this.tooltip = tooltip
    };

}

module.exports = Views;