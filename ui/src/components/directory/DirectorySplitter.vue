<template>
  <Splitter stateKey="directoryMainSplitterHorizontal" stateStorage="local" @resizeend="updateSplitter">
    <SplitterPanel :size="30" :minSize="10" style="overflow: auto" data-testid="splitter-left">
      <NavTree
        :allow-right-click="true"
        :selected-iri="findInTreeIri"
        :find-in-tree="findInTreeBoolean"
        @row-selected="routeToSelected"
        @found-in-tree="directoryStore.updateFindInTreeBoolean(false)"
      />
    </SplitterPanel>
    <SplitterPanel :size="70" :minSize="10" style="overflow: auto" data-testid="splitter-right">
      <div class="splitter-right">
        <div v-if="directoryLoading" class="flex flex-row justify-content-center align-items-center loading-container">
          <ProgressSpinner />
        </div>
        <router-view
          v-else
          v-slot="{ Component, route }"
          v-model:history="history"
          :searchTerm="searchTerm"
          :updateSearch="updateSearch"
          :selected-filter-options="selectedFilterOptions"
          :rows="100"
          @selectedUpdated="routeToSelected"
          @navigateTo="navigateTo"
          @locateInTree="locateInTree"
          @selected-filters-updated="emit('selectedFiltersUpdated', $event)"
        >
          <transition :name="route?.meta?.transition || 'fade'" :mode="route?.meta?.mode || 'in-out'">
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
import { Ref, computed, ref, onMounted, watch } from "vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useRouter } from "vue-router";
import { useLoadingStore } from "@/stores/loadingStore";
import { FilterOptions } from "@im-library/interfaces";

interface Props {
  searchTerm: string;
  updateSearch: boolean;
  selectedFilterOptions: FilterOptions;
}

const props = defineProps<Props>();

const emit = defineEmits({ selectedFiltersUpdated: (_payload: FilterOptions) => true });

const router = useRouter();
const loadingStore = useLoadingStore();
const directoryStore = useDirectoryStore();
const directService = new DirectService();

const findInTreeIri = computed(() => directoryStore.findInTreeIri);
const findInTreeBoolean = computed(() => directoryStore.findInTreeBoolean);
const directoryLoading = computed(() => loadingStore.directoryLoading);

const history: Ref<string[]> = ref([]);

function updateSplitter(event: any) {
  directoryStore.updateSplitterRightSize(event.sizes[1]);
}

function routeToSelected(selected: any) {
  if (isObjectHasKeys(selected, ["key"])) directService.select(selected.key, "Folder");
  else if (isObjectHasKeys(selected, ["iri"])) directService.select(selected.iri, "Folder");
  else if (typeof selected === "string") directService.select(selected, "Folder");
}

function navigateTo(iri: any) {
  if (iri.item?.icon.includes("fa-house")) {
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

.loading-container {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
