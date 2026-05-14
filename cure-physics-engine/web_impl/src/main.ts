import { createApp } from "vue";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";

import App from "./App.vue";
import router from "./router";
import "@shared/css/variable.css";

const app = createApp(App);
app.use(router);
app.mount("#app");
