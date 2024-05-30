<template>
  <div class="single-select">
    <EntailmentOptionsSelect :entailment-object="editNode" />
    <AutocompleteSearchBar v-model:selected="selected" :im-query="imQuery" :root-entities="['http://snomed.info/sct#138875005']" />
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import AutocompleteSearchBar from "../shared/AutocompleteSearchBar.vue";
import { SearchRequest, Node, SearchResultSummary, QueryRequest } from "@im-library/interfaces/AutoGen";
import EntailmentOptionsSelect from "./EntailmentOptionsSelect.vue";
interface Props {
  editNode: Node;
  imQuery?: QueryRequest;
}
const props = defineProps<Props>();
const selected: Ref<SearchResultSummary | undefined> = ref();

onMounted(async () => {
  if (props.editNode["@id"]) selected.value = { iri: props.editNode["@id"], name: props.editNode.name ?? "" } as SearchResultSummary;
});
</script>

<style scoped>
.single-select {
  display: flex;
}
</style>
