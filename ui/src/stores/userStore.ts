import { defineStore } from "pinia";
import { User } from "@im-library/interfaces";
import { UserState } from "@/stores/types/userState";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { AuthService, EntityService } from "@/services";
import { Avatars } from "@im-library/constants";
import { CustomAlert } from "@im-library/interfaces";

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    currentUser: {} as User
  }),
  getters: {
    isLoggedIn: state => isObjectHasKeys(state.currentUser)
  },
  actions: {
    updateCurrentUser(user: any) {
      this.currentUser = user;
    },
    async logoutCurrentUser() {
      let result = { status: 500, message: "Logout (rootStore) failed" } as CustomAlert;
      await AuthService.signOut().then(res => {
        if (res.status === 200) {
          useUserStore().updateCurrentUser(null);
          result = res;
        } else {
          result = res;
        }
      });
      return result;
    },
    async authenticateCurrentUser() {
      const result = { authenticated: false };
      await AuthService.getCurrentAuthenticatedUser().then(res => {
        if (res.status === 200 && res.user) {
          const loggedInUser = res.user;
          const foundAvatar = Avatars.find((avatar: string) => avatar === loggedInUser.avatar);
          if (!foundAvatar) {
            loggedInUser.avatar = Avatars[0];
          }
          useUserStore().updateCurrentUser(loggedInUser);
          result.authenticated = true;
        } else {
          this.logoutCurrentUser().then(resLogout => {
            if (resLogout.status === 200) {
              // log.info("Force logout successful");
            } else {
              // log.error("Force logout failed");
            }
          });
        }
      });
      return result;
    }
  }
});
