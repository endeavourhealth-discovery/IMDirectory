import { defineStore } from "pinia";
import { AuthState } from "@/stores/types/authState";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    registeredUsername: "",
    authReturnUrl: "",
    previousAppUrl: ""
  }),
  actions: {
    updateRegisteredUsername(username: string) {
      this.registeredUsername = username;
    },
    updateAuthReturnUrl(url: string) {
      if (!(url.startsWith("/#/user/login") || url.startsWith("/#/user/register") || url.startsWith("/#/user/password-recovery"))) this.authReturnUrl = url;
    },
    updatePreviousAppUrl() {
      this.previousAppUrl = window.location.href;
    }
  }
});
