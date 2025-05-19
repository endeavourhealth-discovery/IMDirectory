import { createApp, ComponentPublicInstance } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import VueClipboard from "vue3-clipboard";
import { worker } from "./mocks/browser";

declare module "axios" {
  export interface AxiosRequestConfig {
    raw?: boolean;
    silent?: boolean;
  }
}

declare module "vue-router" {
  interface RouteMeta {
    requiresLicense?: boolean;
    transition?: string;
    mode?: "in-out" | "out-in" | "default" | undefined;
    transitionDelay?: string;
  }
}

import "./assets/tailwind.css";

import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";

import Tooltip from "primevue/tooltip";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import StyleClass from "primevue/styleclass";
import DialogService from "primevue/dialogservice";
import Ripple from "primevue/ripple";

import { VueShowdownPlugin } from "vue-showdown";

import { Amplify, ResourcesConfig } from "aws-amplify";
import { createPinia } from "pinia";
import { useSharedStore } from "@/stores/sharedStore";
import { AuthService } from "@/services";

const awsconfig = await AuthService.getConfig();
Amplify.configure(awsconfig.data as ResourcesConfig);

// msw initialising
if (import.meta.env.MODE === "mock") {
  await worker.start();
}

const pinia = createPinia();

const app = createApp(App)
  .use(pinia)
  .use(router)
  .use(PrimeVue, {
    ripple: true,
    local: { dateFormat: "dd/mm/yyyy" },
    theme: { preset: Aura, options: { darkModeSelector: ".my-app-dark", cssLayer: { name: "primevue", order: "theme, base, primevue" } } }
  })
  .use(ConfirmationService)
  .use(ToastService)
  .use(DialogService)
  .use(VueClipboard, {
    autoSetContainer: true,
    appendToBody: true
  })
  .use(VueShowdownPlugin, { flavor: "github" })
  .directive("tooltip", Tooltip)
  .directive("styleclass", StyleClass)
  .directive("ripple", Ripple)
  .component("IMFontAwesomeIcon", IMFontAwesomeIcon);

const sharedStore = useSharedStore();

if (window.Cypress) {
  window.__app__ = app;
}

app.mount("#app");

// Vue application exceptions
app.config.errorHandler = async (err: unknown, _instance: ComponentPublicInstance | null, info: string) => {
  console.error(err);
  _instance?.$toast.add({
    severity: "error",
    summary: info,
    detail: err
  });

  sharedStore.updateError(err as string);
  await router.push({ name: "VueError" });
};
