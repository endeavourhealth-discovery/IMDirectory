<template>
  <InputText type="text" v-model="searchTerm" @click="onVariableInputClick" />
  <OverlayPanel ref="op">
    <Tree
      :value="variableOptions"
      :loading="loading"
      :expanded-keys="expandedKeys"
      :selection-keys="selectedKeys"
      placeholder="Select property"
      class="md:w-20rem w-full"
      selection-mode="single"
      @node-select="onOptionSelect"
    />
  </OverlayPanel>
</template>

<script setup lang="ts">
import setupTree from "@/composables/setupTree";
import { EntityService } from "@/services";
import { useQueryStore } from "@/stores/queryStore";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { Property, PropertyRef } from "@im-library/interfaces/AutoGen";
import { SHACL } from "@im-library/vocabulary";
import { TreeNode } from "primevue/tree";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";

interface Props {
  property: Property;
  datatype: string;
}
const props = defineProps<Props>();
const queryStore = useQueryStore();
const op: Ref<any> = ref();
const { expandedKeys, selectKey, selectedKeys } = setupTree();
const queryTypeIri: ComputedRef<string> = computed(() => queryStore.$state.returnType);
const variableMap: ComputedRef<Map<string, any>> = computed(() => queryStore.$state.variableMap);

const searchTerm: Ref<string> = ref("");
const variableOptions: Ref<TreeNode[]> = ref([]);
const loading: Ref<boolean> = ref(false);
const debounce = ref(0);

onMounted(async () => {
  await initValues();
});

watch(
  () => searchTerm.value,
  () => {
    debounceForSearch(searchTerm.value);
  }
);

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
  variableOptions.value = await getVariableOptions();
  if (props.property.relativeTo) searchTerm.value = getVariableSearchInputDisplay(props.property.relativeTo);
}

async function getVariableOptions(searchTerm?: string) {
  loading.value = true;
  const options: TreeNode[] = [];

  for (const [key, value] of variableMap.value.entries()) {
    const dataModelIri = getVariableWithType(value);
    const treeNode = await getTreeNodeOptionsFromProperties(key, dataModelIri, searchTerm);
    if (treeNode) options.push(treeNode);
  }

  const key = getNameFromRef({ "@id": queryTypeIri.value });
  const option = await getTreeNodeOptionsFromProperties(key, queryTypeIri.value, searchTerm);
  if (option) options.push(option);

  if (searchTerm && isArrayHasLength(options)) {
    if (searchTerm.includes(" -> ")) selectPrepopulatedValue(options, searchTerm);
    else filterBySearchTerm(options, searchTerm);
  }

  loading.value = false;
  return options;
}

function selectPrepopulatedValue(options: TreeNode[], searchTerm: string) {
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

async function getTreeNodeOptionsFromProperties(key: string, dataModelIri: string, searchTerm?: string) {
  let validOptions = await getValidProperties(dataModelIri);

  if (!isArrayHasLength(validOptions)) return undefined;

  const treeNode = {
    key: key,
    label: key + " (" + getNameFromRef({ "@id": dataModelIri }) + ")",
    children: [],
    selectable: false
  } as TreeNode;

  for (const property of validOptions) {
    treeNode.children!.push({
      key: key + "/" + property[SHACL.PATH][0]["@id"],
      label: property[SHACL.PATH][0].name,
      data: {
        "@id": property[SHACL.PATH][0]["@id"],
        nodeRef: key,
        name: property[SHACL.PATH][0].name
      }
    });
  }

  return treeNode;
}

async function getValidProperties(dataModelIri: string) {
  const propertiesEntity = await EntityService.getPartialEntity(dataModelIri, [SHACL.PROPERTY]);
  if (!isObjectHasKeys(propertiesEntity, [SHACL.PROPERTY])) return [];
  const allProperties: any[] = propertiesEntity[SHACL.PROPERTY];
  return allProperties.filter(dmProperty => dmProperty[SHACL.DATATYPE] && dmProperty[SHACL.DATATYPE][0]["@id"] === props.datatype);
}

function getVariableWithType(value: any) {
  if (isObjectHasKeys(value, ["typeOf"])) return value.typeOf["@id"];
  else if (isObjectHasKeys(value, ["nodeRef"])) {
    const objectWithTypeOf = variableMap.value.get(value.nodeRef);
    if (isObjectHasKeys(objectWithTypeOf, ["typeOf"])) return objectWithTypeOf.typeOf["@id"];
  }
}

function onVariableInputClick(event: any) {
  op.value.toggle(event);
}

function onOptionSelect(event: any) {
  delete props.property.value;
  op.value.toggle(event);
  const propertyRef: PropertyRef = event.data;
  searchTerm.value = getVariableSearchInputDisplay(propertyRef);
  props.property.relativeTo = propertyRef;
}

function getVariableSearchInputDisplay(propertyRef: PropertyRef) {
  if (!propertyRef.nodeRef) return getNameFromRef(propertyRef);
  return propertyRef.nodeRef + " -> " + getNameFromRef(propertyRef);
}
</script>

<style scoped></style>
