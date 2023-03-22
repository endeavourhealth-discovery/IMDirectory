<template>
  <div id="topbar">
    <div id="topbar-start">
      <img class="im-logo" src="../../assets/logos/Logo-object-empty.png" alt="IM logo" v-on:click="toLandingPage" />
    </div>
    <div id="topbar-content">
      <slot name="content" />
    </div>
    <div id="topbar-end">
      <Button label="Releases" class="p-button-outlined" @click="showReleaseNotes" />
      <Button :icon="fontAwesomePro ? 'fa-regular fa-palette' : 'fa-solid fa-palette'" @click="changeTheme()" />
      <Button
        :icon="fontAwesomePro ? 'fa-duotone fa-arrow-down-up-across-line' : 'fa-solid fa-cloud-arrow-down'"
        class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button ml-auto"
        @click="openAdminMenu"
      />
      <Menu ref="adminMenu" :model="getAdminItems()" :popup="true" />
      <Button
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
        v-if="!isLoggedIn"
        :icon="fontAwesomePro ? 'fa-duotone fa-user' : 'fa-regular fa-user'"
        class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button"
        @click="openUserMenu"
        aria-haspopup="true"
        aria-controls="overlay_menu"
      />
      <Button
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
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
import TieredMenu from "primevue/tieredmenu";
import { DirectService, Env, FilerService, DataModelService } from "@/services";

import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { usePrimeVue } from "primevue/config";

const store = useStore();
const currentUser = computed(() => store.state.currentUser);
const isLoggedIn = computed(() => store.state.isLoggedIn);
const authReturnUrl = computed(() => store.state.authReturnUrl);
const fontAwesomePro = computed(() => store.state.fontAwesomePro);

const loading = ref(false);
const loginItems: Ref<LoginItem[]> = ref([]);
const accountItems: Ref<AccountItem[]> = ref([]);
const appItems: Ref<{ icon: string; command: Function; label: string }[]> = ref([]);

const PrimeVue: any = usePrimeVue();
const toast = useToast();
const adminMenu = ref();
const userMenu = ref();
const appsOP = ref();
const directService = new DirectService();

onMounted(() => {
  setUserMenuItems();
  setAppMenuItems();
});

function toLandingPage() {
  window.location.href = "/";
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
      url: Env.DIRECTORY_URL + "user/" + "login"
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
      url: Env.DIRECTORY_URL + "user/" + "logout"
    }
  ];
}

function openAdminMenu(event: any): void {
  adminMenu.value.toggle(event);
}

function isLoggedInWithRole(role: String): boolean {
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
  store.commit("updateShowReleaseNotes", true);
}

function changeTheme() {
  PrimeVue.changeTheme("saga-blue", "saga-orange", "theme-link", () => {});
}
</script>

<style scoped>
.im-logo {
  cursor: pointer;
  margin: 0 0.5rem;
  width: 2.25rem;
}

#topbar {
  height: 3.5rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

#topbar-start {
  height: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
}

#topbar-content {
  height: 100%;
  flex: 0 1 auto;
  overflow: auto;
  width: 100%;
}

#topbar-end {
  height: 100%;
  flex: 1 0 auto;
  justify-self: end;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  padding: 0 0.5rem 0 0;
  gap: 0.25rem;
}
</style>

<style>
.topbar-end-button:hover {
  background-color: #6c757d !important;
  color: #ffffff !important;
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
