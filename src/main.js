import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import VueLodash from 'vue-lodash'
import lodash from 'lodash'

Vue.use(VueLodash, {lodash: lodash});

Vue.config.productionTip = false;

new Vue({
    vuetify,
    router,
    render: h => h(App)
}).$mount('#app');
