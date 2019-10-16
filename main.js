const electron = require('electron');
const {app, Menu, Tray, shell, dialog, autoUpdater} = electron;
const BrowserWindow = electron.BrowserWindow;
const gotTheLock = app.requestSingleInstanceLock();
const path = require('path');
const url = require('url');
const ipc = electron.ipcMain;
const log = require('electron-log');
const {getPrinters} = require('./printFunction');
const {setPrinter, startServer} = require('./server');


autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWindow;
let tray = null;

function sendStatus(text) {
    log.info(text);
    if (mainWindow) {

    }
}


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
        const server = "https://hazel.sagirenes.now.sh";
        const feed = `${server}/update/${process.platform}/${app.getVersion()}`;
        autoUpdater.setFeedURL({
            url: feed
        });

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
    ipc.on('test', (event, {name, fileName}) => getPrinters(name, fileName));
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

    autoUpdater.on('checking-for-update', () => {
        sendStatus('Checking for update...');
    });
    autoUpdater.on('update-available', (ev, info) => {
        sendStatus('Update available.');
        log.info('info', info);
        log.info('arguments', arguments);
    });
    autoUpdater.on('update-not-available', (ev, info) => {
        sendStatus('Update not available.');
        log.info('info', info);
        log.info('arguments', arguments);
    });
    autoUpdater.on('error', (ev, err) => {
        sendStatus('Error in auto-updater.');
        log.info('err', err);
        log.info('arguments', arguments);
    });
    autoUpdater.on('update-downloaded', (ev, info) => {
        sendStatus('Update downloaded.  Will quit and install in 5 seconds.');
        log.info('info', info);
        log.info('arguments', arguments);
        setTimeout(function() {
          autoUpdater.quitAndInstall();
        }, 5000)
    });
}