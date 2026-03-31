import { defineStore } from "pinia";
import { useDialog } from "primevue/usedialog";
import { DynamicDialogInstance } from "primevue/dynamicdialogoptions";

type PrimeDialog = ReturnType<typeof useDialog>;
type PreConfirm<T = any> = () => T | false | Promise<T | false>;

export const useDialogStore = defineStore("dialog", () => {
  let dialogService: PrimeDialog | null;
  let dialogRef: DynamicDialogInstance | null;
  let resolver: ((v: any) => void) | null;

  let preConfirm: PreConfirm | null;
  let isLoading = false;
  let error: string | null;

  function register(service: PrimeDialog) {
    dialogService = service;
  }

  function open(component: any, data?: any): Promise<any> {
    if (!dialogService) throw new Error("Dialog service not registered correctly.");

    return new Promise(resolve => {
      resolver = resolve;
      preConfirm = data?.preConfirm ?? null;
      dialogRef = dialogService!.open(component, data);
    });
  }

  function resolve(data: any) {
    resolver?.(data);
    cleanup();
  }

  async function confirm() {
    if (isLoading) return;

    error = null;
    isLoading = true;

    try {
      const result = await preConfirm?.();
      if (result === false) {
        isLoading = false;
        return;
      }
      resolve({ confirm: true, value: result });
    } catch (err) {
      error = err instanceof Error ? err.message : "Something went wrong";
      isLoading = false;
    }
  }

  function cancel() {
    resolve({ confirm: false });
  }

  function deny() {
    resolve({ deny: true });
  }

  function cleanup() {
    resolver = null;
    preConfirm = null;
    dialogRef?.close();
    dialogRef = null;
    isLoading = false;
    error = null;
  }

  return {
    register,
    open,
    confirm,
    cancel,
    deny,
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    }
  };
});
