const vscode = require('vscode');
const TreeDataProvider = require('./src/TreeDataProvider/ViewsContainers');

function activate(context) {

    const { registerTreeDataProvider } = vscode.window;
    const { registerCommand } = vscode.commands;

    const ViewsContainers = new TreeDataProvider(context);

    //注册菜单展开时事件
    registerTreeDataProvider('task-running', ViewsContainers.working);
    registerTreeDataProvider('task-deprecated', ViewsContainers.deprecated);

    registerCommand('task.refresh', () => {
        return ViewsContainers.clear();
    })

    registerCommand('task.run', (treeItem) => {
        return ViewsContainers.run(treeItem);
    })


    registerCommand('task.restart', (treeItem) => {
        return ViewsContainers.restart(treeItem);
    })

    registerCommand('task.stop', (treeItem) => {
        return ViewsContainers.stop(treeItem);
    })

}


// 卸载执行
function deactivate() { }

module.exports = {
    activate,
    deactivate
}
