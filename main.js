const electron = require('electron');
const {app, Menu, Tray, remote} = electron;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const PDFWindow = require('electron-pdf-window');
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const PDF2Pic = require("pdf2pic");
const {getPrinters} = require('./printFunction');
const {setPrinter,startServer} = require('./server');

let mainWindow;
function createWindow() {
    // React
    // mainWindow = new BrowserWindow({
    //     show: false,
    //     width: 800, height: 600,
    //     icon: './tray.png',
    //     title: 'Select Courier',
    //     webPreferences: {
    //         plugins: true,
    //         nodeIntegration: false,
    //         preload: __dirname + '/preload.js'
    //     }
    // });
    // mainWindow.loadURL('http://localhost:3000/');
    // mainWindow.webContents.openDevTools();
    // mainWindow.on('minimize',function(event){
    //     event.preventDefault();
    //     mainWindow.hide();
    // });
    //
    // mainWindow.on('closed', function () {
    //     mainWindow = null
    // });
    let mainWindow = new BrowserWindow({'auto-hide-menu-bar': true, show: false});
    mainWindow.loadURL("www.google.com");
    let printerItems = [];
    const printers = mainWindow.webContents.getPrinters();
    printers.forEach(printer => {
        if(printer.isDefault) {
            setPrinter(printer.name)
        }

        printerItems.push({
            label: printer.name,
            type: 'radio',
            checked: printer.isDefault,
            click() {
                setPrinter(printer.name)
            }
        })
    });
    let tray = new Tray('./tray.png');
    const contextMenu = Menu.buildFromTemplate(printerItems);
    tray.setToolTip('Select Courier App');
    tray.setContextMenu(contextMenu);
    startServer();
}

// For React
// ipc.on('getPrinters', (event, args) => {
//     console.log('ipc getPrinters got triggered');
//     const printers = mainWindow.webContents.getPrinters();
//     console.log(printers.length);
//     mainWindow.send('sendPrinters', printers)
// });
//
// ipc.on('print', (event, args) => {
//     const win = new BrowserWindow({show: false, width: 800, height: 600,});
//     PDFWindow.addSupport(win);
//     win.loadURL(__dirname + './sample.pdf');
//     mainWindow.webContents.on('did-finish-load', () => {
//         setTimeout(() => {
//             win.webContents.print({silent: true});
//             // win.webContents.print({silent: true});
//         }, 2500) // A time to load and render PDF
//     });
// });
//
// ipc.on('serverStart',(event,{port}) => {
//     startServer(port);
// });
//
ipc.on('test', (event, {name, fileName}) => getPrinters(name,fileName));
ipc.on('lol', (event, data) => console.log(data));


app.on('ready', createWindow);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});