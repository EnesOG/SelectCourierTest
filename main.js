const electron = require('electron');
const {app, Menu, Tray, shell, dialog} = electron;
const BrowserWindow = electron.BrowserWindow;
const gotTheLock = app.requestSingleInstanceLock();
const path = require('path');
const url = require('url');
const ipc = electron.ipcMain;
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');
const {getPrinters} = require('./printFunction');
const {setPrinter, startServer} = require('./server');


autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWindow;
let tray = null;
const trayPath = path.join(__dirname, 'images/tray.png');
if (!gotTheLock) {
    dialog.showErrorBox('Oops! Something went wrong!', 'The Select Courier Application is already running!');
    app.quit();
} else {

    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus()
        }
    });

    function createWindow() {
        autoUpdater.checkForUpdatesAndNotify();
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
        let mainWindow = new BrowserWindow({
            'auto-hide-menu-bar': true,
            show: false,
            icon: trayPath,
            title: "Select Courier"
        });
        let printerItems = [];
        const printers = mainWindow.webContents.getPrinters();
        printers.forEach(printer => {
            if (printer.isDefault) {
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
        tray = new Tray(trayPath);
        const contextMenu = Menu.buildFromTemplate([
            {
                label: "Choose default printers",
                enabled: false
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
                label: 'Help2',
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
    ipc.on('test', (event, {name, fileName}) => getPrinters(name, fileName));
    ipc.on('lol', (event, data) => console.log(data));



    app.on('ready', createWindow);
    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    });

    function sendStatusToWindow(text) {
        log.info(text);
        dialog.showMessageBox(mainWindow, {
            type: "info",
            message: text
        })
    }


    autoUpdater.on('checking-for-update', () => {
        sendStatusToWindow('Checking for update...');
    });
    autoUpdater.on('update-available', (info) => {
        sendStatusToWindow('Update available.');
    });
    autoUpdater.on('update-not-available', (info) => {
        sendStatusToWindow('Update not available.');
    });
    autoUpdater.on('error', (err) => {
        sendStatusToWindow('Error in auto-updater. ' + err);
    });
    autoUpdater.on('download-progress', (progressObj) => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        sendStatusToWindow(log_message);
    });
    autoUpdater.on('update-downloaded', (info) => {
        sendStatusToWindow('Update downloaded');
    });

    app.on('before-quit', function (evt) {
        tray = null;
    });

    app.on('activate', function () {
        if (mainWindow === null) {
            createWindow()
        }
    });
}