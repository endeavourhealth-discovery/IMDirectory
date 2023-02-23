<template>
  <AutoComplete v-model="selectedDataModel" :suggestions="dataModelSuggestions" @complete="debounceForSearch($event, 'dataModel')" optionLabel="name" />
  <AutoComplete v-model="selectedEntity" :suggestions="entitySuggestions" @complete="debounceForSearch($event)" optionLabel="name" />
  <Listbox v-model="selectedSuggestion" :options="cities" optionLabel="name" style="width: 15rem" />
</template>

<script setup lang="ts">
import { ref, Ref, computed, PropType, watch } from "vue";
import EntityService from "@/services/EntityService";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { useStore } from "vuex";
import { TreeNode } from "primevue/tree";
import { PathDocument, QueryRequest, Where } from "@im-library/models/AutoGen";
import { QueryService } from "@/services";
import _ from "lodash";
import { SHACL } from "@im-library/vocabulary";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
const store = useStore();
const props = defineProps({
  node: { type: Object as PropType<TreeNode>, required: true }
});

const filterDefaults: Ref<FilterOptions> = computed(() => store.state.filterDefaults);
const abortController = ref(new AbortController());
const debounce = ref(0);
const loading = ref(false);
const entitySuggestions: Ref<ConceptSummary[]> = ref([]);
const dataModelSuggestions: Ref<ConceptSummary[]> = ref([]);
const selectedDataModel: Ref<ConceptSummary> = ref({} as ConceptSummary);
const selectedEntity: Ref<ConceptSummary> = ref({} as ConceptSummary);
const selectedSuggestion: Ref<any> = ref();
const pathDocument: Ref<PathDocument> = ref({} as PathDocument);

watch(
  () => selectedEntity.value,
  async () => {
    await getPathSuggestions();
  }
);

function debounceForSearch(searchTerm: any, type?: string): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    switch (type) {
      case "dataModel":
        searchDataModel(searchTerm);
        break;

      default:
        search(searchTerm);
        break;
    }
  }, 600);
}

async function search(searchTerm: any): Promise<void> {
  if (searchTerm.query.length > 2) {
    loading.value = true;
    entitySuggestions.value = await EntityService.simpleSearch(searchTerm.query, filterDefaults.value, abortController.value);
    loading.value = false;
  }
}

async function searchDataModel(searchTerm: any): Promise<void> {
  const filterOptions = { ...filterDefaults.value };
  filterOptions.types = filterOptions.types.filter(type => type["@id"] === SHACL.NODESHAPE);
  if (searchTerm.query.length > 2) {
    loading.value = true;
    dataModelSuggestions.value = await EntityService.simpleSearch(searchTerm.query, filterOptions, abortController.value);
    loading.value = false;
  }
}

async function getPathSuggestions() {
  if (isObjectHasKeys(selectedEntity.value, ["iri"]) && isObjectHasKeys(selectedDataModel.value, ["iri"])) {
    const queryRequest = {
      pathQuery: {
        name: "paths from patient to Atenolol",
        source: {
          "@id": "http://endhealth.info/im#Patient"
        },
        target: {
          "@id": "http://snomed.info/sct#387506000"
        },
        depth: 3
      }
    } as QueryRequest;

    //   const qr = {
    //     pathQuery:
    //   } as QueryRequest;

    const result = await QueryService.getPathSuggestions(queryRequest);
    console.log(result);
    for (const where of result.where) {
      let label = "";
    }

    return result.where;
  }
}

function getPathSuggestionName(label: string, where: Where) {
  label += where.name || where.id || where["@id"] || where["@type"] || where.se;
  if (isObjectHasKeys(where, ["where"])) {
    for (const nestedWhere of where.where) {
      getPathSuggestionName(label, nestedWhere);
    }
  } else if(isObjectHasKeys(where, ["where"])) {

  }
}
</script>

<style scoped></style>
