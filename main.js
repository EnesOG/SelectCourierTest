const electron = require('electron');
const {app, Menu, Tray, shell, dialog} = electron;
const {autoUpdater} = require('electron-updater');
const BrowserWindow = electron.BrowserWindow;
const checkInternetConnected = require('check-internet-connected');
const gotTheLock = app.requestSingleInstanceLock();
const path = require('path');
const url = require('url');
const ipc = electron.ipcMain;
const log = require('electron-log');
const {getPrinters} = require('./printFunction');
const {setPrinter, startServer} = require('./server');
const AutoLaunch = require('auto-launch');
const fs = require('fs');
let update = false;


const config = {
    timeout: 6000, //timeout connecting to each server, each try
    retries: 10,//number of retries to do before failing
    domain: 'https://apple.com',//the domain to check DNS record of
};
const checkInternet = (config) => {
    checkInternetConnected(config)
        .then((result) => {
            autoUpdater.checkForUpdatesAndNotify();
        }) .catch(ex => {
            console.log('Connection is off');
    });
};


let autoLaunch = new AutoLaunch({
    name: 'Select Courier App',
    path: app.getPath('exe'),
});

autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable();
    autoLaunch.enable()
});


autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
let isUpdate = false;
let mainWindow;
let hideDialog = false;
let tray = null;
const trayPath = path.join(__dirname, 'images/tray.png');
if (!gotTheLock) {
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
        if (!fs.existsSync(`./pdf`)) fs.mkdir(`./pdf`, () => {
        });

        let mainWindow = new BrowserWindow({
            'auto-hide-menu-bar': true,
            show: false,
            icon: trayPath,
            title: "Select Courier"
        });
        let printerItems = [];
        const printers = mainWindow.webContents.getPrinters().sort((a, b) => b.isDefault - a.isDefault);
        console.log(printers);
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
        let contextMenu = [
            {
                label: "Choose default printer",
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

        ];
        const menuTem = Menu.buildFromTemplate(contextMenu);

        tray.setToolTip('Select Courier App');
        tray.setContextMenu(menuTem);
        startServer();
        autoUpdater.on('checking-for-update', () => {
            log.info('info', 'update checking')
        });

        autoUpdater.on('update-available', (ev, info) => {
            log.info('info', info);
            update = true;
            log.info('arguments', arguments);
        });

        autoUpdater.on('update-not-available', (ev, info) => {
            log.info('info', info);
            log.info('arguments', arguments);
        });

        autoUpdater.on('error', (ev, err) => {
           // dialog.showErrorBox('error', err);
            log.info('err', err);
            log.info('arguments', arguments);
        });

       if(!update) {
           autoUpdater.on('update-downloaded', (ev, info) => {
               log.info('info', info);
               log.info('arguments', arguments);
               const option = {
                   type: 'question',
                   buttons: ['Yes, please', 'No Thanks'],
                   defaultId: 1,
                   title: 'Select Courier App',
                   message: 'Do you want to update now?',
               };

               if (hideDialog === false) {
                   dialog.showMessageBox(null, option, (res => {
                       if (res === 0) {
                           autoUpdater.quitAndInstall();
                       } else {
                           hideDialog = true;
                           contextMenu.splice(
                               contextMenu.length - 1, 0,
                               {
                                   label: 'Update now',
                                   click() {
                                       autoUpdater.quitAndInstall();
                                   }
                               }
                           );
                           console.log(contextMenu);
                           const menuTem = Menu.buildFromTemplate(contextMenu);
                           tray.setContextMenu(menuTem);
                       }
                   }));
               }
           });
       }
    }

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

    if (!update) {
        setInterval(() => checkInternet(config), 60 * 1000);
    }
}