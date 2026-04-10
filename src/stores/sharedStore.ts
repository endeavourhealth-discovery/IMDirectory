import { defineStore } from "pinia";
import { IM, TagSeverity } from "vue-library/enums";
import { localStorageWithExpiry } from "vue-library/helpers";
import { ref } from "vue";

export const useSharedStore = defineStore("shared", () => {
  const showCookieConsent = ref<boolean>(false);
  const showSnomedLicense = ref<boolean>(false);
  const showUprnConsent = ref<boolean>(false);
  const tagSeverityMatches = ref<{ iri: string; severity: TagSeverity }[]>([
    { iri: IM.ACTIVE, severity: TagSeverity.SUCCESS },
    { iri: IM.DRAFT, severity: TagSeverity.WARNING },
    { iri: IM.INACTIVE, severity: TagSeverity.DANGER }
  ]);
  const showReleaseNotes = ref<boolean>(false);
  const showReleaseBanner = ref<boolean>(localStorage.getItem("showReleaseBanner") === "true" ? true : false);
  const showDevBanner = ref<boolean>(localStorageWithExpiry.getItem("showDevBanner") ?? true);
  const activeProfile = ref<{ uuid: string; activeClausePath: string }>({ uuid: "", activeClausePath: "" });
  const error = ref<string>("");
  const isPublicMode = ref<boolean | undefined>();
  const isDevMode = ref<boolean>(true);
  const signinUrl = ref<string>("");
  const signupUrl = ref<string>("");

  function updateShowCookieConsent(bool: boolean) {
    showCookieConsent.value = bool;
  }

  function updateActiveProfile(newActiveProfile: { uuid: string; activeClausePath: string }) {
    activeProfile.value = newActiveProfile;
  }

  function updateShowSnomedLicense(bool: boolean) {
    showSnomedLicense.value = bool;
  }

  function updateShowUprnConsent(bool: boolean) {
    showUprnConsent.value = bool;
  }

  function updateShowReleaseNotes(bool: boolean) {
    showReleaseNotes.value = bool;
  }

  function updateShowReleaseBanner(bool: boolean) {
    showReleaseBanner.value = bool;
    localStorage.setItem("showReleaseBanner", bool === true ? "true" : "");
  }

  function updateShowDevBanner(bool: boolean) {
    showDevBanner.value = bool;
    localStorageWithExpiry.setItem("showDevBanner", bool);
  }

  function updateTagSeverityMatches(items: { iri: string; severity: TagSeverity }[]) {
    tagSeverityMatches.value = items;
  }

  function updateError(newError: string) {
    error.value = newError;
  }

  function updateIsPublicMode(publicMode: boolean) {
    isPublicMode.value = publicMode;
  }

  function updateIsDevMode(devMode: boolean) {
    isDevMode.value = devMode;
  }

  function updateSigninUrl(url: string) {
    signinUrl.value = url;
  }

  function updateSignupUrl(url: string) {
    signupUrl.value = url;
  }
  return {
    activeProfile,
    error,
    isDevMode,
    isPublicMode,
    showCookieConsent,
    showDevBanner,
    showReleaseBanner,
    showReleaseNotes,
    showSnomedLicense,
    showUprnConsent,
    signinUrl,
    signupUrl,
    tagSeverityMatches,
    updateActiveProfile,
    updateError,
    updateIsDevMode,
    updateIsPublicMode,
    updateShowCookieConsent,
    updateShowDevBanner,
    updateShowReleaseBanner,
    updateShowReleaseNotes,
    updateShowSnomedLicense,
    updateShowUprnConsent,
    updateSigninUrl,
    updateSignupUrl,
    updateTagSeverityMatches
  };
});
