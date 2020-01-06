<template>
    <v-app v-cloak>

        <v-app-bar
                app
                color="primary"
                dark
        >
            <div class="d-flex align-center">

                <h3 class="title">
                    <v-icon>mdi-application-import</v-icon>
                    Kenwood Contact Importer
                </h3>
            </div>

            <v-spacer></v-spacer>

            <span>v{{ app.version }}</span>
        </v-app-bar>

        <v-content>
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
    const {remote} = window.require('electron');

    export default {
        name: 'App',

        components: {},

        data: () => ({
            app: {
                version: '1.0.0'
            }
        }),

        mounted(){
            this.app.version = remote.app.getVersion();
        }
    };
</script>

<style>
    [v-cloak] {
        display: none;
    }
</style>