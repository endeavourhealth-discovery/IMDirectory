import { ref } from "vue";

import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", () => {
  const registeredUsername = ref<string>("");
  const authReturnPath = ref<string>("");

  function updateRegisteredUsername(username: string) {
    registeredUsername.value = username;
  }

  function updateAuthReturnPath(path: string) {
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
      authReturnPath.value = path;
  }
  return {
    authReturnPath,
    registeredUsername,
    updateAuthReturnPath,
    updateRegisteredUsername
  };
});
