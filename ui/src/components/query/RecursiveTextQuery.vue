<template>
  <div class="text-container">
    <div v-for="textQuery in textQueries">
      <span class="content" @click="openDialog(textQuery)" v-html="textQuery.display"> </span>
      <RecursiveTextQuery v-if="isArrayHasLength(textQuery.children)" :base-entity-iri="baseEntityIri" :text-queries="textQuery.children" />
    </div>
  </div>

  <Dialog v-model:visible="editDialog" modal :style="{ width: '50vw' }">
    <template #header> <div v-html="selected.display"></div> </template>
    <MatchClause :baseEntityIri="baseEntityIri" :text-query="selected" />
    <template #footer>
      <Button class="action-button" severity="secondary" label="Cancel" @click="onCancel()"></Button>
      <Button class="action-button" severity="danger" label="Delete" @click="onDelete()"></Button>
      <Button class="action-button" label="Save" @click="onSave()"></Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ITextQuery } from "@im-library/interfaces/query/TextQuery";
import { PropType, Ref, ref, watch } from "vue";
import MatchClause from "./MatchClause.vue";
import { getDisplayFromMatch } from "@im-library/helpers/TextQueryBuilder";
import { buildClauseUI } from "@im-library/helpers/ClauseUIBuilder";
import { MatchClauseUI, WhereClauseUI } from "@im-library/interfaces";
import { SHACL } from "@im-library/vocabulary";
interface Props {
  baseEntityIri: string;
  addedNewClause?: boolean;
  textQueries: ITextQuery[];
}

const props = defineProps<Props>();

const emit = defineEmits({ onOpenNewClause: () => true });

watch(
  () => props.addedNewClause,
  () => {
    if (props.addedNewClause) {
      const newClause = props.textQueries[props.textQueries.length - 1];
      if ("New clause" === newClause.display) {
        openDialog(newClause);
        emit("onOpenNewClause");
      }
    }
  }
);

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
    updateMatch(match, matchClause);
    if (isArrayHasLength(matchClause.where)) updateWhere(match, matchClause.where);
  }

  selected.value.display = getDisplayFromMatch(selected.value.data);

  editDialog.value = false;
}

function updateMatch(match: any, matchClause: MatchClauseUI) {
  if (isObjectHasKeys(matchClause.matchType)) match[matchClause.matchType.prop] = matchClause.matchValue.iri;
  match.exclude = !matchClause.include;
  if (isArrayHasLength(matchClause.matchEntailment))
    for (const entailment of matchClause.matchEntailment) {
      match[entailment] = true;
    }
}

function updateWhere(match: any, whereClauses: WhereClauseUI[]) {
  match.where = [];
  for (const whereClause of whereClauses) {
    const where = {} as any;
    where["@id"] = whereClause.whereProperty.data[SHACL.PATH][0]["@id"];
    where.name = whereClause.whereProperty.data[SHACL.PATH][0].name;
    where[whereClause.whereType] = whereClause.whereValue;
    match.where.push(where);
  }
}

function onDelete() {
  const index = props.textQueries.findIndex(textQuery => textQuery.key === selected.value.key);
  props.textQueries.splice(index, 1);
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
