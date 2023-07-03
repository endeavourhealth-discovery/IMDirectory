<template>
  <div class="property-input-container">
    in
    <AutoComplete v-model="selected" optionLabel="name" :suggestions="suggestions" @complete="debounceForSearch" @item-select="onSelect" />
    <EntailmentOptionsSelect :entailment-object="editNode" />
    <Button label="Cancel" severity="secondary" @click="emit('onCancel')" />
    <Button label="Save" />
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, onMounted, ref, watch } from "vue";
import EntailmentOptionsSelect from "./EntailmentOptionsSelect.vue";
import { ConceptSummary, FilterOptions } from "@im-library/interfaces";
import { Match, Node, Where } from "@im-library/interfaces/AutoGen";
import { useFilterStore } from "@/stores/filterStore";
import { isObject } from "@im-library/helpers/DataTypeCheckers";
import { EntityService } from "@/services";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";

const emit = defineEmits({ onSave: (payload: string) => payload, onCancel: () => true });

interface Props {
  queryTypeIri: string;
  editNode: Node;
}

const props = defineProps<Props>();
const filterStore = useFilterStore();
const controller: Ref<AbortController> = ref({} as AbortController);
const filterDefaults: Ref<FilterOptions> = computed(() => filterStore.filterDefaults);
const selected: Ref<ConceptSummary> = ref({} as ConceptSummary);
const suggestions: Ref<ConceptSummary[]> = ref([]);
const debounce = ref(0);

watch(
  () => props.editNode,
  () => populateSelected()
);

onMounted(() => {
  populateSelected();
});

function populateSelected() {
  if (props.editNode) {
    selected.value.iri = props.editNode["@id"] ?? props.editNode["@set"] ?? (props.editNode["@type"] as string);
    selected.value.name = getNameFromRef(props.editNode);
  }
}

function onSelect(event: any) {
  props.editNode.name = selected.value.name;
  if (isValueSet(selected.value.entityType)) props.editNode["@set"] = selected.value.iri;
  else if (isRecordModel(selected.value.entityType)) props.editNode["@type"] = selected.value.iri;
  else props.editNode["@id"] = selected.value.iri;
}

async function search(searchTerm: any) {
  if (!isObject(controller.value)) {
    controller.value.abort();
  }
  controller.value = new AbortController();
  suggestions.value = await EntityService.simpleSearch(searchTerm.query, filterDefaults.value, controller.value);
}

function debounceForSearch(searchTerm: any): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    search(searchTerm);
  }, 600);
}
</script>

<style scoped>
.property-input-container {
  align-items: center;
}
</style>
