const {app, BrowserWindow, ipcMain} = require('electron');
const _ = require('lodash');
const async = require('async');
const csv = require('fast-csv');
const ncp = require('copy-paste');
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

    // and load the index.html of the app.
    // win.loadFile('dist/index.html');
    win.loadURL('http://localhost:8081');

    // Open the DevTools.
    //win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    });

    ipcMain.on('loadContacts', (event, arg) => {
        console.log('loadContacts', arg);
        loadContacts(arg, function (err, contacts) {
            event.reply('contactsLoaded', contacts);
            // event.reply('contactsLoaded', contacts.length);
        });
    })
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

function loadContacts(filename, cb) {
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

            const config = {
                maxContacts: 1500,
                sort: true
            };

            if (config.sort) {
                contacts = _.reverse(_.sortBy(contacts, function (item) {
                    return parseInt(item.txCount);
                }));
            }

            contacts = _.take(contacts, config.maxContacts);

            let copyString = 'DmrIndividualIdListId	DmrIndividualIdListIdName	DmrIndividualIdListIdMode	DmrIndividualIdListIndividualAlertTone	DmrIndividualIdListPagingAlertTone	DmrIndividualIdListIndividualAlertLed	DmrIndividualIdListPagingAlertLed';
            _.each(contacts, function (contact) {
                copyString += contact.id + '\t' + (contact.callsign + ' ' + contact.name).substring(0, 15) + '\tTransmitReceive\t255\t255\tCommon\tCommon\r\n';
            });

            console.log(copyString);
            console.log('Copied contacts to clipboard. Paste into the Individual contact list in the Kenwood software to import.');

            ncp.copy(copyString);

            process.nextTick(cb, null, contacts);
        });
}