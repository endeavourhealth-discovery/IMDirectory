<template>
  <Dropdown :options="['is', 'between', 'within']" v-model:model-value="propertyType" />
  <div v-if="propertyType === 'between'">
    <Calendar v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
    <span> and </span>
    <Calendar v-model:model-value="selectedValueB" dateFormat="dd/mm/yy" />
  </div>
  <div v-else-if="propertyType === 'is'">
    <Dropdown type="text" placeholder="operator" :options="operatorOptions" v-model="property.operator" />
    <Dropdown type="text" placeholder="value type" :options="['date', 'variable']" v-model="valueType" />
    <Calendar v-if="valueType === 'date'" v-model:model-value="selectedValueA" dateFormat="dd/mm/yy" />
    <InputText type="text" v-else-if="valueType === 'variable'" v-model="variableSearchInput" @click="onVariableInputClick" />
    <OverlayPanel ref="op">
      <Tree
        v-model="selectedValueA"
        :value="variableOptions"
        filterMode="strict"
        placeholder="Select Item"
        class="md:w-20rem w-full"
        selection-mode="single"
        @node-select="onOptionSelect"
      />
    </OverlayPanel>
    <!-- <TreeSelect
      v-else-if="valueType === 'variable'"
      v-model="selectedValueA"
      :options="variableOptions"
      :filter="true"
      filterMode="strict"
      placeholder="Select Item"
      class="md:w-20rem w-full"
      selection-mode="single"
    /> -->
  </div>
  <div v-else-if="propertyType === 'within'">
    the last <InputNumber v-model:model-value="numberValue" />
    <!-- TODO: model Date options and get from API -->
    <Dropdown :options="['Minute', 'Hour', 'Day', 'MONTHS', 'Year']" v-model:model-value="property.unit" />
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { useQueryStore } from "@/stores/queryStore";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { Property, PropertyRef, Range } from "@im-library/interfaces/AutoGen";
import { SHACL } from "@im-library/vocabulary";
import { cloneDeep } from "lodash";
import { TreeNode } from "primevue/tree";
import { ComputedRef, Ref, computed, onMounted, ref, watch } from "vue";

interface Props {
  property: Property;
  datatype: string;
}
const props = defineProps<Props>();
const queryStore = useQueryStore();
const op: Ref<any> = ref();

const queryTypeIri: ComputedRef<string> = computed(() => queryStore.$state.returnType);
const variableMap: ComputedRef<Map<string, any>> = computed(() => queryStore.$state.variableMap);
const variableSearchInput: Ref<string> = ref("");
const propertyType: Ref<"is" | "between" | "within"> = ref("is");
const valueType: Ref<"date" | "variable"> = ref("date");
const selectedValueA: Ref<any> = ref();
const selectedValueB: Ref<any> = ref();
const operatorOptions = ["=", ">=", ">", "<="];
const numberValue: Ref<number> = ref(0);
const variableOptions: Ref<TreeNode[]> = ref([]);
const filteredVariableOptions: Ref<TreeNode[]> = ref([]);
const debounce = ref(0);

onMounted(async () => {
  await initValues();
});

watch(
  () => numberValue.value,
  () => {
    props.property.value = numberValue.value.toString();
  }
);

watch(
  () => cloneDeep(selectedValueA.value),
  () => updatePropertyValues()
);

watch(
  () => cloneDeep(selectedValueB.value),
  () => updatePropertyValues()
);

watch(
  () => variableSearchInput.value,
  () => {
    debounceForSearch(variableSearchInput.value);
  }
);

function debounceForSearch(searchTerm: any): void {
  clearTimeout(debounce.value);
  debounce.value = window.setTimeout(() => {
    searchOptions(searchTerm);
  }, 600);
}

function searchOptions(searchTerm: any) {
  console.log(searchTerm);
}

async function initValues() {
  variableOptions.value = await getVariableOptions();
  if (props.property.value) {
    if (isNumber(props.property.value)) {
      propertyType.value = "within";
      numberValue.value = ~~props.property.value;
    } else {
      propertyType.value = "is";
      selectedValueA.value = getDateFromString(props.property.value);
    }
  } else if (isObjectHasKeys(props.property, ["range"])) {
    propertyType.value = "between";
    if (props.property.range?.from.value) selectedValueA.value = getDateFromString(props.property.range!.from.value);
    if (props.property.range?.to.value) selectedValueB.value = getDateFromString(props.property.range!.to.value);
  } else if (props.property.relativeTo) {
    propertyType.value = "is";
    valueType.value = "variable";
    // const key = getKeyFromRelativeTo(props.property.relativeTo);
    // if (key) {
    //   selectedValueA.value = {};
    //   selectedValueA.value[key] = true;
    // }
    variableSearchInput.value = getVariableSearchInputDisplay(props.property.relativeTo);
  }
}

function findNodeByKey(nodes: TreeNode[], key?: string) {
  if (!key) return undefined;

  let found = nodes.find(node => node.key === key);
  if (found) return found;
  for (const node of nodes) {
    const nestedFound = node.children?.find(node => node.key === key);
    if (nestedFound) found = nestedFound;
  }
  return found;
}

function getKeyFromRelativeTo(relativeTo: PropertyRef) {
  if (!relativeTo.nodeRef) return relativeTo["@id"];
  return relativeTo.nodeRef + "/" + relativeTo["@id"];
}

async function getVariableOptions() {
  const options: TreeNode[] = [];
  for (const [key, value] of variableMap.value.entries()) {
    const dataModelIri = getVariableWithType(value);
    const treeNode = await getTreeNodeOptionsFromProperties(key, dataModelIri);
    if (treeNode) options.push(treeNode);
  }

  const key = getNameFromRef({ "@id": queryTypeIri.value });
  const option = await getTreeNodeOptionsFromProperties(key, queryTypeIri.value);
  if (option) options.push(option);

  return options;
}

async function getTreeNodeOptionsFromProperties(key: string, dataModelIri: string) {
  const validOptions = await getValidProperties(dataModelIri);
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

function isNumber(stringNumber: string) {
  return /^-?\d+$/.test(stringNumber);
}

function updatePropertyValues() {
  if (propertyType.value === "is") {
    delete props.property.range;
    if (selectedValueA.value && valueType.value === "date") props.property.value = getStringFromDate(selectedValueA.value);
    else if (selectedValueA.value && valueType.value === "variable") props.property.relativeTo = geRelativeToValue();
  } else if (propertyType.value === "between") {
    delete props.property.operator;
    delete props.property.value;
    delete props.property.unit;

    if (!isObjectHasKeys(props.property, ["range"]))
      props.property.range = { from: { operator: "=", unit: "DATE", value: "" }, to: { operator: "=", unit: "DATE", value: "" } } as Range;
    if (selectedValueA.value) props.property.range!.from.value = getStringFromDate(selectedValueA.value);
    if (selectedValueB.value) props.property.range!.to.value = getStringFromDate(selectedValueB.value);
  }
}

function geRelativeToValue() {
  const found = findNodeByKey(variableOptions.value, Object.keys(selectedValueA.value)[0]);
  if (found) return found.data;
}

function getStringFromDate(date: Date) {
  return [date.getDate(), date.getMonth() + 1, date.getFullYear()].join("/");
}

function getDateFromString(date: string) {
  let separator = "";
  if (date.includes("-")) separator = "-";
  else if (date.includes("/")) separator = "/";
  const splits = date.split(separator);
  if (splits.length !== 3) return new Date();

  const year = parseInt(splits[2]);
  const month = parseInt(splits[1]);
  const day = parseInt(splits[0]);
  return new Date(year, month - 1, day);
}

function onVariableInputClick(event: any) {
  op.value.toggle(event);
}

function onOptionSelect(event: any) {
  op.value.toggle(event);
  const propertyRef: PropertyRef = event.data;
  variableSearchInput.value = getVariableSearchInputDisplay(propertyRef);
}

function getVariableSearchInputDisplay(propertyRef: PropertyRef) {
  if (!propertyRef.nodeRef) return getNameFromRef(propertyRef);
  return propertyRef.nodeRef + " -> " + getNameFromRef(propertyRef);
}
</script>

<style scoped></style>
