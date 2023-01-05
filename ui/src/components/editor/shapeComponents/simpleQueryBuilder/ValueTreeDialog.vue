<template>
  <Dialog
    header="Add by list of codes"
    v-model:visible="showValueDialog"
    :maximizable="true"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
    :closable="false"
  >
    <Tree
      :value="nodes"
      selectionMode="single"
      v-model:selectionKeys="selectedKey"
      @node-select="onValueSelect($event as TreeSelectOption)"
      @node-expand="onValueExpand($event as TreeSelectOption)"
      @dblclick="select"
    ></Tree>
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDialog" />
      <Button label="Select" icon="pi pi-check" autofocus @click="select" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { createTreeSelectOption } from "@im-library/helpers/QuickQueryBuilders";
import { TreeSelectOption, TreeTableItemData, TTIriRef } from "@im-library/interfaces";
import { ref, PropType, watch, Ref } from "vue";

const props = defineProps({
  nodes: { type: Array as PropType<Array<TreeSelectOption>>, required: true },
  tableItem: { type: Object as PropType<TreeTableItemData>, required: true },
  showDialog: { type: Boolean, required: true }
});

watch(
  () => props.showDialog,
  async () => {
    showValueDialog.value = props.showDialog;
  }
);

const emit = defineEmits({ onCloseDialog: () => true });
const selectedNode: Ref<TreeSelectOption> = ref({} as TreeSelectOption);
const selectedKey = ref();

function closeDialog() {
  emit("onCloseDialog");
}

function select() {
  props.tableItem.value = { "@id": selectedNode.value.key, name: selectedNode.value.label } as TTIriRef;
  props.tableItem.valueDisplay = selectedNode.value.label;
  closeDialog();
}

const showValueDialog = ref(false);
function onValueSelect(selected: TreeSelectOption) {
  selectedNode.value = selected;
}

async function onValueExpand(option: TreeSelectOption) {
  option.children = await getChildrenSelectionTree(option.key!);
}

async function getChildrenSelectionTree(iri: string) {
  const children = await EntityService.getEntityChildren(iri);
  return children.map(child => {
    const option = createTreeSelectOption(child["@id"], child.name, child.type, child.hasChildren);
    return option;
  });
}
</script>

<style scoped></style>
