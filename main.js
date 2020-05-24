const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let win = null

app.on('ready', () => {
    win = new BrowserWindow({
        width: 600,
        height: 200,
        //   icon: 'assets/zds.png',
        title: 'Musicscratch',
        movable: false
    });

    win.setMenu(null) //remove menu
    win.loadFile('index.html')
});

