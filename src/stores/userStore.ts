import { defineStore } from "pinia";
import { isObjectHasKeys, localStorageWithExpiry } from "vue-library/helpers";
import { SecurityService, UserService } from "@/services";
import { HistoryItem } from "@/interfaces";
import { computed, ref } from "vue";
import { RecentActivityItemDto } from "vue-library/interfaces";
import { NamespacePermission, RecentActivityItem, User } from "vue-library/models";
import { FontSize, PrimeVueColors, PrimeVuePresetThemes, UserRole } from "vue-library/enums";

export const useUserStore = defineStore("user", () => {
  const cookiesEssentialAccepted = ref<boolean>(localStorageWithExpiry.getItem("cookiesEssentialAccepted") === true ? true : false);
  const cookiesOptionalAccepted = ref<boolean>(localStorageWithExpiry.getItem("cookiesOptionalAccepted") === true ? true : false);
  const currentPreset = ref<PrimeVuePresetThemes>();
  const currentPrimaryColor = ref<PrimeVueColors>();
  const currentSurfaceColor = ref<PrimeVueColors>();
  const darkMode = ref<boolean>(false);
  const currentFontSize = ref<FontSize>(FontSize.MEDIUM);
  const currentUser = ref<User>();
  const favourites = ref<string[]>([]);
  const history = ref<HistoryItem[]>([]);
  const recentLocalActivity = ref<RecentActivityItem[]>([]);
  const snomedLicenseAccepted = ref<boolean>(localStorageWithExpiry.getItem("snomedLicenseAccepted") === true ? true : false);
  const uprnAgreementAccepted = ref<boolean>(localStorageWithExpiry.getItem("uprnAgreementAccepted") === true ? true : false);
  const organisations = ref<string[]>([]);
  const includeUserGraph = ref<boolean>(false);
  const namespaces = ref<NamespacePermission[]>([]);

  const isLoggedIn = computed(() => isObjectHasKeys(currentUser.value));
  const isAdmin = computed(() => (currentUser.value?.roles.includes(UserRole.ADMIN) ? true : false));

  function clearAllFromUserDatabase() {
    currentPreset.value = PrimeVuePresetThemes.AURA;
    currentPrimaryColor.value = PrimeVueColors.EMERALD;
    currentSurfaceColor.value = PrimeVueColors.SLATE;
    darkMode.value = false;
    currentFontSize.value = FontSize.MEDIUM;
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

  function getAllFromUserDatabase(): void {
    if (!isLoggedIn.value) {
      getAllFromLocalStorage();
      return;
    }
    clearAllFromLocalStorage();
    if (currentUser.value?.theme) currentPreset.value = currentUser.value.theme;
    if (currentUser.value?.primaryColor) currentPrimaryColor.value = currentUser.value?.primaryColor;
    if (currentUser.value?.darkMode) darkMode.value = currentUser.value.darkMode;
    if (currentUser.value?.fontSize) currentFontSize.value = currentUser.value?.fontSize;
    if (currentUser.value?.organisations) organisations.value = currentUser.value?.organisations;
    if (currentUser.value?.namespaces) namespaces.value = currentUser.value.namespaces;
    if (currentUser.value?.favourites) favourites.value = currentUser.value.favourites;
    if (currentUser.value?.recentActivity) recentLocalActivity.value = currentUser.value.recentActivity;
  }

  function getAllFromLocalStorage(): void {
    const preset = localStorageWithExpiry.getItem("preset");
    if (preset && Object.values(PrimeVuePresetThemes).includes(preset as PrimeVuePresetThemes)) currentPreset.value = preset as PrimeVuePresetThemes;
    const localDarkMode = localStorageWithExpiry.getItem("darkMode");
    if (localDarkMode === "true") darkMode.value = true;
    else darkMode.value = false;
    const primaryColor = localStorageWithExpiry.getItem("primaryColor");
    if (primaryColor && Object.values(PrimeVueColors).includes(primaryColor as PrimeVueColors)) currentPrimaryColor.value = primaryColor as PrimeVueColors;
    const surfaceColor = localStorageWithExpiry.getItem("surfaceColor");
    if (surfaceColor && Object.values(PrimeVueColors).includes(surfaceColor as PrimeVueColors)) currentSurfaceColor.value = surfaceColor as PrimeVueColors;
    const fontSize = localStorageWithExpiry.getItem("fontSize");
    if (fontSize) currentFontSize.value = fontSize;
  }

  function clearAllFromLocalStorage(): void {
    localStorage.removeItem("preset");
    localStorage.removeItem("darkMode");
    localStorage.removeItem("primaryColor");
    localStorage.removeItem("surfaceColor");
    localStorage.removeItem("fontSize");
  }

  async function updateRecentLocalActivity(recentActivityItem: RecentActivityItemDto) {
    let activity: RecentActivityItemDto[] = [];

    if (isLoggedIn.value && currentUser.value) activity = currentUser.value?.recentActivity;
    else activity = recentLocalActivity.value ? recentLocalActivity.value : [];

    activity.forEach(activityItem => {
      if (activityItem.dateTime) activityItem.dateTime = new Date(activityItem.dateTime);
    });
    const foundIndex = activity.findIndex(activityItem => activityItem.iri === recentActivityItem.iri && activityItem.action === recentActivityItem.action);
    if (foundIndex !== -1) {
      activity[foundIndex].dateTime = recentActivityItem.dateTime;
      activity.sort((a, b) => {
        if (a.dateTime && b.dateTime && a.dateTime.getTime() > b.dateTime.getTime()) {
          return 1;
        } else if (a.dateTime && b.dateTime && b.dateTime.getTime() > a.dateTime.getTime()) {
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
    if (isLoggedIn.value) {
      const updatedUser = await UserService.updateUserRecentActivity(activity);
      currentUser.value = updatedUser;
      getAllFromUserDatabase();
    }
  }

  async function clearRecentLocalActivity() {
    if (isLoggedIn.value) {
      const updatedUser = await UserService.updateUserRecentActivity([]);
      currentUser.value = updatedUser;
      getAllFromUserDatabase();
    }
    recentLocalActivity.value = [];
  }

  async function updateFavourites(favourite: string) {
    if (favourite !== "http://endhealth.info/im#Favourites") {
      if (!favourites.value.includes(favourite)) {
        favourites.value.push(favourite);
      } else {
        favourites.value.splice(favourites.value.indexOf(favourite), 1);
      }
      if (isLoggedIn.value) {
        const updatedUser = await UserService.updateUserFavourites(favourites.value);
        currentUser.value = updatedUser;
        getAllFromUserDatabase();
      }
    }
  }

  async function clearFavourites() {
    if (isLoggedIn.value) {
      const updatedUser = await UserService.updateUserFavourites([]);
      currentUser.value = updatedUser;
      getAllFromUserDatabase();
    }
    favourites.value = [];
  }

  async function updatePreset(preset: PrimeVuePresetThemes) {
    currentPreset.value = preset;
    if (isLoggedIn.value) {
      const updatedUser = await UserService.updateUserPreset(preset);
      currentUser.value = updatedUser;
      getAllFromUserDatabase();
    } else localStorageWithExpiry.setItem("preset", preset);
  }

  async function updatePrimaryColor(color: PrimeVueColors) {
    currentPrimaryColor.value = color;
    if (isLoggedIn.value) {
      const updatedUser = await UserService.updateUserPrimaryColor(color);
      currentUser.value = updatedUser;
      getAllFromUserDatabase();
    } else localStorageWithExpiry.setItem("primaryColor", color);
  }

  async function updateSurfaceColor(color: PrimeVueColors) {
    currentSurfaceColor.value = color;
    if (isLoggedIn.value) {
      const updatedUser = await UserService.updateUserSurfaceColor(color);
      currentUser.value = updatedUser;
      getAllFromUserDatabase();
    } else localStorageWithExpiry.setItem("surfaceColor", color);
  }

  async function updateDarkMode(bool: boolean) {
    darkMode.value = bool;
    if (isLoggedIn.value) {
      const updatedUser = await UserService.updateUserDarkMode(bool);
      currentUser.value = updatedUser;
      getAllFromUserDatabase();
    } else localStorageWithExpiry.setItem("darkMode", bool);
  }

  async function updateCurrentFontSize(fontSize: FontSize) {
    currentFontSize.value = fontSize;
    if (isLoggedIn.value) {
      const updatedUser = await UserService.updateUserFontSize(fontSize);
      currentUser.value = updatedUser;
      getAllFromUserDatabase();
    } else localStorageWithExpiry.setItem("fontSize", fontSize);
  }

  function updateCurrentUser(user: User | undefined) {
    currentUser.value = user;
    getAllFromUserDatabase();
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
    if (isLoggedIn.value) {
      const updatedUser = await UserService.updateUserOrganisations(orgs);
      currentUser.value = updatedUser;
      getAllFromUserDatabase();
    } else organisations.value = orgs;
  }

  async function updateNamespaces(ns: NamespacePermission[]) {
    if (isLoggedIn.value) {
      const updatedUser = await UserService.updateUserNamespaces(ns);
      currentUser.value = updatedUser;
      getAllFromUserDatabase();
    } else namespaces.value = ns;
  }

  function updateIncludeUserGraph(bool: boolean) {
    includeUserGraph.value = bool;
  }
  return {
    cookiesEssentialAccepted,
    cookiesOptionalAccepted,
    currentPreset,
    currentPrimaryColor,
    currentFontSize: currentFontSize,
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
    updateCurrentFontSize: updateCurrentFontSize,
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
