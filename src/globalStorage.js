const fs = require('fs');
const path = require('path');

const directoryName = 'globalStorage';
const fileName = 'tasks.json';

function update(context, treeData) {

    const globalStoragePathArr = context.globalStoragePath.split(directoryName);
    const storageDirectory = path.join(globalStoragePathArr[0], directoryName, fileName);

    fs.writeFileSync(storageDirectory, JSON.stringify(treeData));

}

function _readFile(path) {

    if (fs.existsSync(path)) {
        return JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
    } else {
        return null
    }
}


function get(context) {
    const globalStoragePathArr = context.globalStoragePath.split(directoryName);
    const storageDirectory = path.join(globalStoragePathArr[0], directoryName, fileName);

    return _readFile(storageDirectory);
}


module.exports = {
    update,
    get
}