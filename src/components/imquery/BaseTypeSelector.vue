<template>
  <DirectorySearchDialog
    v-model:show-dialog="showDialog"
    v-model:selected="localSelected"
    :imQuery="baseCohortQuery"
    :root-entities="rootBaseEntities"
    :searchTerm="selected.name"
    @cancel="cancelSelector"
  />
</template>
<script setup lang="ts">
import { SearchResultSummary, QueryRequest, Query } from "vue-library/interfaces";
import { ref, watch } from "vue";
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
