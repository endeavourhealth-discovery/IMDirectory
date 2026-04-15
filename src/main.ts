import { ComponentPublicInstance, createApp } from "vue";

import { injectionKeysVueLibrary } from "vue-library";
import { IMFontAwesomeIcon } from "vue-library/components";

import Aura from "@primeuix/themes/aura";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import DialogService from "primevue/dialogservice";
import Ripple from "primevue/ripple";
import StyleClass from "primevue/styleclass";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";
import VueClipboard from "vue3-clipboard";
import { VueShowdownPlugin } from "vue-showdown";

import { useSharedStore } from "@/stores/sharedStore";

import App from "./App.vue";
import "./assets/tailwind.css";
import { useDirectService } from "./composables/useDirectService";
import { worker } from "./mocks/browser";
import router from "./router";
import { EntityService, UserService } from "./services";

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
  .component("IMFontAwesomeIcon", IMFontAwesomeIcon)
  .provide(injectionKeysVueLibrary.userService, UserService)
  .provide(injectionKeysVueLibrary.useDirectService, useDirectService)
  .provide(injectionKeysVueLibrary.entityService, EntityService);

const sharedStore = useSharedStore();

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
