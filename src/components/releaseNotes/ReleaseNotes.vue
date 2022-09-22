<template>
  <Dialog :header="'What\'s new (v' + release.version + ')'" :visible="showRelNotes" :closable="false" :modal="true">
    <ul>
      <li v-for="item in release.notes">{{ item }}</li>
    </ul>
    <template #footer>
      <Button label="Close" @click="close" autofocus />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref } from "vue";

const showRelNotes = ref(false);
const release = ref({
  version: 2.2,
  notes: [
    "Updated core to SNOMED 34.1 (10-Aug-2022)",
    "Visual enhancements (e.g. less whitespace on tree)",
    "Optimized search results table",
    "Main directory tree now supports double-click",
    "'Find in tree' now locates in the right panel hierarchy",
    "Fixed incorrect code display (symbols) in IMViewer"
  ]
});

onMounted(() => {
  const lastVer = window.localStorage.getItem("IMVersion");
  if (!lastVer || +lastVer < release.value.version) {
    showRelNotes.value = true;
  }
});

function close() {
  showRelNotes.value = false;
  localStorage.setItem("IMVersion", release.value.version.toString());
}
</script>

<style scoped></style>
