<template>
  <Inplace :closable="true">
    <template #display>
      <h4>{{ selected }}</h4>
    </template>
    <template #content>
      <Dropdown :options="options" v-model:model-value="selected" @change="emit('onChange', selected)" />
    </template>
  </Inplace>
</template>

<script setup lang="ts">
import { PropType, Ref, onMounted, ref, watch } from "vue";
const emit = defineEmits({ onChange: (payload: string) => payload });
const props = defineProps({
  selectedOption: { type: String, required: false },
  options: { type: Object as PropType<string[]>, required: true }
});
const selected: Ref<string> = ref("");

onMounted(async () => {
  selected.value = props.selectedOption || props.options[0];
});
</script>

<style scoped></style>
