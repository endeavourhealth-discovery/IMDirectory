<template>
  <AutoComplete
    :multiple="true"
    v-model="selectedEntity"
    :suggestions="suggestions"
    @complete="searchEntity($event)"
    @item-select="handleChange"
    @dragenter.prevent
    @dragover.prevent
    @drop="dropReceived"
  >
    <template #item="slotProps">
      <div class="autocomplete-suggestion">
        {{ slotProps.item.name }} - {{ slotProps.item["@id"] }}
        <Button
          icon="fa-solid fa-sitemap"
          class="find-in-tree-button p-button-sm p-button-text"
          v-tooltip="'Find in tree'"
          @click="findInTree(slotProps.item['@id'])"
        />
      </div>
    </template>
    <template #chip="slotProps">
      <div v-tooltip.right="slotProps.value['@id']">{{ slotProps.value.name }}</div>
    </template>
  </AutoComplete>
  <Button
    :disabled="!isArrayHasLength(selectedEntity) || !selectedEntity?.[0]?.['@id']"
    icon="fa-solid fa-sitemap"
    v-tooltip="'Find in tree'"
    @click="findInTree(selectedEntity?.[0]?.['@id'])"
  />
</template>

<script setup lang="ts">
import { SearchRequest, TTAlias, TTIriRef } from "im-library/interfaces";
import { onMounted, PropType, Ref, ref, watch } from "vue";
import { SortBy, SortDirection } from "im-library/enums";
import { FilterDefaults } from "im-library/config";
import { isArrayHasLength, isObject, isObjectHasKeys } from "im-library/helpers/modules/DataTypeCheckers";
import { EntityService } from "@/services";
import {} from "im-library/vocabulary";
import _ from "lodash";
import { useStore } from "vuex";

const store = useStore();
const props = defineProps({
  ttAlias: { type: Object as PropType<TTAlias>, required: true },
  parentClauseIri: { type: String, required: false },
  getSuggestionsMethod: { type: Function, required: false }
});

const suggestions = ref();
const abortController = ref(new AbortController());
const selectedEntity: Ref<TTIriRef[]> = ref([] as TTIriRef[]);

watch(
  () => _.cloneDeep(props.ttAlias),
  () => populateTTAlias()
);

onMounted(() => {
  populateTTAlias();
});

function populateTTAlias() {
  if (isObjectHasKeys(props.ttAlias, ["@id", "name"])) selectedEntity.value = [{ "@id": props.ttAlias["@id"], name: props.ttAlias.name }];
}

function handleChange(event: any) {
  selectedEntity.value = [event.value];
  props.ttAlias["@id"] = event.value["@id"];
  props.ttAlias.name = event.value.name;
}

function findInTree(iri: string) {
  if (iri) store.commit("updateFindInEditorTreeIri", iri);
}

function dropReceived(event: any) {
  const data = event.dataTransfer.getData("text/plain");
  if (data) {
    const json = JSON.parse(data);
    const iriRef = { "@id": json.data, name: json.label };
    handleChange({ value: iriRef });
  }
}

async function searchEntity(searchTerm: any): Promise<void> {
  if (searchTerm.query.length > 0) {
    if (props.getSuggestionsMethod) {
      const filtereredSuggestions = await props.getSuggestionsMethod(props.parentClauseIri, searchTerm.query);
      suggestions.value = filtereredSuggestions;
    } else {
      const searchRequest = {} as SearchRequest;
      searchRequest.termFilter = searchTerm.query;
      searchRequest.sortBy = SortBy.Usage;
      searchRequest.page = 1;
      searchRequest.size = 100;
      searchRequest.sortDirection = SortDirection.DESC;
      searchRequest.sortField = "weighting";
      searchRequest.schemeFilter = FilterDefaults.schemeOptions;
      searchRequest.typeFilter = FilterDefaults.typeOptions;
      searchRequest.statusFilter = FilterDefaults.statusOptions;
      if (!isObject(abortController.value)) {
        abortController.value.abort();
      }

      abortController.value = new AbortController();
      const results = await EntityService.advancedSearch(searchRequest, abortController.value);
      suggestions.value = results.map(result => {
        return { name: result.name, "@id": result.iri };
      });
    }
  }
}
</script>

<style scoped>
.autocomplete-suggestion {
  display: flex;
  flex-flow: row wrap;
  align-items: baseline;
}

.find-in-tree-button {
  z-index: 999;
}
</style>
