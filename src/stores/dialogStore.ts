import { defineStore } from "pinia";
import { useDialog } from "primevue/usedialog";
import { DynamicDialogInstance } from "primevue/dynamicdialogoptions";

type PrimeDialog = ReturnType<typeof useDialog>;

export const useDialogStore = defineStore("dialog", () => {
  let dialogService: PrimeDialog | null;
  let dialogRef: DynamicDialogInstance | null;
  let resolver: ((v: boolean) => void) | null;

  function register(service: PrimeDialog) {
    dialogService = service;
  }

  function open(component: any, options?: any): Promise<boolean> {
    if (!dialogService) throw new Error("Dialog not registered");

    return new Promise<boolean>(resolve => {
      resolver = resolve;
      dialogRef = dialogService!.open(component, options);
    });
  }

  function resolve(result: boolean, data: any) {
    resolver?.(result);
    resolver = null;
    dialogRef?.close(data);
    dialogRef = null;
  }

  return { register, open, resolve };
});
