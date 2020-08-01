const {app, BrowserWindow, ipcMain} = require('electron');
const _ = require('lodash');
// const async = require('async');
const csv = require('fast-csv');
// const ncp = require('copy-paste');
const fs = require('fs-extra');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.removeMenu();

    // and load the index.html of the app.
    win.loadFile('dist/index.html');
    // win.loadURL('http://localhost:8080');

    // Open the DevTools.
    //win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    });

    // ipcMain.on('loadContacts', (event, filename, maxContacts, sort) => {
    //     console.log('loadContacts', filename, maxContacts, sort);
    //     loadContacts(filename, maxContacts, sort, function (err, contacts) {
    //         event.reply('contactsLoaded', contacts);
    //     });
    // })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
});

function loadContacts(filename, maxContacts, sort, cb) {
    let contacts = [];

    const readStream = fs.createReadStream(filename);

    readStream
        .pipe(csv.parse({headers: true}))
        .on('data', function (data) {
            contacts.push(data);
        })
        .on('error', function (err) {
            process.nextTick(cb, err);
        })
        .on('end', function () {
            console.log('Loaded %s contacts', contacts.length);

            //map properties
            contacts = _.map(contacts, function (o) {
                return {
                    id: o.ID,
                    callsign: o.Call,
                    name: o.Name,
                    lastTX: o['Last TX'],
                    txCount: o['TX Count'],
                };
            });

            if (sort) {
                contacts = _.reverse(_.sortBy(contacts, function (item) {
                    return parseInt(item.txCount);
                }));
            }

            contacts = _.take(contacts, maxContacts);

            process.nextTick(cb, null, contacts);
        });
}