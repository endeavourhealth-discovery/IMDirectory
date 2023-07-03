<template>
  <Dialog v-model:visible="visible" modal :header="'Keep as variable'" :style="{ width: '20vw' }">
    <InputText type="text" v-model="match.variable" />
    <template #footer>
      <Button label="Discard" severity="secondary" @click="visible = false" text />
      <Button label="Save" @click="visible = false" text />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Match } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref, watch } from "vue";
const emit = defineEmits({ "update:showDialog": payload => typeof payload === "boolean" });

interface Props {
  showDialog: boolean;
  match: Match;
}

const props = defineProps<Props>();
const visible: Ref<boolean> = ref(false);

watch(
  () => props.showDialog,
  newValue => {
    visible.value = newValue;
  }
);

watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
  }
});

onMounted(async () => {});
</script>

<style scoped></style>
