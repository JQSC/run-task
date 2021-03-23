const vscode = require('vscode');
const View = require('./Views');

class ViewsContainers {

    constructor(context) {

        this.treeData = [
            {
                name: 'static-page', description: 'E:\run-task\resources', children: [
                    {
                        id: '1.1',
                        name: 'npm run dev',
                        description: 'package.json'
                    },
                    {
                        id: '1.2',
                        name: 'npm run test',
                        description: 'package.json'
                    }
                ]
            }
        ];

        this.working = new View(this.treeData);
        this.deprecated = new View();

    }

    run(item) {
        let tree = this._find(item);
        tree.active = true;
        this.working.refresh();
    }

    restart(item){

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