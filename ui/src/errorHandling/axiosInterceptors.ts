import router from "@/router";
import { useUserStore } from "@/stores/userStore";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Auth } from "aws-amplify";
import { ComponentPublicInstance } from "vue";

export function setupAxiosInterceptors(axios: any, vm: ComponentPublicInstance) {
  const userStore = useUserStore();
  axios.interceptors.request.use(async (request: any) => {
    if (userStore.isLoggedIn) {
      if (!request.headers) request.headers = {};
      request.headers.Authorization = "Bearer " + (await Auth.currentSession()).getIdToken().getJwtToken();
    }
    return request;
  });

  axios.interceptors.response.use(
    (response: any) => {
      return isObjectHasKeys(response, ["data"]) ? response.data : undefined;
    },
    (error: any) => {
      if (error?.response?.config?.raw) return Promise.reject(error);
      if (error?.response?.status === 403) {
        if (error.response.data) {
          vm.$toast.add({
            severity: "error",
            summary: "Access denied",
            detail: error.response.data.debugMessage
          });
        } else if (error.config.url) {
          vm.$toast.add({
            severity: "error",
            summary: "Access denied",
            detail: "Login required for " + error.config.url.substring(error.config.url.lastIndexOf("/") + 1) + "."
          });
        } else {
          vm.$toast.add({
            severity: "error",
            summary: "Access denied"
          });
        }
        router.push({ name: "AccessDenied" });
      } else if (error?.response?.status === 401) {
        vm.$toast.add({
          severity: "error",
          summary: "Access denied",
          detail:
            "Insufficient clearance to access " +
            error.config.url.substring(error.config.url.lastIndexOf("/") + 1) +
            ". Please contact an admin to change your account security clearance if you require access to this resource."
        });
        router.push({ name: "AccessDenied" }).then();
      } else if (error?.response?.data?.code && error?.response?.status > 399 && error?.response?.status < 500) {
        console.error(error.response.data);
        vm.$toast.add({
          severity: "error",
          summary: error.response.data.code,
          detail: error.response.data.debugMessage
        });
      } else if (error?.response?.status >= 500 && error.code === "ERR_BAD_RESPONSE") {
        router.push({ name: "ServerOffline" }).then();
      } else if (error.code === "ERR_CANCELED") {
        return;
      } else if (error.code === "ERR_BAD_REQUEST") {
        router.push({ name: "ServerOffline" }).then();
      } else {
        return Promise.reject(error);
      }
    }
  );
}
