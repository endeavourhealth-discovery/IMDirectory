<template>
  <Dialog
    :header="title"
    v-model:visible="showPropertyDialog"
    :maximizable="true"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
    :closable="false"
  >
    {{ from }}

    <div v-if="nodes && nodes.length" class="select-tree-dialog-container">
      <InputText type="text" v-model="searchTerm" placeholder="Filter" @keyup.enter="filter" />
      <Tree
        :value="nodes"
        selectionMode="single"
        v-model:selectionKeys="selectedKey"
        @node-select="select($event as TreeSelectOption)"
        @node-expand="expand($event as TreeSelectOption)"
        @dblclick="finalSelect"
      ></Tree>
    </div>

    <div v-else class="select-tree-dialog-container">
      <EntityAutocomplete :ttAlias="selectedEntity" />
      <Tree
        :value="suggestionNodes"
        selectionMode="single"
        v-model:selectionKeys="selectedSuggestion"
        @node-select="selectSuggestion($event as TreeSelectOption)"
        @node-expand="expandSuggestion($event as TreeSelectOption)"
        @dblclick="finalSelectSuggestion"
      ></Tree>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDialog" />
      <Button label="Select" icon="pi pi-check" autofocus @click="finalSelect" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import EntityAutocomplete from "@/components/editor/shapeComponents/setDefinition/EntityAutocomplete.vue";
import { getSuggestionPaths, buildSuggestionPathNodes } from "@/composables/treeSelectDialog";
import { TreeDialogActions, TreeSelectOption, TreeTableItemData, TTAlias, TTIriRef } from "@im-library/interfaces";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Tree from "primevue/tree";
import _ from "lodash";
import { ref, PropType, watch, Ref } from "vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

const props = defineProps({
  nodes: { type: Array as PropType<Array<TreeSelectOption>>, required: true },
  tableItem: { type: Object as PropType<TreeTableItemData>, required: true },
  showDialog: { type: Boolean, required: true },
  actions: { type: Object as PropType<TreeDialogActions>, required: true },
  from: { type: String, required: true },
  selectType: { type: String, required: true },
  title: { type: String, required: false, default: "Select item" }
});

const emit = defineEmits({
  onCloseDialog: () => true,
  onFilter: (selectType: string, searchTerm: string, tableItem: TreeTableItemData) => true
});
const selectedNode: Ref<TreeSelectOption> = ref({} as TreeSelectOption);
const selectedKey = ref();
const showPropertyDialog = ref(false);
const searchTerm: Ref<string> = ref("");
const suggestionNodes: Ref<any[]> = ref([]);
const selectedSuggestion: Ref<any> = ref();
const selectedEntity: Ref<TTAlias> = ref({} as TTAlias);

watch(
  () => props.showDialog,
  async () => {
    showPropertyDialog.value = props.showDialog;
  }
);

watch(
  () => _.cloneDeep(selectedEntity.value),
  async newValue => {
    if (props.from && isObjectHasKeys(newValue, ["@id"])) {
      const source = { "@id": props.from } as TTIriRef;
      const target = { "@id": newValue["@id"] } as TTIriRef;
      suggestionNodes.value = await getSuggestionPathNodes(source, target);
    }
  }
);

watch(
  () => selectedEntity.value["@id"],
  async newValue => {
    const source = { "@id": props.from } as TTIriRef;
    const target = { "@id": newValue } as TTIriRef;
    suggestionNodes.value = await getSuggestionPathNodes(source, target);
  }
);

async function filter() {
  if (searchTerm) {
    emit("onFilter", props.selectType, searchTerm.value, props.tableItem);
  }
}

async function getSuggestionPathNodes(source: TTIriRef, target: TTIriRef, depth?: number) {
  const suggestionPaths = await getSuggestionPaths(source, target);
  return buildSuggestionPathNodes(suggestionPaths);
}

function closeDialog() {
  emit("onCloseDialog");
}

function selectSuggestion(selectedValue: TreeSelectOption) {
  console.log(selectedValue);
}

function expandSuggestion(selectedValue: TreeSelectOption) {
  console.log(selectedValue);
}

function finalSelectSuggestion() {}

function select(selectedValue: TreeSelectOption) {
  props.actions.onSelect(selectedNode, selectedValue);
}

function expand(option: TreeSelectOption) {
  props.actions.onExpand(option);
}

function finalSelect() {
  props.actions.onFinalSelect(props.tableItem, selectedNode);
  closeDialog();
}
</script>

<style scoped>
.select-tree-dialog-container {
  display: flex;
  flex-flow: column nowrap;
}
</style>
