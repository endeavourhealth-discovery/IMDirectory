<template>
  <div class="text-container">
    <div v-for="textQuery in textQueries">
      <span class="content" @click="openDialog(textQuery)" v-html="textQuery.display"> </span>
      <RecursiveTextQuery v-if="isArrayHasLength(textQuery.children)" :base-entity-iri="baseEntityIri" :text-queries="textQuery.children" :parent="textQuery" />
    </div>
  </div>

  <Dialog v-model:visible="editDialog" modal :style="{ width: '50vw' }">
    <template #header> <div v-html="selected.display"></div> </template>
    <MatchClause :baseEntityIri="baseEntityIri" :text-query="selected" />
    <template #footer>
      <Button class="action-button" severity="secondary" label="Cancel" @click="onCancel()"></Button>
      <Button class="action-button" label="Save" @click="onSave()"></Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { ITextQuery } from "@im-library/interfaces/query/TextQuery";
import { PropType, Ref, ref } from "vue";
import MatchClause from "./MatchClause.vue";
import { getDisplayFromMatch } from "@im-library/helpers/TextQueryBuilder";
import { buildClauseUI } from "@im-library/helpers/ClauseUIBuilder";
const props = defineProps({
  baseEntityIri: { type: String, required: true },
  textQueries: { type: Object as PropType<ITextQuery[]>, required: true },
  parent: { type: Object as PropType<ITextQuery | undefined> }
});

const selected: Ref<ITextQuery> = ref({} as ITextQuery);
const editDialog: Ref<boolean> = ref(false);

function openDialog(textQuery: ITextQuery) {
  selected.value = textQuery;
  editDialog.value = true;
}

function onCancel() {
  selected.value.uiData = buildClauseUI(selected.value.data);
  editDialog.value = false;
}

function onSave() {
  if (selected.value.uiData.length === 1) {
    const matchClause = selected.value.uiData[0];
    const match = selected.value.data;

    match[matchClause.matchType.prop] = matchClause.matchValue.iri;
    match.exclude = !matchClause.include;
    for (const entailment of matchClause.matchEntailment) {
      match[entailment] = true;
    }
  }

  selected.value.display = getDisplayFromMatch(selected.value.data);

  editDialog.value = false;
}
</script>

<style scoped>
.text-container {
  padding-left: 1rem;
}

.content {
  cursor: pointer;
}

.content:hover {
  color: var(--blue-400);
}
</style>
