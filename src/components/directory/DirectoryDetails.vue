<template>
  <div class="loading-container flex flex-row items-center justify-center" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else id="directory-table-container">
    <div class="to-search-button-container">
      <Button
        link
        v-if="searchResults?.entities?.length"
        label="Back to search results"
        icon="fa-solid fa-arrow-left"
        class="back-to-search"
        @click="$emit('goToSearchResults')"
      />
    </div>
    <div class="header-container">
      <ParentHierarchy
        v-if="entity.iri"
        :entityIri="entity?.iri"
        @navigateTo="(iri: string) => $emit('navigateTo', iri)"
        :history="history"
        @update:history="(newHistory: string[]) => $emit('update:history', newHistory)"
      />
      <ParentHeader
        v-if="selectedIri !== 'http://endhealth.info/im#Favourites'"
        :entity="entity"
        @locateInTree="(iri: string) => $emit('locateInTree', iri)"
        :showSelectButton="showSelectButton"
        @entitySelected="(iri: string) => emit('selectedUpdated', iri)"
      />
    </div>
    <div class="datatable-container">
      <Viewer v-if="entity.iri" :entityIri="entity?.iri" @navigateTo="(iri: string) => $emit('navigateTo', iri)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import { EntityService } from "@/services";
import { IM } from "@/vocabulary";
import Viewer from "@/components/directory/Viewer.vue";
import ParentHeader from "@/components/directory/ParentHeader.vue";
import ParentHierarchy from "@/components/directory/ParentHierarchy.vue";
import { SearchResponse } from "@/interfaces/AutoGen";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";

interface Props {
  selectedIri: string;
  showSelectButton?: boolean;
  history: string[];
  searchResults?: SearchResponse;
}
const props = withDefaults(defineProps<Props>(), { showSelectButton: false });

const emit = defineEmits<{
  navigateTo: [payload: string];
  locateInTree: [payload: string];
  "update:history": [payload: string[]];
  selectedUpdated: [payload: string];
  goToSearchResults: [];
}>();

watch(
  () => props.selectedIri,
  async () => await init()
);

const entity: Ref<TTEntity> = ref({});
const loading = ref(true);

onMounted(async () => await init());

async function init() {
  loading.value = true;
  entity.value = await EntityService.getEntityByPredicateExclusions(props.selectedIri, [IM.HAS_MEMBER]);
  loading.value = false;
}
</script>
<style scoped>
.loading-container {
  height: 100%;
  flex: 1 1 auto;
}

#directory-table-container {
  flex: 1 1 auto;
  height: 100%;
  max-width: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.datatable-container {
  flex: 0 1 auto;
  overflow: auto;
  padding: 0.5rem;
}

.header-container {
  display: flex;
  flex-flow: column nowrap;
}

.back-to-search {
  padding-bottom: 0;
}
</style>
