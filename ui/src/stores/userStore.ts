import { defineStore } from "pinia";
import { UserState } from "@/stores/types/userState";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { AuthService, EntityService, UserService } from "@/services";
import { Avatars } from "@im-library/constants";
import { CustomAlert, HistoryItem, RecentActivityItem, User } from "@im-library/interfaces";

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    cookiesEssentialAccepted: localStorage.getItem("cookiesEssentialAccepted") === "true" ? true : false,
    cookiesOptionalAccepted: localStorage.getItem("cookiesOptionalAccepted") === "true" ? true : false,
    currentTheme: localStorage.getItem("currentTheme") as string,
    currentUser: {} as User,
    favourites: [] as string[],
    history: [] as HistoryItem[],
    recentLocalActivity: JSON.parse(localStorage.getItem("recentLocalActivity") ?? "[]") as RecentActivityItem[],
    snomedLicenseAccepted: localStorage.getItem("snomedLicenseAccepted") === "true" ? true : false
  }),
  getters: {
    isLoggedIn: state => isObjectHasKeys(state.currentUser)
  },
  actions: {
    clearOptionalCookies() {
      localStorage.removeItem("currentTheme");
      localStorage.removeItem("favourites");
      localStorage.removeItem("recentLocalActivity");
      localStorage.removeItem("directoryMainSplitterVertical");
      localStorage.removeItem("directoryMainSplitterHorizontal");
      localStorage.removeItem("viewerMainSplitterVertical");
      localStorage.removeItem("viewerMainSplitterHorizontal");
      localStorage.removeItem("eclEditorSavedString");
      localStorage.removeItem("editorSavedEntity");
      localStorage.removeItem("creatorSavedEntity");
      localStorage.removeItem("editorSelectedIri");
    },
    updateCookiesEssentialAccepted(bool: boolean) {
      this.cookiesEssentialAccepted = bool;
      localStorage.setItem("cookiesEssentialAccepted", String(bool));
    },
    updateCookiesOptionalAccepted(bool: boolean) {
      this.cookiesOptionalAccepted = bool;
      localStorage.setItem("cookiesOptionalAccepted", String(bool));
    },
    async initFavourites() {
      const favourites = JSON.parse(localStorage.getItem("favourites") ?? "[]") as string[];
      for (let index = 0; index < favourites.length; index++) {
        const iriExists = await EntityService.iriExists(favourites[index]);
        if (!iriExists) {
          favourites.splice(index, 1);
        }
      }
      localStorage.setItem("favourites", JSON.stringify(favourites));
      this.favourites = favourites;
    },
    async updateRecentLocalActivity(recentActivityItem: RecentActivityItem) {
      let activity: RecentActivityItem[] = this.currentUser.id ? await UserService.getUserMRU(this.currentUser.id) : this.recentLocalActivity;
      activity.forEach(activityItem => {
        activityItem.dateTime = new Date(activityItem.dateTime);
      });
      const foundIndex = activity.findIndex(activityItem => activityItem.iri === recentActivityItem.iri && activityItem.action === recentActivityItem.action);
      if (foundIndex !== -1) {
        activity[foundIndex].dateTime = recentActivityItem.dateTime;
        activity.sort((a, b) => {
          if (a.dateTime.getTime() > b.dateTime.getTime()) {
            return 1;
          } else if (b.dateTime.getTime() > a.dateTime.getTime()) {
            return -1;
          } else {
            return 0;
          }
        });
      } else {
        while (activity.length > 4) activity.shift();
        if (recentActivityItem.iri !== "http://endhealth.info/im#Favourites") {
          activity.push(recentActivityItem);
        }
      }
      //if (this.cookiesOptionalAccepted) localStorage.setItem("recentLocalActivity", JSON.stringify(activity));
      if (this.currentUser.id) await UserService.updateUserMRU(this.currentUser.id, JSON.stringify(activity));
      this.recentLocalActivity = activity;
    },
    updateFavourites(favourite: string) {
      if (favourite !== "http://endhealth.info/im#Favourites") {
        const favourites: string[] = JSON.parse(localStorage.getItem("favourites") ?? "[]");
        if (!favourites.includes(favourite)) {
          favourites.push(favourite);
        } else {
          favourites.splice(favourites.indexOf(favourite), 1);
        }
        if (this.cookiesOptionalAccepted) localStorage.setItem("favourites", JSON.stringify(favourites));
        this.favourites = favourites;
      }
    },
    updateCurrentTheme(theme: string) {
      this.currentTheme = theme;
    },
    updateCurrentUser(user: any) {
      this.currentUser = user;
    },
    async logoutCurrentUser() {
      let result = { status: 500, message: "Logout (userStore) failed" } as CustomAlert;
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
    },
    updateSnomedLicenseAccepted(bool: boolean) {
      this.snomedLicenseAccepted = bool;
      localStorage.setItem("snomedLicenseAccepted", bool === true ? "true" : "");
    }
  }
});
