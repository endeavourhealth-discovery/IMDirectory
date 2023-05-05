import { defineStore } from "pinia";
import { User } from "@im-library/interfaces";
import { UserState } from "@/stores/types/userState";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { AuthService, EntityService } from "@/services";
import { Avatars } from "@im-library/constants";
import { CustomAlert, HistoryItem, RecentActivityItem } from "@im-library/interfaces";
import { useCookieStore } from "@/stores/cookieStore";
export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    currentUser: {} as User,
    favourites: [] as string[],
    history: [] as HistoryItem[],
    recentLocalActivity: JSON.parse(localStorage.getItem("recentLocalActivity") || "[]") as RecentActivityItem[],
    currentTheme: localStorage.getItem("currentTheme") as string,
  }),
  getters: {
    isLoggedIn: state => isObjectHasKeys(state.currentUser)
  },
  actions: {
    async initFavourites() {
      const favourites = JSON.parse(localStorage.getItem("favourites") || "[]") as string[];
      for (let index = 0; index < favourites.length; index++) {
        const iriExists = await EntityService.iriExists(favourites[index]);
        if (!iriExists) {
          favourites.splice(index, 1);
        }
      }
      localStorage.setItem("favourites", JSON.stringify(favourites));
      this.favourites = favourites;
    },
    updateRecentLocalActivity(recentActivityItem: RecentActivityItem) {
      let activity: RecentActivityItem[] = JSON.parse(localStorage.getItem("recentLocalActivity") || "[]");
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

      if (useCookieStore().cookiesOptionalAccepted) localStorage.setItem("recentLocalActivity", JSON.stringify(activity));
      this.recentLocalActivity = activity;
    },
    updateFavourites(favourite: string) {
      if (favourite !== "http://endhealth.info/im#Favourites") {
        const favourites: string[] = JSON.parse(localStorage.getItem("favourites") || "[]");
        if (!favourites.includes(favourite)) {
          favourites.push(favourite);
        } else {
          favourites.splice(favourites.indexOf(favourite), 1);
        }
        if (useCookieStore().cookiesOptionalAccepted) localStorage.setItem("favourites", JSON.stringify(favourites));
        this.favourites = favourites;
      }
    },
    updateCurrentTheme(theme: any) {
      this.currentTheme = theme;
      if (useCookieStore().cookiesOptionalAccepted) localStorage.setItem("currentTheme", theme);
    },
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
