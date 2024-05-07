<template>
  <InputText type="text" v-model="propertyDisplay" @click="showDialog" placeholder="relative to" />
  <Dialog v-model:visible="showTreeSearch" modal header="Select property" :style="{ backgroundColor: 'var(--surface-section)' }">
    <div class="relative-to-select-dialog">
      <InputText type="text" v-model="searchTerm" />
      <Tree
        :value="variableOptions"
        :loading="loading"
        :expanded-keys="expandedKeys"
        :selection-keys="selectedKeys"
        placeholder="Select property"
        class="md:w-20rem w-full"
        selection-mode="single"
        @node-select="onNodeSelect"
      />
    </div>
    <template #footer>
      <Button label="Clear" severity="warning" @click="clear" text />
      <Button label="Cancel" severity="secondary" @click="cancel" text />
      <Button label="Save" @click="save" text />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import setupTree from "@/composables/setupTree";
import { EntityService } from "@/services";
import { useQueryStore } from "@/stores/queryStore";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { Where, PropertyRef, Match, Query } from "@im-library/interfaces/AutoGen";
import { TreeNode } from "primevue/treenode";
import { ComputedRef, Ref, computed, inject, onMounted, ref, watch } from "vue";

interface Props {
  propertyIri: string;
  property: Where;
  datatype: string;
  propertyRef?: PropertyRef;
}

const props = defineProps<Props>();
const queryStore = useQueryStore();
const { expandedKeys, selectKey, selectedKeys, selectedNode } = setupTree();
const queryTypeIri: ComputedRef<string> = computed(() => queryStore.$state.returnType);
const showTreeSearch: Ref<boolean> = ref(false);
const searchTerm: Ref<string> = ref("");
const propertyDisplay: Ref<string> = ref("");
const variableOptions: Ref<TreeNode[]> = ref([]);
const loading: Ref<boolean> = ref(false);
const debounce = ref(0);
const variableMap = inject("variableMap") as Ref<{ [key: string]: any }>;
const fullQuery = inject("fullQuery") as Ref<Query>;
const { getTypeOfMatch } = setupIMQueryBuilderActions();

const emit = defineEmits({ "update:propertyRef": payload => true });

onMounted(async () => {
  await initValues();
});

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
}

async function getVariableOptions(searchTerm?: string) {
  loading.value = true;
  const options: TreeNode[] = [];

  for (const key of Object.keys(variableMap.value)) {
    const dataModelIri = getVariableWithType(variableMap.value[key]);
    if (dataModelIri) {
      const treeNode = await EntityService.getPropertyOptions(dataModelIri, props.datatype, key);
      if (isObjectHasKeys(treeNode)) options.push(treeNode);
    }
  }

  if (queryTypeIri.value) {
    const option = await EntityService.getPropertyOptions(queryTypeIri.value, props.datatype, getNameFromRef({ "@id": queryTypeIri.value }));
    if (isObjectHasKeys(option)) {
      option.children = option.children?.filter(childOption => childOption.data["@id"] !== props.propertyIri);
      if (isArrayHasLength(option.children)) options.push(option);
    }
  }

  if (searchTerm && isArrayHasLength(options)) {
    filterBySearchTerm(options, searchTerm);
  }

  loading.value = false;
  return options;
}

function selectPrepopulatedValue(options: TreeNode[], searchTerm: string) {
  selectedNode.value = {};
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

function getVariableSearchInputDisplay(propertyRef: PropertyRef) {
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
