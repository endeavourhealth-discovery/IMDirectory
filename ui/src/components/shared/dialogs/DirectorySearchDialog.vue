<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    header="Search"
    :style="{ minWidth: '80vw', minHeight: '80vh', backgroundColor: 'var(--surface-section)' }"
    class="search-dialog"
  >
    <div class="directory-search-dialog-content">
      <div class="search-bar"><SearchBar v-model:searchResults="searchResults" v-model:searchLoading="searchLoading" :searchByQuery="searchByQuery" /></div>
      <div class="vertical-divider">
        <div class="left-container"><NavTree :selectedIri="treeIri" @selectedUpdated="updateSelected" /></div>
        <div class="right-container">
          <SearchResults
            :searchResults="searchResults"
            :searchLoading="searchLoading"
            :selected="selected"
            @selectedUpdated="updateSelected"
            :locateInTreeFunction="locateInTree"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <!-- <div class="footer"> -->
      <Button label="Discard" severity="secondary" @click="discard" text />
      <Button label="Save" @click="save" text />
      <!-- </div> -->
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, Ref, computed } from "vue";
import { ConceptSummary } from "@im-library/interfaces";
import SearchBar from "@/components/shared/SearchBar.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import NavTree from "@/components/shared/NavTree.vue";
import { useSharedStore } from "@/stores/sharedStore";
import _ from "lodash";

interface Props {
  showDialog: boolean;
  searchByQuery?: string;
  selected?: ConceptSummary;
}
const props = defineProps<Props>();
watch(
  () => _.cloneDeep(props.showDialog),
  newValue => (visible.value = newValue)
);

const emit = defineEmits({ "update:showDialog": payload => typeof payload === "boolean", "update:selected": payload => true, onClose: () => true });

const sharedStore = useSharedStore();
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

const visible = ref(false);
watch(visible, newValue => emit("update:showDialog", newValue));
const active = ref(0);
const searchResults: Ref<ConceptSummary[]> = ref([]);
const searchLoading = ref(false);
const treeIri = ref("");

onMounted(() => {
  visible.value = props.showDialog;
});

function updateSelected(data: ConceptSummary) {
  emit("update:selected", data);
}

function locateInTree(event: any, iri: string) {
  treeIri.value = iri;
}

async function save() {
  emit("onClose");
}

function discard() {
  emit("onClose");
}
</script>

<style scoped>
.directory-search-dialog-content {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
}

.vertical-divider {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
}

.left-container {
  flex: 0 0 30%;
}

.right-container {
  flex: 1 1 auto;
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
.search-dialog:deep(.p-dialog-content) {
  flex: 1 1 auto;
}
</style>
