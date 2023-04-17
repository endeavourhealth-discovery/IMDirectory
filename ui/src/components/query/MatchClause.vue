<template>
  <div class="create-clause">
    <BaseClause
      :from="from"
      :text-query="textQuery"
      @onSelectType="baseClause.selectedType = $event"
      @onSelectTypeValue="baseClause.selectedTypeValue = $event"
    />
    <WhereClause
      v-if="baseClause && baseClause.selectedType.name === 'Property' && baseClause.selectedTypeValue"
      :property="baseClause.selectedTypeValue"
      :selectedWhere="baseClause.selectedWhere"
      @on-select-property-value="baseClause.selectedPropertyValue = $event"
    />
  </div>
  <div class="footer-actions">
    <Button class="action-button" severity="secondary" label="Cancel" @click="emit('onCancel')"></Button>
    <Button class="action-button" label="Save" @click="onSave"></Button>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType, onMounted } from "vue";
import { ITextQuery } from "@im-library/interfaces";
import BaseClause from "./clause/BaseClause.vue";
import WhereClause from "./clause/WhereClause.vue";
import { TreeNode } from "primevue/tree";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Where } from "@im-library/interfaces/AutoGen";
const emit = defineEmits({ onCancel: () => true, onSave: (payload: any) => payload });

const props = defineProps({
  from: { type: Object as PropType<ITextQuery>, required: true },
  textQuery: { type: Object as PropType<ITextQuery>, required: true }
});

const baseClause = ref();

onMounted(() => {
  baseClause.value = {
    selectedType: {} as any,
    selectedTypeValue: "" as any,
    selectedPropertyValue: {} as TreeNode,
    selectedWhere: {} as Where
  };
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

.footer-actions {
  display: flex;
  justify-content: end;
}
</style>
