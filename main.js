const electron = require('electron');
const { ipcMain } = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let { PythonShell } = require('python-shell')
//https://www.techiediaries.com/python-electron-tutorial/



let win = null;
//var robot = require("robotjs");// does not work for an obscure reason
var ipcRenderer = require('electron').ipcRenderer;

app.on('ready', () => {
    ipcMain.on("typing", (event, arg) => { typing(arg) })


    win = new BrowserWindow({
        alwaysOnTop: false,
        width: 1200,
        height: 850,
        //   icon: 'assets/zds.png',
        title: 'Musicwriterpad',
        webPreferences: {
            nodeIntegration: true
        },
        movable: false
    });

    win.setMenu(null) //remove menu
    win.loadFile('dist/index.html')






});






function typing(str) {
    PythonShell.run('typing.py', {
        mode: 'text',
        args: [str]
    }, function (err, results) {
        if (err) throw err;
        console.log('typing.py finished.');
        console.log('results', results);
    });
}