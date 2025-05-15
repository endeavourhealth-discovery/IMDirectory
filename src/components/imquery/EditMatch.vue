<template>
  <div class="edit-match-wrapper">
    <Button
      v-if="!isEmptyMatch()"
      v-tooltip="'Exclude'"
      :class="'hover-button'"
      :outlined="true"
      :severity="'secondary'"
      class="builder-button exclude-button vertical-button not-button"
      label="NOT"
      size="small"
      @click.stop=""
    />
    <div
      :class="[hover ? 'hover-edit-match-container' : 'edit-match-container']"
      class=""
      @mouseover.stop="hover = true"
      @mouseout.stop="hover = false"
      @click.stop="emit('onUpdateDialogFocus', editMatch)"
    >
      <div v-if="editMatch?.typeOf?.name">{{ editMatch.typeOf.name }}</div>
      <div v-else-if="editMatch?.instanceOf">
        {{ editMatch.instanceOf.map(instanceOf => instanceOf.qualifier + " " + instanceOf.name).join(",") }}
      </div>
      <div v-else-if="editMatch?.name">{{ editMatch?.name }}</div>
      <span v-for="(matches, type) in boolGroup" :key="type">
        <span :class="type">{{ getOperatorText(type) }}</span>
        <div class="tree-node-wrapper">
          <span v-for="(nestedQuery, index) in matches" :key="index">
            <RecursiveMatchDisplay
              :match="nestedQuery"
              :key="`nestedQueryDisplay-${index}`"
              :clause-index="index"
              :property-index="index"
              :parent-operator="type as Bool"
              :depth="1"
              :parent-match="match"
              :bracketed="index === match[type]!.length - 1"
              :edit-mode="true"
            />
          </span>
        </div>
      </span>
      <div v-if="editMatch?.where" class="where-group">
        <div class="where-list">
          <RecursiveWhereDisplay :where="match.where!" :index="0" :key="0" :depth="1" :expandedSet="true" :inline="false" />

          <Dialog v-model:visible="showAddPropertyDialog" :header="'Add property'" :style="{ minWidth: '50vw' }" maximizable modal>
            <AddProperty
              :dataModelIri="typeOf ?? props.parentMatchType ?? selectedBaseType?.iri"
              :match="editMatch"
              :show-variable-options="false"
              @on-dialog-update="(value: boolean) => (showAddPropertyDialog = value)"
            />
          </Dialog>

          <Button
            v-if="!isBooleanEditor && editMatch['@id'] === focusedId"
            class="add-property-button"
            icon="fa-solid fa-plus"
            label="Add property"
            severity="success"
            @click="showAddPropertyDialog = true"
          />
        </div>
      </div>
      <EditOrderBy v-if="focusedId === editMatch['@id'] && editMatch.orderBy" :dm-iri="typeOf" :editMatch="editMatch" :order-by="editMatch.orderBy" />
      <div v-else-if="editMatch.orderBy" v-html="editMatch.orderBy.description" />
      <span v-if="editMatch.variable">label as {{ editMatch.variable }}</span>
    </div>
    <Button
      v-if="!isRootFeature"
      :class="[!hover && 'hover-button']"
      :outlined="!hover"
      class="builder-button delete-button"
      icon="fa-solid fa-trash"
      severity="danger"
      @click.stop="emit('deleteMatch', editMatch['@id']!)"
      @mouseover.stop="hover = true"
      @mouseout.stop="hover = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { Bool, DisplayMode, Match, SearchResultSummary, Where } from "@/interfaces/AutoGen";
import setupIMMatchBuilderActions from "@/composables/setupIMQueryBuilderActions";
import type { MenuItem } from "primevue/menuitem";
import { computed, inject, onMounted, Ref, ref, watch } from "vue";
import EditOrderBy from "./EditOrderBy.vue";
import { cloneDeep } from "lodash-es";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import AddProperty from "./AddProperty.vue";
import { QueryService } from "@/services";
import RecursiveWhereDisplay from "@/components/query/viewer/RecursiveWhereDisplay.vue";
import RecursiveMatchDisplay from "@/components/query/viewer/RecursiveMatchDisplay.vue";
interface Props {
  isRootFeature?: boolean;
  match: Match;
  focusedId?: string;
  parentMatchType?: string;
  isBooleanEditor?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  onUpdateDialogFocus: [payload: Match];
  deleteMatch: [payload: string];
  ungroupMatches: [payload: Match];
}>();
const hover: Ref<boolean> = ref(false);
const { getMenuItemFromMatch, isFlatMatch, toggleMatchBool, toggleWhereBool } = setupIMMatchBuilderActions();
const group: Ref<number[]> = ref([]);
const typeOf: Ref<string> = ref("");
const selectedBaseType = inject("selectedBaseType") as Ref<SearchResultSummary | undefined>;
const fullMatch = inject("fullMatch") as Ref<Match | undefined>;
const showAddPropertyDialog: Ref<boolean> = ref(false);
const showBuildFeature: Ref<boolean> = ref(false);
const editMatch = ref(cloneDeep(props.match));
const boolGroup = computed(() => {
  return {
    ...(editMatch.value.and ? { and: editMatch.value.and } : {}),
    ...(editMatch.value.or ? { or: editMatch.value.or } : {}),
    ...(editMatch.value.not ? { not: editMatch.value.not } : {})
  };
});

function getOperatorText(operator: string): string {
  if (operator === "or") {
    return "At least one of the following";
  } else if (operator === "and") {
    return "All of the following";
  } else {
    return " ";
  }
}
onMounted(() => {
  if (fullMatch.value) typeOf.value = fullMatch.value!.typeOf!["@id"]!;
});

watch(
  () => cloneDeep(editMatch),
  () => {
    if (fullMatch.value) typeOf.value = fullMatch.value!.typeOf!["@id"]!;
  }
);

function onNestedUpdateDialogFocus(match: Match) {
  emit("onUpdateDialogFocus", match);
}

function isEmptyMatch() {
  if (!isObjectHasKeys(editMatch)) return true;
  return (
    JSON.stringify(editMatch) === JSON.stringify({ match: [], boolMatch: "and" }) ||
    JSON.stringify(editMatch) === JSON.stringify({ match: [], boolMatch: "and", exclude: false })
  );
}
</script>

<style scoped>
.edit-match-container {
  width: 99%;
  padding: 0.5rem;
  border: var(--p-immatch-editor-border-color) 1px solid;
  border-radius: 5px;
  background-color: var(--p-immatch-editor-background-color);
  margin: 0.5rem;
  flex: 1;
  cursor: pointer;
}

.edit-match-container:deep(.hover-button) {
  color: #00000030 !important;
  border-style: dashed !important;
}

.hover-edit-match-container {
  width: 99%;
  padding: 0.5rem;
  border-radius: 5px;
  background-color: #6bb28c10;
  margin: 0.5rem;
  flex: 1;
  border: var(--p-immatch-editor-hover-border-color) 1px solid;
}

.match-description {
  width: 100%;
  height: 100%;
}

.feature-group,
.where-group {
  width: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 0.2rem;
}

.feature-list,
.where-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  gap: 0.2rem;
}

.feature-bracket-group {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row;
}

.then-title {
  padding-top: 0.5rem;
}

.edit-match-wrapper {
  display: flex;
  width: 100%;
  padding: 0.1rem;
}

.add-property-button {
  width: 10rem;
  margin-top: 0.5rem;
  margin-left: 1rem;
}

.expanding-button {
  align-self: stretch;
}

.left-container {
  display: flex;
  align-items: center;
}

.group-checkbox {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.nested-match {
  display: flex;
}

.strike-through {
  text-decoration: line-through;
}

.builder-button {
  width: 2rem;
}

.vertical-button {
  writing-mode: vertical-lr;
  transform: scale(-1);
  align-self: stretch;
}

.hover-button {
  color: #00000030 !important;
  border-style: dashed !important;
}

.add-feature-button {
  width: 10rem;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
}
</style>
