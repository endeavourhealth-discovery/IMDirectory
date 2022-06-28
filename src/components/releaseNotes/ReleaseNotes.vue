<template>
  <Dialog :header="'What\'s new (v' + release.version + ')'" :visible="showRelNotes" :closable=false>
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
        version: 2.1,
        notes: [
            "Update to SNOMED xx.xx",
            "Navigation trees now support double-click",
            "Tooltips added to main tree",
            "'Load more' in trees for large lists",
            "'See more' navigation option in definition & graph",
            "Sort search results by usage",
            "Query definition now updates when navigating",
            "Fixed issue when user tried to update their email",
            "Various bug fixes/performance enhancements"
        ]
      }
    };
  },
  mounted() {
    console.log("mounted");
    const lastVer = localStorage.getItem("IMVersion");
    if (!lastVer || +lastVer <= this.release.version) {
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
