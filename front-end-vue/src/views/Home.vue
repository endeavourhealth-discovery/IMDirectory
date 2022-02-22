<template>
  <Splitter class="main-grid">
    <SplitterPanel :size="30">
      <Navigator />
    </SplitterPanel>
    <SplitterPanel :size="70">
      <router-view />
    </SplitterPanel>
  </Splitter>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Navigator from "@/components/home/Navigator.vue";

export default defineComponent({
  name: "Home",
  components: {
    Navigator
  }
});
</script>

<style scoped>
.main-grid {
  height: 100%;
  width: 100%;
}
.header-grow {
  flex-grow: 1;
}
.user-menu {
  height: 100%;
  margin-left: 5px;
  width: 12.5rem;
}
.p-menubar {
  height: 100%;
}
</style>
