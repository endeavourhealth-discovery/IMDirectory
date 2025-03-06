import { defineStore } from "pinia";
import { SharedState } from "@/stores/types/sharedState";
import { IM } from "@/vocabulary";
import localStorageWithExpiry from "@/helpers/LocalStorageWithExpiry";

export const useSharedStore = defineStore("shared", {
  state: (): SharedState => ({
    showCookieConsent: false,
    showSnomedLicense: false,
    showUprnConsent: false,
    tagSeverityMatches: [
      { "@id": IM.ACTIVE, severity: "success" },
      { "@id": IM.DRAFT, severity: "warning" },
      { "@id": IM.INACTIVE, severity: "danger" }
    ],
    showReleaseNotes: false,
    showReleaseBanner: localStorage.getItem("showReleaseBanner") === "true" ? true : false,
    showDevBanner: localStorageWithExpiry.getItem("showDevBanner") ?? true,
    activeProfile: { uuid: "", activeClausePath: "" },
    error: undefined,
    isPublicMode: undefined,
    isDevMode: undefined
  }),
  actions: {
    updateShowCookieConsent(bool: boolean) {
      this.showCookieConsent = bool;
    },
    updateActiveProfile(value: any) {
      this.activeProfile = value;
    },
    updateShowSnomedLicense(bool: boolean) {
      this.showSnomedLicense = bool;
    },
    updateShowUprnConsent(bool: boolean) {
      this.showUprnConsent = bool;
    },
    updateShowReleaseNotes(bool: boolean) {
      this.showReleaseNotes = bool;
    },
    updateShowReleaseBanner(bool: boolean) {
      this.showReleaseBanner = bool;
      localStorage.setItem("showReleaseBanner", bool === true ? "true" : "");
    },
    updateShowDevBanner(bool: boolean) {
      this.showDevBanner = bool;
      localStorageWithExpiry.setItem("showDevBanner", bool);
    },
    updateTagSeverityMatches(items: any) {
      this.tagSeverityMatches = items;
    },
    updateError(error: any) {
      this.error = error;
    },
    updateIsPublicMode(publicMode: boolean) {
      this.isPublicMode = publicMode;
    },
    updateIsDevMode(devMode: boolean) {
      this.isDevMode = devMode;
    }
  }
});
