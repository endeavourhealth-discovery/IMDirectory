<template>
  <div class="text-container">
    <div v-for="textQuery in textQueries">
      <span class="content" @click="openDialog(textQuery)" v-html="textQuery.display"> </span>
      <RecursiveTextQuery v-if="isArrayHasLength(textQuery.children)" :base-entity-iri="baseEntityIri" :text-queries="textQuery.children" :parent="textQuery" />
    </div>
  </div>
  <Dialog v-model:visible="editDialog" modal :header="selected.display" :style="{ width: '50vw' }">
    <MatchClause :baseEntityIri="baseEntityIri" :match="selected.data" @on-cancel="editDialog = false" @on-save="onSave" />
  </Dialog>
</template>

<script setup lang="ts">
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { ITextQuery } from "@im-library/interfaces/query/TextQuery";
import { onMounted, PropType, Ref, ref } from "vue";
import MatchClause from "./MatchClause.vue";
import { Match } from "@im-library/interfaces/AutoGen";
const props = defineProps({
  baseEntityIri: { type: String, required: true },
  textQueries: { type: Object as PropType<ITextQuery[]>, required: true },
  parent: { type: Object as PropType<ITextQuery | undefined>, required: true }
});

const selected: Ref<ITextQuery> = ref({} as ITextQuery);
const editDialog: Ref<boolean> = ref(false);

function openDialog(textQuery: ITextQuery) {
  selected.value = textQuery;
  editDialog.value = true;
}

function onSave(event: Match) {
  selected.value.data = event;
  editDialog.value = false;
}

onMounted(async () => {});
</script>

<style scoped>
.text-container {
  padding-left: 1rem;
}

.content {
  cursor: pointer;
}

.content:hover {
  color: lightskyblue;
}
</style>
