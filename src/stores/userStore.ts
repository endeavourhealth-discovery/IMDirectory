import { defineStore } from "pinia";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { UserService } from "@/services";
import { HistoryItem, RecentActivityItem, User } from "@/interfaces";
import PrimeVuePresetThemes from "@/enums/PrimeVuePresetThemes";
import PrimeVueColors from "@/enums/PrimeVueColors";
import localStorageWithExpiry from "@/helpers/LocalStorageWithExpiry";
import { UserRole } from "@/enums";
import { computed, ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const cookiesEssentialAccepted = ref<boolean>(localStorageWithExpiry.getItem("cookiesEssentialAccepted") === true ? true : false);
  const cookiesOptionalAccepted = ref<boolean>(localStorageWithExpiry.getItem("cookiesOptionalAccepted") === true ? true : false);
  const currentPreset = ref<PrimeVuePresetThemes>();
  const currentPrimaryColor = ref<PrimeVueColors>();
  const currentSurfaceColor = ref<PrimeVueColors>();
  const darkMode = ref<boolean>(false);
  const currentScale = ref<string>("14px");
  const currentUser = ref<User>();
  const favourites = ref<string[]>([]);
  const history = ref<HistoryItem[]>([]);
  const recentLocalActivity = ref<RecentActivityItem[]>([]);
  const snomedLicenseAccepted = ref<boolean>(localStorageWithExpiry.getItem("snomedLicenseAccepted") === true ? true : false);
  const uprnAgreementAccepted = ref<boolean>(localStorageWithExpiry.getItem("uprnAgreementAccepted") === true ? true : false);
  const organisations = ref<string[]>([]);
  const includeUserGraph = ref<boolean>(false);

  const isLoggedIn = computed(() => isObjectHasKeys(currentUser.value));
  const isAdmin = computed(() => (currentUser.value?.roles.includes(UserRole.ADMIN) ? true : false));

  function clearAllFromUserDatabase() {
    currentPreset.value = PrimeVuePresetThemes.AURA;
    currentPrimaryColor.value = PrimeVueColors.EMERALD;
    currentSurfaceColor.value = PrimeVueColors.SLATE;
    darkMode.value = false;
    currentScale.value = "14px";
    favourites.value = [];
    recentLocalActivity.value = [];
  }

  function clearOptionalCookies() {
    localStorage.removeItem("directoryMainSplitterVertical");
    localStorage.removeItem("directoryMainSplitterHorizontal");
    localStorage.removeItem("viewerMainSplitterVertical");
    localStorage.removeItem("viewerMainSplitterHorizontal");
    localStorage.removeItem("eclEditorSavedString");
    localStorage.removeItem("editorSavedEntity");
    localStorage.removeItem("creatorSavedEntity");
    localStorage.removeItem("editorSelectedIri");
  }

  function updateCookiesEssentialAccepted(bool: boolean) {
    cookiesEssentialAccepted.value = bool;
    localStorageWithExpiry.setItem("cookiesEssentialAccepted", bool);
  }

  function updateCookiesOptionalAccepted(bool: boolean) {
    cookiesOptionalAccepted.value = bool;
    localStorageWithExpiry.setItem("cookiesOptionalAccepted", bool);
  }

  async function getAllFromUserDatabase(): Promise<void> {
    if (!isLoggedIn.value) {
      getAllFromLocalStorage();
      return;
    }
    clearAllFromLocalStorage();
    const data = await UserService.getUserData();
    if (data?.preset) currentPreset.value = data.preset;
    if (data?.primaryColor) currentPrimaryColor.value = data.primaryColor;
    if (data?.darkMode) darkMode.value = data.darkMode;
    if (data?.scale) currentScale.value = data.scale;
    if (data?.organisations) organisations.value = data.organisations;
    if (data?.favourites) favourites.value = data.favourites;
    if (data?.mru) recentLocalActivity.value = data.mru;
  }

  function getAllFromLocalStorage(): void {
    const preset = localStorageWithExpiry.getItem("preset");
    if (preset && Object.values(PrimeVuePresetThemes).includes(preset as PrimeVuePresetThemes)) currentPreset.value = preset as PrimeVuePresetThemes;
    const darkMode = localStorageWithExpiry.getItem("darkMode");
    if (darkMode === "true") darkMode.value = true;
    else darkMode.value = false;
    const primaryColor = localStorageWithExpiry.getItem("primaryColor");
    if (primaryColor && Object.values(PrimeVueColors).includes(primaryColor as PrimeVueColors)) currentPrimaryColor.value = primaryColor as PrimeVueColors;
    const surfaceColor = localStorageWithExpiry.getItem("surfaceColor");
    if (surfaceColor && Object.values(PrimeVueColors).includes(surfaceColor as PrimeVueColors)) currentSurfaceColor.value = surfaceColor as PrimeVueColors;
    const scale = localStorageWithExpiry.getItem("scale");
    if (scale) currentScale.value = scale;
  }

  function clearAllFromLocalStorage(): void {
    localStorage.removeItem("preset");
    localStorage.removeItem("darkMode");
    localStorage.removeItem("primaryColor");
    localStorage.removeItem("surfaceColor");
    localStorage.removeItem("scale");
  }

  async function updateRecentLocalActivity(recentActivityItem: RecentActivityItem) {
    let activity: RecentActivityItem[] = [];

    if (isLoggedIn.value) activity = await UserService.getUserMRU();
    else activity = recentLocalActivity.value ? recentLocalActivity.value : [];

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
    if (isLoggedIn.value) await UserService.updateUserMRU(activity);
    recentLocalActivity.value = activity;
  }

  async function clearRecentLocalActivity() {
    if (isLoggedIn.value) await UserService.updateUserMRU([]);
    recentLocalActivity.value = [];
  }

  async function updateFavourites(favourite: string) {
    if (favourite !== "http://endhealth.info/im#Favourites") {
      if (!favourites.value.includes(favourite)) {
        favourites.value.push(favourite);
      } else {
        favourites.value.splice(favourites.value.indexOf(favourite), 1);
      }
      if (isLoggedIn.value) await UserService.updateUserFavourites(favourites.value);
    }
  }

  async function clearFavourites() {
    if (isLoggedIn.value) await UserService.updateUserFavourites([]);
    favourites.value = [];
  }

  async function updatePreset(preset: PrimeVuePresetThemes) {
    currentPreset.value = preset;
    if (isLoggedIn.value) await UserService.updateUserPreset(preset);
    else localStorageWithExpiry.setItem("preset", preset);
  }

  async function updatePrimaryColor(color: PrimeVueColors) {
    currentPrimaryColor.value = color;
    if (isLoggedIn.value) await UserService.updateUserPrimaryColor(color);
    else localStorageWithExpiry.setItem("primaryColor", color);
  }

  async function updateSurfaceColor(color: PrimeVueColors) {
    currentSurfaceColor.value = color;
    if (isLoggedIn.value) await UserService.updateUserSurfaceColor(color);
    else localStorageWithExpiry.setItem("surfaceColor", color);
  }

  async function updateDarkMode(bool: boolean) {
    darkMode.value = bool;
    if (isLoggedIn.value) await UserService.updateUserDarkMode(bool);
    else localStorageWithExpiry.setItem("darkMode", bool);
  }

  async function updateCurrentScale(scale: string) {
    currentScale.value = scale;
    if (isLoggedIn.value) await UserService.updateUserScale(scale);
    else localStorageWithExpiry.setItem("scale", scale);
  }

  function updateCurrentUser(user: User | undefined) {
    currentUser.value = user;
  }

  function updateSnomedLicenseAccepted(bool: boolean) {
    snomedLicenseAccepted.value = bool;
    localStorageWithExpiry.setItem("snomedLicenseAccepted", bool);
  }

  function updateUprnAgreementAccepted(bool: boolean) {
    uprnAgreementAccepted.value = bool;
    localStorageWithExpiry.setItem("uprnAgreementAccepted", bool);
  }

  async function updateOrganisations(orgs: string[]) {
    if (isLoggedIn.value) await UserService.updateUserOrganisations(orgs);
    organisations.value = orgs;
  }

  function updateIncludeUserGraph(bool: boolean) {
    includeUserGraph.value = bool;
  }
  return {
    cookiesEssentialAccepted,
    cookiesOptionalAccepted,
    currentPreset,
    currentPrimaryColor,
    currentScale,
    currentSurfaceColor,
    currentUser,
    darkMode,
    favourites,
    history,
    recentLocalActivity,
    snomedLicenseAccepted,
    uprnAgreementAccepted,
    organisations,
    includeUserGraph,
    updateCookiesEssentialAccepted,
    updateCookiesOptionalAccepted,
    updateCurrentScale,
    updateCurrentUser,
    updateDarkMode,
    updateFavourites,
    updateIncludeUserGraph,
    updateOrganisations,
    updatePreset,
    updatePrimaryColor,
    updateRecentLocalActivity,
    updateSnomedLicenseAccepted,
    updateSurfaceColor,
    updateUprnAgreementAccepted,
    clearAllFromLocalStorage,
    clearAllFromUserDatabase,
    clearFavourites,
    clearOptionalCookies,
    clearRecentLocalActivity,
    getAllFromLocalStorage,
    getAllFromUserDatabase,
    isAdmin,
    isLoggedIn
  };
});
