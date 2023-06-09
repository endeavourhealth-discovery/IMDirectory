<template>
  <Dropdown :options="['in', 'notIn', 'isNull']" v-model:model-value="whereType" />
  <div v-if="whereType !== 'isNull'" v-for="(editValue, index) in editValues" class="class-select">
    <InputText type="text" @click="openDialog(index)" placeholder="Value" v-model:model-value="editValue.name" />
    <EntailmentOptionsSelect :entailment-options="editValue.entailmentOptions" />
    <Button icon="fa-solid fa-plus" text @click="editValues.push({ name: '' } as EditValue)" />
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

const emit = defineEmits({ onSelect: (payload: any) => payload });

interface EditValue {
  iri: string;
  name: string;
  entailmentOptions: string[];
}

interface Props {
  classIri: string;
}

const props = defineProps<Props>();
const whereType: Ref<string> = ref("");
const visible: Ref<boolean> = ref(false);
const showTree: Ref<boolean> = ref(false);
const editValues: Ref<EditValue[]> = ref([] as EditValue[]);
const selectedIndex: Ref<number> = ref(0);
watch(
  () => _.cloneDeep(editValues.value),
  () => {
    for (const editValue of editValues.value) {
      const whereValue = { "@id": editValue.iri, name: editValue.name } as any;
      if (isArrayHasLength(editValue.entailmentOptions))
        for (const entailment of editValue.entailmentOptions) {
          whereValue[entailment] = true;
        }
    }
  }
);

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
  editValues.value.push({} as EditValue);

  // TODO populate if edit

  // for (const value of props.whereClause.whereValue) {
  //   editValues.value.push({
  //     name: getNameFromRef(value),
  //     iri: value["@id"],
  //     entailmentOptions: getEntailmentOptions(value)
  //   } as EditValue);
  // }
}

function onSelect(event: any) {
  visible.value = false;
  editValues.value[selectedIndex.value] = {
    name: event.name || event.label || getNameFromRef(event),
    iri: event["@id"],
    entailmentOptions: getEntailmentOptions(event)
  } as EditValue;
  emit("onSelect", event);
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
