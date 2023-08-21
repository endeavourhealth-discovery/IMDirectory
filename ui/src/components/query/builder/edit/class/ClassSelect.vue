<template>
  <div class="property-input-container">
    <Dropdown :options="['in', 'notIn', 'isNull']" v-model:model-value="propertyType" />
    <InputText type="text" placeholder="Value label" v-model:model-value="props.property.valueLabel" />
    <Button label="Save custom set" text severity="info" />
  </div>
  <div v-if="propertyType !== 'isNull'" v-for="(editValue, index) in editValues" class="property-input-container class-select">
    <InputText type="text" @click="openDialog(index)" placeholder="Value" v-model:model-value="editValue.name" />
    <EntailmentOptionsSelect :entailment-object="editValue" />
    <Button icon="fa-solid fa-plus" text @click="editValues.push({ '@id': '', name: '' } as Node)" />
    <Button icon="pi pi-trash" text severity="danger" @click="deleteItem(index)" :disabled="editValues.length === 1" />
    <DirectorySearchDialog v-model:show-dialog="visible" @update:selected="onSelect" />
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isQuery, isRecordModel, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF } from "@im-library/vocabulary";
import { onMounted, Ref, ref } from "vue";
import EntailmentOptionsSelect from "../EntailmentOptionsSelect.vue";
import ValueTreeSelect from "./ValueTreeSelect.vue";
import ValueListSelect from "./ValueListSelect.vue";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import _ from "lodash";
import { Node, Property } from "@im-library/interfaces/AutoGen";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { N } from "vitest/dist/types-2b1c412e";
import { buildMatchFromCS } from "@im-library/helpers/QueryBuilder";

const emit = defineEmits({ onSelect: (payload: any) => payload });

interface Props {
  property: Property;
  classIri: string;
}

const props = defineProps<Props>();
const propertyType: Ref<string> = ref("in");
const visible: Ref<boolean> = ref(false);
const showTree: Ref<boolean> = ref(false);
const editValues: Ref<Node[]> = ref([] as Node[]);
const selectedIndex: Ref<number> = ref(0);
const setType: Ref<string> = ref("set");
const showSearchDialog: Ref<boolean> = ref(false);

onMounted(async () => {
  initEditValues();
  const entity = await EntityService.getPartialEntity(props.classIri, [RDF.TYPE, IM.DEFINITION]);
  if (isQuery(entity[RDF.TYPE]) || (isValueSet(entity[RDF.TYPE]) && isObjectHasKeys(entity, [IM.DEFINITION]))) {
    showTree.value = false;
  } else {
    showTree.value = true;
  }
});

function initEditValues() {
  if (isObjectHasKeys(props.property, ["notIn"])) propertyType.value = "notIn";
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
  const node = buildMatchFromCS(cs);

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
