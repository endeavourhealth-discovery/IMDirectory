<template>
  <Dialog :header="title" :visible="visible" :modal="true" :closable="true">
    <div class="p-dialog-content">
      <p>{{ prompt }}</p>
      <InputText type="text" v-model="text" autofocus @keyup.enter="btnOK" @keyup.esc="btnCancel" />
    </div>
    <template #footer>
      <Button :label="cancelLabel ?? 'Cancel'" :icon="fontAwesomePro ? 'fa-regular fa-xmark' : 'pi pi-times'" @click="btnCancel" class="p-button-text" />
      <Button :label="okLabel ?? 'OK'" :icon="fontAwesomePro ? 'fa-solid fa-check' : 'pi pi-check'" :disabled="!text" @click="btnOK" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from "vue";
import "vue-json-pretty/lib/styles.css";
import { useSharedStore } from "@/stores/sharedStore";

const emit = defineEmits({
  result: payload => typeof payload === "string"
});

interface Props {
  showDialog: boolean;
  title: string;
  prompt: string;
  initialText: string;
  okLabel?: string;
  cancelLabel?: string;
}

const sharedStore = useSharedStore();
const fontAwesomePro = computed(() => sharedStore.fontAwesomePro);

const props = defineProps<Props>();
const visible = ref(false);
const text: Ref<string | undefined> = ref("");

watch(
  () => props.showDialog,
  newValue => {
    text.value = props.initialText;
    visible.value = newValue;
  }
);

function btnOK() {
  if (text.value) {
    visible.value = false;
    emit("result", text.value);
  }
}

function btnCancel() {
  emit("result", null);
  visible.value = false;
}
</script>

<style scoped>
.p-dialog-content {
  flex-direction: column;
}
</style>
