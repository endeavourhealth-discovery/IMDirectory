import { defineStore } from "pinia";
import { SharedState } from "@/stores/types/sharedState";
import { IM } from "@/vocabulary";
import localStorageWithExpiry from "@/helpers/LocalStorageWithExpiry";
import { TagSeverity } from "@/enums";

export const useSharedStore = defineStore("shared", {
  state: (): SharedState => ({
    showCookieConsent: false,
    showSnomedLicense: false,
    showUprnConsent: false,
    tagSeverityMatches: [
      { "@id": IM.ACTIVE, severity: TagSeverity.SUCCESS },
      { "@id": IM.DRAFT, severity: TagSeverity.WARNING },
      { "@id": IM.INACTIVE, severity: TagSeverity.DANGER }
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
    updateActiveProfile(value: { uuid: string; activeClausePath: string }) {
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
    updateTagSeverityMatches(items: { "@id": string; severity: TagSeverity }[]) {
      this.tagSeverityMatches = items;
    },
    updateError(error: string) {
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
