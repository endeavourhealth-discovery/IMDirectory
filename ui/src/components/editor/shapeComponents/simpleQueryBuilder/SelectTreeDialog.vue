<template>
  <Dialog
    header="Add by list of codes"
    v-model:visible="showPropertyDialog"
    :maximizable="true"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
    :closable="false"
  >
    <Tree
      :value="nodes"
      selectionMode="single"
      v-model:selectionKeys="selectedKey"
      @node-select="select($event as TreeSelectOption)"
      @node-expand="expand($event as TreeSelectOption)"
      @dblclick="finalSelect"
    ></Tree>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDialog" />
      <Button label="Select" icon="pi pi-check" autofocus @click="finalSelect" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { TreeDialogActions, TreeSelectOption, TreeTableItemData, TTIriRef } from "@im-library/interfaces";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Tree from "primevue/tree";
import { ref, PropType, watch, Ref } from "vue";

const props = defineProps({
  nodes: { type: Array as PropType<Array<TreeSelectOption>>, required: true },
  tableItem: { type: Object as PropType<TreeTableItemData>, required: true },
  showDialog: { type: Boolean, required: true },
  actions: { type: Object as PropType<TreeDialogActions>, required: true }
});

watch(
  () => props.showDialog,
  async () => {
    showPropertyDialog.value = props.showDialog;
  }
);

const emit = defineEmits({ onCloseDialog: () => true });
const selectedNode: Ref<TreeSelectOption> = ref({} as TreeSelectOption);
const selectedKey = ref();
const showPropertyDialog = ref(false);

function closeDialog() {
  emit("onCloseDialog");
}

function select(selectedValue: TreeSelectOption) {
  props.actions.onSelect(selectedNode, selectedValue);
}

function expand(option: TreeSelectOption) {
  props.actions.onExpand(option);
}

function finalSelect() {
  console.log(props.tableItem, selectedNode);
  props.actions.onFinalSelect(props.tableItem, selectedNode);
  closeDialog();
}
</script>

<style scoped></style>
