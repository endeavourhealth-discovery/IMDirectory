import { useSharedStore } from "@/stores/sharedStore";
import Swal, { SweetAlertResult } from "sweetalert2";
import { Router } from "vue-router";
import { SecurityService } from "@/services";

export async function directToLogin(router: Router) {
  const sharedStore = useSharedStore();
  console.log("directToLogin");
  await Swal.fire({
    icon: "warning",
    title: "Please Login to continue",
    showCancelButton: true,
    confirmButtonText: "Login",
    reverseButtons: true
  }).then(async (result: SweetAlertResult) => {
    if (result.isConfirmed) {
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
