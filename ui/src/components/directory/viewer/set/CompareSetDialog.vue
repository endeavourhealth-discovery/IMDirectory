<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    header="Search"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh', backgroundColor: 'var(--surface-section)' }"
    class="search-dialog"
  >
    <div class="compare-set-dialog-content">
      <div class="comparison-section">
        <div class="section-header">
          Exclusive to

          <Inplace :closable="true">
            <template #display>
              {{ setA.name || "Click to select set A" }}
            </template>
            <template #content>
              <AutoComplete v-model="setA" optionLabel="name" :suggestions="filteredSets" @complete="searchValueSet" />
            </template>
          </Inplace>
        </div>
        <Listbox v-model="selectedA" :options="setMembersA" optionLabel="name" />
      </div>
      <div class="comparison-section">
        <div class="section-header">Shared members</div>
        <Listbox v-model="selectedShared" :options="setMembersA" optionLabel="name" />
      </div>

      <div class="comparison-section">
        <div class="section-header">
          Exclusive to

          <Inplace :closable="true">
            <template #display>
              {{ setB.name || "Click to select set B" }}
            </template>
            <template #content>
              <AutoComplete v-model="setB" optionLabel="name" :suggestions="filteredSets" @complete="searchValueSet" />
            </template>
          </Inplace>
        </div>
        <Listbox v-model="selectedB" :options="cities" optionLabel="name" />
      </div>
    </div>

    <template #footer class="compare-set-dialog-footer"> <Button label="OK" @click="visible = false" /> </template>
  </Dialog>
</template>
<script setup lang="ts">
import { EntityService, QueryService } from "@/services";
import { useFilterStore } from "@/stores/filterStore";
import { SortDirection } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys, isObject } from "@im-library/helpers/DataTypeCheckers";
import { FilterOptions } from "@im-library/interfaces";
import { SearchRequest, SearchResponse, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, RDFS } from "@im-library/vocabulary";
import { Console } from "console";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";
interface Props {
  showDialog: boolean;
  setIriA: string;
}
const filterStore = useFilterStore();

const storeSelectedFilters: ComputedRef<FilterOptions> = computed(() => filterStore.selectedFilters);
const selectedFilters: Ref<FilterOptions> = ref({ ...storeSelectedFilters.value });
const controller: Ref<AbortController> = ref({} as AbortController);

const cities = ref([
  { name: "New York", code: "NY" },
  { name: "Rome", code: "RM" },
  { name: "London", code: "LDN" },
  { name: "Istanbul", code: "IST" },
  { name: "Paris", code: "PRS" }
]);

const selectedA = ref();
const selectedShared = ref();
const selectedB = ref();
const setA: Ref<TTIriRef> = ref({} as TTIriRef);
const setMembersA: Ref<any[]> = ref([]);
const setMembersB: Ref<any[]> = ref([]);
const setB: Ref<TTIriRef> = ref({} as TTIriRef);
const filteredSets: Ref<SearchResultSummary[]> = ref([]);

const props = defineProps<Props>();
watch(
  () => props.showDialog,
  async newValue => {
    if (newValue) await init();
    visible.value = newValue;
  }
);
const visible = ref(false);
watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
  }
});
const emit = defineEmits({ "update:showDialog": payload => typeof payload === "boolean" });
onMounted(async () => {
  if (props.setIriA) init();
});

watch(
  () => props.setIriA,
  async newValue => {
    if (newValue) await init();
  }
);

watch(
  () => setA.value["@id"],
  async newValue => {
    console.log("change");
    if (newValue) await getMembers(newValue);
  }
);

async function init() {
  const entity = await EntityService.getPartialEntity(props.setIriA, [RDFS.LABEL]);
  setA.value = { "@id": entity["@id"], name: entity[RDFS.LABEL] } as TTIriRef;
}

async function getMembers(iri: string) {
  const members = await EntityService.getFullyExpandedSetMembers(iri, false, false);
  console.log(members.length);
  setMembersA.value = members;
}

async function search(searchText: string): Promise<SearchResultSummary[]> {
  if (searchText && searchText.length > 2) {
    const searchRequest = {} as SearchRequest;
    searchRequest.termFilter = searchText;
    searchRequest.sortField = "weighting";
    searchRequest.page = 1;
    searchRequest.size = 100;
    searchRequest.schemeFilter = [];
    const schemes = selectedFilters.value.schemes;
    for (const scheme of schemes) {
      searchRequest.schemeFilter!.push(scheme["@id"]);
    }

    searchRequest.statusFilter = [];
    const statusList = selectedFilters.value.status;
    for (const status of statusList) {
      searchRequest.statusFilter!.push(status["@id"]);
    }

    searchRequest.typeFilter = [];
    const types = [IM.CONCEPT_SET, IM.VALUE_SET];
    for (const type of types) {
      searchRequest.typeFilter!.push(type);
    }

    if (isArrayHasLength(selectedFilters.value.sortFields) && isObjectHasKeys(selectedFilters.value.sortFields[0])) {
      const sortField = selectedFilters.value.sortFields[0];
      if (sortField["@id"] === IM.NAMESPACE + "Usage") searchRequest.sortField = "weighting";

      if (isArrayHasLength(selectedFilters.value.sortDirections) && isObjectHasKeys(selectedFilters.value.sortDirections[0])) {
        const sortDirection = selectedFilters.value.sortDirections[0];
        if (sortDirection["@id"] === IM.NAMESPACE + "Descending") searchRequest.sortDirection = SortDirection.DESC;
        if (sortDirection["@id"] === IM.NAMESPACE + "Ascending") searchRequest.sortDirection = SortDirection.ASC;
      }
    }

    if (!isObject(controller.value)) {
      controller.value.abort();
    }
    controller.value = new AbortController();
    const result = await EntityService.advancedSearch(searchRequest, controller.value);
    //
    if (result?.entities) return result.entities;
  }
  return [];
}

async function searchValueSet(event: any) {
  const searchTerm: string = event.query;
  filteredSets.value = await search(searchTerm);
}
</script>
<style scoped>
.compare-set-dialog-content {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-flow: row;
  overflow: auto;
  justify-content: center;
}
.compare-set-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
}

.p-listbox {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.comparison-section {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
}

.section-header {
  display: flex;
  justify-content: center;
  align-items: baseline;
}
</style>
<style>
.p-dialog-content {
  flex: 1 1 auto;
  display: flex;
}
</style>
