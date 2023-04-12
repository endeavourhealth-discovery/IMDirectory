<template>
  <div class="create-clause">
    <BaseClause
      :from="from"
      :text-query="textQuery"
      @onSelectType="baseClause.selectedType = $event"
      @onSelectTypeValue="baseClause.selectedTypeValue = $event"
    />
    <WhereClause v-if="baseClause.selectedType.name === 'Property'" :property="baseClause.selectedTypeValue" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, PropType } from "vue";
import { ConceptSummary, ITextQuery } from "@im-library/interfaces";
import { Element } from "@im-library/interfaces/AutoGen";
import BaseClause from "./clause/BaseClause.vue";
import WhereClause from "./clause/WhereClause.vue";
import { TreeNode } from "primevue/tree";
const props = defineProps({
  from: { type: Object as PropType<ITextQuery>, required: true },
  textQuery: { type: Object as PropType<ITextQuery>, required: true }
});

const baseClause = ref({
  selectedType: { name: "Type", prop: "@type" },
  selectedTypeValue: "" as any
});
</script>

<style scoped>
.create-clause {
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;
}
</style>
