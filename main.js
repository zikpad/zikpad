const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let win = null;
//var robot = require("robotjs");// does not work for an obscure reason
var ipcRenderer = require('electron').ipcRenderer;

app.on('ready', () => {
    win = new BrowserWindow({
        width: 800,
        height: 500,
        //   icon: 'assets/zds.png',
        title: 'Musicwriterpad',
        movable: false
    });

    win.setMenu(null) //remove menu
    win.loadFile('dist/index.html')

});



