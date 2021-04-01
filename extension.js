const vscode = require('vscode');
const TreeDataProvider = require('./src/TreeDataProvider/ViewsContainers');

function activate(context) {

    const { registerTreeDataProvider } = vscode.window;
    const { registerCommand } = vscode.commands;

    const ViewsContainers = new TreeDataProvider(context);

    //注册菜单展开时事件
    registerTreeDataProvider('task-running', ViewsContainers.working);
    registerTreeDataProvider('task-deprecated', ViewsContainers.deprecated);

    registerCommand('task.run', (treeItem) => {
        return ViewsContainers.run(treeItem);
    })

    registerCommand('task.stop', () => {
        //无法得知终端的详细状态
        //return ViewsContainers.stop(treeItem);
    })

    registerCommand('workspace.remove', (workspace) => {
        return ViewsContainers.removeWorkSpace(workspace);
    })

    registerCommand('workspace.refresh', (workspace) => {
        return ViewsContainers.workspaceRefresh(workspace);
    })
}


// 卸载执行
function deactivate() { }

module.exports = {
    activate,
    deactivate
}
