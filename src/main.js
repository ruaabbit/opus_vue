import './assets/main.css'
import 'element-plus/es/components/message/style/css'
import 'vue-cesium/dist/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import VueCesium from 'vue-cesium'

const app = createApp(App)

app.use(router)
app.use(VueCesium, {
    cesiumPath: '/seaice/Cesium/Cesium.js',
})

app.mount('#app')
