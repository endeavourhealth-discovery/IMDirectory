<template>
  <Dialog :header="'What\'s new (v' + release.version + ')'" :visible="showRelNotes" :closable=false :modal="true">
    <ul>
      <li v-for="item in release.notes">{{item}}</li>
    </ul>
    <template #footer>
      <Button label="Close" @click="close" autofocus />
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ReleaseNotes",
  data() {
    return {
      showRelNotes: false,
      release: {
        version: 2.2,
        notes: [
            "Updated core to SNOMED 34.1 (10-Aug-2022)",
            "Visual enhancements (e.g. less whitespace on tree)",
            "Optimized search results table",
            "Main directory tree now supports double-click",
            "'Find in tree' now locates in the right panel hierarchy",
            "Fixed incorrect code display (symbols) in IMViewer"
        ]
      }
    };
  },
  mounted() {
    console.log("mounted");
    const lastVer = localStorage.getItem("IMVersion");
    if (!lastVer || +lastVer < this.release.version) {
      this.showRelNotes = true;
    }
  },
  methods: {
    close() {
      this.showRelNotes = false;
      localStorage.setItem("IMVersion", this.release.version.toString());
    }
  }
});
</script>

<style scoped>
</style>
