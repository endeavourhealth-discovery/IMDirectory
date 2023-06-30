<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    header="Search"
    :style="{ minWidth: '90vw', maxWidth: '90vw', minHeight: '90vh', maxHeight: '90vh', backgroundColor: 'var(--surface-section)' }"
    class="search-dialog"
  >
    <div class="directory-search-dialog-content">
      <div class="search-bar">
        <SearchBar v-model:searchResults="searchResults" v-model:searchLoading="searchLoading" :searchByQuery="searchByQuery" />
      </div>
      <div class="vertical-divider">
        <div class="left-container">
          <NavTree :selectedIri="treeIri" @row-selected="showDetails" />
        </div>
        <div class="right-container">
          <DirectoryDetails
            v-if="detailsIri"
            :selected-iri="detailsIri"
            @locateInTree="locateInTree"
            @navigateTo="navigateTo"
            :validationQuery="searchByQuery"
            :showSelectButton="true"
            v-model:history="history"
            @selected-updated="updateSelectedFromIri"
          />
          <SearchResults
            v-else
            :searchResults="searchResults"
            :searchLoading="searchLoading"
            :selected="selected"
            @selectedUpdated="updateSelected"
            @locate-in-tree="locateInTree"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, Ref, computed } from "vue";
import { ConceptSummary } from "@im-library/interfaces";
import SearchBar from "@/components/shared/SearchBar.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import NavTree from "@/components/shared/NavTree.vue";
import DirectoryDetails from "@/components/directory/DirectoryDetails.vue";
import { useSharedStore } from "@/stores/sharedStore";
import _ from "lodash";
import { EntityService } from "@/services";

interface Props {
  showDialog: boolean;
  searchByQuery?: string;
  selected?: ConceptSummary;
}
const props = defineProps<Props>();
watch(
  () => props.showDialog,
  newValue => {
    visible.value = newValue;
  }
);

const emit = defineEmits({
  "update:showDialog": payload => typeof payload === "boolean",
  "update:selected": payload => true,
});

const sharedStore = useSharedStore();
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

const visible = ref(false);
watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
    resetDialog();
  }
});
const searchResults: Ref<ConceptSummary[]> = ref([]);
const searchLoading = ref(false);
const treeIri = ref("");
const detailsIri = ref("");
const history: Ref<string[]> = ref([]);

watch(searchResults, newValue => {
  detailsIri.value = "";
});

onMounted(() => {
  visible.value = props.showDialog;
});

function updateSelected(data: ConceptSummary) {
  emit("update:selected", data);
  visible.value = false;
}

async function updateSelectedFromIri(iri: string) {
  const entity = await EntityService.getEntitySummary(iri);
  emit("update:selected", entity);
  visible.value = false;
}

function locateInTree(iri: string) {
  treeIri.value = iri;
}

function showDetails(data: any) {
  detailsIri.value = data.key;
}

function navigateTo(iri: string) {
  detailsIri.value = iri;
}

function resetDialog() {
  searchResults.value = [];
  searchLoading.value = false;
  treeIri.value = "";
  detailsIri.value = "";
  history.value = [];
}
</script>

<style scoped>
.directory-search-dialog-content {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
}

.vertical-divider {
  width: 100%;
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: row nowrap;
}

.left-container {
  flex: 0 0 30%;
  overflow: auto;
}

.right-container {
  flex: 1 1 auto;
  overflow: auto;
}

.search-bar {
  min-height: 3.5rem;
  background-color: var(--surface-100);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 0 0.5rem;
}
</style>

<style>
.p-dialog-content {
  flex: 1 1 auto;
  display: flex;
}
</style>
