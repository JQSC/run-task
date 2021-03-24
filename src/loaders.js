const vscode = require('vscode');

class NpmLoader {

    constructor() {

    }


    loadTask() {

        const foundList = vscode.workspace.findFiles('*.js', "**/{node_modules,.vscode-test,.git,bower_components}");


    }

    runTask() { }


}


module.exports = {
    NpmLoader
}

