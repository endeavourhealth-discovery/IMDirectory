<template>
  <div class="dropdown-header">
    <Dropdown :options="options" v-model:model-value="selected" @change="emit('onChange', selected)" />
  </div>
</template>

<script setup lang="ts">
import { PropType, Ref, onMounted, ref, watch } from "vue";
const emit = defineEmits({ onChange: (payload: string) => payload });
const props = defineProps({
  selectedOption: { type: String, required: false },
  options: { type: Object as PropType<string[]>, required: true }
});
const selected: Ref<string> = ref("");

onMounted(() => {
  selected.value = props.selectedOption || props.options[0];
});
</script>

<style scoped>
.dropdown-header {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
