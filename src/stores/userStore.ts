import { defineStore } from "pinia";
import { UserState } from "@/stores/types/userState";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { EntityService, UserService } from "@/services";
import { HistoryItem, RecentActivityItem } from "@/interfaces";
import PrimeVuePresetThemes from "@/enums/PrimeVuePresetThemes";
import PrimeVueColors from "@/enums/PrimeVueColors";

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    cookiesEssentialAccepted: localStorage.getItem("cookiesEssentialAccepted") === "true" ? true : false,
    cookiesOptionalAccepted: localStorage.getItem("cookiesOptionalAccepted") === "true" ? true : false,
    currentPreset: undefined,
    currentPrimaryColor: undefined,
    currentSurfaceColor: undefined,
    darkMode: false,
    currentScale: "14px",
    currentUser: undefined,
    favourites: [] as string[],
    history: [] as HistoryItem[],
    recentLocalActivity: [] as RecentActivityItem[],
    snomedLicenseAccepted: localStorage.getItem("snomedLicenseAccepted") === "true" ? true : false,
    uprnAgreementAccepted: localStorage.getItem("uprnAgreementAccepted") === "true" ? true : false,
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
      localStorage.setItem("cookiesEssentialAccepted", String(bool));
    },
    updateCookiesOptionalAccepted(bool: boolean) {
      this.cookiesOptionalAccepted = bool;
      localStorage.setItem("cookiesOptionalAccepted", String(bool));
    },
    async initFavourites() {
      let favourites: string[] = [];
      if (this.currentUser) {
        const result = await UserService.getUserFavourites();
        if (result) favourites = result;
      } else favourites = this.favourites ? this.favourites : [];
      for (let index = 0; index < favourites.length; index++) {
        const iriExists = await EntityService.iriExists(favourites[index]);
        if (!iriExists) {
          favourites.splice(index, 1);
        }
      }
      if (this.currentUser) await UserService.updateUserFavourites(favourites);
      this.favourites = favourites;
    },
    async getAllFromUserDatabase(): Promise<void> {
      if (this.currentUser) {
        const preset = await UserService.getUserPreset();
        if (preset) {
          this.currentPreset = preset;
          localStorage.setItem("preset", preset);
        }
        const primaryColor = await UserService.getUserPrimaryColor();
        if (primaryColor) {
          this.currentPrimaryColor = primaryColor;
          localStorage.setItem("primaryColor", primaryColor);
        }
        const surfaceColor = await UserService.getUserSurfaceColor();
        if (surfaceColor) {
          this.currentSurfaceColor = surfaceColor;
          localStorage.setItem("surfaceColor", surfaceColor);
        }
        const darkMode = await UserService.getUserDarkMode();
        if (darkMode) {
          this.darkMode = darkMode;
          localStorage.setItem("darkMode", darkMode === true ? "true" : "");
        }
        const scaleResult = await UserService.getUserScale();
        if (scaleResult) {
          this.currentScale = scaleResult;
          localStorage.setItem("scale", scaleResult);
        }
        const favourites = await UserService.getUserFavourites();
        if (favourites?.length) this.favourites = favourites;
        const recentActivityResult = await UserService.getUserMRU();
        if (recentActivityResult) this.recentLocalActivity = recentActivityResult;
        const organisationResults = await UserService.getUserOrganisations();
        if (organisationResults) this.organisations = organisationResults;
      } else this.getAllFromLocalStorage();
    },
    getAllFromLocalStorage(): void {
      const preset = localStorage.getItem("preset");
      if (preset && Object.values(PrimeVuePresetThemes).includes(preset as PrimeVuePresetThemes)) this.currentPreset = preset as PrimeVuePresetThemes;
      const darkMode = localStorage.getItem("darkMode");
      if (darkMode === "true") this.darkMode = true;
      else this.darkMode = false;
      const primaryColor = localStorage.getItem("primaryColor");
      if (primaryColor && Object.values(PrimeVueColors).includes(primaryColor as PrimeVueColors)) this.currentPrimaryColor = primaryColor as PrimeVueColors;
      const surfaceColor = localStorage.getItem("surfaceColor");
      if (surfaceColor && Object.values(PrimeVueColors).includes(surfaceColor as PrimeVueColors)) this.currentSurfaceColor = surfaceColor as PrimeVueColors;
      const scale = localStorage.getItem("scale");
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
      localStorage.setItem("preset", preset);
    },
    async updatePrimaryColor(color: PrimeVueColors) {
      this.currentPrimaryColor = color;
      if (this.currentUser) await UserService.updateUserPrimaryColor(color);
      localStorage.setItem("primaryColor", color);
    },
    async updateSurfaceColor(color: PrimeVueColors) {
      this.currentSurfaceColor = color;
      if (this.currentUser) await UserService.updateUserSurfaceColor(color);
      localStorage.setItem("surfaceColor", color);
    },
    async updateDarkMode(bool: boolean) {
      this.darkMode = bool;
      if (this.currentUser) await UserService.updateUserDarkMode(bool);
      localStorage.setItem("darkMode", bool === true ? "true" : "");
    },
    async updateCurrentScale(scale: string) {
      this.currentScale = scale;
      if (this.currentUser) await UserService.updateUserScale(scale);
      localStorage.setItem("scale", scale);
    },
    updateCurrentUser(user: any) {
      this.currentUser = user;
    },
    updateSnomedLicenseAccepted(bool: boolean) {
      this.snomedLicenseAccepted = bool;
      localStorage.setItem("snomedLicenseAccepted", bool === true ? "true" : "");
    },
    updateUprnAgreementAccepted(bool: boolean) {
      this.uprnAgreementAccepted = bool;
      localStorage.setItem("uprnAgreementAccepted", bool === true ? "true" : "");
    },
    async updateOrganisations(organisations: string[]) {
      if (this.currentUser) await UserService.updateUserOrganisations(organisations);
      this.organisations = organisations;
    }
  }
});
