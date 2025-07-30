<template>
  <Dialog :visible="modelShowDialog" modal :draggable="false" :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '20vh' }" maximizable>
    <template #header>
      <div class="ecl-builder-dialog-header">
        <strong>Base type Selector:</strong>
      </div>
    </template>
    <DirectorySearchDialog
      v-model:show-dialog="showDialog"
      v-model:selected="localSelected"
      :imQuery="baseCohortQuery"
      :root-entities="rootBaseEntities"
      :searchTerm="selected.name"
    />
    <!--
    <div class="auto-complete-container">
      <div>Select the type of entity or base cohort</div>
      <AutocompleteSearchBar ref="searchBar" v-model:selected="localSelected" v-model:imQuery="baseCohortQuery" :rootEntities="rootBaseEntities" />
    </div>-->
    <template #footer>
      <Button label="Cancel" icon="fa-solid fa-xmark" severity="secondary" @click="cancelSelector" data-testid="cancel-base-type-button" />
      <Button label="OK" icon="fa-solid fa-check" class="p-button-primary" @click="submitBaseType" data-testid="base-type-ok-button" />
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import AutocompleteSearchBar from "@/components/shared/AutocompleteSearchBar.vue";
import { SearchResultSummary, QueryRequest, Query } from "@/interfaces/AutoGen";
import { ref, watch } from "vue";
import { cloneDeep } from "lodash-es";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { FilterOptions } from "@/interfaces";
import DirectorySearchDialog from "@/components/shared/dialogs/DirectorySearchDialog.vue";

interface Props {
  selected: SearchResultSummary;
  rootBaseEntities: string[];
}
const props = defineProps<Props>();
const baseCohortQuery = defineModel<QueryRequest>("baseCohortQuery");
const modelShowDialog = defineModel<boolean>("visible");
const localSelected = ref(props.selected);
const showDialog = ref(true);
const emit = defineEmits<{
  cancel: [];
  updateBaseType: [payload: SearchResultSummary];
}>();

watch(
  localSelected,
  (newValue, oldValue) => {
    if (newValue?.iri !== oldValue?.iri) {
      submitBaseType();
    }
  },
  { deep: true }
);

function cancelSelector() {
  emit("cancel");
}
function submitBaseType() {
  emit("updateBaseType", localSelected.value);
}
</script>

<style scoped>
.auto-complete-container {
  flex: 1 1 0%;
  min-width: 0;
}
</style>
