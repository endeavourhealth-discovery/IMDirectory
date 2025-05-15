import { ToastSeverity } from "@/enums";
import { ToastOptions } from "@/models";
import { useToast } from "primevue/usetoast";
import { Ref } from "vue";

function setupCopyToClipboard(valueToCopy?: Ref<string>, onCopyMessage?: string, onErrorMessage?: string) {
  const toast = useToast();

  function copyToClipboard() {
    return valueToCopy?.value;
  }

  function copyObjectToClipboard(navigator: Navigator, object: any) {
    try {
      navigator.clipboard.writeText(JSON.stringify(object));
      onCopy();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log(`Error copying to clipboard ${error}`);
      onCopyError();
    }
    return valueToCopy?.value;
  }

  function onCopy(): void {
    toast.add(new ToastOptions(ToastSeverity.SUCCESS, onCopyMessage ?? "Value copied to clipboard"));
  }

  function onCopyError(): void {
    toast.add(new ToastOptions(ToastSeverity.ERROR, onErrorMessage ?? "Failed to copy value to clipboard"));
  }

  return {
    copyToClipboard,
    copyObjectToClipboard,
    onCopy,
    onCopyError
  };
}
export default setupCopyToClipboard;
