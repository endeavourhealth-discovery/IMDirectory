// services/toast.ts
import type { ToastServiceMethods } from "primevue/toastservice";

let toast: ToastServiceMethods | null = null;

export function setToastInstance(instance: ToastServiceMethods) {
  toast = instance;
}

export function showError(summary: string, detail?: string) {
  toast?.add({
    severity: "error",
    summary,
    detail,
    life: 5000
  });
}

export function showSuccess(summary: string, detail?: string) {
  toast?.add({
    severity: "success",
    summary,
    detail,
    life: 3000
  });
}
