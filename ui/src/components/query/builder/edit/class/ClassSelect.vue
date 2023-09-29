<template>
  <div class="property-input-container">
    <Dropdown :options="['is', 'isNot', 'isNull']" v-model:model-value="propertyType" />
    <InputText type="text" placeholder="Value label" v-model:model-value="props.property.valueLabel" />
    <SaveCustomSetDialog v-if="propertyType === 'inSet'" :set-members="editValues" />
  </div>
  <div v-if="propertyType !== 'isNull'" v-for="(editValue, index) in editValues" class="property-input-container class-select">
    <InputText type="text" @click="openDialog(index)" placeholder="Value" v-model:model-value="editValue.name" />
    <EntailmentOptionsSelect :entailment-object="editValue" />
    <Button icon="fa-solid fa-plus" text @click="editValues.push({ '@id': '', name: '' } as Node)" />
    <Button icon="pi pi-trash" text severity="danger" @click="deleteItem(index)" :disabled="editValues.length === 1" />
    <DirectorySearchDialog
      :selected="{ iri: editValue['@id'], name: editValue.name } as ConceptSummary"
      v-model:show-dialog="visible"
      @update:selected="onSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { onMounted, Ref, ref } from "vue";
import EntailmentOptionsSelect from "../EntailmentOptionsSelect.vue";
import _ from "lodash";
import { Node, Property } from "@im-library/interfaces/AutoGen";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { buildNodeFromCS } from "@im-library/helpers/QueryBuilder";
import SaveCustomSetDialog from "../dialogs/SaveCustomSetDialog.vue";

interface Props {
  property: Property;
  classIri: string;
}

const props = defineProps<Props>();
const propertyType: Ref<string> = ref("is");
const visible: Ref<boolean> = ref(false);
const editValues: Ref<Node[]> = ref([] as Node[]);
const selectedIndex: Ref<number> = ref(0);

onMounted(async () => {
  initEditValues();
});

function initEditValues() {
  if (isObjectHasKeys(props.property, ["isNot"])) propertyType.value = "isNot";
  else if (isObjectHasKeys(props.property, ["null"])) propertyType.value = "isNull";

  if (propertyType.value && propertyType.value !== "isNull") {
    if (!isArrayHasLength((props.property as any)[propertyType.value])) (props.property as any)[propertyType.value] = [{} as Node];
    editValues.value = (props.property as any)[propertyType.value];
  } else {
    editValues.value.push({} as Node);
  }
}

function onSelect(cs: ConceptSummary) {
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
