<template>
  <Panel class="subsets-panel" header="Subsets" toggleable :collapsed="!hasSubSets">
    <div class="subsets-content">
      <Fieldset legend="Inclusions" toggleable>
        <div v-for="inclusion of inclusions.is" class="inclusions-array-container">
          <AutocompleteSearchBar :selected="inclusion" :searchByQuery="queryRequest" :rootEntities="['http://endhealth.info/im#Sets']" />
        </div>
      </Fieldset>
      <Fieldset legend="Exclusions" toggleable>
        <AutocompleteSearchBar />
      </Fieldset>
      <Button label="Add inclusion" @click="addInclusion" />
      <Button label="Add exclusion" @click="addExclusion" />
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Match, QueryRequest } from "@im-library/interfaces/AutoGen";
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { ComputedRef, Ref, computed, onMounted, ref } from "vue";
import { IM, QUERY } from "@im-library/vocabulary";

interface Props {
  subsets?: Match[];
}

const props = defineProps<Props>();

const hasSubSets: ComputedRef<boolean> = computed(() => isArrayHasLength(inclusions.value.is) || isArrayHasLength(exclusions.value.is));

const inclusions: Ref<Match> = ref({ is: [] });
const exclusions: Ref<Match> = ref({ is: [], exclude: true });
const inclusionsBuild = ref();
const exclusionsBuild = ref();
const queryRequest: QueryRequest = {
  query: { "@id": QUERY.SEARCH_ENTITIES },
  argument: [{ parameter: "this", valueIriList: [{ "@id": IM.CONCEPT_SET }, { "@id": IM.VALUESET }] }]
};

onMounted(() => {
  processProps();
});

function processProps() {
  if (props.subsets) {
    for (const m of props.subsets) {
      if (m.exclude) exclusions.value = m;
      else inclusions.value = m;
    }
  }
}

function addInclusion() {
  if (!inclusions.value.is) {
    inclusions.value = { is: [{ "@id": "http://endhealth.info/im#CSET_EmailOnlineEncounter" }] };
  } else inclusions.value.is.push({ "@id": "" });
}

function addExclusion() {
  if (!exclusions.value.is) {
    exclusions.value = { is: [{ "@id": "http://endhealth.info/im#CSET_EmailOnlineEncounter" }], exclude: true };
  } else exclusions.value.is.push({ "@id": "" });
}
</script>

<style scoped>
.subsets-content:deep(#autocomplete-search) {
  border: 1px solid var(--surface-border);
}
</style>
