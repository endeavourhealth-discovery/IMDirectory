<template>
  <Dialog
    :header="queryLoading ? 'Results' : 'Results: ' + testQueryParams.length"
    v-model:visible="internalShowDialog"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
    :closable="false"
  >
    <div v-for="param in testQueryParams">{{ param.param }} : <InputText type="text" v-model="param.value" /></div>
    {{ props.params }}
    <template #footer>
      <Button label="Cancel" icon="fa-duotone fa-ban" @click="close" class="p-button-secondary" />
      <Button label="Run" icon="pi pi-check" @click="run" autofocus />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref, Ref } from "vue";
import { Query } from "@im-library/models/AutoGen";

const queryLoading: Ref<boolean> = ref(false);
const testQueryParams: Ref<{ param: string; value: string }[]> = ref([]);

const props = defineProps({
  params: { type: Set<string>, required: true },
  imquery: { type: Object as PropType<Query>, required: true },
  showDialog: { type: Boolean, required: true }
});

const emit = defineEmits({ closeDialog: () => true });
const internalShowDialog = ref(true);

onMounted(async () => {
  for (const param of props.params) {
    testQueryParams.value.push({ param: param, value: "" });
  }
});

function close() {
  emit("closeDialog");
}

function run() {}
</script>

<style scoped></style>
