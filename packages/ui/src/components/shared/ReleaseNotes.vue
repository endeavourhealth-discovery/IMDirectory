<template>
  <Dialog
    header="What's new"
    :visible="showRelNotes"
    :closable="false"
    :modal="true"
    :data-testid="'dialog-visible-' + showRelNotes"
    :style="{ width: '80vw' }"
  >
    <div v-if="loadingGlobal" class="global-loading-container">
      <ProgressSpinner />
    </div>
    <div v-else id="all-releases-container">
      <Button label="Expand all" @click="viewAll" data-testid="expand-all-button" />
      <div v-for="[key, appReleases] in releases" class="app-releases">
        <div class="title-container">
          <p class="app-name">{{ key }}</p>
          <Button
            :icon="showApp[key] ? 'pi pi-minus' : 'pi pi-plus'"
            class="p-button-rounded p-button-text p-button-primary p-button-sm expand-button"
            :id="'expand-button-' + key"
            @click="expandAppClicked(key, !showApp[key])"
            v-styleclass="{
              selector: '.tgl-' + key,
              enterClass: 'hidden',
              enterActiveClass: 'my-fadein',
              leaveActiveClass: 'my-fadeout',
              leaveToClass: 'hidden'
            }"
            :data-testid="'expand-button-' + key"
          />
        </div>
        <div :class="'hidden app-release-content-container tgl-' + key">
          <div v-if="loadingPerApp[key]" class="loading-container">
            <ProgressSpinner />
          </div>
          <div v-else-if="!appReleases || !appReleases.length">None</div>
          <div v-else class="releases-container">
            <div v-for="release in appReleases" class="release-container">
              <p class="version">{{ release.version }}</p>
              <p class="publish-date">publish date: {{ release.publishedDate }}</p>
              <div class="release-notes-container">
                <ul>
                  <li v-for="note in release.releaseNotes">{{ note }}</li>
                </ul>
              </div>
              <a :href="release.url">{{ release.url }}</a>
            </div>
            <Button
              v-if="!showLegacy[key]"
              label="View more"
              @click="getOlderReleases(key)"
              class="release-button view-more"
              data-testid="get-older-release-notes-button"
            />
            <Button
              v-else-if="appReleases.length > 1"
              label="Hide older"
              @click="hideOlderReleases(key)"
              class="release-button hide-older"
              data-testid="hide-older-release-notes-button"
            />
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Close" @click="close" data-testid="close-button" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, Ref, ref, inject, reactive, nextTick } from "vue";
import semver from "semver";
import { Env, GithubService } from "@/services";
import { GithubRelease } from "im-library/interfaces";
import { isObjectHasKeys } from "im-library/helpers/DataTypeCheckers";

const props = defineProps({
  appVersion: { type: String, required: true },
  repositoryName: { type: String, required: true }
});

const showRelNotes = ref(false);
const releases: Map<string, GithubRelease[]> = reactive(
  new Map().set("auth", []).set("directory", []).set("importData", []).set("editor", []).set("viewer", [])
);
const showApp: Ref<any> = ref({ auth: false, directory: false, editor: false, importData: false, viewer: false });
const showLegacy: Ref<any> = ref({ auth: false, directory: false, editor: false, importData: false, viewer: false });
const loadingPerApp: Ref<any> = ref({ auth: false, directory: false, editor: false, importData: false, viewer: false });
const loadingGlobal = ref(false);

onMounted(async () => {
  await init(props.repositoryName, props.appVersion);
});

async function init(repoName: string, latestVersion: string) {
  loadingGlobal.value = true;
  const lastVersion = getLocalVersion(repoName);
  if (!lastVersion || !semver.valid(lastVersion) || semver.lt(lastVersion, latestVersion)) {
    await getLatestReleaseNotes(repoName);
    showRelNotes.value = true;
    loadingGlobal.value = false;
    await nextTick();
    startExpanded(props.repositoryName);
  } else if (semver.valid(lastVersion) && semver.gt(lastVersion, lastVersion)) {
    setLocalVersion(repoName, latestVersion);
    await getLatestReleaseNotes(repoName);
    showRelNotes.value = true;
    loadingGlobal.value = false;
    await nextTick();
    startExpanded(props.repositoryName);
  } else loadingGlobal.value = false;
}

function getLocalVersion(repoName: string): string | null {
  return localStorage.getItem(repoName + "Version");
}

function setLocalVersion(repoName: string, versionNo: string) {
  localStorage.setItem(repoName + "Version", versionNo);
}

async function getLatestReleaseNotes(repoName: string) {
  loadingPerApp.value[repoNameToKey(repoName)] = true;
  const release = await GithubService.getLatestRelease(repoName);
  if (isObjectHasKeys(release)) releases.set(repoNameToKey(repoName), [release]);
  loadingPerApp.value[repoNameToKey(repoName)] = false;
}

async function getAdditionalAppLatestReleaseNotes(currentAppRepo: string) {
  if (currentAppRepo !== "IMDirectory") await getLatestReleaseNotes("IMDirectory");
  if (currentAppRepo !== "IMAuth") await getLatestReleaseNotes("IMAuth");
  if (currentAppRepo !== "IMEditor") await getLatestReleaseNotes("IMEditor");
  await getLatestReleaseNotes("ImportData");
  if (currentAppRepo !== "IMViewer") await getLatestReleaseNotes("IMViewer");
}

async function getAllRepoReleaseNotes(repoName: string) {
  loadingPerApp.value[repoNameToKey(repoName)] = true;
  const results = await GithubService.getReleases(repoName);
  releases.set(repoNameToKey(repoName), results);
  loadingPerApp.value[repoNameToKey(repoName)] = false;
}

async function getAdditionalFullReleaseNotes(currentAppRepo: string) {
  if (currentAppRepo !== "IMDirectory") await getAllRepoReleaseNotes("IMDirectory");
  if (currentAppRepo !== "IMAuth") await getAllRepoReleaseNotes("IMAuth");
  if (currentAppRepo !== "IMEditor") await getAllRepoReleaseNotes("IMEditor");
  await getAllRepoReleaseNotes("ImportData");
  if (currentAppRepo !== "IMViewer") await getAllRepoReleaseNotes("IMViewer");
}

function close() {
  showRelNotes.value = false;
  const iterator = releases.entries();
  for (let i = 0; i < releases.size; i++) {
    const item = iterator.next().value;
    const key = item[0];
    const value = item[1];
    let version;
    if (value.length) version = value[0].version;
    if (version) setLocalVersion(keyToRepoName(key), version);
  }
}

async function expandAppClicked(key: string, show: boolean) {
  if (!releases.get(key)?.length) await getLatestReleaseNotes(keyToRepoName(key));
  showApp.value[key] = show;
}

function startExpanded(repoName: string) {
  const key = repoNameToKey(repoName);
  const button = document.getElementById(`expand-button-${key}`) as HTMLElement;
  if (button) button.click();
  // else throw new Error("failed to find button to click: " + key);
}

function setShowLegacy(repoName: string, show: boolean) {
  showLegacy.value[repoNameToKey(repoName)] = show;
}

function resetBooleanObject(booleanObject: any) {
  for (const [key, value] of Object.entries(booleanObject)) {
    booleanObject[key] = false;
  }
}

async function viewAll() {
  await getAdditionalAppLatestReleaseNotes(props.repositoryName);
  if (props.repositoryName !== "IMAuth" && showApp.value.auth === false) startExpanded("IMAuth");
  if (props.repositoryName !== "IMDirectory" && showApp.value.directory === false) startExpanded("IMDirectory");
  if (props.repositoryName !== "IMEditor" && showApp.value.editor === false) startExpanded("IMEditor");
  if (showApp.value.importData === false) startExpanded("ImportData");
  if (props.repositoryName !== "IMViewer" && showApp.value.viewer === false) startExpanded("IMViewer");
}

async function getOlderReleases(appKey: string) {
  setShowLegacy(keyToRepoName(appKey), true);
  await getAllRepoReleaseNotes(keyToRepoName(appKey));
}

function hideOlderReleases(appKey: string) {
  const found = releases.get(appKey);
  if (found) {
    const first = found[0];
    releases.set(appKey, [first]);
  }
}

function repoNameToKey(repoName: string): string {
  if (repoName === "ImportData") return "importData";
  return repoName.substring(2).toLowerCase();
}

function keyToRepoName(key: string): string {
  if (key === "importData") return "ImportData";
  return "IM" + key.substring(0, 1).toUpperCase() + key.substring(1);
}
</script>

<style scoped>
#all-releases-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
}
.title-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}
.app-name {
  text-transform: capitalize;
  margin: 0;
}

.app-releases {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
}

.app-release-content-container {
  width: calc(100% - 1rem);
  margin-left: 1rem;
}

.releases-container {
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  width: 100%;
}

.release-container {
  width: calc(100% - 1rem);
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 3px;
}

p {
  margin: 0;
  padding: 0;
}

.version {
  padding: 0 1rem 0 0;
  font-size: large;
}

.release-button {
  margin-top: 0.5rem;
  width: fit-content;
}

@keyframes my-fadein {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes my-fadeout {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.my-fadein {
  animation: my-fadein 150ms linear;
}

.my-fadeout {
  animation: my-fadeout 150ms linear;
}
</style>
