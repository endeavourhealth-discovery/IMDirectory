<template>
  <AutoComplete
    v-if="concept.concept"
    v-model="concept.concept.entailment"
    :suggestions="entailments"
    @complete="searchEntailments"
    emptySearchMessage="Invalid entailment"
    class="nl-entailment"
  ></AutoComplete>
  <AutoSizeAutoComplete :test="selectedConcept!.name!"></AutoSizeAutoComplete>
  <NLRefinementGroupEdit v-if="concept.refinement" :refinement-group="concept.refinement">REFINED</NLRefinementGroupEdit>
</template>

<script setup lang="ts">
import { RefinedConcept } from "@/components/nlEditor/ecl/NLClasses";
import NLRefinementGroupEdit from "@/components/nlEditor/ecl/NLRefinementGroupEdit.vue";
import { onMounted, ref, Ref, watch } from "vue";
import { AutoCompleteCompleteEvent, AutoCompleteItemSelectEvent } from "primevue/autocomplete";
import { SearchResponse, SearchResultSummary, TTIriRef } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { SNOMED } from "@im-library/vocabulary";
import AutoSizeAutoComplete from "@/components/nlEditor/ecl/AutoSizeAutoComplete.vue";

interface Props {
  concept: RefinedConcept;
}

const props = withDefaults(defineProps<Props>(), {});

const entailments: Ref<string[]> = ref([]);
const concepts: Ref<SearchResultSummary[]> = ref([]);
const selectedConcept: Ref<TTIriRef> = ref({} as TTIriRef);

onMounted(() => {
  selectedConcept.value = props.concept?.concept?.iri ? { "@id": props.concept.concept.iri, name: props.concept.concept.term } : ({} as TTIriRef);
});

function searchEntailments(event: AutoCompleteCompleteEvent) {
  if (event.query?.length > 0) {
    entailments.value = ["<<", "<", ">", ">>"].filter(e => e.startsWith(event.query));
  } else {
    entailments.value = [];
  }
}

async function searchConcepts(event: AutoCompleteCompleteEvent) {
  if (event.query?.length > 0) {
    concepts.value =
      (
        await EntityService.advancedSearch({
          termFilter: event.query,
          schemeFilter: [SNOMED.NAMESPACE],
          size: 20
        })
      ).entities ?? [];
  } else {
    entailments.value = [];
  }
}

function selectConcept(event: AutoCompleteItemSelectEvent) {}
</script>

<style>
.p-autocomplete-input {
  border-width: 0;
  padding: 0;
  background: transparent;
}

.nl-entailment .p-autocomplete-input {
  width: 2rem;
}
</style>
