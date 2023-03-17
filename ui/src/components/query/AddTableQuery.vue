<template>
  rules
  <div class="footer-actions">
    <Button class="action-button" severity="secondary" label="Cancel" @click="cancel"></Button>
    <Button class="action-button" severity="success" label="Add" @click="add"></Button>
  </div>
</template>

<script setup lang="ts">
import { TableQuery } from "@im-library/interfaces";
import { Where, With } from "@im-library/interfaces/AutoGen";
import { onMounted, Ref, ref } from "vue";

const props = defineProps({
  queryData: { type: Array<TableQuery>, required: true },
  selected: { type: Array<TableQuery>, required: true },
  level: { type: Number, required: false, default: 0 }
});
onMounted(async () => {});

const clause: Ref<Where | With> = ref({} as any);
const emit = defineEmits({ onCancel: () => true });

function cancel() {
  emit("onCancel");
}

function add() {
  try {
    props.queryData[0].parent.data.where.push({ description: "new clause" } as Where);
  } catch (error) {
    console.log(error);
  }
}
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
