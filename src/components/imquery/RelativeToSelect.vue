<template>
  <InputText type="text" v-model="propertyDisplay" @click="showDialog" placeholder="relative to" />
  <Dialog v-model:visible="showTreeSearch" modal header="Select property">
    <div class="relative-to-select-dialog">
      <InputText type="text" v-model="searchTerm" />
      <Tree
        :value="variableOptions"
        :loading="loading"
        :expanded-keys="expandedKeys"
        :selection-keys="selectedKeys"
        placeholder="Select property"
        class="w-full md:w-80"
        selection-mode="single"
        @node-select="onNodeSelect"
      />
    </div>
    <template #footer>
      <Button label="Clear" severity="warn" @click="clear" text />
      <Button label="Cancel" severity="secondary" @click="cancel" text />
      <Button label="Save" @click="save" text />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import setupTree from "@/composables/setupTree";
import { EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { getNameFromRef } from "@/helpers/TTTransform";
import { Where, Query } from "@/interfaces/AutoGen";
import { SHACL } from "@/vocabulary";
import type { TreeNode } from "primevue/treenode";
import { Ref, inject, onMounted, ref, watch } from "vue";

interface Props {
  propertyIri: string;
  property: Where;
  datatype: string;
  propertyRef?: Where;
}

const props = defineProps<Props>();

const { expandedKeys, selectKey, selectedKeys, selectedNode } = setupTree();
const showTreeSearch: Ref<boolean> = ref(false);
const searchTerm: Ref<string> = ref("");
const propertyDisplay: Ref<string | undefined> = ref();
const variableOptions: Ref<TreeNode[]> = ref([]);
const loading: Ref<boolean> = ref(false);
const debounce = ref(0);
const variableMap = inject("variableMap") as Ref<{ [key: string]: any }>;
const fullQuery = inject("fullQuery") as Ref<Query>;
const { getTypeOfMatch } = setupIMQueryBuilderActions();

const emit = defineEmits<{ "update:propertyRef": [treeData: any] }>();

onMounted(async () => {
  await initValues();
});

watch(
  () => props.propertyRef,
  async () => await initValues()
);

watch(
  () => searchTerm.value,
  () => {
    debounceForSearch(searchTerm.value);
  }
);

function clear() {
  delete props.property.relativeTo;
  propertyDisplay.value = "";
  searchTerm.value = "";
  expandedKeys.value = {};
  selectedKeys.value = {};
  cancel();
}

function cancel() {
  showTreeSearch.value = false;
}

function showDialog() {
  expandedKeys.value = {};
  showTreeSearch.value = true;
  selectPrepopulatedValue(variableOptions.value, propertyDisplay.value);
}

function onNodeSelect(node: any) {
  selectKey(node.key);
  selectedNode.value = node;
}

function save() {
  if (selectedNode.value) {
    delete props.property.value;
    propertyDisplay.value = getVariableSearchInputDisplay(selectedNode.value.data);
    if (props.propertyRef) emit("update:propertyRef", selectedNode.value.data);
    else props.property.relativeTo = selectedNode.value.data;
    showTreeSearch.value = false;
  }
}

function debounceForSearch(searchTerm: any): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    searchOptions(searchTerm);
  }, 600);
}

async function searchOptions(searchTerm: any) {
  variableOptions.value = await getVariableOptions(searchTerm);
}

async function initValues() {
  selectPrepopulatedValue(variableOptions.value, propertyDisplay.value);
  variableOptions.value = await getVariableOptions();
  if (props.property.relativeTo) propertyDisplay.value = getVariableSearchInputDisplay(props.property.relativeTo);
  if (props.propertyRef) propertyDisplay.value = getVariableSearchInputDisplay(props.propertyRef);
}

async function getVariableOptions(searchTerm?: string) {
  loading.value = true;
  const options: TreeNode[] = [];

  for (const key of Object.keys(variableMap.value)) {
    const dataModelIri = getVariableWithType(variableMap.value[key]);
    if (dataModelIri) {
      const treeNode = await getPropertyOptions(dataModelIri, props.datatype, key);
      if (isObjectHasKeys(treeNode)) options.push(treeNode);
    }
  }

  if (searchTerm && isArrayHasLength(options)) {
    filterBySearchTerm(options, searchTerm);
  }

  loading.value = false;
  return options;
}

async function getPropertyOptions(dataModelIri: string, dataTypeIri: string, key: string): Promise<TreeNode> {
  const propertiesEntity = await EntityService.getPartialEntity(dataModelIri, [SHACL.PROPERTY]);
  if (!isObjectHasKeys(propertiesEntity, [SHACL.PROPERTY])) return {} as TreeNode;
  const allProperties: any[] = propertiesEntity[SHACL.PROPERTY];
  const validOptions = allProperties.filter(dmProperty => dmProperty[SHACL.DATATYPE] && dmProperty[SHACL.DATATYPE][0]["@id"] === dataTypeIri);
  if (!isArrayHasLength(validOptions)) return {} as TreeNode;

  const treeNode = {
    key: key,
    label: key + " (" + getNameFromRef({ "@id": dataModelIri }) + ")",
    children: [] as TreeNode[],
    selectable: false
  } as TreeNode;

  for (const property of validOptions) {
    treeNode.children?.push({
      key: key + "/" + property[SHACL.PATH][0]["@id"],
      label: property[SHACL.PATH][0].name,
      data: {
        "@id": property[SHACL.PATH][0]["@id"],
        nodeRef: key,
        name: property[SHACL.PATH][0].name
      }
    } as TreeNode);
  }

  return treeNode;
}

function selectPrepopulatedValue(options: TreeNode[], searchTerm?: string) {
  selectedNode.value = undefined;
  if (searchTerm) {
    const splits = searchTerm.split(" -> ");
    if (isArrayHasLength(splits)) {
      const parentOption = options.filter(parentOption => parentOption.label?.includes(splits[0]));
      if (isArrayHasLength(parentOption)) {
        expandedKeys.value[parentOption[0].key!] = true;
        const childOption = parentOption[0].children?.filter(childOption => childOption.label === splits[1]);
        if (isArrayHasLength(childOption)) selectKey(childOption![0].key!);
      }
    }
  }
}

function filterBySearchTerm(options: TreeNode[], searchTerm: string) {
  expandedKeys.value = {};
  for (const [key, parentOption] of options.entries()) {
    const filteredChildren = parentOption.children?.filter(childOption => childOption.label?.includes(searchTerm));
    if (isArrayHasLength(filteredChildren)) {
      parentOption.children = filteredChildren;
      expandedKeys.value[parentOption.key!] = true;
    } else if (!parentOption.label?.includes(searchTerm)) options.splice(key);
  }
}

function getVariableWithType(value: any) {
  if (isObjectHasKeys(value, ["typeOf"])) return value.typeOf["@id"];
  else if (isObjectHasKeys(value, ["variable"])) {
    const objectWithTypeOf = variableMap.value[value.variable];
    if (isObjectHasKeys(objectWithTypeOf, ["typeOf"])) return objectWithTypeOf.typeOf["@id"];
    if (fullQuery.value && isObjectHasKeys(objectWithTypeOf, ["@id"])) return getTypeOfMatch(fullQuery.value, objectWithTypeOf["@id"]);
  }
}

function getVariableSearchInputDisplay(propertyRef: Where) {
  if (!isObjectHasKeys(propertyRef, ["nodeRef"])) return getNameFromRef(propertyRef);
  return propertyRef.nodeRef + " -> " + getNameFromRef(propertyRef);
}
</script>

<style scoped>
.relative-to-select-dialog {
  display: flex;
  flex-flow: column;
}
</style>
