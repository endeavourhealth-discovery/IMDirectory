<template>
  <div class="property-input-container">
    <Dropdown
      :options="[
        { id: 'is', name: 'is' },
        { id: 'isNot', name: 'is not' },
        { id: 'isNull', name: 'is not recorded' },
        { id: 'isNotNull', name: 'is recorded' }
      ]"
      optionValue="id"
      optionLabel="name"
      v-model:model-value="propertyType"
    />
    <InputText
      v-if="propertyType !== 'isNull' && propertyType !== 'isNotNull'"
      type="text"
      placeholder="Value label"
      v-model:model-value="props.property.valueLabel"
    />
    <SaveCustomSetDialog v-if="propertyType !== 'isNull' && propertyType !== 'isNotNull'" :set-members="editValues" @on-save="onCustomSetSave" />
  </div>
  <div v-if="propertyType !== 'isNull' && propertyType !== 'isNotNull'" v-for="(editValue, index) in editValues" class="property-input-container class-select">
    <InputText type="text" @click="openDialog(index)" placeholder="Value" v-model:model-value="editValue.name" />
    <EntailmentOptionsSelect :entailment-object="editValue" />
    <Button icon="fa-solid fa-plus" text @click="editValues.push({ '@id': '', name: '' } as Node)" />
    <Button icon="fa-solid fa-trash" text severity="danger" @click="deleteItem(index)" :disabled="editValues.length === 1" />
    <DirectorySearchDialog
      :selected="{ iri: editValue['@id'], name: editValue.name } as SearchResultSummary"
      v-model:show-dialog="visible"
      @update:selected="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { onMounted, Ref, ref, watch } from "vue";
import EntailmentOptionsSelect from "../EntailmentOptionsSelect.vue";
import _ from "lodash";
import { Node, Where } from "@im-library/interfaces/AutoGen";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { buildNodeFromCS } from "@im-library/helpers/QueryBuilder";
import SaveCustomSetDialog from "../dialogs/SaveCustomSetDialog.vue";
import { SearchResultSummary } from "@im-library/interfaces/AutoGen";

interface Props {
  property: Where;
  classIri: string;
}

const props = defineProps<Props>();
const propertyType: Ref<string | undefined> = ref();
const visible: Ref<boolean> = ref(false);
const editValues: Ref<Node[]> = ref([] as Node[]);
const selectedIndex: Ref<number> = ref(0);

onMounted(async () => {
  initEditValues();
});

watch(
  () => propertyType.value,
  () => handlePropertyTypeChange()
);

function onCustomSetSave(customSetRef: Node) {
  editValues.value.length = 0;
  editValues.value.push(customSetRef);
  propertyType.value = "is";
}

function handlePropertyTypeChange() {
  if (propertyType.value === "isNot") {
    props.property.isNot = editValues.value;
    delete props.property.is;
    delete props.property.isNull;
    delete props.property.isNotNull;
  } else if (propertyType.value === "is") {
    props.property.is = editValues.value;
    delete props.property.isNot;
    delete props.property.isNull;
    delete props.property.isNotNull;
  } else if (propertyType.value === "isNull") {
    props.property.isNull = true;
    delete props.property.is;
    delete props.property.isNotNull;
    delete props.property.isNot;
  } else if (propertyType.value === "isNotNull") {
    props.property.isNotNull = true;
    delete props.property.is;
    delete props.property.isNull;
    delete props.property.isNot;
  }
}

function initEditValues() {
  if (isObjectHasKeys(props.property, ["is"])) propertyType.value = "is";
  else if (isObjectHasKeys(props.property, ["isNot"])) propertyType.value = "isNot";
  else if (isObjectHasKeys(props.property, ["isNull"])) propertyType.value = "isNull";
  else if (isObjectHasKeys(props.property, ["isNotNull"])) propertyType.value = "isNotNull";

  if (propertyType.value && propertyType.value !== "isNull" && propertyType.value !== "isNotNull") {
    if (!isArrayHasLength((props.property as any)[propertyType.value])) (props.property as any)[propertyType.value] = [{} as Node];
    editValues.value = (props.property as any)[propertyType.value];
  } else {
    editValues.value.push({} as Node);
  }
}

function onSelect(cs: SearchResultSummary) {
  visible.value = false;
  const node = buildNodeFromCS(cs);

  editValues.value[selectedIndex.value] = node;
}

function openDialog(index: number) {
  selectedIndex.value = index;
  visible.value = true;
}

function deleteItem(index: number) {
  editValues.value.splice(index, 1);
}
</script>

<style scoped>
.class-select {
  display: flex;
  align-items: baseline;
}
.hidden-button {
  display: none;
}
.class-select:hover .hidden-button {
  display: flex;
}

.property-input-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
  width: 100%;
  gap: 0.5rem;
}
</style>
