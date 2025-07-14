<template>
  <Dialog :visible="modelShowDialog" modal :draggable="false" :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '20vh' }" maximizable>
    <template #header>
      <div class="ecl-builder-dialog-header">
        <strong>Base type Selector:</strong>
      </div>
    </template>
    <div class="auto-complete-container">
      <div>Select the type of entity or base cohort</div>
      <AutocompleteSearchBar ref="searchBar" v-model:selected="localSelected" v-model:imQuery="baseCohortQuery" :rootEntities="rootBaseEntities" />
    </div>
    <template #footer>
      <Button label="Cancel" icon="fa-solid fa-xmark" severity="secondary" @click="closeBaseDialog" data-testid="cancel-base-type-button" />
      <Button label="OK" icon="fa-solid fa-check" class="p-button-primary" @click="submitBaseType" data-testid="base-type-ok-button" />
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { SearchResultSummary, QueryRequest, Query } from "@/interfaces/AutoGen";
import { ref } from "vue";

interface Props {
  selected: SearchResultSummary;
  rootBaseEntities: string[];
}
const props = defineProps<Props>();
const baseCohortQuery = defineModel<QueryRequest>("baseCohortQuery");
const modelShowDialog = defineModel<boolean>("visible");
const localSelected = ref(props.selected);
const emit = defineEmits<{
  closeDialog: [];
  updateBaseType: [payload: SearchResultSummary];
}>();
function closeBaseDialog() {
  emit("closeDialog");
}
function submitBaseType() {
  emit("updateBaseType", localSelected.value);
  closeBaseDialog();
}
</script>

<style scoped>
.auto-complete-container {
  flex: 1 1 0%;
  min-width: 0;
}
</style>
