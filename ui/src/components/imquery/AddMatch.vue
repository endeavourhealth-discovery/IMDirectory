<template>
  <div class="add-buttons">
    <DirectorySearchDialog
      v-model:show-dialog="showAddPopulationDialog"
      :root-entities="[IM.MODULE_SETS, IM.MODULE_QUERIES]"
      :os-query="osQueryForPopulation"
      @update:selected="onPopulationSelect"
    />

    <DirectorySearchDialog
      v-model:show-dialog="showAddFeatureDialog"
      :root-entities="[IM.MODULE_FEATURES]"
      :os-query="osQueryForFeature"
      @update:selected="onFeatureSelect"
    />

    <AddPropertyDialog
      v-model:show-dialog="showBuildFeatureDialog"
      :dataModelIri="matchTypeOfIri"
      :header="'Build feature'"
      :show-variable-options="false"
      @on-property-add="(properties: Where[]) => onFeatureBuild(properties)"
    />

    <AddPropertyDialog
      v-model:show-dialog="showBuildThenFeatureDialog"
      :dataModelIri="matchTypeOfIri"
      :header="'Build feature'"
      :show-variable-options="false"
      @on-property-add="(properties: Where[]) => onThenFeatureBuild(properties)"
    />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, watch } from "vue";
import AddPropertyDialog from "../query/builder/edit/dialogs/AddPropertyDialog.vue";
import DirectorySearchDialog from "../shared/dialogs/DirectorySearchDialog.vue";
import { Match, Query, SearchRequest, SearchResultSummary, Where } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import { v4 } from "uuid";
import { EntityService } from "@/services";
interface Props {
  editMatch: Match;
  matchTypeOfIri: string;
  showAddPopulation: boolean;
  showBuildFeature: boolean;
  showBuildThenFeature: boolean;
  showAddFeature: boolean;
}
const props = defineProps<Props>();

const emit = defineEmits({
  "update:showAddPopulation": payload => typeof payload === "boolean",
  "update:showBuildFeature": payload => typeof payload === "boolean",
  "update:showBuildThenFeature": payload => typeof payload === "boolean",
  "update:showAddFeature": payload => typeof payload === "boolean"
});

const showAddPopulationDialog: Ref<boolean> = ref(false);
const showBuildFeatureDialog: Ref<boolean> = ref(false);
const showBuildThenFeatureDialog: Ref<boolean> = ref(false);
const showAddFeatureDialog: Ref<boolean> = ref(false);
const osQueryForPopulation: Ref<SearchRequest> = ref({ typeFilter: [IM.COHORT_QUERY] });
const osQueryForFeature: Ref<SearchRequest> = ref({ typeFilter: [IM.MATCH_CLAUSE] });

watch(
  () => props.showAddPopulation,
  newValue => {
    showAddPopulationDialog.value = newValue;
  }
);
watch(showAddPopulationDialog, newValue => {
  if (!newValue) {
    emit("update:showAddPopulation", newValue);
  }
});

watch(
  () => props.showAddFeature,
  newValue => {
    showAddFeatureDialog.value = newValue;
  }
);
watch(showAddFeatureDialog, newValue => {
  if (!newValue) {
    emit("update:showAddFeature", newValue);
  }
});

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

function onPopulationSelect(selected: SearchResultSummary) {
  const match: Match = { "@id": v4(), instanceOf: { "@id": selected.iri, name: selected.name, memberOf: true } };
  describeMatch(match, 0);
  if (!props.editMatch.match) props.editMatch.match = [];
  props.editMatch.match.push(match);
}

async function onFeatureSelect(selected: SearchResultSummary) {
  const featureEntity = await EntityService.getPartialEntity(selected.iri, [IM.DEFINITION]);
  if (!featureEntity || !featureEntity[IM.DEFINITION]) return;
  const featureDefinition: Query = JSON.parse(featureEntity[IM.DEFINITION]);
  describeMatch(featureDefinition, 0);
  if (!props.editMatch.match) props.editMatch.match = [];
  props.editMatch.match.push(featureDefinition);
}

function onFeatureBuild(properties: Where[]) {
  const match: Match = { "@id": v4(), where: properties };
  if (!props.editMatch.match) props.editMatch.match = [];
  props.editMatch.match.push(match);
}

function onThenFeatureBuild(properties: Where[]) {
  const match: Match = { "@id": v4(), where: properties };
  props.editMatch.then = match;
}
</script>

<style scoped></style>
