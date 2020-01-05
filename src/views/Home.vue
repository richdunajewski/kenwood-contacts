<template>
    <v-container>
        <h3 class="title">Contact File Import</h3>

        <v-form ref="import">
            <v-file-input
                label="Contacts File (CSV)"
            ></v-file-input>

            <v-btn type="submit" color="primary">Load Contacts</v-btn>
        </v-form>
    </v-container>
</template>