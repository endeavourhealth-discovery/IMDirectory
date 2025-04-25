<template>
  <div class="add-next-container">
    <template v-for="option of options" :key="option">
      <Button icon="fa-solid fa-plus" :label="option" severity="danger" class="p-button-rounded p-button-outlined add-next-button" @click="addItem(option)">
      </Button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, onMounted } from "vue";
import { NextComponentSummary, ComponentDetails } from "@/interfaces";
import { PropertyShape } from "@/interfaces/AutoGen";
import { ComponentType, EditorMode } from "@/enums";
import { stringAscending } from "@/helpers/Sorters";

const props = defineProps<{
  id: string;
  shape: PropertyShape;
  mode: EditorMode;
  value: NextComponentSummary;
  position: number;
  last: boolean;
}>();

const emit = defineEmits<{
  addClicked: [payload: { selectedType: ComponentType; position: number }];
  deleteClicked: [payload: ComponentDetails];
}>();

let options: Ref<ComponentType[]> = ref([]);

watch(options, newValue => {
  newValue.sort(stringAscending);
});

onMounted(() => {
  generateOptions(props.value);
});

function addItem(selectedOption: ComponentType) {
  emit("addClicked", {
    selectedType: selectedOption,
    position: props.value.previousPosition + 1
  });
}

function generateOptions(value: NextComponentSummary) {
  switch (value.previousComponentType) {
    case ComponentType.ENTITY:
      options.value = [ComponentType.LOGIC, ComponentType.ENTITY, ComponentType.REFINEMENT];
      break;
    case ComponentType.LOGIC:
      options.value = [ComponentType.ENTITY, ComponentType.LOGIC, ComponentType.REFINEMENT];

      break;
    case ComponentType.REFINEMENT:
      options.value = [ComponentType.ENTITY, ComponentType.LOGIC, ComponentType.REFINEMENT];
      break;
    default:
      console.error("Unhandled component type within member editor AddNext generateOptions switch");
      break;
  }
}
</script>

<style scoped>
.add-next-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
}

.add-next-button {
  border-style: dashed !important;
}
</style>
