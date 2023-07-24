<template>
  <div class="property-input-container">
    in
    <InputText type="text" @click="showDialog = true" placeholder="Value" v-model:model-value="selected.name" />
    <DirectorySearchDialog :selected="selected" v-model:show-dialog="showDialog" @update:selected="onSelect" />
    <EntailmentOptionsSelect :entailment-object="editNode" />
    <Button label="Cancel" severity="secondary" @click="emit('onCancel')" />
    <Button label="Save" @click="emit('onSave', selected)" />
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import EntailmentOptionsSelect from "./EntailmentOptionsSelect.vue";
import { ConceptSummary } from "@im-library/interfaces";
import { Node } from "@im-library/interfaces/AutoGen";
import { getNameFromRef } from "@im-library/helpers/TTTransform";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";

const emit = defineEmits({ onCancel: () => true, onSave: (_payload: ConceptSummary) => true, "update:selected": payload => true });

interface Props {
  queryTypeIri: string;
  editNode: Node;
}

const props = defineProps<Props>();
const selected: Ref<ConceptSummary> = ref({} as ConceptSummary);
const showDialog = ref(false);

watch(
  () => props.editNode,
  () => populateSelected()
);

onMounted(() => {
  populateSelected();
});

function populateSelected() {
  if (props.editNode) {
    selected.value.iri = props.editNode["@id"] ?? props.editNode["@set"] ?? (props.editNode["@type"] as string);
    selected.value.name = getNameFromRef(props.editNode);
  }
}

function onSelect(cs: ConceptSummary) {
  selected.value = cs;
}
</script>

<style scoped>
.property-input-container {
  display: flex;
  flex-wrap: wrap;
  margin-left: 0.5rem;
  width: 100%;
  gap: 0.5rem;
  align-items: center;
}
</style>
