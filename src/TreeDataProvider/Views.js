const vscode = require('vscode');

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
                let aClicks = parseInt((a.logs && a.logs.clicks) || 0);
                let bClicks = parseInt((b.logs && b.logs.clicks) || 0);
                let res = bClicks - aClicks;
                return res
            })
        }
    }
}


class ViewsItemTitle extends vscode.TreeItem {
    constructor(item) {
        const { name, description, children } = item;
        super(name);
        this.contextValue = (vscode.workspace.name === name) ? 'current' : 'other';
        this.description = '';
        this.tooltip = description
        this.collapsibleState = (name === vscode.workspace.name ? 2 : 1);
    };

}

class ViewsItemContent extends vscode.TreeItem {
    constructor(item) {
        const { cmdLineDesc, filePath, fileName, active, iconPath, logs } = item;
        let label = cmdLineDesc;
        let description = active ? 'RUNNING' : '';
        //未运行过的命令，将label的内容放到description中
        if (!logs || !logs.clicks) {
            label = ''
            description = cmdLineDesc + ' ' + description;
        }

        super(label);
        this.contextValue = active ? 'running' : 'unstart';
        this.iconPath = iconPath;
        this.description = description;
        this.tooltip = filePath

    };

}

module.exports = Views;