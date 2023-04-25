<template>
  <div class="text-container">
    <div v-for="textQuery in textQueries">
      <span class="content" @click="openDialog(textQuery)" v-html="textQuery.display"> </span>
      <RecursiveTextQuery v-if="isArrayHasLength(textQuery.children)" :base-entity-iri="baseEntityIri" :text-queries="textQuery.children" :parent="textQuery" />
    </div>
  </div>

  <Dialog v-model:visible="editDialog" modal :style="{ width: '50vw' }">
    <template #header> <div v-html="selected.display"></div> </template>
    <MatchClause :baseEntityIri="baseEntityIri" :match="selected.data" @on-cancel="editDialog = false" />
    <template #footer>
      <Button class="action-button" severity="secondary" label="Cancel" @click="editDialog = false"></Button>
      <Button class="action-button" label="Save" @click="onSave()"></Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ITextQuery } from "@im-library/interfaces/query/TextQuery";
import { onMounted, PropType, Ref, ref } from "vue";
import MatchClause from "./MatchClause.vue";
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

function onSave() {
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
