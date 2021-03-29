const { spawn, execFile } = require("child_process");
const path = require('path')
const filePath = path.join(__dirname, 'run.bat');


// var ls = execFile('notepad', (error, stdout, stderr) => {
//     if (error) {
//         throw error;
//     }
//     console.log(stdout);
// })


let subProcess = spawn('run.bat', [], {
    cwd: 'G:\\CGTN\\static-page',
    detached: true,
    shell: true
})


subProcess.stderr.on('data', (data) => {
    console.log('stderr');

});
//执行完毕
subProcess.on('close', () => {
    console.log('close');
});