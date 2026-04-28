import { useDialog } from "primevue/usedialog";

type PrimeDialog = ReturnType<typeof useDialog>;

let dialog: PrimeDialog | null = null;

export function registerDialog(service: PrimeDialog) {
  dialog = service;
}

export function getDialog(): PrimeDialog {
  if (!dialog) {
    throw new Error("DialogService not registered");
  }
  return dialog;
}

export default { getDialog };
