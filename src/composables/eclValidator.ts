import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import Swal from "sweetalert2";

export function showVerificationDialog(dynamicDialog: any): any {
  return dynamicDialog.open(LoadingDialog, {
    props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
    data: { title: "Validating", text: "Running validation checks..." }
  });
}

export async function showValidationMessage(invalid: boolean | undefined) {
  if (!invalid) {
    await Swal.fire({
      icon: "success",
      title: "Success",
      backdrop: true,
      showClass: { popup: "swal-popup" },
      text: "All entities are valid.",
      confirmButtonText: "Close",
      confirmButtonColor: "#689F38"
    });
  } else {
    await Swal.fire({
      icon: "warning",
      title: "Warning",
      text: "Invalid values found. Please review your entries.",
      confirmButtonText: "Close",
      confirmButtonColor: "#689F38"
    });
  }
}
