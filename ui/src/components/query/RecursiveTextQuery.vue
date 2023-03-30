<template>
  <div class="text-container">
    <div v-for="(textQuery, index) in textQueries">
      <div v-if="textQuery.display && textQuery.display !== 'or'">
        <span v-if="textQuery.data.exclude" class="exclude">exclude </span>
        <span v-if="index === 0 && textQuery.parent.bool === 'or'"> <span class="and">and </span> <span class="either">either </span> </span>
        <span v-else-if="index !== 0 && !textQuery.parent.bool && !textQuery.data.exclude" class="and">and </span>
        <span v-else-if="index !== 0 && textQuery.parent.bool" :class="textQuery.parent.bool">{{ textQuery.parent.bool + " " }} </span>
        <span v-if="'exclude' !== textQuery.display" class="content" @click="openDialog(textQuery)"> {{ textQuery.display }}</span>
        <RecursiveTextQuery :from="from" v-if="isArrayHasLength(textQuery.children)" :text-queries="textQuery.children" :parent="textQuery" />
      </div>
      <RecursiveTextQuery :from="from" v-else-if="isArrayHasLength(textQuery.children)" :text-queries="textQuery.children" :parent="textQuery" />
    </div>
  </div>
  <Dialog v-model:visible="editDialog" modal :header="selected.display" :style="{ width: '50vw' }">
    <EditTextQuery :from="from" :text-query="selected" @on-cancel="editDialog = false" />
  </Dialog>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ITextQuery } from "@im-library/interfaces/query/TextQuery";
import { onMounted, PropType, ComputedRef, Ref, ref, computed } from "vue";
import EditTextQuery from "./EditTextQuery.vue";
const props = defineProps({
  from: { type: Object as PropType<ITextQuery>, required: true },
  textQueries: { type: Object as PropType<ITextQuery[]>, required: true },
  parent: { type: Object as PropType<ITextQuery | undefined>, required: true }
});

const selected: Ref<ITextQuery> = ref({} as ITextQuery);
const editDialog: Ref<boolean> = ref(false);

function openDialog(textQuery: ITextQuery) {
  selected.value = textQuery;
  editDialog.value = true;
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
