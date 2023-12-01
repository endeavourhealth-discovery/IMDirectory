<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local" @resizeend="updateSplitter">
    <SplitterPanel :size="30" :minSize="10" style="overflow: auto" data-testid="splitter-left">
      <NavTree :allow-right-click="true" :selected-iri="findInTreeIri" @row-selected="routeToSelected" />
    </SplitterPanel>
    <SplitterPanel :size="70" :minSize="10" style="overflow: auto" data-testid="splitter-right">
      <div class="splitter-right">
        <router-view
          v-slot="{ Component, route }"
          @selectedUpdated="routeToSelected"
          :searchResults="searchResults"
          :searchLoading="searchLoading"
          @navigateTo="navigateTo"
          @locateInTree="locateInTree"
          v-model:history="history"
        >
          <transition :name="showTransitions ? route?.meta?.transition : 'fade'" :mode="showTransitions ? route?.meta?.mode : 'in-out'">
            <component :key="route.fullPath" :style="{ transitionDelay: route?.meta?.transitionDelay || '0s' }" :is="Component" />
          </transition>
        </router-view>
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script setup lang="ts">
import NavTree from "@/components/shared/NavTree.vue";
import { useDirectoryStore } from "@/stores/directoryStore";
import { DirectService } from "@/services";
import { Ref, computed, ref, onMounted } from "vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useRouter } from "vue-router";

const router = useRouter();
const directoryStore = useDirectoryStore();
const directService = new DirectService();

const searchResults = computed(() => directoryStore.searchResults);
const searchLoading = computed(() => directoryStore.searchLoading);
const findInTreeIri = computed(() => directoryStore.findInTreeIri);

const history: Ref<string[]> = ref([]);
const showTransitions = ref(false);

onMounted(async () => {
  await router.isReady();
  showTransitions.value = true;
});

function updateSplitter(event: any) {
  directoryStore.updateSplitterRightSize(event.sizes[1]);
}

function routeToSelected(selected: any) {
  if (isObjectHasKeys(selected, ["key"])) directService.select(selected.key, "Folder");
  else if (isObjectHasKeys(selected, ["iri"])) directService.select(selected.iri, "Folder");
  else if (typeof selected === "string") directService.select(selected, "Folder");
}

function navigateTo(iri: any) {
  if (iri.item && iri.item.icon.includes("fa-house")) {
    router.push("/");
  } else {
    directService.select(iri, "Folder");
  }
}

function locateInTree(iri: string) {
  directoryStore.updateFindInTreeIri(iri);
}
</script>

<style scoped>
.p-splitter {
  height: 100%;
  width: 100%;
}

.splitter-right {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
