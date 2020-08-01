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

        <v-footer dark color="primary" padless>
            <v-card
                flat
                tile
                class="black">
                <v-card-text class="white--text">
                    <span class="caption text-center">Copyright &copy; 2020 <a href="https://richdunajewski.com/" target="_blank" class="white--text" @click.prevent="externalLink">Rich Dunajewski</a> and licensed under the MIT license.<br>
                        <span class="text-uppercase">Kenwood</span> is a trademark of the JVCKENWOOD Corporation.</span>
                </v-card-text>
            </v-card>
            <p class="caption text-center">Copyright &copy; 2020 <a href="https://richdunajewski.com/" target="_blank" class="white--text" @click.prevent="externalLink">Rich Dunajewski</a> and licensed under the MIT license.<br>
                <span class="text-uppercase">Kenwood</span> is a trademark of the JVCKENWOOD Corporation.</p>

<!--            <span class="caption text-center">v{{ app.version }}</span>-->
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