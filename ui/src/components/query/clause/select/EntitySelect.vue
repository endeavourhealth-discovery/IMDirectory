<template>
  <Dropdown :options="['in', 'notIn', 'isNull']" v-model:model-value="whereType" />
  <EntitySearch :entity-value="entityValue" />
  <EntailmentOptionsSelect :entailmentOptions="entailmentOptions" />
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import DropdownHeader from "../DropdownHeader.vue";
import EntitySearch from "../../editTextQuery/EntitySearch.vue";
import EntailmentOptionsSelect from "../../editTextQuery/EntailmentOptionsSelect.vue";
import { ConceptSummary } from "@im-library/interfaces";

const whereType = ref("");
const entityValue: Ref<ConceptSummary> = ref({} as ConceptSummary);
const entailmentOptions: Ref<string[]> = ref([]);
</script>

<style scoped></style>
