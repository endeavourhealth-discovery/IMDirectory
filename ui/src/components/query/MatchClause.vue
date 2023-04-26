<template>
  <div v-if="isArrayHasLength(textQuery.children)">
    <MatchClause v-for="child of textQuery.children" :base-entity-iri="props.baseEntityIri" :text-query="child" />
  </div>

  <div v-else v-for="editClause of editClauses">
    <Button
      :label="editClause.include ? 'Include' : 'Exclude'"
      :severity="editClause.include ? 'info' : 'danger'"
      text
      @click="editClause.include = !editClause.include"
    />
    <div class="create-clause">
      <BaseClause :baseEntityIri="baseEntityIri" :base-clause="editClause" />

      <WhereClause
        v-for="whereClause of editClause.where"
        :base-clause="editClause"
        :where-clause="whereClause"
        :base-entity-iri="baseEntityIri"
        :entailment-options="whereClause.whereEntailment"
      />
    </div>

    <Button :label="'Add property'" :severity="'success'" text @click="addProperty(editClause)" />

    <!-- <SimpleJsonEditor v-if="jsonMode" :json-object="{ data: match }" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, PropType, Ref, onMounted } from "vue";
import BaseClause from "./clause/BaseClause.vue";
import WhereClause from "./clause/WhereClause.vue";
import { Match } from "@im-library/interfaces/AutoGen";
import SimpleJsonEditor from "./editTextQuery/SimpleJsonEditor.vue";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ConceptSummary, ITextQuery, MatchClauseUI, WhereClauseUI } from "@im-library/interfaces";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";

const emit = defineEmits({ onCancel: () => true, onSave: (payload: any) => payload });

const props = defineProps({
  baseEntityIri: { type: String, required: true },
  textQuery: { type: Object as PropType<ITextQuery>, required: true }
});

const jsonMode = ref(true);
const editMatch: Ref<any> = ref();
const editClauses: Ref<MatchClauseUI[]> = ref([
  {
    matchType: {} as { name: string; prop: string },
    matchValue: {} as ConceptSummary,
    matchEntailment: [] as string[]
  } as MatchClauseUI
]);

onMounted(() => {
  editClauses.value = props.textQuery.uiData;
});

function addProperty(editClause: MatchClauseUI) {
  if (!isArrayHasLength(editClause.where)) editClause.where = [];
  editClause.where.push({ whereValue: "", whereType: "", whereProperty: "", whereEntailment: [] } as WhereClauseUI);
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
