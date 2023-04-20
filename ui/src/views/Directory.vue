<template>
  <div id="directory-main-container">
    <TopBar>
      <template #content>
        <div id="topbar-content-container">
          <Search />
        </div>
      </template>
    </TopBar>
    <div id="app-content-container">
      <div v-if="loading" class="flex flex-row justify-content-center align-items-center loading-container">
        <ProgressSpinner />
      </div>
      <DirectorySplitter v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import TopBar from "@/components/shared/TopBar.vue";
import Search from "@/components/directory/topbar/Search.vue";
import DirectorySplitter from "@/components/directory/DirectorySplitter.vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useStore } from "vuex";

const router = useRouter();
const toast = useToast();
const store = useStore();

const currentUser = computed(() => store.state.currentUser);
const isLoggedIn = computed(() => store.state.isLoggedIn);

const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await store.dispatch("fetchFilterSettings");
  await store.dispatch("initFavourites");
  loading.value = false;
});
</script>

<style scoped>
#directory-main-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

#topbar-content-container {
  height: 100%;
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
}

body {
  overflow: hidden;
}

.loading-container {
  width: 100%;
  height: 100%;
}

#app-content-container {
  flex: 1 1 auto;
  overflow: auto;
}

#topbar-container {
  height: 4rem;
  width: 100vw;
}
</style>
