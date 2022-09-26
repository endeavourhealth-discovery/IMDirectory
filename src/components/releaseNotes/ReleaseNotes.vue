<template>
  <Dialog :header="'What\'s new (v' + version + ')'" :visible="showRelNotes" :closable="false" :modal="true" :data-testid="'dialog-visible-' + showRelNotes">
    <ul>
      <li v-for="item in releaseNotes">{{ item }}</li>
    </ul>
    <template #footer>
      <Button label="Close" @click="close" autofocus />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import semver from "semver";

const version = __APP_VERSION__;
const showRelNotes = ref(false);
const releaseNotes = ref([
  "Updated core to SNOMED 34.1 (10-Aug-2022)",
  "Visual enhancements (e.g. less whitespace on tree)",
  "Optimized search results table",
  "Main directory tree now supports double-click",
  "'Find in tree' now locates in the right panel hierarchy",
  "Fixed incorrect code display (symbols) in IMViewer"
]);

onMounted(() => {
  const lastVer = window.localStorage.getItem("IMVersion");
  if (!lastVer || !semver.valid(lastVer) || semver.lt(lastVer, version)) {
    showRelNotes.value = true;
  } else if (semver.valid(lastVer) && semver.gt(lastVer, version)) {
    localStorage.setItem("IMVersion", version);
    showRelNotes.value = true;
  }
});

function close() {
  showRelNotes.value = false;
  localStorage.setItem("IMVersion", version);
}
</script>

<style scoped></style>
