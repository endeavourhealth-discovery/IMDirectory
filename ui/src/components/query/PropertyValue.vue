<template>
  <div class="content">
    <AutoComplete
      v-model="selectedDataModel"
      :suggestions="dataModelSuggestions"
      @complete="debounceForSearch($event, 'dataModel')"
      optionLabel="name"
      placeholder="Select data model"
    />
    <AutoComplete
      v-model="selectedEntity"
      :suggestions="entitySuggestions"
      @complete="debounceForSearch($event)"
      optionLabel="name"
      placeholder="Select property or value"
    />
    <Listbox v-model="selectedSuggestion" :options="pathSuggestions" optionLabel="label" />
  </div>
  <div class="footer">
    <Button label="Cancel" icon="fa-solid fa-ban" @click="onClose" class="p-button-text" />
    <Button label="Save" icon="fa-solid fa-check" @click="onSave" autofocus />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, PropType, watch } from "vue";
import EntityService from "@/services/EntityService";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { useStore } from "vuex";
import { TreeNode } from "primevue/tree";
import { From, Query, Where } from "@im-library/models/AutoGen";
import { QueryService } from "@/services";
import _ from "lodash";
import { SHACL } from "@im-library/vocabulary";
import { isArrayHasLength, isObject, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

const store = useStore();
const props = defineProps({
  node: { type: Object as PropType<TreeNode>, required: true },
  query: { type: Object as PropType<Query>, required: true }
});

const emit = defineEmits({ onClose: () => true });

const filterDefaults: Ref<FilterOptions> = computed(() => store.state.filterDefaults);
const abortController = ref(new AbortController());
const debounce = ref(0);
const loading = ref(false);
const entitySuggestions: Ref<ConceptSummary[]> = ref([]);
const dataModelSuggestions: Ref<ConceptSummary[]> = ref([]);
const selectedDataModel: Ref<ConceptSummary> = ref() as any;
const selectedEntity: Ref<ConceptSummary> = ref() as any;
const selectedSuggestion: Ref<{ label: string; where: Where }> = ref({} as { label: string; where: Where });
const pathSuggestions: Ref<{ label: string; where: Where }[]> = ref([]);

watch(
  () => selectedEntity.value,
  async () => {
    pathSuggestions.value = await getPathSuggestions();
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
  const pathSuggestions = [] as { label: string; where: Where }[];
  if (isObjectHasKeys(selectedEntity.value, ["iri"]) && isObjectHasKeys(selectedDataModel.value, ["iri"])) {
    const queryRequest = {
      pathQuery: {
        name: "paths from patient to Atenolol",
        source: {
          "@id": selectedDataModel.value.iri
        },
        target: {
          "@id": selectedEntity.value.iri
        },
        depth: 2
      }
    };

    const result = await QueryService.getPathSuggestions(queryRequest);
    for (const where of result.where) {
      const pathSuggestion = { label: "", where: where };
      buildPathSuggestionName(pathSuggestion, where);
      pathSuggestions.push(pathSuggestion);
    }
  }
  return pathSuggestions;
}

function buildPathSuggestionName(pathSuggestion: { label: string }, where: Where) {
  const name = getName(where);
  console.log(name);
  if (name.toUpperCase() !== "concept".toUpperCase()) pathSuggestion.label += name;
  if (isObjectHasKeys(where, ["where"])) {
    if (name.toUpperCase() !== "concept".toUpperCase()) pathSuggestion.label += " / ";
    if (isObject(where.where)) {
      buildPathSuggestionName(pathSuggestion, where.where as any);
    } else if (isArrayHasLength(where.where)) {
      for (const nestedWhere of where.where) {
        buildPathSuggestionName(pathSuggestion, nestedWhere);
      }
    }
  }
  if (isObjectHasKeys(where, ["in"])) {
    for (const inItem of where.in) {
      if (isObjectHasKeys(inItem, ["where"])) {
        buildPathSuggestionName(pathSuggestion, inItem as any);
      } else {
        console.log("here");
        pathSuggestion.label += " -> " + getName(inItem as any);
      }
    }
  }
}

function getName(where: Where) {
  return where.name || where.id || getNameFromIri(where["@id"]) || getNameFromIri(where["@type"]) || getNameFromIri(where["@set"]);
}

function getNameFromIri(iri: string) {
  if (!iri) return "";
  const splits = iri.split("#");
  return splits[1] || splits[0];
}

function onClose() {
  emit("onClose");
}

function onSave() {
  const newFrom = { "@id": selectedDataModel.value.iri, name: selectedDataModel.value.name, where: selectedSuggestion.value.where } as From;
  if (isObjectHasKeys(props.query.from)) {
    const oldFrom = { ...props.query.from };
    delete (props.query as any).from;
    props.query.from = { bool: "or", from: [] as From[] } as From;
    props.query.from.from.push(oldFrom);
    props.query.from.from.push(newFrom);
  } else {
    props.query.from = newFrom;
  }

  emit("onClose");
}
</script>

<style scoped>
.content {
  padding-bottom: 1rem;
}
.footer {
  display: flex;
  justify-content: end;
}
</style>
