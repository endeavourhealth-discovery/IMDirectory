<template>
  <div id="topbar">
    <div id="topbar-start">
      <img class="im-logo" src="../../assets/logos/Logo-object-empty.png" alt="IM logo" v-on:click="toLandingPage" />
    </div>
    <div id="topbar-content">
      <slot name="content" />
    </div>
    <div id="topbar-end">
      <Button
        v-tooltip.bottom="'Releases'"
        v-if="currentVersion"
        :label="currentVersion"
        class="p-button-rounded p-button-outlined p-button-plain topbar-end-button"
        @click="showReleaseNotes"
      />
      <Button
        v-tooltip.bottom="'Themes'"
        :icon="fontAwesomePro ? 'fa-regular fa-palette' : 'fa-solid fa-palette'"
        rounded
        text
        plain
        class="topbar-end-button"
        @click="openThemesMenu"
      />
      <Menu ref="themesMenu" id="themes-menu" :model="getThemes()" :popup="true">
        <template #item="{ item }: any">
          <div class="theme-row p-link">
            <Image class="theme-icon p-menuitem-icon" v-if="item.image" :src="item.image" alt="icon" width="30" />
            <span class="p-menuitem-text">{{ item.label }}</span>
          </div>
        </template>
      </Menu>
      <Button
        v-tooltip.bottom="'Upload/Download'"
        :icon="fontAwesomePro ? 'fa-duotone fa-arrow-down-up-across-line' : 'fa-solid fa-arrow-down-up-across-line'"
        class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button ml-auto"
        @click="openAdminMenu"
      />
      <Menu ref="adminMenu" :model="getAdminItems()" :popup="true" />
      <Button
        v-tooltip.bottom="'Apps'"
        :icon="fontAwesomePro ? 'fa-regular fa-grid-2' : 'pi pi-th-large'"
        class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button"
        @click="openAppsOverlay"
      />
      <OverlayPanel ref="appsOP" class="app-overlay-panel">
        <div class="flex flex-row flex-wrap gap-1 justify-content-start">
          <Button
            v-for="item in appItems"
            v-tooltip.bottom="item.label"
            :icon="item.icon"
            class="p-button-rounded p-button-text p-button-plain"
            @click="open(item)"
          />
        </div>
      </OverlayPanel>
      <Button
        v-tooltip.left="'Account'"
        v-if="!isLoggedIn"
        :icon="fontAwesomePro ? 'fa-duotone fa-user' : 'fa-regular fa-user'"
        class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button"
        @click="openUserMenu"
        aria-haspopup="true"
        aria-controls="overlay_menu"
      />
      <Button
        v-tooltip.left="'Account'"
        v-if="currentUser && isLoggedIn"
        class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button"
        @click="openUserMenu"
        aria-haspopup="true"
        aria-controls="overlay_menu"
      >
        <img class="avatar-icon" alt="avatar icon" :src="getUrl(currentUser.avatar)" style="min-width: 1.75rem" />
      </Button>
      <Menu ref="userMenu" :model="getItems()" :popup="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref, onMounted } from "vue";
import { AccountItem, LoginItem } from "@im-library/interfaces";
import { useToast } from "primevue/usetoast";
import { DirectService, Env, FilerService, DataModelService, GithubService, UserService } from "@/services";

import { usePrimeVue } from "primevue/config";
import { useUserStore } from "@/stores/userStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useSharedStore } from "@/stores/sharedStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const directoryStore = useDirectoryStore();
const sharedStore = useSharedStore();
const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);
const currentTheme: Ref<string | undefined> = ref();

const loading = ref(false);
const loginItems: Ref<LoginItem[]> = ref([]);
const accountItems: Ref<AccountItem[]> = ref([]);
const appItems: Ref<{ icon: string; command: Function; label: string }[]> = ref([]);
const currentVersion: Ref<undefined | string> = ref();

const PrimeVue: any = usePrimeVue();
const toast = useToast();
const adminMenu = ref();
const themesMenu = ref();
const userMenu = ref();
const appsOP = ref();
const directService = new DirectService();

onMounted(async () => {
  if (currentUser.value) currentTheme.value = await UserService.getUserTheme(currentUser.value.id);
  if (!currentTheme.value) currentTheme.value = "saga-blue";
  setUserMenuItems();
  setAppMenuItems();
  await getCurrentVersion();
});

async function getCurrentVersion() {
  const latestRelease = await GithubService.getLatestRelease("IMDirectory");
  if (latestRelease && latestRelease.version) currentVersion.value = latestRelease.version;
}

function toLandingPage() {
  router.push("/");
  //window.location.href = "/";
}

function open(item: { icon: string; command: Function; label: string }) {
  item.command();
}

function getItems(): LoginItem[] | AccountItem[] {
  if (isLoggedIn.value) {
    return accountItems.value;
  } else {
    return loginItems.value;
  }
}

function openUserMenu(event: any): void {
  (userMenu.value as any).toggle(event);
}

function getUrl(item: string): string {
  const url = new URL(`/src/assets/avatars/${item}`, import.meta.url);
  return url.href;
}

function openAppsOverlay(event: any) {
  (appsOP.value as any).toggle(event);
}

function setUserMenuItems(): void {
  loginItems.value = [
    {
      label: "Login",
      icon: "fa-solid fa-fw fa-user",
      url: Env.DIRECTORY_URL + "user/" + "login",
      command: () => {
        authStore.updatePreviousAppUrl();
      }
    },
    {
      label: "Register",
      icon: "fa-solid fa-fw fa-user-plus",
      url: Env.DIRECTORY_URL + "user/" + "register"
    }
  ];
  accountItems.value = [
    {
      label: "My account",
      icon: "fa-solid fa-fw fa-user",
      url: Env.DIRECTORY_URL + "user/" + "my-account"
    },
    {
      label: "Edit account",
      icon: "fa-solid fa-fw fa-user-pen",
      url: Env.DIRECTORY_URL + "user/" + "my-account/edit"
    },
    {
      label: "Change password",
      icon: "fa-solid fa-fw fa-user-lock",
      url: Env.DIRECTORY_URL + "user/" + "my-account/password-edit"
    },
    {
      label: "Logout",
      icon: "fa-solid fa-fw fa-arrow-right-from-bracket",
      url: Env.DIRECTORY_URL + "user/" + "logout",
      command: () => {
        authStore.updatePreviousAppUrl();
      }
    }
  ];
}

function openAdminMenu(event: any): void {
  adminMenu.value.toggle(event);
}

function openThemesMenu(event: any): void {
  themesMenu.value.toggle(event);
}

function isLoggedInWithRole(role: string): boolean {
  return isLoggedIn.value && currentUser.value && currentUser.value.roles.includes(role);
}

function getAdminItems(): any[] {
  return [
    {
      label: "Filing Documents",
      icon: fontAwesomePro ? "fa-duotone fa-files" : "fa-solid fa-file",
      items: [
        {
          label: "Download Changes",
          icon: fontAwesomePro ? "fa-duotone fa-file-arrow-down" : "fa-solid fa-file-arrow-up",
          disabled: !isLoggedInWithRole("IMAdmin"),
          command: () => downloadChanges()
        },
        {
          label: "Upload Document",
          icon: fontAwesomePro ? "fa-duotone fa-file-arrow-up" : "fa-solid fa-file-arrow-down",
          disabled: !(isLoggedInWithRole("create") || isLoggedInWithRole("edit")),
          command: () => directService.file()
        }
      ]
    },
    {
      label: "Code Downloads",
      icon: fontAwesomePro ? "fa-duotone fa-code" : "fa-solid fa-code",
      items: [
        {
          label: "Download Java",
          icon: "fa-brands fa-java",
          command: () => downloadJava()
        }
      ]
    }
  ];
}

function getThemes() {
  return [
    {
      label: "Arya",
      items: [
        {
          label: "Blue",
          image: new URL(`../../assets/themes/arya-blue.png`, import.meta.url),
          disabled: currentTheme.value === "arya-blue",
          command: () => changeTheme("arya-blue")
        },
        {
          label: "Green",
          image: new URL(`../../assets/themes/arya-green.png`, import.meta.url),
          disabled: currentTheme.value === "arya-green",
          command: () => changeTheme("arya-green")
        },
        {
          label: "Orange",
          image: new URL(`../../assets/themes/arya-orange.png`, import.meta.url),
          disabled: currentTheme.value === "arya-orange",
          command: () => changeTheme("arya-orange")
        },
        {
          label: "Purple",
          image: new URL(`../../assets/themes/arya-purple.png`, import.meta.url),
          disabled: currentTheme.value === "arya-purple",
          command: () => changeTheme("arya-purple")
        }
      ]
    },
    {
      label: "Bootstrap",
      items: [
        {
          label: "Blue",
          image: new URL(`../../assets/themes/bootstrap4-light-blue.svg`, import.meta.url),
          disabled: currentTheme.value === "bootstrap4-light-blue",
          command: () => changeTheme("bootstrap4-light-blue")
        },
        {
          label: "Purple",
          image: new URL(`../../assets/themes/bootstrap4-light-purple.svg`, import.meta.url),
          disabled: currentTheme.value === "bootstrap4-light-purple",
          command: () => changeTheme("bootstrap4-light-purple")
        },
        {
          label: "Blue",
          image: new URL(`../../assets/themes/bootstrap4-dark-blue.svg`, import.meta.url),
          disabled: currentTheme.value === "bootstrap4-dark-blue",
          command: () => changeTheme("bootstrap4-dark-blue")
        },
        {
          label: "Purple",
          image: new URL(`../../assets/themes/bootstrap4-dark-purple.svg`, import.meta.url),
          disabled: currentTheme.value === "bootstrap4-dark-purple",
          command: () => changeTheme("bootstrap4-dark-purple")
        }
      ]
    },
    {
      label: "Fluent UI",
      items: [
        {
          label: "Blue",
          image: new URL(`../../assets/themes/fluent-light.png`, import.meta.url),
          disabled: currentTheme.value === "fluent-light",
          command: () => changeTheme("fluent-light")
        }
      ]
    },
    {
      label: "Lara",
      items: [
        {
          label: "Indigo",
          image: new URL(`../../assets/themes/lara-light-indigo.png`, import.meta.url),
          disabled: currentTheme.value === "lara-light-indigo",
          command: () => changeTheme("lara-light-indigo")
        },
        {
          label: "Blue",
          image: new URL(`../../assets/themes/lara-light-blue.png`, import.meta.url),
          disabled: currentTheme.value === "lara-light-blue",
          command: () => changeTheme("lara-light-blue")
        },
        {
          label: "Purple",
          image: new URL(`../../assets/themes/lara-light-purple.png`, import.meta.url),
          disabled: currentTheme.value === "lara-light-purple",
          command: () => changeTheme("lara-light-purple")
        },
        {
          label: "Teal",
          image: new URL(`../../assets/themes/lara-light-teal.png`, import.meta.url),
          disabled: currentTheme.value === "lara-light-teal",
          command: () => changeTheme("lara-light-teal")
        },
        {
          label: "Indigo",
          image: new URL(`../../assets/themes/lara-dark-indigo.png`, import.meta.url),
          disabled: currentTheme.value === "lara-dark-indigo",
          command: () => changeTheme("lara-dark-indigo")
        },
        {
          label: "Blue",
          image: new URL(`../../assets/themes/lara-dark-blue.png`, import.meta.url),
          disabled: currentTheme.value === "lara-dark-blue",
          command: () => changeTheme("lara-dark-blue")
        },
        {
          label: "Purple",
          image: new URL(`../../assets/themes/lara-dark-purple.png`, import.meta.url),
          disabled: currentTheme.value === "lara-dark-purple",
          command: () => changeTheme("lara-dark-purple")
        },
        {
          label: "Teal",
          image: new URL(`../../assets/themes/lara-dark-teal.png`, import.meta.url),
          disabled: currentTheme.value === "lara-dark-teal",
          command: () => changeTheme("lara-dark-teal")
        }
      ]
    },
    {
      label: "Material Design",
      items: [
        {
          label: "Indigo",
          image: new URL(`../../assets/themes/md-light-indigo.svg`, import.meta.url),
          disabled: currentTheme.value === "md-light-indigo",
          command: () => changeTheme("md-light-indigo")
        },
        {
          label: "Deep Purple",
          image: new URL(`../../assets/themes/md-light-deeppurple.svg`, import.meta.url),
          disabled: currentTheme.value === "md-light-deeppurple",
          command: () => changeTheme("md-light-deeppurple")
        },
        {
          label: "Indigo",
          image: new URL(`../../assets/themes/md-dark-indigo.svg`, import.meta.url),
          disabled: currentTheme.value === "md-dark-indigo",
          command: () => changeTheme("md-dark-indigo")
        },
        {
          label: "Deep Purple",
          image: new URL(`../../assets/themes/md-dark-deeppurple.svg`, import.meta.url),
          disabled: currentTheme.value === "md-dark-deeppurple",
          command: () => changeTheme("md-dark-deeppurple")
        }
      ]
    },
    {
      label: "Material Design Compact",
      items: [
        {
          label: "Indigo",
          image: new URL(`../../assets/themes/mdc-light-indigo.svg`, import.meta.url),
          disabled: currentTheme.value === "mdc-light-indigo",
          command: () => changeTheme("mdc-light-indigo")
        },
        {
          label: "Deep Purple",
          image: new URL(`../../assets/themes/mdc-light-deeppurple.svg`, import.meta.url),
          disabled: currentTheme.value === "mdc-light-deeppurple",
          command: () => changeTheme("mdc-light-deeppurple")
        },
        {
          label: "Indigo",
          image: new URL(`../../assets/themes/mdc-dark-indigo.svg`, import.meta.url),
          disabled: currentTheme.value === "mdc-dark-indigo",
          command: () => changeTheme("mdc-dark-indigo")
        },
        {
          label: "Deep Purple",
          image: new URL(`../../assets/themes/mdc-dark-deeppurple.svg`, import.meta.url),
          disabled: currentTheme.value === "mdc-dark-deeppurple",
          command: () => changeTheme("mdc-dark-deeppurple")
        }
      ]
    },
    {
      label: "Mira",
      items: [
        {
          label: "Mira",
          image: new URL(`../../assets/themes/mira.jpg`, import.meta.url),
          disabled: currentTheme.value === "mira",
          command: () => changeTheme("mira")
        }
      ]
    },
    {
      label: "Nano",
      items: [
        {
          label: "Nano",
          image: new URL(`../../assets/themes/nano.jpg`, import.meta.url),
          disabled: currentTheme.value === "nano",
          command: () => changeTheme("nano")
        }
      ]
    },
    {
      label: "Saga",
      items: [
        {
          label: "Blue",
          image: new URL(`../../assets/themes/saga-blue.png`, import.meta.url),
          disabled: currentTheme.value === "saga-blue",
          command: () => changeTheme("saga-blue")
        },
        {
          label: "Green",
          image: new URL(`../../assets/themes/saga-green.png`, import.meta.url),
          disabled: currentTheme.value === "saga-green",
          command: () => changeTheme("saga-green")
        },
        {
          label: "Orange",
          image: new URL(`../../assets/themes/saga-orange.png`, import.meta.url),
          disabled: currentTheme.value === "saga-orange",
          command: () => changeTheme("saga-orange")
        },
        {
          label: "Purple",
          image: new URL(`../../assets/themes/saga-purple.png`, import.meta.url),
          disabled: currentTheme.value === "saga-purple",
          command: () => changeTheme("saga-purple")
        }
      ]
    },
    {
      label: "Soho",
      items: [
        {
          label: "Light",
          image: new URL(`../../assets/themes/soho-light.png`, import.meta.url),
          disabled: currentTheme.value === "soho-light",
          command: () => changeTheme("soho-light")
        },
        {
          label: "Dark",
          image: new URL(`../../assets/themes/soho-dark.png`, import.meta.url),
          disabled: currentTheme.value === "soho-dark",
          command: () => changeTheme("soho-dark")
        }
      ]
    },
    {
      label: "Tailwind",
      items: [
        {
          label: "Tailwind Light",
          image: new URL(`../../assets/themes/tailwind-light.png`, import.meta.url),
          disabled: currentTheme.value === "tailwind-light",
          command: () => changeTheme("tailwind-light")
        }
      ]
    },
    {
      label: "Vela",
      items: [
        {
          label: "Blue",
          image: new URL(`../../assets/themes/vela-blue.png`, import.meta.url),
          disabled: currentTheme.value === "vela-blue",
          command: () => changeTheme("vela-blue")
        },
        {
          label: "Green",
          image: new URL(`../../assets/themes/vela-green.png`, import.meta.url),
          disabled: currentTheme.value === "vela-green",
          command: () => changeTheme("vela-green")
        },
        {
          label: "Orange",
          image: new URL(`../../assets/themes/vela-orange.png`, import.meta.url),
          disabled: currentTheme.value === "vela-orange",
          command: () => changeTheme("vela-orange")
        },
        {
          label: "Purple",
          image: new URL(`../../assets/themes/vela-purple.png`, import.meta.url),
          disabled: currentTheme.value === "vela-purple",
          command: () => changeTheme("vela-purple")
        }
      ]
    },
    {
      label: "Viva",
      items: [
        {
          label: "Light",
          image: new URL(`../../assets/themes/viva-light.svg`, import.meta.url),
          disabled: currentTheme.value === "viva-light",
          command: () => changeTheme("viva-light")
        },
        {
          label: "Dark",
          image: new URL(`../../assets/themes/viva-dark.svg`, import.meta.url),
          disabled: currentTheme.value === "viva-dark",
          command: () => changeTheme("viva-dark")
        }
      ]
    }
  ];
}

async function downloadChanges() {
  toast.add({ severity: "info", summary: "Preparing download", detail: "Zipping delta files for download...", life: 3000 });
  let blob = await FilerService.downloadDeltas();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "deltas.zip";
  link.click();
}

async function downloadJava() {
  toast.add({ severity: "info", summary: "Preparing download", detail: "Generating Java files for download...", life: 3000 });
  let blob = await DataModelService.generateJava();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "DmCodeGen.zip";
  link.click();
}

function setAppMenuItems() {
  appItems.value = [
    { label: "Directory", icon: "fa-solid fa-folder-open", command: () => directService.view() },
    { label: "Creator", icon: "fa-solid fa-circle-plus", command: () => directService.create() }
    // TODO add when query builder is ready { label: "Query", icon: "fa-solid fa-clipboard-question", command: () => directService.query() }
  ];
}

function showReleaseNotes() {
  sharedStore.updateShowReleaseNotes(true);
}

function changeTheme(newTheme: string) {
  PrimeVue.changeTheme(currentTheme.value, newTheme, "theme-link", () => {});
  if (currentUser.value) {
    UserService.updateUserTheme(currentUser.value.id, newTheme);
  } else {
    userStore.updateCurrentTheme(newTheme);
  }
  currentTheme.value = newTheme;
}
</script>

<style scoped>
.im-logo {
  cursor: pointer;
  margin: 0 0.5rem;
  width: 2.25rem;
}

#topbar {
  min-height: 3.5rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  background-color: var(--surface-100);
}

#topbar-start {
  height: 100%;
  flex: 0 0 auto;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
}

#topbar-content {
  height: 100%;
  flex: 1 1 auto;
  overflow: auto;
  width: 100%;
}

#topbar-end {
  height: 100%;
  flex: 0 1 auto;
  justify-self: end;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  padding: 0 0.5rem 0 0;
  gap: 0.25rem;
}

.theme-row {
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}

.theme-icon {
  margin-left: 1rem;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  padding: 0.125rem 0;
}
</style>

<style>
.topbar-end-button:hover {
  background-color: var(--text-color) !important;
  color: var(--surface-a) !important;
}

.app-overlay-panel {
  z-index: 1;
}

.p-submenu-list {
  left: -100%;
}

.p-tooltip {
  z-index: 999;
}
</style>

<style>
#themes-menu {
  overflow: auto;
  height: 35vh;
}
</style>
