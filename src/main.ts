import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./style.css";

// ==================== 應用初始化 ====================

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

app.mount("#app");

console.log("✅ Vue 應用已掛載");
