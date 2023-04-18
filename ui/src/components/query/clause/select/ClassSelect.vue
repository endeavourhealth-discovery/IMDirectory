<template>
  <DropdownHeader :options="['In', 'Not in', 'Is null']" @on-change="header = $event" />
  <div v-if="header !== 'Is null'" v-for="(selValue, index) in selectedValues" class="class-select">
    <InputText type="text" @click="openDialog(index)" placeholder="Value" v-model:model-value="selValue.name" />
    <EntailmentOptionsSelect :selected="selectedOptions" :entailment-options="[]" />
    <Button class="hidden-button" icon="fa-solid fa-plus" text @click="selectedValues.push({ name: '' } as ConceptSummary)" />
    <Button class="hidden-button" icon="pi pi-trash" text severity="danger" @click="deleteItem(index)" />
  </div>
  <Dialog v-model:visible="visible" modal header="Value" :style="{ width: '50vw' }">
    <ValueTreeSelect v-if="showTree" :class-iri="props.selectedProperty.data[SHACL.CLASS][0]['@id']" @close="visible = false" />
    <ValueListSelect v-else :class-iri="props.selectedProperty.data[SHACL.CLASS][0]['@id']" @close="visible = false" @on-select="onSelect($event)" />
  </Dialog>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isQuery, isValueSet } from "@im-library/helpers/ConceptTypeMethods";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF, SHACL } from "@im-library/vocabulary";
import { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";
import EntailmentOptionsSelect from "../../editTextQuery/EntailmentOptionsSelect.vue";
import ValueTreeSelect from "./class/ValueTreeSelect.vue";
import ValueListSelect from "./class/ValueListSelect.vue";
import DropdownHeader from "../DropdownHeader.vue";
import { ConceptSummary } from "@im-library/interfaces";
const emit = defineEmits({ onSelect: (payload: any) => payload });

const props = defineProps({
  selectedProperty: { type: Object as PropType<TreeNode>, required: true },
  selectedValue: { type: Object as PropType<TreeNode>, required: false }
});
const visible: Ref<boolean> = ref(false);
const showTree: Ref<boolean> = ref(false);
const selectedValues: Ref<ConceptSummary[]> = ref([{} as ConceptSummary]);
const selectedIndex: Ref<number> = ref(0);
const selectedOptions: Ref<string[]> = ref([]);
const header = ref("Is");

onMounted(async () => {
  const classIri = props.selectedProperty.data[SHACL.CLASS][0]["@id"];
  const entity = await EntityService.getPartialEntity(classIri, [RDF.TYPE, IM.DEFINITION]);
  if (isQuery(entity[RDF.TYPE]) || (isValueSet(entity[RDF.TYPE]) && isObjectHasKeys(entity, [IM.DEFINITION]))) {
    showTree.value = false;
  } else {
    showTree.value = true;
  }
});

function onSelect(event: any) {
  visible.value = false;
  selectedValues.value[selectedIndex.value] = {
    name: event.name || event.label,
    iri: event["@id"]
  } as ConceptSummary;
  emit("onSelect", event);
}

function openDialog(index: number) {
  selectedIndex.value = index;
  visible.value = true;
}

function deleteItem(index: number) {
  selectedValues.value.splice(index, 1);
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
