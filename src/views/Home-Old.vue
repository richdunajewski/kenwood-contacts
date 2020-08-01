<template>
    <v-container>
        <h3 class="title">Contact File Import</h3>


        <v-stepper v-model="stepper">
            <v-stepper-header>
                <v-stepper-step :complete="stepper > 1" step="1">Select CSV File</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step :complete="stepper > 2" step="2">Select Contacts</v-stepper-step>

                <v-divider></v-divider>

                <v-stepper-step step="3">Export Contacts</v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
                <v-stepper-content step="1">
                    <v-form ref="import">
                        <v-row>
                            <v-col class="flex-grow-1 flex-shrink-0">
                                <v-file-input
                                        v-model="file"
                                        label="Contacts File (CSV)"
                                        hide-details
                                        solo
                                        dense
                                ></v-file-input>
                            </v-col>
                            <v-col class="flex-grow-0 flex-shrink-1">
                                <!--<v-btn @click="loadContacts()" color="primary" :disabled="loadDisabled">Load Contacts</v-btn>-->
                            </v-col>
                        </v-row>
                    </v-form>


                    <div class="text-right">
                        <v-btn
                                color="primary"
                                @click="loadContacts()"
                                :disabled="loadDisabled"
                        >
                            Load Contacts
                            <v-icon>mdi-chevron-right</v-icon>
                        </v-btn>
                    </div>
                </v-stepper-content>
                <v-stepper-content step="2">
                    <v-card v-if="contacts.length > 0">
                        <v-card-title class="pt-0">
                            Contacts
                            <v-spacer></v-spacer>
                            <v-text-field
                                    v-model="search"
                                    append-icon="mdi-magnify"
                                    label="Search"
                                    outlined
                                    single-line
                                    hide-details
                                    dense
                            ></v-text-field>
                        </v-card-title>
                        <v-data-table
                                :items="contacts"
                                :item-key="id"
                                :headers="headers"
                                :search="search"
                                dense
                        >
                            <template v-slot:item.lastTX="{ item }">
                                <span :title="moment(item.lastTX).format('MM/DD/YYYY h:mm:ss a')">{{ item.lastTX | fromNow }}</span>
                            </template>
                        </v-data-table>

                        <v-card-text>
                            <v-slider
                                    v-model="maxContacts"
                                    min="0"
                                    :max="contacts.length"
                                    label="Max Contacts to Copy"
                                    thumb-label="always"
                            ></v-slider>

                            <v-btn @click="copyContacts" color="primary">Copy Contacts</v-btn>
                        </v-card-text>
                    </v-card>
                </v-stepper-content>
                <v-stepper-content step="3">
                    3
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>


        <v-dialog v-model="dialog.state" width="500">
            <v-card>
                <v-toolbar dense dark :color="dialog.color" class="mb-5">
                    <h3 class="title">{{ dialog.title }}</h3>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="dialog.state = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text>
                    {{ dialog.message }}
                </v-card-text>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>
    import moment from 'moment';
    import io from 'socket.io-client';

    const {ipcRenderer} = window.require('electron');
    const ncp = window.require('copy-paste');

    export default {
        data: () => ({
            stepper: null,
            loadDisabled: true,
            file: null,
            maxContacts: 200,
//            sortContacts: true,
            headers: [
                {text: 'ID', value: 'id'},
                {text: 'Call', value: 'callsign'},
                {text: 'Name', value: 'name'},
                {text: 'Last TX', value: 'lastTX'},
                {text: 'TX Count', value: 'txCount'},
            ],
            search: null,
            contacts: [],
            dialog: {
                state: false,
                color: 'primary',
                title: '',
                message: ''
            }
        }),

        watch: {
            file() {
                console.log(this._)
                console.log(this.loadDisabled)
                this.loadDisabled = !this._.isObject(this.file);
                console.log(this.loadDisabled)
            }
        },

        methods: {
            loadContacts() {
                if (this._.isNull(this.filen)) {
                    this.dialog.title = 'Error';
                    this.dialog.message = 'Please select a file name.';
                    this.dialog.color = 'error';
                    this.dialog.state = true;
                } else {
                    ipcRenderer.on('contactsLoaded', (event, contacts) => {
                        this.contacts = contacts;

                        this.stepper = 2;
                    });

                    ipcRenderer.send('loadContacts', this.file.path, this.maxContacts, false);
                }
            },

            copyContacts() {
                let copyString = 'DmrIndividualIdListId	DmrIndividualIdListIdName\tDmrIndividualIdListIdMode\tDmrIndividualIdListIndividualAlertTone\tDmrIndividualIdListPagingAlertTone\tDmrIndividualIdListIndividualAlertLed\tDmrIndividualIdListPagingAlertLed';
                this._.each(this.contacts, function (contact) {
                    copyString += contact.id + '\t' + (contact.callsign + ' ' + contact.name).substring(0, 15) + '\tTransmitReceive\t255\t255\tCommon\tCommon\r\n';
                });
                ncp.copy(copyString);

                this.dialog.title = 'Contacts Copied';
                this.dialog.message = 'Your contacts have been copied to your clipboard. You may now paste them into the Individual List section of the Kenwood software to import them.';
                this.dialog.color = 'success';
                this.dialog.state = true;
            },

            moment(date) {
                return moment(date);
            }
        },

        created() {
            let urlreg = /(.+:\/\/?[^/]+)(\/.*)*/;
            let pathname = urlreg.exec('https://api.brandmeister.network/lh/');
            let options = {};
            let socket;

            if (pathname[2]) options['path'] = pathname[2];
            if (pathname[0].charAt(4) === "s") options['secure'] = true;
            options['force new connection'] = true;

            console.log(options)
            socket = io.connect(pathname[1], options);

            socket.on('connect', function () {
                console.log('Socket connected');
                socket.on('userHistoryQuery', function (msg) {
                    console.log('Got user query reply');
                    console.log(msg);
                });

                let talkgroups = [31360];
                let reflectors = [];

                socket.emit("lastUserList", {"talkgroups": talkgroups, "reflectors":reflectors});
            });
        },

        filters: {
            fromNow(date) {
                return moment(date).fromNow();
            }
        }
    };
</script>