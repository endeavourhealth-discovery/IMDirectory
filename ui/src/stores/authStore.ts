import { defineStore } from "pinia";
import { AuthState } from "@/stores/types/authState";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    registeredUsername: "" as string,
    authReturnUrl: "",
    previousAppUrl: ""
  }),
  actions: {
    updateRegisteredUsername(username: any) {
      this.registeredUsername = username;
    },
    updateAuthReturnUrl(url: any) {
      this.authReturnUrl = url;
    }
  }
});
