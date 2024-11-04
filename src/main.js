import './assets/main.css'
import 'element-plus/es/components/message/style/css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
