<template>
  <Dialog :visible="true" :closable="false" :modal="true" :style="{ width: '80vw' }">
    <div v-if="loadingGlobal" class="global-loading-container">
      <ProgressSpinner />
    </div>
    <div v-else id="all-releases-container">
      <div class="app-releases">
        <div class="title-container">
          <h1 class="title">Releases</h1>
        </div>
        <div class="app-release-content-container">
          <div v-if="loadingNotes" class="loading-container">
            <ProgressSpinner />
          </div>
          <div v-else-if="!releases.length"><span>None</span></div>
          <div v-else class="releases-container">
            <div v-for="(release, relIdx) in releases" class="release-container" v-bind:key="relIdx">
              <h1 class="version">{{ release.version }}</h1>
              <p class="publish-date">publish date: {{ release.publishedDate }}</p>
              <div class="release-notes-container">
                <span v-if="!release.releaseNotes.length">No details</span>
                <VueShowdown
                  v-else
                  class="showdown-component"
                  v-for="(note, noteIdx) in release.releaseNotes"
                  :markdown="note"
                  flavor="github"
                  v-bind:key="noteIdx"
                />
              </div>
              <Button link as="a" class="github-link" :href="sanitizeUrl(release.url)">{{ release.url }}</Button>
            </div>
          </div>
          <div v-if="!(loadingNotes || loadingGlobal)" class="view-buttons-container">
            <Button
              v-if="releases.length < 2"
              label="View more"
              @click="getOlderReleases()"
              class="release-button view-more"
              data-testid="get-older-release-notes-button"
            />
            <Button v-else label="Hide older" @click="hideOlderReleases()" class="release-button hide-older" data-testid="hide-older-release-notes-button" />
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
import { onMounted, Ref, ref, nextTick } from "vue";
import { GithubService } from "@/services";
import { GithubRelease } from "@/interfaces";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { useSharedStore } from "@/stores/sharedStore";
import { sanitizeUrl } from "@braintree/sanitize-url";

const sharedStore = useSharedStore();

const releases: Ref<GithubRelease[]> = ref([]);
const loadingNotes: Ref<boolean> = ref(false);
const loadingGlobal = ref(false);

onMounted(async () => {
  await init();
});

async function init() {
  loadingGlobal.value = true;
  await getLatestReleaseNotes();
  loadingGlobal.value = false;
  await nextTick();
}

function setLocalVersion(repoName: string, versionNo: string) {
  localStorage.setItem(repoName + "Version", versionNo);
}

async function getLatestReleaseNotes() {
  loadingNotes.value = true;
  const release = await GithubService.getLatestRelease("IMDirectory");
  release.releaseNotes = release.releaseNotes.map(note => note.replaceAll("%27", "'").replaceAll("%22", '"'));
  if (isObjectHasKeys(release)) releases.value = [release];
  loadingNotes.value = false;
}

async function getAllRepoReleaseNotes() {
  loadingNotes.value = true;
  const results = await GithubService.getReleases("IMDirectory");
  results.forEach(res => (res.releaseNotes = res.releaseNotes.map(note => note.replaceAll("%27", "'").replaceAll("%22", '"'))));
  releases.value = results;
  loadingNotes.value = false;
}

function close() {
  if (releases.value.length) setLocalVersion("IMDirectory", releases.value[0].version);
  sharedStore.updateShowReleaseNotes(false);
}

async function getOlderReleases() {
  await getAllRepoReleaseNotes();
}

function hideOlderReleases() {
  const first = releases.value[0];
  releases.value = [first];
}
</script>

<style scoped>
.global-loading-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

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
  flex: 0 0 auto;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}
.title {
  margin: 0;
  padding-bottom: 0.5rem;
}

.app-releases {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
}

.app-release-content-container {
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.releases-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  width: 100%;
  overflow: auto;
}

.loading-container {
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
}

.release-container {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-content-border-radius);
}

.release-notes-container {
  margin-bottom: 0.5rem;
}

.view-buttons-container {
  flex: 0 0 auto;
}

.loading-container {
  overflow: hidden;
}

p {
  margin: 0;
  padding: 0;
}

.version {
  margin: 0 0 0.5rem 0;
}

.release-button {
  margin-top: 0.5rem;
  width: fit-content;
}

.github-link {
  padding: 0;
}

.showdown-component:deep(ul) {
  list-style-type: disc;
  list-style-position: inside;
  padding-left: 1rem;
}
</style>
