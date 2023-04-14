<template>
  <Listbox v-model="selectedValue" :options="options" optionLabel="@id" :virtualScrollerOptions="{ itemSize: 38 }" listStyle="height:300px" />
  <div class="footer-actions">
    <Button class="action-button" severity="secondary" label="Cancel" @click="emit('close')"></Button>
    <Button class="action-button" label="Select" @click="emit('onSelect', selectedValue)"></Button>
  </div>
</template>

<script setup lang="ts">
import { QueryService } from "@/services";
import { QueryRequest } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref, watch } from "vue";
const props = defineProps({
  classIri: { type: String, required: true }
});
const emit = defineEmits({ onSelect: (payload: any) => payload, close: () => true });

const selectedValue: Ref<any> = ref({});
const options: Ref<any> = ref([]);

onMounted(async () => {
  const queryRequest = { query: { "@id": props.classIri } } as QueryRequest;
  const results = await QueryService.queryIM(queryRequest);
  options.value = results.entities;
});
</script>

<style scoped>
.action-button {
  margin-right: 0.1rem;
}
.footer-actions {
  display: flex;
  justify-content: end;
}
</style>
