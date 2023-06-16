<template>
  <Dropdown :options="['in', 'notIn', 'isNull']" v-model:model-value="whereType" />
  <InputText type="text" placeholder="Value label" v-model:model-value="props.where.valueLabel" />
  <div v-if="whereType !== 'isNull'" v-for="(editValue, index) in editValues" class="class-select">
    <InputText type="text" @click="openDialog(index)" placeholder="Value" v-model:model-value="editValue.name" />
    <EntailmentOptionsSelect />
    <Button icon="fa-solid fa-plus" text @click="editValues.push({ '@id': '', name: '' } as Node)" />
    <Button icon="pi pi-trash" text severity="danger" @click="deleteItem(index)" :disabled="editValues.length === 1" />
  </div>
  <Dialog v-model:visible="visible" modal header="Value" :style="{ width: '50vw' }">
    <ValueTreeSelect v-if="showTree" :class-iri="classIri" @close="visible = false" />
    <ValueListSelect v-else :class-iri="classIri" @close="visible = false" @on-select="onSelect($event)" />
  </Dialog>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isQuery, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF, SHACL } from "@im-library/vocabulary";
import { onMounted, Ref, ref, watch } from "vue";
import EntailmentOptionsSelect from "../../editTextQuery/EntailmentOptionsSelect.vue";
import ValueTreeSelect from "./class/ValueTreeSelect.vue";
import ValueListSelect from "./class/ValueListSelect.vue";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import { getEntailmentOptions } from "@im-library/helpers/ClauseUIBuilder";
import _ from "lodash";
import { Node, Where } from "@im-library/interfaces/AutoGen";

const emit = defineEmits({ onSelect: (payload: any) => payload });

interface Props {
  where: Where;
  classIri: string;
}

const props = defineProps<Props>();
const whereType: Ref<string> = ref("in");
const visible: Ref<boolean> = ref(false);
const showTree: Ref<boolean> = ref(false);
const editValues: Ref<Node[]> = ref([] as Node[]);
const selectedIndex: Ref<number> = ref(0);

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
  if (isObjectHasKeys(props.where, ["notIn"])) whereType.value = "notIn";
  else if (isObjectHasKeys(props.where, ["null"])) whereType.value = "isNull";

  if (whereType.value && whereType.value !== "isNull") {
    editValues.value = (props.where as any)[whereType.value];
  } else {
    editValues.value.push({} as Node);
  }
}

function onSelect(event: any) {
  visible.value = false;
  editValues.value[selectedIndex.value] = {
    name: event.name || event.label || getNameFromRef(event),
    "@id": event["@id"]
  } as Node;
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
</style>
