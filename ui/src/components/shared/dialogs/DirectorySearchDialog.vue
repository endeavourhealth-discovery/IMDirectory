<template>
  <Dialog v-model:visible="visible" modal header="Search" :style="{ minWidth: '80vw', minHeight: '80vh', backgroundColor: 'var(--surface-section)' }">
    <div class="directory-search-dialog">
      <div class="search-bar"><SearchBar v-model:searchResults="searchResults" v-model:searchLoading="searchLoading" :searchByQuery="searchByQuery" /></div>
      <div class="vertical-divider">
        <div class="left-container">tree</div>
        <div class="right-container"><SearchResults :searchResults="searchResults" :searchLoading="searchLoading" /></div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, Ref, computed } from "vue";
import { ConceptSummary } from "@im-library/interfaces";
import { MenuItem } from "primevue/menuitem";
import SearchBar from "@/components/shared/SearchBar.vue";
import SearchResults from "@/components/shared/SearchResults.vue";
import { useSharedStore } from "@/stores/sharedStore";
import _ from "lodash";

interface Props {
  showDialog: boolean;
  searchByQuery?: string;
}
const props = defineProps<Props>();
watch(
  () => _.cloneDeep(props.showDialog),
  newValue => (visible.value = newValue)
);

const emit = defineEmits({ "update:showDialog": payload => typeof payload === "boolean" });

const sharedStore = useSharedStore();
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

const visible = ref(false);
watch(visible, newValue => emit("update:showDialog", newValue));
const active = ref(0);
const searchResults: Ref<ConceptSummary[]> = ref([]);
const searchLoading = ref(false);

onMounted(() => {
  visible.value = props.showDialog;
});
</script>

<style scoped>
.directory-search-dialog {
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
