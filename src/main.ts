import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

// ==================== 應用初始化 ====================

const app = createApp(App);

app.mount("#app");

console.log("✅ Vue 應用已掛載");
