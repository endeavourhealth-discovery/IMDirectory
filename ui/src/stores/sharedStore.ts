import { defineStore } from "pinia";
import { SharedState } from "@/stores/types/sharedState";
import { IM } from "@im-library/vocabulary";

export const useSharedStore = defineStore("shared", {
  state: (): SharedState => ({
    showCookieConsent: false,
    showSnomedLicense: false,
    tagSeverityMatches: [
      { "@id": IM.ACTIVE, severity: "success" },
      { "@id": IM.DRAFT, severity: "warning" },
      { "@id": IM.INACTIVE, severity: "danger" }
    ],
    showReleaseNotes: false,
    showBanner: localStorage.getItem("showBanner") === "true" ? true : false,
    activeProfile: { uuid: "", activeClausePath: "" },
    error: undefined
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
    updateShowReleaseNotes(bool: boolean) {
      this.showReleaseNotes = bool;
    },
    updateShowBanner(bool: boolean) {
      this.showBanner = bool;
      localStorage.setItem("showBanner", bool === true ? "true" : "");
    },
    updateTagSeverityMatches(items: any) {
      this.tagSeverityMatches = items;
    },
    updateError(error: any) {
      this.error = error;
    }
  }
});
