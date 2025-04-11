import './assets/main.css'
import 'element-plus/es/components/message/style/css'
import { createApp } from 'vue'
import VueCesium from 'vue-cesium'
import App from './App.vue'

import 'vue-cesium/dist/index.css'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(VueCesium)

app.mount('#app')
