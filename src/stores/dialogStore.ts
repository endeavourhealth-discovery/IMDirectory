import { defineStore } from "pinia";
import { useDialog } from "primevue/usedialog";
import { DynamicDialogInstance } from "primevue/dynamicdialogoptions";

type PrimeDialog = ReturnType<typeof useDialog>;

export const useDialogStore = defineStore("dialog", () => {
  let dialogService: PrimeDialog | null;
  let dialogRef: DynamicDialogInstance | null;
  let resolver: ((v: any) => void) | null;

  function register(service: PrimeDialog) {
    dialogService = service;
  }

  function open(component: any, data?: any): Promise<any> {
    if (!dialogService) throw new Error("Dialog service not registered correctly.");

    return new Promise<boolean>(resolve => {
      resolver = resolve;
      dialogRef = dialogService!.open(component, data);
    });
  }

  function resolve(data: any) {
    resolver?.(data);
    resolver = null;
    dialogRef?.close();
    dialogRef = null;
  }

  return { register, open, resolve };
});
