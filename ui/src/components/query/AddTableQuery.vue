<template>
  <div class="property-value">
    Property: <InputText type="text" v-model="selectedProperty.label" @click="propertySelectDialog = true" /> Value:
    <InputText type="text" v-model="selectedValue.label" @click="valueSelectDialog = true" />
  </div>

  <Dialog v-model:visible="propertySelectDialog" modal header="Add clause" :style="{ width: '50vw' }">
    <PropertySelect
      :from="from"
      :query-data="queryData"
      :selected="selected"
      :level="level + 1"
      @on-cancel="propertySelectDialog = false"
      @on-select="onPropertySelect"
    />
  </Dialog>
  <Dialog v-model:visible="valueSelectDialog" modal header="Add clause" :style="{ width: '50vw' }">
    Value select
    <!-- <ValueSelect
      :from="from"
      :query-data="queryData"
      :selected="selected"
      :level="level + 1"
      @on-cancel="propertySelectDialog = false"
      @on-select="onPropertySelect"
    /> -->
  </Dialog>
  <div class="footer-actions">
    <Button class="action-button" severity="secondary" label="Cancel" @click="cancel"></Button>
    <Button class="action-button" severity="success" label="Add" @click="add"></Button>
  </div>
</template>

<script setup lang="ts">
import { TableQuery } from "@im-library/interfaces";
import { Where } from "@im-library/interfaces/AutoGen";
import { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";
import PropertySelect from "./PropertySelect.vue";

const props = defineProps({
  queryData: { type: Array<TableQuery>, required: true },
  from: { type: Object as PropType<TableQuery>, required: true },
  selected: { type: Array<TableQuery>, required: true },
  level: { type: Number, required: false, default: 0 }
});

const where: Ref<Where> = ref({} as Where);
const selectedProperty: TreeNode = ref({});
const selectedValue: TreeNode = ref({});
const propertySelectDialog = ref(false);
const valueSelectDialog = ref(false);
const emit = defineEmits({ onCancel: () => true });

function cancel() {
  emit("onCancel");
}
function onPropertySelect(selectedNode: TreeNode) {
  selectedProperty.value = selectedNode;
}
function add() {
  try {
    props.queryData[0].parent.data.where.push({ description: "new clause" } as Where);
  } catch (error) {
    console.log(error);
  }
}
</script>

<style scoped>
.action-button {
  margin-right: 0.1rem;
}
.footer-actions {
  display: flex;
  justify-content: end;
}
</style>
