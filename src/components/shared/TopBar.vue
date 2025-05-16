<template>
  <div id="topbar">
    <div id="topbar-start">
      <img class="im-logo" src="/logos/Logo-object-empty.png" alt="IM logo" v-on:click="toLandingPage" data-testid="im-logo" />
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
        data-testid="releases-button"
      />
      <Button
        v-tooltip.bottom="'Themes'"
        icon="fa-regular fa-palette"
        rounded
        text
        plain
        class="topbar-end-button"
        @click="openThemesMenu"
        data-testid="change-theme-button"
      />
      <Popover ref="themesMenu" id="themes-menu">
        <div class="theme-container">
          <h2>Primary</h2>
          <div class="color-picker">
            <Button
              v-for="(color, index) in themeOptions.primaryColours"
              rounded
              class="round-button border-none"
              :class="selectedPrimaryColor === color && 'selected-primary'"
              :style="'background-color:var(--p-' + color + '-500)'"
              v-tooltip="color"
              @click="
                () => {
                  selectedPrimaryColor = color;
                  changePrimaryColor(color);
                }
              "
              v-bind:key="index"
            />
          </div>
          <h2>Surface</h2>
          <div class="color-picker">
            <Button
              v-for="(color, index) in themeOptions.surfaceColours"
              rounded
              class="round-button border-none"
              :class="selectedSurfaceColor === color && 'selected-surface'"
              :style="'background-color:var(--p-' + color + '-500)'"
              v-tooltip="color"
              @click="
                () => {
                  selectedSurfaceColor = color;
                  changeSurfaceColor(color);
                }
              "
              v-bind:key="index"
            />
          </div>
          <h2>Presets</h2>
          <div class="flex flex-row flex-wrap">
            <SelectButton v-model="preset" :options="themeOptions.presets" :allowEmpty="false" />
          </div>
          <h2>Dark mode</h2>
          <ToggleSwitch v-model="darkMode" />
        </div>
      </Popover>
      <Button
        v-tooltip.bottom="'Scale'"
        icon="fa-duotone fa-text-size"
        rounded
        text
        plain
        class="topbar-end-button"
        @click="openScaleMenu"
        data-testid="font-size-button"
      />
      <Menu ref="scaleMenu" id="scale-menu" :model="getScales()" :popup="true">
        <template #item="{ item }">
          <div class="scale-row">
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
        @click="openUploadDownloadMenu"
        data-testid="upload-download-button"
      />
      <Menu ref="uploadDownloadMenu" id="upload-download-menu" :model="uploadDownloadItems" :popup="true" />
      <Button
        v-tooltip.bottom="'Apps'"
        icon="fa-regular fa-grid-2"
        class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button"
        @click="openAppsOverlay"
        data-testid="apps-button"
      />
      <Popover ref="appsOP" class="app-overlay-panel" id="apps-menu">
        <div class="flex flex-row flex-wrap justify-start gap-2">
          <template v-for="(item, index) in appItems" v-bind:key="index">
            <Shortcut :label="item.label" :icon="item.icon" :command="item.command" :color="item.color" :size="item.size" :visible="item.visible" />
          </template>
        </div>
      </Popover>
      <Button
        v-tooltip.left="'Account'"
        v-if="!isLoggedIn"
        icon="fa-duotone fa-user"
        class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button"
        @click="openUserMenu"
        aria-haspopup="true"
        aria-controls="overlay_menu"
        data-testid="account-menu"
      />
      <Button
        v-tooltip.left="'Account'"
        v-if="currentUser && isLoggedIn"
        class="p-button-rounded p-button-text p-button-plain p-button-lg p-button-icon-only topbar-end-button"
        @click="openUserMenu"
        aria-haspopup="true"
        aria-controls="overlay_menu"
        data-testid="account-menu-logged-in"
      >
        <img class="avatar-icon" alt="avatar icon" :src="`/avatars/${currentUser.avatar}`" style="min-width: 1.75rem" />
      </Button>
      <Menu ref="userMenu" id="account-menu" :model="getItems()" :popup="true">
        <template #item="{ item, props }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a v-ripple :href="href" v-bind="props.action" @click="navigate" style="color: var(--p-text-color)">
              <span :class="item.icon" />
              <span class="ml-2">{{ item.label }}</span>
            </a>
          </router-link>
          <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action" style="color: var(--p-text-color)">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </template>
      </Menu>
    </div>
    <Dialog header="Set namespace/package" :visible="showCodeDownload" :modal="true" :closable="false" id="code-download-dialog">
      <div class="flex flex-col gap-2">
        <label for="template">Template</label>
        <Select id="template" v-model="template" :options="templates" />
      </div>
      <div class="flex flex-col gap-2">
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
import { computed, ref, Ref, onMounted, watch } from "vue";
import Shortcut from "../directory/landingPage/Shortcut.vue";
import { useToast } from "primevue/usetoast";
import { DirectService, FilerService, GithubService, CodeGenService } from "@/services";
import type { MenuItem } from "primevue/menuitem";

import { useUserStore } from "@/stores/userStore";
import { useSharedStore } from "@/stores/sharedStore";
import { useRouter } from "vue-router";
import setupChangeScale from "@/composables/setupChangeScale";
import setupChangeThemeOptions from "@/composables/setupChangeThemeOptions";
import PrimeVuePresetThemes from "@/enums/PrimeVuePresetThemes";
import PrimeVueColors from "@/enums/PrimeVueColors";

const router = useRouter();
const userStore = useUserStore();
const sharedStore = useSharedStore();
const currentUser = computed(() => userStore.currentUser);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const isAdmin = computed(() => userStore.isAdmin);
const currentScale = computed(() => userStore.currentScale);
const currentPreset = computed(() => userStore.currentPreset);
const currentPrimaryColor = computed(() => userStore.currentPrimaryColor);
const currentSurfaceColor = computed(() => userStore.currentSurfaceColor);
const userDarkMode = computed(() => userStore.darkMode);

const { changeScale } = setupChangeScale();
const { changePreset, changePrimaryColor, changeSurfaceColor, changeDarkMode } = setupChangeThemeOptions();

const showCodeDownload = ref(false);
const namespace = ref();
const templates: Ref<string[]> = ref([]);
const template = ref();
const loginItems: Ref<MenuItem[]> = ref([]);
const accountItems: Ref<MenuItem[]> = ref([]);
const uploadDownloadItems: Ref<MenuItem[]> = ref([]);
const appItems: Ref<{ icon: string; command?: () => void; url?: string; label: string; color: string; size: number; visible?: boolean }[]> = ref([]);
const currentVersion: Ref<undefined | string> = ref();
const themeOptions: Ref<{ primaryColours: PrimeVueColors[]; surfaceColours: PrimeVueColors[]; presets: PrimeVuePresetThemes[] }> = ref({
  primaryColours: [
    PrimeVueColors.EMERALD,
    PrimeVueColors.GREEN,
    PrimeVueColors.LIME,
    PrimeVueColors.RED,
    PrimeVueColors.ORANGE,
    PrimeVueColors.AMBER,
    PrimeVueColors.YELLOW,
    PrimeVueColors.TEAL,
    PrimeVueColors.CYAN,
    PrimeVueColors.SKY,
    PrimeVueColors.BLUE,
    PrimeVueColors.INDIGO,
    PrimeVueColors.VIOLET,
    PrimeVueColors.PURPLE,
    PrimeVueColors.FUCHSIA,
    PrimeVueColors.PINK,
    PrimeVueColors.ROSE
  ],
  surfaceColours: [PrimeVueColors.SLATE, PrimeVueColors.GRAY, PrimeVueColors.ZINC, PrimeVueColors.NEUTRAL, PrimeVueColors.STONE],
  presets: [PrimeVuePresetThemes.AURA, PrimeVuePresetThemes.LARA, PrimeVuePresetThemes.NORA, PrimeVuePresetThemes.MATERIAL]
});
const preset = ref(themeOptions.value.presets[0]);
const darkMode = ref(false);
const selectedPrimaryColor = ref(themeOptions.value.primaryColours[0]);
const selectedSurfaceColor = ref(themeOptions.value.surfaceColours[0]);

const toast = useToast();
const uploadDownloadMenu = ref();
const themesMenu = ref();
const scaleMenu = ref();
const userMenu = ref();
const appsOP = ref();
const directService = new DirectService();

watch(preset, async newValue => {
  await changePreset(newValue);
});

watch(darkMode, async newValue => {
  await changeDarkMode(newValue);
});

onMounted(async () => {
  darkMode.value = userDarkMode.value;
  if (currentPreset.value) preset.value = currentPreset.value;
  if (currentPrimaryColor.value) selectedPrimaryColor.value = currentPrimaryColor.value;
  if (currentSurfaceColor.value) selectedSurfaceColor.value = currentSurfaceColor.value;
  setUserMenuItems();
  setAppMenuItems();
  await setUploadDownloadMenuItems();
  await getCurrentVersion();
});

async function getCurrentVersion() {
  const latestRelease = await GithubService.getLatestRelease("IMDirectory");
  if (latestRelease && latestRelease.version) currentVersion.value = latestRelease.version;
}

function toLandingPage() {
  router.push("/");
}

function getItems(): MenuItem[] {
  if (isLoggedIn.value) {
    return accountItems.value;
  } else {
    return loginItems.value;
  }
}

function openUserMenu(event: MouseEvent): void {
  userMenu.value.toggle(event);
}

function openAppsOverlay(event: MouseEvent) {
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

function openUploadDownloadMenu(event: MouseEvent): void {
  uploadDownloadMenu.value.toggle(event);
}

function openThemesMenu(event: MouseEvent): void {
  themesMenu.value.toggle(event);
}

function openScaleMenu(event: MouseEvent): void {
  scaleMenu.value.toggle(event);
}

function isLoggedInWithRole(role: string): boolean {
  return isLoggedIn.value && typeof currentUser.value !== "undefined" && currentUser.value.roles.includes(role);
}

async function setUploadDownloadMenuItems(): Promise<void> {
  uploadDownloadItems.value = [
    {
      label: "Upload/Download",
      icon: "fa-duotone fa-files",
      items: [
        {
          label: "Download changes",
          icon: "fa-duotone fa-file-arrow-down",
          disabled: !isAdmin.value,
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

function getScales(): MenuItem[] {
  return [
    {
      label: "UI Scale",
      items: [
        {
          key: "12px",
          label: "Small",
          icon: "fa-regular fa-a fa-xs",
          command: async () => await changeScale("12px")
        },
        {
          key: "14px",
          label: "Medium",
          icon: "fa-regular fa-a fa-sm",
          command: async () => await changeScale("14px")
        },
        {
          key: "16px",
          label: "Large",
          icon: "fa-regular fa-a",
          command: async () => await changeScale("16px")
        },
        {
          key: "18px",
          label: "XLarge",
          icon: "fa-regular fa-a",
          command: async () => await changeScale("18px")
        }
      ]
    }
  ];
}

async function downloadCode() {
  templates.value = await CodeGenService.getCodeTemplateList();
  showCodeDownload.value = true;
}

async function generateAndDownload() {
  showCodeDownload.value = false;
  toast.add({ severity: "info", summary: "Preparing download", detail: "Generating files for download...", life: 3000 });
  let blob = await CodeGenService.generateCodeForAllModels(namespace.value, template.value);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "DmCodeGen.zip";
  link.click();
}

function setAppMenuItems() {
  appItems.value = [
    { label: "Directory", icon: "fa-duotone fa-folder-open", command: () => router.push({ name: "LandingPage" }), color: "var(--p-blue-500)", size: 2 },
    { label: "Creator", icon: "fa-duotone fa-circle-plus", command: () => directService.create(), color: "var(--p-orange-500)", size: 2 },
    { label: "ASSIGN UPRN", icon: "fa-duotone fa-map-location-dot", command: () => directService.uprn(), color: "var(--p-red-500)", size: 2 },
    // { label: "Workflow", icon: "fa-duotone fa-list-check", command: () => directService.workflow(), color: "var(--p-green-500)", size: 2 }
    // TODO add when query builder is ready { label: "Query", icon: "fa-solid fa-clipboard-question", command: () => directService.query() }
    {
      label: "Admin toolbox",
      icon: "fa-duotone fa-toolbox",
      command: () => openAdminToolbox(),
      color: "var(--p-zinc-500)",
      size: 2,
      visible: isAdmin.value
    }
  ];
}

async function downloadChanges() {
  toast.add({ severity: "info", summary: "Preparing download", detail: "Zipping delta files for download...", life: 3000 });
  try {
    let blob = await FilerService.downloadDeltas();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "deltas.zip";
    link.click();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    toast.add({ severity: "error", summary: "Download failed", detail: "File location not found, unable to download deltas", life: 3000 });
  }
}

function showReleaseNotes() {
  sharedStore.updateShowReleaseNotes(true);
}

async function openAdminToolbox() {
  await router.push({ name: "Admin" });
}
</script>

<style scoped>
@reference "tailwindcss-primeui";
.im-logo {
  cursor: pointer;
  margin: 0 0.5rem;
  width: 2.25rem;
}

#topbar {
  min-height: 3.5rem;
  height: 3.5rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid var(--p-content-border-color);
}

#topbar-start {
  height: inherit;
  flex: 0 0 auto;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
}

#topbar-content {
  height: inherit;
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  overflow: auto;
  width: 100%;
}

#topbar-end {
  height: inherit;
  flex: 0 1 auto;
  justify-self: end;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  padding: 0 0.5rem 0 0;
  gap: 0.25rem;
}

.scale-row {
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
  min-height: 30px;
  cursor: pointer;
}

.theme-icon {
  margin-left: 1rem;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  padding: 0.125rem 0;
}

.topbar-end-button:hover {
  background-color: var(--p-text-color) !important;
  color: var(--p-content-background) !important;
}

.app-overlay-panel {
  z-index: 1;
}

#themes-menu {
  overflow: auto;
}

.theme-container {
  display: flex;
  flex-flow: column nowrap;
  width: 18rem;
}

.color-picker {
  display: flex;
  flex-flow: row wrap;
  gap: 0.25rem;
}

.round-button {
  height: 2rem;
  width: 2rem;
}
</style>
