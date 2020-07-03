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
    win.title = "Zikpad - (new document)";
    win.webContents.send("new");
}



function openDocument() {
    let files = dialog.showOpenDialogSync({ title: "Open file", filters: [{ name: "Lilypond file", extensions: "ly" }] });
    openFile(files[0]);
    
}


function openFile(filename){
    win.title = "Zikpad - " + filename;
    fs.readFile(filename, 'utf8', (err, data) => {
        win.webContents.send("open", data)
    });
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
    ipcMain.on("open", (event, arg) => {openFile(arg)});
    ipcMain.on("save", (event, arg) => { fs.writeFileSync(filename, arg) })

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
                { label: 'Open', accelerator: "Ctrl+O", click() { openDocument() } },
                { label: 'Save', accelerator: "Ctrl+S", click() { saveDocument() } },
                { label: 'Save As', click() { saveAsDocument() } },
                { label: 'Exit', click() { app.quit() } }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: "Ctrl+Z", click() { win.webContents.send("undo"); } },
                { label: 'Redo', accelerator: "Ctrl+Shift+Z", click() { win.webContents.send("redo"); } },
            ]
        },


        {
            label: "Help",
            submenu: [{
                label: 'About...', click() {
                    dialog.showMessageBox(win, { message: "Visit https://zikpad.github.io/" })
                }
            }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);
    win.loadFile('dist/index.html')
    
    win.webContents.openDevTools()



    win.on('close', function (e) {
        let choice = require('electron').dialog.showMessageBoxSync(this,
            {
                type: 'question',
                buttons: ['Yes', 'No'],
                title: 'Confirm',
                message: 'Are you sure you want to quit?'
            });
        if (choice == 1) {
            e.preventDefault();
        }
    });


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