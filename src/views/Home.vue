<template>
    <v-container>
        <h3 class="title">DMR Contact List Import</h3>

        <v-card class="mb-5">
            <v-card-title>Search Brandmeister Talkgroups</v-card-title>
            <v-card-text>
                <v-text-field
                        v-model="talkgroups"
                        append-icon="mdi-account-group"
                        label="Talkgroups"
                        hint="Separated with a comma (3134,31360)"
                        persistent-hint
                        outlined
                        dense
                        @keyup.enter="searchBrandmeister"
                ></v-text-field>

                <div class="text-right">
                    <v-btn color="primary" @click="searchBrandmeister" :loading="brandmeisterLoading">Search
                        <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>


        <v-card v-if="contacts.length > 0">
            <v-card-title class="pt-0">
                Contacts
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Filter Results"
                        clearable
                        outlined
                        single-line
                        hide-details
                        dense
                        class="mt-2"
                ></v-text-field>
            </v-card-title>
            <v-data-table
                    :items="contacts"
                    item-key="_id"
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
    const {remote} = window.require('electron');
    import moment from 'moment';
    import io from 'socket.io-client';

    let socket;

    const ncp = window.require('copy-paste');

    export default {
        data: () => ({
            brandmeisterLoading: false,
            talkgroups: null,
            maxContacts: 200,
            sortContacts: true,
            headers: [
                {text: 'ID', value: '_id'},
                {text: 'Call', value: 'call'},
                {text: 'Name', value: 'name'},
                {text: 'Last TX', value: 'last'},
                {text: 'TX Count', value: 'count'},
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

        methods: {
            searchBrandmeister() {
                let sTalkgroups = this._.isString(this.talkgroups) ? this.talkgroups.split(',') : [];
                let sReflectors = sTalkgroups; //@todo accept reflectors as separate option

                this.brandmeisterLoading = true;
                remote.getCurrentWindow().setProgressBar(0, {mode: 'indeterminate'});

                socket.emit('lastUserList', {
                    talkgroups: this._.map(sTalkgroups, this._.parseInt),
                    reflectors: this._.map(sReflectors, this._.parseInt)
                });
            },

            copyContacts() {
                let copyString = 'DmrIndividualIdListId	DmrIndividualIdListIdName\tDmrIndividualIdListIdMode\tDmrIndividualIdListIndividualAlertTone\tDmrIndividualIdListPagingAlertTone\tDmrIndividualIdListIndividualAlertLed\tDmrIndividualIdListPagingAlertLed\r\n';
                this._.each(this.contacts, (contact, i) => {
                    if (i < this.maxContacts) copyString += contact._id + '\t' + (contact.call + ' ' + contact.name).substring(0, 15) + '\tTransmitReceive\t255\t255\tCommon\tCommon\r\n';
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

            if (pathname[2]) options['path'] = pathname[2];
            if (pathname[0].charAt(4) === "s") options['secure'] = true;
            options['force new connection'] = true;

            socket = io.connect(pathname[1], options);

            socket.on('connect', () => {
                socket.on('userHistoryQuery', (msg) => {
                    this.brandmeisterLoading = false;
                    remote.getCurrentWindow().setProgressBar(-1, {mode: 'none'});

                    this.contacts = this.sortContacts ? this._.sortBy(msg, 'count').reverse() : msg;
                });
            });
        },

        filters: {
            fromNow(date) {
                return moment(date).fromNow();
            }
        }
    }
</script>