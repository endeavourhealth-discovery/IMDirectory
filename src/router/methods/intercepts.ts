import { Router } from "vue-router";

import AlertDialog from "@/components/shared/dynamicDialogs/AlertDialog.vue";
import { SecurityService } from "@/services";
import { useDialogStore } from "@/stores/dialogStore";
import { useSharedStore } from "@/stores/sharedStore";

export async function directToLogin(router: Router) {
  const sharedStore = useSharedStore();
  const dialogStore = useDialogStore();
  console.log("directToLogin");
  await dialogStore
    .open(AlertDialog, {
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
        if (!sharedStore.signinUrl) {
          sharedStore.updateSigninUrl(await SecurityService.getLoginUrl());
        }
        window.location.href = sharedStore.signinUrl;
      } else {
        console.log("redirecting to landing page");
        await router.push("/directory");
      }
    });
}
