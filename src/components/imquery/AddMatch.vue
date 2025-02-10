<template>
  <AddNewFeatureDialog
    v-model:show-dialog="showBuildFeatureDialog"
    :show-navigate="true"
    :dataModelIri="matchTypeOfIri"
    :header="'Add new feature'"
    :show-variable-options="false"
    :can-clear-path="true"
    :has-next-step="true"
    :show-all-type-filters="true"
    @on-match-add="(_match: Match) => emit('addFeature', _match)"
  />

  <AddNewFeatureDialog
    v-model:show-dialog="showBuildThenFeatureDialog"
    :show-navigate="true"
    :dataModelIri="matchTypeOfIri"
    :header="'Add test'"
    :show-variable-options="false"
    :can-clear-path="true"
    :has-next-step="true"
    :show-all-type-filters="true"
    @on-match-add="(_match: Match) => emit('addThen', _match)"
  />
</template>

<script setup lang="ts">
import { Ref, ref, watch } from "vue";
import { Match } from "@/interfaces/AutoGen";
import AddNewFeatureDialog from "./addNewFeatureDialog/AddNewFeatureDialog.vue";
interface Props {
  editMatch: Match;
  matchTypeOfIri: string | undefined;
  showBuildFeature: boolean;
  showBuildThenFeature: boolean;
}
const props = defineProps<Props>();

const emit = defineEmits({
  "update:showBuildFeature": payload => typeof payload === "boolean",
  "update:showBuildThenFeature": payload => typeof payload === "boolean",
  addFeature: (payload: Match) => payload,
  addThen: (payload: Match) => payload
});

const showBuildFeatureDialog: Ref<boolean> = ref(false);
const showBuildThenFeatureDialog: Ref<boolean> = ref(false);

watch(
  () => props.showBuildThenFeature,
  newValue => {
    showBuildThenFeatureDialog.value = newValue;
  }
);
watch(showBuildThenFeatureDialog, newValue => {
  if (!newValue) {
    emit("update:showBuildThenFeature", newValue);
  }
});

watch(
  () => props.showBuildFeature,
  newValue => {
    showBuildFeatureDialog.value = newValue;
  }
);
watch(showBuildFeatureDialog, newValue => {
  if (!newValue) {
    emit("update:showBuildFeature", newValue);
  }
});
</script>

<style scoped></style>
