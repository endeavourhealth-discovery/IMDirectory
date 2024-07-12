<template>
  <DirectorySearchDialog
    v-model:show-dialog="showAddPopulationDialog"
    :root-entities="[IM.MODULE_SETS, IM.MODULE_QUERIES]"
    :im-query="imQueryForPopulation"
    @update:selected="onPopulationSelect"
  />

  <DirectorySearchDialog
    v-model:show-dialog="showAddFeatureDialog"
    :root-entities="[IM.MODULE_FEATURES, IM.MODULE_QUERIES]"
    :im-query="imQueryForFeature"
    @update:selected="onFeatureSelect"
  />

  <!-- <AddFeatureDialog
    v-model:show-dialog="showBuildFeatureDialog"
    :dataModelIri="matchTypeOfIri"
    :header="'Add new feature'"
    :show-variable-options="false"
    @on-match-add="onMatchAdd"
    @on-property-add="onPropertyAdd"
  />

  <AddFeatureDialog
    v-model:show-dialog="showBuildThenFeatureDialog"
    :dataModelIri="matchTypeOfIri"
    :header="'Add new feature'"
    :show-variable-options="false"
    @on-match-add="onThenMatchAdd"
    @on-property-add="onThenPropertyAdd"
  /> -->

  <AddNewFeatureDialog
    v-model:show-dialog="showBuildFeatureDialog"
    :dataModelIri="matchTypeOfIri"
    :header="'Add new feature'"
    :show-variable-options="false"
    :can-clear-path="true"
    :has-next-step="true"
    @on-match-add="onMatchAdd"
    @on-property-add="onPropertyAdd"
  />

  <AddNewFeatureDialog
    v-model:show-dialog="showBuildThenFeatureDialog"
    :dataModelIri="matchTypeOfIri"
    :header="'Add new feature'"
    :show-variable-options="false"
    :can-clear-path="true"
    :has-next-step="true"
    @on-match-add="onThenMatchAdd"
    @on-property-add="onThenPropertyAdd"
  />
</template>

<script setup lang="ts">
import { Ref, ref, watch } from "vue";
import DirectorySearchDialog from "../shared/dialogs/DirectorySearchDialog.vue";
import { Bool, Match, Query, QueryRequest, SearchResultSummary, Where } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import { v4 } from "uuid";
import { EntityService } from "@/services";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { buildIMQueryFromFilters } from "@/helpers/IMQueryBuilder";
import { SearchOptions } from "@im-library/interfaces";
import AddFeatureDialog from "./AddFeatureDialog.vue";
import AddNewFeatureDialog from "./addNewFeatureDialog/AddNewFeatureDialog.vue";
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
const imQueryForPopulation: Ref<QueryRequest> = ref(buildIMQueryFromFilters({ types: [{ "@id": IM.COHORT_QUERY }] } as SearchOptions));
const imQueryForFeature: Ref<QueryRequest> = ref(buildIMQueryFromFilters({ types: [{ "@id": IM.MATCH_CLAUSE }, { "@id": IM.COHORT_QUERY }] } as SearchOptions));

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
  describeMatch(match, 0, false);
  if (!props.editMatch.match) props.editMatch.match = [];
  props.editMatch.match.push(match);
}

async function onFeatureSelect(selected: SearchResultSummary) {
  const featureEntity = await EntityService.getPartialEntity(selected.iri, [IM.DEFINITION]);
  if (!featureEntity || !featureEntity[IM.DEFINITION]) return;
  const featureDefinition: Query = JSON.parse(featureEntity[IM.DEFINITION]);
  describeMatch(featureDefinition, 0, false);
  if (!props.editMatch.match) props.editMatch.match = [];
  props.editMatch.match.push(featureDefinition);
}

function onPropertyAdd(property: Where) {
  const match: Match = { "@id": v4(), where: [property] };
  describeMatch(match, 0, false);
  if (!props.editMatch.match) props.editMatch.match = [];
  props.editMatch.match.push(match);
}

function onMatchAdd(match: Match) {
  describeMatch(match, 0, false);
  if (!props.editMatch.match) props.editMatch.match = [];
  props.editMatch.match.push(match);
}

function onThenPropertyAdd(property: Where) {
  const match: Match = { "@id": v4(), where: [property] };
  describeMatch(match, 0, false);
  if (props.editMatch.then) {
    if (isArrayHasLength(props.editMatch.then.match)) props.editMatch.then.match?.push(match);
    else props.editMatch.then = { boolMatch: Bool.and, match: [props.editMatch.then, match] };
  } else props.editMatch.then = match;
}

function onThenMatchAdd(match: Match) {
  describeMatch(match, 0, false);
  if (props.editMatch.then) {
    if (isArrayHasLength(props.editMatch.then.match)) props.editMatch.then.match?.push(match);
    else props.editMatch.then = { boolMatch: Bool.and, match: [props.editMatch.then, match] };
  } else props.editMatch.then = match;
}
</script>

<style scoped></style>
