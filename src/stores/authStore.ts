import { defineStore } from "pinia";
import { AuthState } from "@/stores/types/authState";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    registeredUsername: "",
    authReturnPath: ""
  }),
  actions: {
    updateRegisteredUsername(username: string) {
      this.registeredUsername = username;
    },
    updateAuthReturnPath(path: string) {
      if (
        !(
          path.startsWith("/user/login") ||
          path.startsWith("/user/register") ||
          path.startsWith("/user/password-recovery") ||
          path.startsWith("/user/confirm-code") ||
          path.startsWith("/user/logout") ||
          path.startsWith("/user/mfa-login") ||
          path.startsWith("/user/changeTemporaryPassword")
        )
      )
        this.authReturnPath = path;
    }
  }
});
