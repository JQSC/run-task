const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const View = require('./Views');
const globalStorage = require('../globalStorage')
const loaders = require('../loaders')

const defaultTasks = {
    working: [],
    deprecated: []
}

class ViewsContainers {

    constructor(context) {

        const memorizeTasks = globalStorage.get(context);

        this.context = context;

        this.treeData = memorizeTasks || defaultTasks;

        this.working = new View(this.treeData.working);
        this.deprecated = new View(this.treeData.deprecated);

        this.loaderList = this.setupLoaders(vscode.workspace.getConfiguration('runtask'));

    }

    run(item) {
        let tree = this._findUpdateItem(item);
        tree.active = true;

        let loader = this.findLoader(this.loaderList, item);
        loader && loader.runTask(item, () => {
            tree.active = false;
            this.refresh();
        });

        this.refresh();

    }

    restart(item) {

    }


    stop(item) {
        let tree = this._findUpdateItem(item);
        tree.active = false;
        this.refresh();
    }

    get() {
        return this.treeData.working
    }

    refresh() {
        this.working.refresh();
    }

    clear() {
        globalStorage.update(this.context, defaultTasks);
        this.refresh();
    }

    setupLoaders(globalConfig) {

        const currentState = this.get();

        if (!currentState) return;

        const engines = [
            loaders.NpmLoader
        ];

        const loaderList = [];

        for (const engine of engines) {
            loaderList.push(new engine(globalConfig));
        }

        loaderList[0].loadTask().then((tasks) => {

            const index = currentState.findIndex((item) => item.name === vscode.workspace.name);

            const tree = {
                name: vscode.workspace.name,
                description: vscode.workspace.rootPath,
                children: tasks
            }

            if (index > -1) {
                currentState[index] = tree
            } else {
                currentState.unshift(tree)
            }

            globalStorage.update(this.context, this.treeData)


            this.refresh();
        })

        return loaderList
    }

    _findUpdateItem(item) {
        for (let trees of this.get()) {
            for (let tree of trees.children) {
                if (tree.id === item.id) {
                    return tree
                }
            }
        }
    }

    findLoader(loaderList, item) {
        let currentLoader
        for (let loader of loaderList) {
            if (loader.key === item.key) {
                currentLoader = loader
            }
        }
        return currentLoader
    }

}



module.exports = ViewsContainers;