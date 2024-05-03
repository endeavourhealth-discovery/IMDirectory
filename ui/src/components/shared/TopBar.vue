<template>
  <div id="topbar">
    <div id="topbar-start">
      <img class="im-logo" src="/logos/Logo-object-empty.png" alt="IM logo" v-on:click="toLandingPage" />
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
      <Button v-tooltip.bottom="'Themes'" icon="fa-regular fa-palette" rounded text plain class="topbar-end-button" @click="openThemesMenu" />
      <Menu ref="themesMenu" id="themes-menu" :model="getThemes()" :popup="true">
        <template #item="{ item }: any">
          <div class="theme-row p-link">
            <Image class="theme-icon p-menuitem-icon" v-if="item.image" :src="item.image" alt="icon" width="30" />
            <span class="p-menuitem-text">{{ item.label }}</span>
            <span v-if="item.key === currentTheme" class="theme-icon p-menuitem-icon fa-regular fa-check" />
          </div>
        </template>
      </Menu>
      <Button v-tooltip.bottom="'Scale'" icon="fa-duotone fa-text-size" rounded text plain class="topbar-end-button" @click="openScaleMenu" />
      <Menu ref="scaleMenu" id="scale-menu" :model="getScales()" :popup="true">
        <template #item="{ item }: any">
          <div class="scale-row p-link">
            <span class="theme-icon p-menuitem-icon" :class="item.icon" />
            <span class="p-menuitem-text">{{ item.label }}</span>
            <span v-if="item.key === currentScale" class="theme-icon p-menuitem-icon fa-regular fa-check" />
          </div>
        </template>
      </Menu>
      <Button
        v-tooltip.bottom="'Upload/Download'"
        icon="fa-duotone fa-arrow-down-up-across-line"
        class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button ml-auto"
        @click="openAdminMenu"
      />
      <Menu ref="adminMenu" :model="adminItems" :popup="true" />
      <Button
        v-tooltip.bottom="'Apps'"
        icon="fa-regular fa-grid-2"
        class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button"
        @click="openAppsOverlay"
      />
      <OverlayPanel ref="appsOP" class="app-overlay-panel">
        <div class="flex flex-row flex-wrap gap-2 justify-content-start">
          <template v-for="item in appItems">
            <Shortcut :label="item.label" :icon="item.icon" :command="item.command" :color="item.color" :size="item.size" />
          </template>
        </div>
      </OverlayPanel>
      <Button
        v-tooltip.left="'Account'"
        v-if="!isLoggedIn"
        icon="fa-duotone fa-user"
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
      <Menu ref="userMenu" :model="getItems()" :popup="true">
        <template #item="{ item, props }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a v-ripple :href="href" v-bind="props.action" @click="navigate" style="color: var(--text-color)">
              <span :class="item.icon" />
              <span class="ml-2">{{ item.label }}</span>
            </a>
          </router-link>
          <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action" style="color: var(--text-color)">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </template>
      </Menu>
    </div>
    <Dialog header="Set namespace/package" :visible="showCodeDownload" :modal="true" :closable="false">
      <div class="flex flex-column gap-2">
        <label for="template">Template</label>
        <Dropdown id="template" v-model="template" :options="templates" />
      </div>
      <div class="flex flex-column gap-2">
        <label for="namespace">Namespace/Package</label>
        <InputText id="namespace" type="text" v-model="namespace" autofocus />
      </div>
      <template #footer>
        <Button label="Cancel" icon="fa-regular fa-xmark" @click="showCodeDownload = false" class="p-button-text" />
        <Button label="Download" icon="fa-duotone fa-display-code" :disabled="!template" @click="generateAndDownload" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref, onMounted } from "vue";
import Shortcut from "../directory/landingPage/Shortcut.vue";
import { useToast } from "primevue/usetoast";
import { DirectService, Env, FilerService, GithubService, UserService, CodeGenService } from "@/services";
import { MenuItem } from "primevue/menuitem";

import { useUserStore } from "@/stores/userStore";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useSharedStore } from "@/stores/sharedStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import setupChangeTheme from "@/composables/setupChangeTheme";
import setupChangeScale from "@/composables/setupChangeScale";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const directoryStore = useDirectoryStore();
const sharedStore = useSharedStore();
const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const currentTheme = computed(() => userStore.currentTheme);
const currentScale = computed(() => userStore.currentScale);

const { changeTheme } = setupChangeTheme();
const { changeScale } = setupChangeScale();

const showCodeDownload = ref(false);
const namespace = ref();
const templates: Ref<string[]> = ref([]);
const template = ref();
const loading = ref(false);
const loginItems: Ref<MenuItem[]> = ref([]);
const accountItems: Ref<MenuItem[]> = ref([]);
const adminItems: Ref<MenuItem[]> = ref([]);
const appItems: Ref<{ icon: string; command?: Function; url?: string; label: string; color: string; size: number }[]> = ref([]);
const currentVersion: Ref<undefined | string> = ref();

const toast = useToast();
const adminMenu = ref();
const themesMenu = ref();
const scaleMenu = ref();
const userMenu = ref();
const appsOP = ref();
const directService = new DirectService();

onMounted(async () => {
  setUserMenuItems();
  setAppMenuItems();
  await setAdminMenuItems();
  await getCurrentVersion();
});

async function getCurrentVersion() {
  const latestRelease = await GithubService.getLatestRelease("IMDirectory");
  if (latestRelease && latestRelease.version) currentVersion.value = latestRelease.version;
}

function toLandingPage() {
  router.push("/");
}

function open(item: { icon: string; command: Function; label: string }) {
  item.command();
}

function getItems(): MenuItem[] {
  if (isLoggedIn.value) {
    return accountItems.value;
  } else {
    return loginItems.value;
  }
}

function openUserMenu(event: any): void {
  userMenu.value.toggle(event);
}

function getUrl(item: string): string {
  const url = new URL(`/src/assets/avatars/${item}`, import.meta.url);
  return url.href;
}

function openAppsOverlay(event: any) {
  appsOP.value.toggle(event);
}

function setUserMenuItems(): void {
  loginItems.value = [
    {
      label: "Login",
      icon: "fa-solid fa-fw fa-user",
      route: "/user/login"
    },
    {
      label: "Register",
      icon: "fa-solid fa-fw fa-user-plus",
      route: "/user/register"
    }
  ];
  accountItems.value = [
    {
      label: "My account",
      icon: "fa-solid fa-fw fa-user",
      route: "/user/my-account"
    },
    {
      label: "Edit account",
      icon: "fa-solid fa-fw fa-user-pen",
      route: "/user/my-account/edit"
    },
    {
      label: "Change password",
      icon: "fa-solid fa-fw fa-user-lock",
      route: "/user/my-account/password-edit"
    },
    {
      label: "Logout",
      icon: "fa-solid fa-fw fa-arrow-right-from-bracket",
      route: "/user/logout"
    }
  ];
}

function openAdminMenu(event: any): void {
  adminMenu.value.toggle(event);
}

function openThemesMenu(event: any): void {
  themesMenu.value.toggle(event);
}

function openScaleMenu(event: any): void {
  scaleMenu.value.toggle(event);
}

function isLoggedInWithRole(role: string): boolean {
  return isLoggedIn.value && currentUser.value && currentUser.value.roles.includes(role);
}

async function setAdminMenuItems(): Promise<void> {
  adminItems.value = [
    {
      label: "Filing Documents",
      icon: "fa-duotone fa-files",
      items: [
        {
          label: "Download Changes",
          icon: "fa-duotone fa-file-arrow-down",
          disabled: !isLoggedInWithRole("IMAdmin"),
          command: () => downloadChanges()
        },
        {
          label: "Upload Document",
          icon: "fa-duotone fa-file-arrow-up",
          disabled: !(isLoggedInWithRole("create") || isLoggedInWithRole("edit")),
          command: () => directService.file()
        },
        {
          label: "Download Code",
          icon: "fa-duotone fa-display-code",
          command: () => downloadCode()
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
          key: "arya-blue",
          label: "Blue",
          image: new URL(`../../assets/themes/arya-blue.png`, import.meta.url),
          command: () => changeTheme("arya-blue")
        },
        {
          key: "arya-green",
          label: "Green",
          image: new URL(`../../assets/themes/arya-green.png`, import.meta.url),
          command: () => changeTheme("arya-green")
        },
        {
          key: "arya-orange",
          label: "Orange",
          image: new URL(`../../assets/themes/arya-orange.png`, import.meta.url),
          command: () => changeTheme("arya-orange")
        },
        {
          key: "arya-purple",
          label: "Purple",
          image: new URL(`../../assets/themes/arya-purple.png`, import.meta.url),
          command: () => changeTheme("arya-purple")
        }
      ]
    },
    {
      label: "Bootstrap",
      items: [
        {
          key: "bootstrap4-light-blue",
          label: "Blue",
          image: new URL(`../../assets/themes/bootstrap4-light-blue.svg`, import.meta.url),
          command: () => changeTheme("bootstrap4-light-blue")
        },
        {
          label: "Purple",
          image: new URL(`../../assets/themes/bootstrap4-light-purple.svg`, import.meta.url),
          key: "bootstrap4-light-purple",
          command: () => changeTheme("bootstrap4-light-purple")
        },
        {
          key: "bootstrap4-dark-blue",
          label: "Blue",
          image: new URL(`../../assets/themes/bootstrap4-dark-blue.svg`, import.meta.url),
          command: () => changeTheme("bootstrap4-dark-blue")
        },
        {
          key: "bootstrap4-dark-purple",
          label: "Purple",
          image: new URL(`../../assets/themes/bootstrap4-dark-purple.svg`, import.meta.url),
          command: () => changeTheme("bootstrap4-dark-purple")
        }
      ]
    },
    {
      label: "Fluent UI",
      items: [
        {
          key: "fluent-light",
          label: "Blue",
          image: new URL(`../../assets/themes/fluent-light.png`, import.meta.url),
          command: () => changeTheme("fluent-light")
        }
      ]
    },
    {
      label: "Lara",
      items: [
        {
          key: "lara-light-indigo",
          label: "Indigo",
          image: new URL(`../../assets/themes/lara-light-indigo.png`, import.meta.url),
          command: () => changeTheme("lara-light-indigo")
        },
        {
          key: "lara-light-blue",
          label: "Blue",
          image: new URL(`../../assets/themes/lara-light-blue.png`, import.meta.url),
          command: () => changeTheme("lara-light-blue")
        },
        {
          key: "lara-light-purple",
          label: "Purple",
          image: new URL(`../../assets/themes/lara-light-purple.png`, import.meta.url),
          command: () => changeTheme("lara-light-purple")
        },
        {
          key: "lara-light-teal",
          label: "Teal",
          image: new URL(`../../assets/themes/lara-light-teal.png`, import.meta.url),
          command: () => changeTheme("lara-light-teal")
        },
        {
          key: "lara-dark-indigo",
          label: "Indigo",
          image: new URL(`../../assets/themes/lara-dark-indigo.png`, import.meta.url),
          command: () => changeTheme("lara-dark-indigo")
        },
        {
          key: "lara-dark-blue",
          label: "Blue",
          image: new URL(`../../assets/themes/lara-dark-blue.png`, import.meta.url),
          command: () => changeTheme("lara-dark-blue")
        },
        {
          key: "lara-dark-purple",
          label: "Purple",
          image: new URL(`../../assets/themes/lara-dark-purple.png`, import.meta.url),
          command: () => changeTheme("lara-dark-purple")
        },
        {
          key: "lara-dark-teal",
          label: "Teal",
          image: new URL(`../../assets/themes/lara-dark-teal.png`, import.meta.url),
          command: () => changeTheme("lara-dark-teal")
        }
      ]
    },
    {
      label: "Material Design",
      items: [
        {
          key: "md-light-indigo",
          label: "Indigo",
          image: new URL(`../../assets/themes/md-light-indigo.svg`, import.meta.url),
          command: () => changeTheme("md-light-indigo")
        },
        {
          key: "md-light-deeppurple",
          label: "Deep Purple",
          image: new URL(`../../assets/themes/md-light-deeppurple.svg`, import.meta.url),
          command: () => changeTheme("md-light-deeppurple")
        },
        {
          key: "md-dark-indigo",
          label: "Indigo",
          image: new URL(`../../assets/themes/md-dark-indigo.svg`, import.meta.url),
          command: () => changeTheme("md-dark-indigo")
        },
        {
          key: "md-dark-deeppurple",
          label: "Deep Purple",
          image: new URL(`../../assets/themes/md-dark-deeppurple.svg`, import.meta.url),
          command: () => changeTheme("md-dark-deeppurple")
        }
      ]
    },
    {
      label: "Material Design Compact",
      items: [
        {
          key: "mdc-light-indigo",
          label: "Indigo",
          image: new URL(`../../assets/themes/mdc-light-indigo.svg`, import.meta.url),
          command: () => changeTheme("mdc-light-indigo")
        },
        {
          key: "mdc-light-deeppurple",
          label: "Deep Purple",
          image: new URL(`../../assets/themes/mdc-light-deeppurple.svg`, import.meta.url),
          command: () => changeTheme("mdc-light-deeppurple")
        },
        {
          key: "mdc-dark-indigo",
          label: "Indigo",
          image: new URL(`../../assets/themes/mdc-dark-indigo.svg`, import.meta.url),
          command: () => changeTheme("mdc-dark-indigo")
        },
        {
          key: "mdc-dark-deeppurple",
          label: "Deep Purple",
          image: new URL(`../../assets/themes/mdc-dark-deeppurple.svg`, import.meta.url),
          command: () => changeTheme("mdc-dark-deeppurple")
        }
      ]
    },
    {
      label: "Mira",
      items: [
        {
          key: "mira",
          label: "Mira",
          image: new URL(`../../assets/themes/mira.jpg`, import.meta.url),
          command: () => changeTheme("mira")
        }
      ]
    },
    {
      label: "Nano",
      items: [
        {
          key: "nano",
          label: "Nano",
          image: new URL(`../../assets/themes/nano.jpg`, import.meta.url),
          command: () => changeTheme("nano")
        }
      ]
    },
    {
      label: "Saga",
      items: [
        {
          key: "saga-blue",
          label: "Blue",
          image: new URL(`../../assets/themes/saga-blue.png`, import.meta.url),
          command: () => changeTheme("saga-blue")
        },
        {
          key: "saga-green",
          label: "Green",
          image: new URL(`../../assets/themes/saga-green.png`, import.meta.url),
          command: () => changeTheme("saga-green")
        },
        {
          key: "saga-orange",
          label: "Orange",
          image: new URL(`../../assets/themes/saga-orange.png`, import.meta.url),
          command: () => changeTheme("saga-orange")
        },
        {
          key: "saga-purple",
          label: "Purple",
          image: new URL(`../../assets/themes/saga-purple.png`, import.meta.url),
          command: () => changeTheme("saga-purple")
        }
      ]
    },
    {
      label: "Soho",
      items: [
        {
          key: "soho-light",
          label: "Light",
          image: new URL(`../../assets/themes/soho-light.png`, import.meta.url),
          command: () => changeTheme("soho-light")
        },
        {
          key: "soho-dark",
          label: "Dark",
          image: new URL(`../../assets/themes/soho-dark.png`, import.meta.url),
          command: () => changeTheme("soho-dark")
        }
      ]
    },
    {
      label: "Tailwind",
      items: [
        {
          key: "tailwind-light",
          label: "Tailwind Light",
          image: new URL(`../../assets/themes/tailwind-light.png`, import.meta.url),
          command: () => changeTheme("tailwind-light")
        }
      ]
    },
    {
      label: "Vela",
      items: [
        {
          key: "vela-blue",
          label: "Blue",
          image: new URL(`../../assets/themes/vela-blue.png`, import.meta.url),
          command: () => changeTheme("vela-blue")
        },
        {
          key: "vela-green",
          label: "Green",
          image: new URL(`../../assets/themes/vela-green.png`, import.meta.url),
          command: () => changeTheme("vela-green")
        },
        {
          key: "vela-orange",
          label: "Orange",
          image: new URL(`../../assets/themes/vela-orange.png`, import.meta.url),
          command: () => changeTheme("vela-orange")
        },
        {
          key: "vela-purple",
          label: "Purple",
          image: new URL(`../../assets/themes/vela-purple.png`, import.meta.url),
          command: () => changeTheme("vela-purple")
        }
      ]
    },
    {
      label: "Viva",
      items: [
        {
          key: "viva-light",
          label: "Light",
          image: new URL(`../../assets/themes/viva-light.svg`, import.meta.url),
          command: () => changeTheme("viva-light")
        },
        {
          key: "viva-dark",
          label: "Dark",
          image: new URL(`../../assets/themes/viva-dark.svg`, import.meta.url),
          command: () => changeTheme("viva-dark")
        }
      ]
    }
  ];
}

function getScales(): MenuItem[] {
  return [
    {
      label: "UI Scale",
      items: [
        {
          key: "12px",
          label: "Small",
          icon: "fa-regular fa-a fa-xs",
          command: () => changeScale("12px")
        },
        {
          key: "14px",
          label: "Medium",
          icon: "fa-regular fa-a fa-sm",
          command: () => changeScale("14px")
        },
        {
          key: "16px",
          label: "Large",
          icon: "fa-regular fa-a",
          command: () => changeScale("16px")
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

async function downloadCode() {
  templates.value = await CodeGenService.getCodeTemplateList();
  showCodeDownload.value = true;
}

async function generateAndDownload() {
  showCodeDownload.value = false;
  toast.add({ severity: "info", summary: "Preparing download", detail: "Generating files for download...", life: 3000 });
  let blob = await CodeGenService.generateCode(namespace.value, template.value);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "DmCodeGen.zip";
  link.click();
}

function setAppMenuItems() {
  appItems.value = [
    { label: "Directory", icon: "fa-duotone fa-folder-open", command: () => directService.view(), color: "var(--blue-500)", size: 2 },
    { label: "Creator", icon: "fa-duotone fa-circle-plus", command: () => directService.create(), color: "var(--orange-500)", size: 2 },
    { label: "UPRN", icon: "fa-duotone fa-address-book", command: () => directService.uprn(), color: "var(--red-500)", size: 2 }
    // TODO add when query builder is ready { label: "Query", icon: "fa-solid fa-clipboard-question", command: () => directService.query() }
  ];
}

function showReleaseNotes() {
  sharedStore.updateShowReleaseNotes(true);
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

.scale-row {
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
  min-height: 30px;
}

.selected {
  background-colour: red;
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

#themes-menu {
  overflow: auto;
  height: 35vh;
}
</style>
