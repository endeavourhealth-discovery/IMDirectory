import router from "@/router";
import { ComponentPublicInstance } from "vue";

export function setupExternalErrorHandler(vm: ComponentPublicInstance) {
  window.addEventListener("unhandledrejection", e => {
    e.preventDefault();
    console.error(e);
    if (e.reason?.response?.data?.title)
      vm.$toast.add({
        severity: "error",
        summary: e.reason.response.data.title,
        detail: e.reason.response.data.detail
      });
    else if (e.reason?.name)
      vm.$toast.add({
        severity: "error",
        summary: e.reason.name,
        detail: e.reason.message
      });
    else
      vm.$toast.add({
        severity: "error",
        summary: "An error occurred",
        detail: e.reason
      });
    router.push({ name: "VueError" });
  });
}
