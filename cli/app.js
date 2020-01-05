const _ = require('lodash');
const async = require('async');
const csv = require('fast-csv');
const ncp = require('copy-paste');
const fs = require('fs');

const config = {
    contactFile: 'mycontacts.csv',
    maxContacts: 500,
    sort: true
};

let contacts = [];

csv
    .fromPath(config.contactFile, {headers: true})
    .on('data', function (data) {
        contacts.push(data);
    })
    .on('end', function () {
        console.log('done', contacts.length);

        if (config.sort) {
                contacts = _.reverse(_.sortBy(contacts, function (item) {
                return parseInt(item['TX Count']);
            }));
        }

        let copyString = 'DmrIndividualIdListId	DmrIndividualIdListIdName	DmrIndividualIdListIdMode	DmrIndividualIdListIndividualAlertTone	DmrIndividualIdListPagingAlertTone	DmrIndividualIdListIndividualAlertLed	DmrIndividualIdListPagingAlertLed';
        _.each(_.take(contacts, config.maxContacts), function (contact) {
            copyString += contact.ID + '\t' + (contact.Call + ' ' + contact.Name).substring(0, 15) + '\tTransmitReceive\t255\t255\tCommon\tCommon\r\n';
        });

        console.log(copyString);
        console.log('Copied contacts to clipboard. Paste into the Individual contact list in the Kenwood software to import.');

        ncp.copy(copyString);
    });
