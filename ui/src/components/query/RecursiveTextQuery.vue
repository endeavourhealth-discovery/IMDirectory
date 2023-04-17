<template>
  <div class="text-container">
    <div v-for="(textQuery, index) in textQueries">
      <div v-if="textQuery.display && textQuery.display !== 'or' && textQuery.display !== 'or '">
        <span v-if="textQuery.data.exclude" class="exclude">exclude </span>
        <span v-if="'exclude' !== textQuery.display" class="content" @click="openDialog(textQuery)"> {{ textQuery.display }}</span>
        <RecursiveTextQuery :baseEntityIri="baseEntityIri" v-if="isArrayHasLength(textQuery.children)" :text-queries="textQuery.children" :parent="textQuery" />
      </div>
      <RecursiveTextQuery
        :baseEntityIri="baseEntityIri"
        v-else-if="isArrayHasLength(textQuery.children)"
        :text-queries="textQuery.children"
        :parent="textQuery"
      />
    </div>
  </div>
  <Dialog v-model:visible="editDialog" modal :header="selected.display" :style="{ width: '50vw' }">
    <MatchClause :baseEntityIri="baseEntityIri" :match="selected.data" @on-cancel="editDialog = false" @on-save="onSave" />
  </Dialog>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ITextQuery } from "@im-library/interfaces/query/TextQuery";
import { onMounted, PropType, ComputedRef, Ref, ref, computed } from "vue";
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

.and {
  color: orange;
  user-select: none;
}

.either,
.or {
  color: blue;
  user-select: none;
}

.content {
  cursor: pointer;
}

.content:hover {
  color: lightskyblue;
}

.exclude {
  color: red;
}
</style>
