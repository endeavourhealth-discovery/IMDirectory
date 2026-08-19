<template>
  <Dialog
    :visible="true"
    :modal="true"
    :closable="false"
    :maximizable="true"
    :style="{
      minWidth: '90vw',
      minHeight: '80h',
      display: 'flex',
      flexFlow: 'column nowrap'
    }"
    :contentStyle="{ flexGrow: '50', display: 'flex', flexDirection: 'column' }"
    :auto-z-index="true"
    id="ecl-builder-dialog"
  >
    <div class="button-container">
      <Button label="Close" icon="fa-solid fa-xmark" @click="closeMemberDialog" data-testid="cancel-ecl-builder-button" />
    </div>
    <div>
      <Members :eclQuery="query" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
    </div>
    <div class="button-container">
      <Button label="Close" icon="fa-solid fa-xmark" @click="closeMemberDialog" data-testid="cancel-ecl-builder-button" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import type { Query } from "@endeavour/vue-library/models";

import Members from "@/components/directory/viewer/set/Members.vue";

interface Props {
  showDialog?: boolean;
  eclString?: string;
  showNames?: boolean;
  query?: Query;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  navigateTo: [payload: string];
  closeMemberDialog: [];
}>();

function closeMemberDialog(): void {
  emit("closeMemberDialog");
}
</script>

<style scoped>
.button-container {
  display: flex;
  flex-flow: row;
  gap: 1rem;
  margin: 1rem 0 1rem 0;
}
</style>
