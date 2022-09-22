<template>
  <div class="query-item-container" :id="id">
    <div class="label-container">
      <span class="float-text">Constraint</span>
      <Dropdown v-model="selected" :options="options" optionLabel="name" placeholder="Select constraint">
        <template #value="slotProps">
          <span>{{ slotProps.value.name }}</span>
        </template>
        <template #option="slotProps">
          <span> {{ slotProps.option.symbol }} {{ slotProps.option.name }} </span>
        </template>
      </Dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, PropType, ref, Ref, watch } from "vue";
import { Enums, Helpers } from "im-library";
import { ECLComponentDetails } from "im-library/dist/types/interfaces/Interfaces";
const { ECLComponent } = Enums;
const {
  DataTypeCheckers: { isObjectHasKeys }
} = Helpers;

const props = defineProps({
  id: { type: String, required: true },
  position: { type: Number, required: true },
  value: { type: Object as () => { name: string; symbol: string }, required: false },
  showButtons: { type: Object as PropType<{ minus: boolean; plus: boolean }>, default: { minus: true, plus: true } }
});

const emit = defineEmits({ updateClicked: (_payload: ECLComponentDetails) => true });

const selected: Ref<{ name: string; symbol: string }> = ref({} as { name: string; symbol: string });
const options: Ref<{ name: string; symbol: string }[]> = ref([
  { name: "Descendant or self of", symbol: "<<" },
  { name: "Descendant of", symbol: "<" },
  { name: "Self", symbol: "" },
  { name: "Child of", symbol: "<!" },
  { name: "Child or self of", symbol: "<<!" },
  { name: "Ancestor of", symbol: ">" },
  { name: "Ancestor or self of", symbol: ">>" },
  { name: "Parent of", symbol: ">!" },
  { name: "Parent or self of", symbol: ">>!" },
  { name: "Member of", symbol: "^" }
]);

watch(selected, () => onConfirm());

onMounted(() => {
  if (props.value && isObjectHasKeys(props.value, ["name", "symbol"])) {
    selected.value = props.value;
  } else {
    selected.value = options.value[0];
  }
});

function onConfirm(): void {
  emit("updateClicked", createConstraint());
}

function createConstraint(): ECLComponentDetails {
  return {
    id: props.id,
    value: selected.value,
    position: props.position,
    type: ECLComponent.CONSTRAINT,
    queryString: selected.value.symbol,
    showButtons: props.showButtons
  };
}
</script>

<style scoped>
.query-item-container {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid #ffc952;
  border-radius: 3px;
  gap: 1rem;
}

.label-container {
  flex: 1 1 auto;
  padding: 1rem;
  position: relative;
}

.p-dropdown {
  width: 100%;
  min-width: 15rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
