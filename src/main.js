import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

Vue.use(VueGoogleMaps, {
  load: {
    key: require('./secrets').keys.maps
  }
})

Vue.mixin({
  methods: {
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
