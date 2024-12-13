import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import Toast, { PluginOptions, POSITION } from 'vue-toastification';
// Assurez-vous d'importer le CSS
import 'vue-toastification/dist/index.css';

const options: PluginOptions = {
  // Configurations optionnelles (facultatif)
  position: POSITION.TOP_RIGHT,
  timeout: 5000,
  closeOnClick: true,
  pauseOnHover: true,
};

const app = createApp(App)

app.use(router)
app.use(Toast, options);
app.mount('#app')
