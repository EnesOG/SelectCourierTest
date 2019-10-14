const electron = require('electron');
const {app, Menu, Tray, shell} = electron;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const {getPrinters} = require('./printFunction');
const {setPrinter,startServer} = require('./server');

let mainWindow;
let tray = null
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
    tray = new Tray('./tray.png');
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Choose default printers",
            enabled : false
        },
        {
          type: 'separator'
        },
        ...printerItems,
        {
            type: 'separator'
        },
        {
            label: 'Go to website',
            click() {
                let link = 'https://www.selectcourier.com/pro/index';
                shell.openExternal(link);
            }
        },
        {
            label: 'Help',
            click() {
                let link = 'https://www.selectcourier.com/page/contact';
                shell.openExternal(link);
            }
        },
        {
            label: 'Close',
            click() {
                mainWindow.isQuiting = true;
                mainWindow.close();
            }
        }

    ]);

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

app.on('before-quit', function (evt) {
    tray = null;
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});