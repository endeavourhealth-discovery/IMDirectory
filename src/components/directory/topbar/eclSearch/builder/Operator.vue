<template>
  <div class="query-item-container" :id="id">
    <div class="label-container">
      <span class="float-text">Operator</span>
      <Dropdown v-model="selected" :options="options" optionLabel="name" placeholder="Select operator">
        <template #value="slotProps">
          <span>{{ slotProps.value.name }}</span>
        </template>
        <template #option="slotProps">
          <span>{{ slotProps.option.name }}</span>
        </template>
      </Dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, PropType, Ref, ref, watch } from "vue";
import { ECLComponent } from "@/im_library/enums";
import { ECLComponentDetails } from "@/im_library/interfaces";

const props = defineProps({
  id: { type: String, required: true },
  position: { type: Number, required: true },
  value: {
    type: Object as PropType<{
      symbol: string;
      name: string;
    }>,
    required: false
  },
  showButtons: { type: Object as PropType<{ minus: boolean; plus: boolean }>, default: { minus: true, plus: true } }
});

const emit = defineEmits({ updateClicked: (_payload: ECLComponentDetails) => true });

const options: Ref<{ symbol: string; name: string }[]> = ref([
  { symbol: "=", name: "Equals" },
  { symbol: "!=", name: "Not equals" }
]);
const selected: Ref<{ symbol: string; name: string }> = ref({ symbol: "=", name: "Equals" });
const edit = ref(false);

watch(selected, () => onConfirm());

onMounted(() => {
  if (props.value) {
    selected.value = props.value;
  } else {
    selected.value = options.value[0];
  }
});

function onConfirm() {
  emit("updateClicked", createOperator());
}

function createOperator(): ECLComponentDetails {
  return {
    id: props.id,
    value: selected.value,
    position: props.position,
    type: ECLComponent.OPERATOR,
    queryString: selected.value.symbol,
    showButtons: props.showButtons
  };
}
</script>

<style scoped>
.query-item-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.label-container {
  margin: 0 1rem 0 0;
  padding: 1rem;
  border: 1px solid #34314c;
  border-radius: 3px;
  position: relative;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
