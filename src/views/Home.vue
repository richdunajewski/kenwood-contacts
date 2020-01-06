<template>
    <v-container>
        <h3 class="title">Contact File Import</h3>

        <v-form ref="import">
            <v-file-input
                    v-model="filename"
                    label="Contacts File (CSV)"
                    solo
            ></v-file-input>

            <v-btn @click="loadContacts()" color="primary">Load Contacts</v-btn>
        </v-form>

        <v-card v-if="contacts.length > 0" class="mt-5">
            <v-card-title>
                Contacts
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
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
    import moment from 'moment';
    const {ipcRenderer} = window.require('electron');

    export default {
        data: () => ({
            filename: null,
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

        methods: {
            loadContacts(){
                if (this._.isNull(this.filename)) {
                    this.dialog.title = 'Error';
                    this.dialog.message = 'Please select a file name.';
                    this.dialog.color = 'error';
                    this.dialog.state = true;
                } else {
                    ipcRenderer.on('contactsLoaded', (event, arg) => {
                        this.contacts = arg;

                        this.dialog.title = 'Contacts Copied';
                        this.dialog.message = 'Your contacts have been copied to your clipboard. You may now paste them into the Individual List section of the Kenwood software to import them.';
                        this.dialog.color = 'success';
                        this.dialog.state = true;
                    });

                    ipcRenderer.send('loadContacts', this.filename.path);
                }
            },

            moment(date){
                return moment(date);
            }
        },

        filters: {
            fromNow(date){
                return moment(date).fromNow();
            }
        }
    };
</script>