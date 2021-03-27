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
        this.refresh();

        let loader = this.findLoader(this.loaderList, item);
        loader && loader.runTask(item, () => {
            tree.active = false;
            this.refresh();
        });

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
            loaders.NpmLoader,
            loaders.GulpLoader
        ];

        const loaderList = [];

        for (const engine of engines) {
            loaderList.push(new engine(globalConfig));
        }

        const tree = {
            name: vscode.workspace.name,
            description: vscode.workspace.rootPath,
            children: []
        }

        const index = currentState.findIndex((item) => item.name === vscode.workspace.name);

        if (index > -1) {
            currentState[index] = tree
        } else {
            currentState.unshift(tree)
        }

        for (const task of loaderList) {
            task.loadTask((tasks) => {
                tree.children = tree.children.concat(tasks);
                globalStorage.update(this.context, this.treeData)

                this.refresh();
            })
        }

        return loaderList
    }

    _findUpdateItem(item) {
        for (let trees of this.get()) {
            for (let tree of trees.children) {
                if (tree.uid === item.uid) {
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