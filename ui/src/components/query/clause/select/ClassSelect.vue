<template>
  <DropdownHeader :options="['In', 'Not in', 'Is null']" />
  <div class="class-select">
    <InputText type="text" @click="visible = true" placeholder="Value" v-model:model-value="valueDisplay" />
    <AncestorDescendantSelect />
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
import AncestorDescendantSelect from "../../editTextQuery/AncestorDescendantSelect.vue";
import ValueTreeSelect from "./class/ValueTreeSelect.vue";
import ValueListSelect from "./class/ValueListSelect.vue";
import DropdownHeader from "../DropdownHeader.vue";
const emit = defineEmits({ onSelect: (payload: any) => payload });

const props = defineProps({
  selectedProperty: { type: Object as PropType<TreeNode>, required: true },
  selectedValue: { type: Object as PropType<TreeNode>, required: false }
});
const visible: Ref<boolean> = ref(false);
const showTree: Ref<boolean> = ref(false);
const valueDisplay = ref();

onMounted(async () => {
  // TODO get tree from set/query
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
  valueDisplay.value = event.name || event.label;
  emit("onSelect", event);
}
</script>

<style scoped>
.class-select {
  display: flex;
  align-items: baseline;
}
</style>
