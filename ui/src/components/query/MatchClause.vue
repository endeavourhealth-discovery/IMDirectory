<template>
  <div v-if="!isObjectHasKeys(match, ['boolMatch'])">
    <Button :label="include ? 'Include' : 'Exclude'" :severity="include ? 'info' : 'danger'" text @click="include = !include" />
    <div v-for="baseClause of baseClauses" class="create-clause">
      <BaseClause
        :baseEntityIri="baseEntityIri"
        :clauseType="baseClause.matchType"
        :typeValue="baseClause.matchValue"
        :entailmentOptions="baseClause.matchEntailment"
      />

      <WhereClause
        v-for="whereClause of baseClause.where"
        :base-clause="baseClause"
        :where-clause="whereClause"
        :base-entity-iri="baseEntityIri"
        :entailment-options="whereClause.whereEntailment"
      />
    </div>
    <!-- <SimpleJsonEditor v-if="jsonMode" :json-object="{ data: match }" /> -->
  </div>
  <MatchClause v-else v-for="matchItem of match.match" :base-entity-iri="props.baseEntityIri" :match="matchItem" />
</template>

<script setup lang="ts">
import { ref, PropType, Ref, onMounted } from "vue";
import BaseClause from "./clause/BaseClause.vue";
import WhereClause from "./clause/WhereClause.vue";
import { Match } from "@im-library/interfaces/AutoGen";
import SimpleJsonEditor from "./editTextQuery/SimpleJsonEditor.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ConceptSummary, MatchClauseUI } from "@im-library/interfaces";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";
import { buildClauseUI } from "@im-library/helpers/ClauseUIBuilder";

const emit = defineEmits({ onCancel: () => true, onSave: (payload: any) => payload });

const props = defineProps({
  baseEntityIri: { type: String, required: true },
  match: { type: Object as PropType<Match>, required: true }
});

const jsonMode = ref(true);
const include = ref(true);
const baseClauses: Ref<MatchClauseUI[]> = ref([
  {
    matchType: {} as { name: string; prop: string },
    matchValue: {} as ConceptSummary,
    matchEntailment: [] as string[]
  } as MatchClauseUI
]);

onMounted(() => {
  const uiData = buildClauseUI(props.match);
  if (isArrayHasLength(uiData)) baseClauses.value = uiData;
  if (isObjectHasKeys(props.match, ["exclude"])) include.value = !props.match.exclude;
});

function onSave() {
  emit("onSave", {});
}
</script>

<style scoped>
.create-clause {
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;
}

.json-action {
  display: flex;
  justify-content: center;
}

.footer-actions {
  display: flex;
  justify-content: end;
}

.action-button {
  margin-right: 0.1rem;
}
.json-button {
  margin: 0.1rem;
}
</style>
