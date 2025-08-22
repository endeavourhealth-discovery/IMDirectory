<template>
  <Dialog
    v-model:visible="showDialog"
    modal
    maximizable
    header="Argument values"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    class="argument-selector"
    :pt="{ content: { class: 'flex-auto' } }"
  >
    <ArgumentDisplay
      :arguments="arguments"
      :runOnConfirm="runOnConfirm"
      :showFooterButtons="showFooterButtons"
      @hide-dialog="showDialog = false"
      @arguments-completed="passArguments"
    />
  </Dialog>
</template>

<script setup lang="ts">
import ArgumentDisplay from "@/components/queryRunner/ArgumentDisplay.vue";
import { Argument, ArgumentReference } from "@/interfaces/AutoGen";

interface Props {
  arguments: ArgumentReference[] | undefined;
  runOnConfirm?: boolean;
  showFooterButtons: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  argumentsCompleted: [payload: Argument[], boolean];
}>();

const showDialog = defineModel<boolean>("showDialog");

function passArguments(args: Argument[], runOnConfirm: boolean) {
  emit("argumentsCompleted", args, runOnConfirm);
}
</script>

<style scoped></style>
