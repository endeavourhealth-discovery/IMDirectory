<template>
  <Dialog
    :header="title"
    v-model:visible="showPropertyDialog"
    :maximizable="true"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
    :closable="false"
  >
    <Listbox v-model="selected" :options="list" :filter="true" optionLabel="name"> </Listbox>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDialog" />
      <Button label="Select" icon="pi pi-check" autofocus @click="finalSelect" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import _ from "lodash";
import { ref, PropType, watch, Ref } from "vue";

const props = defineProps({
  list: { type: Array as PropType<Array<any>>, required: true },
  showDialog: { type: Boolean, required: true },
  title: { type: String, required: false, default: "Select item" }
});

const emit = defineEmits({
  onCloseDialog: () => true,
  onSelect: (_payload: any) => true
});
const selected: Ref<any> = ref({});
const showPropertyDialog = ref(false);

watch(
  () => props.showDialog,
  async () => {
    showPropertyDialog.value = props.showDialog;
  }
);

function closeDialog() {
  emit("onCloseDialog");
}

function finalSelect() {
  emit("onSelect", selected.value);
  closeDialog();
}
</script>

<style scoped>
.p-listbox {
  height: 100%;
  overflow-y: auto;
}
</style>
