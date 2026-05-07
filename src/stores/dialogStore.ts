import { ref } from "vue";

import { defineStore } from "pinia";
import { DynamicDialogInstance, DynamicDialogOptions } from "primevue/dynamicdialogoptions";
import { useDialog } from "primevue/usedialog";

type PrimeDialog = ReturnType<typeof useDialog>;

export const useDialogStore = defineStore("dialog", () => {
  const dialogService = ref<PrimeDialog | null>();
  let dialogRef = ref<DynamicDialogInstance | null>();
  let resolver: ((v: any) => void) | null;

  let isLoading = ref(false);
  let error = ref<string | null>();

  function register(service: PrimeDialog) {
    dialogService.value = service;
  }

  function open(component: any, data?: DynamicDialogOptions): Promise<any> {
    if (!dialogService) throw new Error("Dialog service not registered correctly.");

    error.value = null;

    return new Promise(resolve => {
      resolver = resolve;
      dialogRef.value = dialogService.value!.open(component, data);
    });
  }

  function resolve(data: any) {
    resolver?.(data);
    cleanup();
  }

  async function confirm(preConfirm: (...args: unknown[]) => Promise<boolean>) {
    if (isLoading.value) return;

    error.value = null;
    isLoading.value = true;

    if (preConfirm) {
      const result = await preConfirm();
      if (!result) {
        isLoading.value = false;
        return;
      }
    }
    resolve({ confirm: true });
  }

  function cancel() {
    resolve({ confirm: false });
  }

  function deny() {
    resolve({ deny: true });
  }

  function cleanup() {
    resolver = null;
    dialogRef.value?.close();
    dialogRef.value = null;
    isLoading.value = false;
    error.value = null;
  }

  function setError(err: any) {
    error.value = err;
  }

  return {
    register,
    open,
    confirm,
    cancel,
    deny,
    setError,
    error,
    get isLoading() {
      return isLoading;
    }
  };
});
