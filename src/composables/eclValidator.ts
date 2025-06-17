import LoadingDialog from "@/components/shared/dynamicDialogs/LoadingDialog.vue";
import EclService from "../services/EclService";
import Swal from "sweetalert2";
import { ECLQuery, Query } from "@/interfaces/AutoGen";

function showVerificationDialog(targetElement?: string, dynamicDialog?: any): any {
  if (targetElement && dynamicDialog) {
    const verificationDialog = dynamicDialog.open(LoadingDialog, {
      props: { modal: true, closable: false, closeOnEscape: false, style: { width: "50vw" } },
      data: { title: "Validating", text: "Running validation checks..." }
    });
    return verificationDialog;
  }
  return null;
}

export async function validateModelFromECL(
  ecl: string,
  targetElement?: string,
  dynamicDialog?: any,
  showOnlyInvalid?: boolean,
  showNames?: boolean
): Promise<ECLQuery> {
  const verificationDialog = showVerificationDialog(targetElement, dynamicDialog);
  const eclQuery = await EclService.validateModelFromECL(ecl, showNames ? showNames : false);
  if (targetElement) verificationDialog.close();
  if (targetElement && !eclQuery.status!.valid) await showValidationMessage(true, targetElement);
  else if (targetElement && !showOnlyInvalid) await showValidationMessage(false, targetElement);
  return eclQuery;
}

export async function validateModelFromQuery(query: Query, targetElement?: string, dynamicDialog?: any, showOnlyInvalid?: boolean): Promise<ECLQuery> {
  const verificationDialog = showVerificationDialog(targetElement, dynamicDialog);
  const eclQuery = await EclService.validateModelFromQuery(query);
  if (targetElement) verificationDialog.close();
  if (!eclQuery.status!.valid && targetElement) await showValidationMessage(true, targetElement);
  else if (targetElement && !showOnlyInvalid) await showValidationMessage(false, targetElement);
  return eclQuery;
}

export async function showValidationMessage(invalid: boolean | undefined, targetElement: string) {
  if (!invalid) {
    await Swal.fire({
      target: document.getElementById(targetElement),
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
      target: document.getElementById(targetElement),
      confirmButtonText: "Close",
      confirmButtonColor: "#689F38"
    });
  }
}
