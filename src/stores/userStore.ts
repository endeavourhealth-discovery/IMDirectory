import { defineStore } from "pinia";
import { UserState } from "@/stores/types/userState";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { EntityService, UserService } from "@/services";
import { HistoryItem, RecentActivityItem } from "@/interfaces";
import PrimeVuePresetThemes from "@/enums/PrimeVuePresetThemes";
import PrimeVueColors from "@/enums/PrimeVueColors";
import localStorageWithExpiry from "@/helpers/LocalStorageWithExpiry";

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    cookiesEssentialAccepted: localStorageWithExpiry.getItem("cookiesEssentialAccepted") === true ? true : false,
    cookiesOptionalAccepted: localStorageWithExpiry.getItem("cookiesOptionalAccepted") === true ? true : false,
    currentPreset: undefined,
    currentPrimaryColor: undefined,
    currentSurfaceColor: undefined,
    darkMode: false,
    currentScale: "14px",
    currentUser: undefined,
    favourites: [] as string[],
    history: [] as HistoryItem[],
    recentLocalActivity: [] as RecentActivityItem[],
    snomedLicenseAccepted: localStorageWithExpiry.getItem("snomedLicenseAccepted") === true ? true : false,
    uprnAgreementAccepted: localStorageWithExpiry.getItem("uprnAgreementAccepted") === true ? true : false,
    organisations: [] as string[]
  }),
  getters: {
    isLoggedIn: state => isObjectHasKeys(state.currentUser),
    isAdmin: state => (state.currentUser?.roles.includes("IMAdmin") ? true : false)
  },
  actions: {
    clearAllFromUserDatabase() {
      this.currentPreset = PrimeVuePresetThemes.AURA;
      this.currentPrimaryColor = PrimeVueColors.EMERALD;
      this.currentSurfaceColor = PrimeVueColors.SLATE;
      this.darkMode = false;
      this.currentScale = "14px";
      this.favourites = [];
      this.recentLocalActivity = [];
    },
    clearOptionalCookies() {
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
      localStorageWithExpiry.setItem("cookiesEssentialAccepted", bool);
    },
    updateCookiesOptionalAccepted(bool: boolean) {
      this.cookiesOptionalAccepted = bool;
      localStorageWithExpiry.setItem("cookiesOptionalAccepted", bool);
    },
    async getAllFromUserDatabase(): Promise<void> {
      if (this.currentUser) {
        this.clearAllFromLocalStorage();
        const data = await UserService.getUserData();
        if (data.preset) this.currentPreset = data.preset;
        if (data.primaryColor) this.currentPrimaryColor = data.primaryColor;
        if (data.darkMode) this.darkMode = data.darkMode;
        if (data.scale) this.currentScale = data.scale;
        if (data.organisations) this.organisations = data.organisations;
        if (data.favourites) this.favourites = data.favourites;
        if (data.mru) this.recentLocalActivity = data.mru;
      } else this.getAllFromLocalStorage();
    },
    getAllFromLocalStorage(): void {
      const preset = localStorageWithExpiry.getItem("preset");
      if (preset && Object.values(PrimeVuePresetThemes).includes(preset as PrimeVuePresetThemes)) this.currentPreset = preset as PrimeVuePresetThemes;
      const darkMode = localStorageWithExpiry.getItem("darkMode");
      if (darkMode === "true") this.darkMode = true;
      else this.darkMode = false;
      const primaryColor = localStorageWithExpiry.getItem("primaryColor");
      if (primaryColor && Object.values(PrimeVueColors).includes(primaryColor as PrimeVueColors)) this.currentPrimaryColor = primaryColor as PrimeVueColors;
      const surfaceColor = localStorageWithExpiry.getItem("surfaceColor");
      if (surfaceColor && Object.values(PrimeVueColors).includes(surfaceColor as PrimeVueColors)) this.currentSurfaceColor = surfaceColor as PrimeVueColors;
      const scale = localStorageWithExpiry.getItem("scale");
      if (scale) this.currentScale = scale;
    },
    clearAllFromLocalStorage(): void {
      localStorage.removeItem("preset");
      localStorage.removeItem("darkMode");
      localStorage.removeItem("primaryColor");
      localStorage.removeItem("surfaceColor");
      localStorage.removeItem("scale");
    },
    async updateRecentLocalActivity(recentActivityItem: RecentActivityItem) {
      let activity: RecentActivityItem[] = [];

      if (this.currentUser) activity = await UserService.getUserMRU();
      else activity = this.recentLocalActivity ? this.recentLocalActivity : [];

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
      if (this.currentUser) await UserService.updateUserMRU(activity);
      this.recentLocalActivity = activity;
    },
    async clearRecentLocalActivity() {
      if (this.currentUser) await UserService.updateUserMRU([]);
      this.recentLocalActivity = [];
    },
    async updateFavourites(favourite: string) {
      if (favourite !== "http://endhealth.info/im#Favourites") {
        if (!this.favourites.includes(favourite)) {
          this.favourites.push(favourite);
        } else {
          this.favourites.splice(this.favourites.indexOf(favourite), 1);
        }
        if (this.currentUser) await UserService.updateUserFavourites(this.favourites);
      }
    },
    async clearFavourites() {
      if (this.currentUser) await UserService.updateUserFavourites([]);
      this.favourites = [];
    },
    async updatePreset(preset: PrimeVuePresetThemes) {
      this.currentPreset = preset;
      if (this.currentUser) await UserService.updateUserPreset(preset);
      else localStorageWithExpiry.setItem("preset", preset);
    },
    async updatePrimaryColor(color: PrimeVueColors) {
      this.currentPrimaryColor = color;
      if (this.currentUser) await UserService.updateUserPrimaryColor(color);
      else localStorageWithExpiry.setItem("primaryColor", color);
    },
    async updateSurfaceColor(color: PrimeVueColors) {
      this.currentSurfaceColor = color;
      if (this.currentUser) await UserService.updateUserSurfaceColor(color);
      else localStorageWithExpiry.setItem("surfaceColor", color);
    },
    async updateDarkMode(bool: boolean) {
      this.darkMode = bool;
      if (this.currentUser) await UserService.updateUserDarkMode(bool);
      else localStorageWithExpiry.setItem("darkMode", bool);
    },
    async updateCurrentScale(scale: string) {
      this.currentScale = scale;
      if (this.currentUser) await UserService.updateUserScale(scale);
      else localStorageWithExpiry.setItem("scale", scale);
    },
    updateCurrentUser(user: any) {
      this.currentUser = user;
    },
    updateSnomedLicenseAccepted(bool: boolean) {
      this.snomedLicenseAccepted = bool;
      localStorageWithExpiry.setItem("snomedLicenseAccepted", bool);
    },
    updateUprnAgreementAccepted(bool: boolean) {
      this.uprnAgreementAccepted = bool;
      localStorageWithExpiry.setItem("uprnAgreementAccepted", bool);
    },
    async updateOrganisations(organisations: string[]) {
      if (this.currentUser) await UserService.updateUserOrganisations(organisations);
      this.organisations = organisations;
    }
  }
});
