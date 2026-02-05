import { useSharedStore } from "@/stores/sharedStore";
import Swal, { SweetAlertResult } from "sweetalert2";
import { Router } from "vue-router";
import GenericDialog from "@/components/shared/dynamicDialogs/GenericDialog.vue";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { toRaw } from "vue";
import { getDialog } from "@/services/DialogService";
import { useDialogStore } from "@/stores/dialogStore";

export async function directToLogin(router: Router) {
  const sharedStore = useSharedStore();
  const dialogStore = useDialogStore();
  console.log("directToLogin");
  await dialogStore
    .open(GenericDialog, {
      props: { modal: true, style: { width: "30vw" }, closable: false },
      data: {
        icon: "fa-regular fa-circle-exclamation",
        title: "Please Login to continue",
        cancelButtonText: "Cancel",
        confirmButtonText: "Login",
        reverseButtons: true
      }
    })
    .then(async (result: any) => {
      if (result?.confirm) {
        console.log("redirecting to login");
        window.location.href = sharedStore.signinUrl;
      } else {
        console.log("redirecting to landing page");
        await router.push({ name: "LandingPage" });
      }
    });
}
