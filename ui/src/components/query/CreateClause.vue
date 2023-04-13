<template>
  <div class="create-clause">
    <BaseClause
      :from="from"
      :text-query="textQuery"
      @onSelectType="baseClause.selectedType = $event"
      @onSelectTypeValue="baseClause.selectedTypeValue = $event"
    />
    <WhereClause
      v-if="baseClause.selectedType.name === 'Property' && baseClause.selectedTypeValue"
      :property="baseClause.selectedTypeValue"
      @on-select-property-value="baseClause.selectedPropertyValue = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from "vue";
import { ITextQuery } from "@im-library/interfaces";
import BaseClause from "./clause/BaseClause.vue";
import WhereClause from "./clause/WhereClause.vue";
import { TreeNode } from "primevue/tree";
const props = defineProps({
  from: { type: Object as PropType<ITextQuery>, required: true },
  textQuery: { type: Object as PropType<ITextQuery>, required: true }
});

const baseClause = ref({
  selectedType: { name: "Type", prop: "@type" },
  selectedTypeValue: "" as any,
  selectedPropertyValue: {} as TreeNode
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
