//const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const fs = require('fs');
//const { ipcMain } = require('electron');
//const app = electron.app;
//const BrowserWindow = electron.BrowserWindow;
let { PythonShell } = require('python-shell')
//https://www.techiediaries.com/python-electron-tutorial/



let win = null;
let filename = undefined;



function newDocument() {
    filename = undefined;
    win.webContents.send("new");
}



function openDocument() {
    let files = dialog.showOpenDialogSync({ title: "Open file", filters: [{ name: "Lilypond file", extensions: "ly" }] });
    filename = files[0];
    win.title = "Zikpad - " + filename;
    fs.readFile(filename, 'utf8', (err, data) => win.webContents.send("new", filenameContent));
}


function saveDocument() {
    if (filename == undefined)
        saveAsDocument();
    else
        win.webContents.send("save");
}


function saveAsDocument() {
    let newFilename = dialog.showSaveDialogSync({ title: "Save file", filters: [{ name: "Lilypond file", extensions: "ly" }] });
    if (newFilename == undefined) return;

    filename = newFilename;
    win.title = "Zikpad - " + filename;
    saveDocument();
}




app.on('ready', () => {
    ipcMain.on("typing", (event, arg) => { typing(arg) })


    win = new BrowserWindow({
        alwaysOnTop: false,
        width: 1200,
        height: 850,
        //   icon: 'assets/zds.png',
        title: 'Zikpad',
        webPreferences: {
            nodeIntegration: true
        },
        movable: false
    });


    let menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                { label: 'New', click() { newDocument() } },
                { label: 'Open', click() { openDocument() } },
                { label: 'Save', click() { saveDocument() } },
                { label: 'Save As', click() { saveAsDocument() } },
                {
                    label: 'Exit', click() {
                        app.quit()
                    }
                }
            ]
        }
    ])


    Menu.setApplicationMenu(menu);
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