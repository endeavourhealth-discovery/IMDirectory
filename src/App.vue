<template>
  <div class="layout-wrapper layout-static">
    <Toast />
    <ConfirmDialog />
    <div id="topbar-content-container">
      <TopBar>
        <template #content>
          <Search />
        </template>
      </TopBar>
      <div id="app-content-container">
        <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
          <ProgressSpinner />
        </div>
        <router-view v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Search from "@/components/topbar/Search.vue";

export default defineComponent({
  name: "App",
  components: { Search },
  async mounted() {
    // check for user and log them in if found or logout if not
    this.loading = true;
    await this.$store.dispatch("authenticateCurrentUser");
    await this.$store.dispatch("fetchBlockedIris");
    this.loading = false;
  },
  data() {
    return {
      loading: false
    };
  }
});
</script>

<style>
#topbar-content-container {
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  overflow: auto;
}

body {
  overflow: hidden;
}

.loading-container {
  width: 100%;
  height: 100%;
}

#app-content-container {
  height: calc(100% - 3.5rem);
}

#topbar-container {
  height: 4rem;
  width: 100vw;
}

.p-toast-message-text {
  width: calc(100% - 4rem);
}

.p-toast-message-content {
  width: 100%;
}

.p-toast-detail {
  width: 100%;
  word-wrap: break-word;
}
</style>
