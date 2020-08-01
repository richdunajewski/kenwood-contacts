<template>
    <v-app v-cloak>

        <!--        <v-app-bar-->
        <!--                app-->
        <!--                color="primary"-->
        <!--                dark-->
        <!--        >-->
        <!--            <div class="d-flex align-center">-->

        <!--                <h3 class="title">-->
        <!--                    <v-icon>mdi-application-import</v-icon>-->
        <!--                    Kenwood Contact Importer-->
        <!--                </h3>-->
        <!--            </div>-->

        <!--            <v-spacer></v-spacer>-->

        <!--            <span>v{{ app.version }}</span>-->
        <!--        </v-app-bar>-->

        <v-content>
            <router-view></router-view>
        </v-content>

        <v-footer padless>
            <v-row>
                <v-col cols="12" class="pb-0">
                    <v-card flat tile class="black">
                        <v-card-text class="white--text text-center">
                    <span class="caption">
                        Copyright &copy; 2020 <a href="https://richdunajewski.com/"
                                                 target="_blank" class="white--text"
                                                 @click.prevent="externalLink">Rich Dunajewski</a> and licensed under the MIT license.<br>
                        <span class="text-uppercase">Kenwood</span> is a trademark of the JVCKENWOOD Corporation.
                    </span>
                            <br>
                            <span class="caption">v{{ app.version }}</span>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-footer>
    </v-app>
</template>

<script>
    const {remote, shell} = window.require('electron');

    export default {
        name: 'App',

        components: {},

        data: () => ({
            app: {
                version: '0.0.0'
            }
        }),

        methods: {
            externalLink(e) {
                shell.openExternal(e.target.href);
            }
        },

        mounted() {
            //load app version from Electron
            this.app.version = remote.app.getVersion();
        }
    };
</script>

<style>
    [v-cloak] {
        display: none;
    }
</style>