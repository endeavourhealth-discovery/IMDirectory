import Swal, { SweetAlertResult } from "sweetalert2";
import { Router } from "vue-router";

export async function directToLogin(router: Router) {
  await Swal.fire({
    icon: "warning",
    title: "Please Login to continue",
    showCancelButton: true,
    confirmButtonText: "Login",
    reverseButtons: true
  }).then((result: SweetAlertResult) => {
    if (result.isConfirmed) {
      console.log("redirecting to login");
      router.push({ name: "Login" });
    } else {
      console.log("redirecting to landing page");
      router.push({ name: "LandingPage" });
    }
  });
}
