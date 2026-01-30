import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import Swal from "sweetalert2";
import GenericDialog from "@/components/shared/dynamicDialogs/GenericDialog.vue";

export function useEclValidator() {
  function showVerificationDialog(dynamicDialog: any): any {
    return dynamicDialog.open(LoadingDialog, {
      props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
      data: { title: "Validating", text: "Running validation checks..." }
    });
  }

  async function showValidationMessage(invalid: boolean | undefined, dynamicDialog: any) {
    if (!invalid) {
      await dialogStore.open(GenericDialog, {
        props: { modal: true, style: { width: "30vw" }, closable: false },
        data: {
          icon: "fa-regular fa-circle-check",
          title: "Success",
          text: "All entities are valid.",
          confirmButtonText: "Close"
        }
      });
    } else {
      await dialogStore.open(GenericDialog, {
        props: { modal: true, style: { width: "30vw" }, closable: false },
        data: {
          icon: "fa-regular fa-circle-exclamation",
          title: "Warning",
          text: "Invalid values found. Please review your entries.",
          confirmButtonText: "Close"
        }
      });
    }
  }
  return { showValidationMessage, showVerificationDialog };
}
