<template>
  <div class="logic-container" :id="id">
    <div class="label-container">
      <span class="float-text">Logic</span>
      <Dropdown v-model="selected" :options="options" placeholder="Select logic" />
    </div>
    <AddDeleteButtons :show="showButtons" :position="position" :options="getButtonOptions()" @deleteClicked="deleteClicked" @addNextClicked="addNextClicked" />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, PropType, Ref, ref, watch } from "vue";
import AddDeleteButtons from "../AddDeleteButtons.vue";
import { ECLComponent } from "@/im_library/enums";
import { ECLComponentDetails } from "@/im_library/interfaces";

const props = defineProps({
  id: { type: String, required: true },
  position: { type: Number, required: true },
  value: { type: Object as PropType<{ data: string; parentGroup: ECLComponent }>, required: true },
  showButtons: { type: Object as PropType<{ minus: boolean; plus: boolean }>, default: { minus: true, plus: true } }
});

const emit = defineEmits({
  addNextOptionsClicked: (_payload: any) => true,
  deleteClicked: (_payload: ECLComponentDetails) => true,
  updateClicked: (_payload: ECLComponentDetails) => true
});

const options: Ref<string[]> = ref(["AND", "OR", "MINUS"]);
const selected = ref("");

watch(selected, () => onConfirm());

onMounted(() => {
  if (props.value && props.value.data) {
    selected.value = props.value.data;
  } else {
    selected.value = options.value[0];
  }
});

function onConfirm(): void {
  emit("updateClicked", {
    id: props.id,
    value: { data: selected.value, parentGroup: props.value.parentGroup },
    position: props.position,
    type: ECLComponent.LOGIC,
    queryString: selected.value,
    showButtons: props.showButtons
  });
}

function deleteClicked(): void {
  emit("deleteClicked", {
    id: props.id,
    value: { data: selected.value, parentGroup: props.value.parentGroup },
    position: props.position,
    type: ECLComponent.LOGIC,
    queryString: selected.value,
    showButtons: props.showButtons
  });
}

function addNextClicked(item: any): void {
  emit("addNextOptionsClicked", {
    position: props.position + 1,
    selectedType: item
  });
}

function getButtonOptions() {
  if (props.value.parentGroup === ECLComponent.REFINEMENT_GROUP) {
    return [ECLComponent.REFINEMENT];
  } else {
    return [ECLComponent.FOCUS_CONCEPT];
  }
}
</script>

<style scoped>
.logic-container {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.p-button-label {
  padding-left: 0.5rem;
}

.query-item-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.label-container {
  padding: 1rem;
  border: 1px solid #34314c;
  border-radius: 3px;
  position: relative;
}

.p-dropdown {
  width: 7rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
