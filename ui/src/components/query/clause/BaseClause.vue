<template>
  <div class="base-clause">
    <Dropdown v-model="baseClause.matchType" :options="clauseTypes" optionLabel="name" placeholder="Select a type" />
    <EntitySearch :entity-value="baseClause.matchValue" />
    <EntailmentOptionsSelect :entailmentOptions="baseClause.matchEntailment" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, PropType, watch } from "vue";
import EntitySearch from "../editTextQuery/EntitySearch.vue";
import EntailmentOptionsSelect from "../editTextQuery/EntailmentOptionsSelect.vue";
import { ConceptSummary, MatchClauseUI, WhereClauseUI } from "@im-library/interfaces";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
const props = defineProps({
  baseEntityIri: { type: String, required: true },
  baseClause: { type: Object as PropType<MatchClauseUI>, required: true }
});

const clauseTypes = [
  { name: "Type", prop: "@type" },
  { name: "Set", prop: "@set" },
  { name: "Entity", prop: "@id" }
];
</script>

<style scoped>
.base-clause {
  display: flex;
  flex-flow: row;
  height: 100%;
  width: 100%;
}
</style>
