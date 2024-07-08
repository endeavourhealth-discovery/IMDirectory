<template>
  <div class="edit-match-wrapper">
    <Button
      :severity="editMatch.exclude ? 'danger' : 'secondary'"
      :outlined="!editMatch.exclude"
      label="NOT"
      @click.stop="editMatch!.exclude = !editMatch!.exclude"
      class="builder-button exclude-button vertical-button not-button"
      :class="!editMatch.exclude && 'hover-button'"
      v-tooltip="'Exclude'"
      size="small"
    />
    <div
      :class="[hover ? 'hover-edit-match-container' : 'edit-match-container']"
      class=""
      @mouseover.stop="hover = true"
      @mouseout.stop="hover = false"
      @click.stop="emit('onUpdateDialogFocus', [getMenuItemFromMatch(props.editMatch)])"
    >
      <MatchSelector v-if="focusedId === editMatch['@id'] && isFlatMatch(editMatch)" :editMatch="editMatch" />
      <div v-else v-html="editMatch?.description" />

      <div v-if="editMatch?.match" class="feature-group">
        <Button
          v-if="isBooleanEditor"
          class="expanding-button builder-button conjunction-button vertical-button"
          :label="editMatch.boolMatch?.toUpperCase() ?? 'AND'"
          @click.stop="toggleMatchBool(editMatch)"
        />
        <div class="feature-bracket-group">
          <div class="feature-list">
            <div class="nested-match" v-for="[index, nestedMatch] in editMatch.match.entries()">
              <span class="left-container" v-if="isBooleanEditor">
                <div class="group-checkbox">
                  <Checkbox :inputId="'group' + index" name="Group" :value="index" v-model="group" @click.stop />
                  <label :for="'group' + index">Select</label>
                </div>
                <Button
                  v-if="group.includes(index)"
                  icon="fa-solid fa-brackets-curly"
                  severity="help"
                  @click.stop="bracketItems()"
                  :disabled="!group.length"
                  v-tooltip="'Bracket selected items'"
                />
              </span>
              <EditMatch
                :editMatch="nestedMatch"
                :focused-id="focusedId"
                :is-boolean-editor="isBooleanEditor"
                @on-update-dialog-focus="onNestedUpdateDialogFocus"
                @delete-match="onDeleteMatch"
                @ungroup-matches="ungroupMatches"
              />
            </div>
            <Button
              type="button"
              label="Add feature"
              icon="fa-solid fa-plus"
              aria-haspopup="true"
              aria-controls="overlay_menu"
              severity="success"
              class="add-feature-button"
              @click.stop="event => addFeatureMenu.toggle(event)"
              :disabled="!selectedBaseType"
            />
            <Menu ref="addFeatureMenu" id="overlay_menu" :model="addOptions" :popup="true" />
            <AddMatch
              v-model:show-add-feature="showAddFeature"
              v-model:show-add-population="showAddPopulation"
              v-model:show-build-feature="showBuildFeature"
              v-model:show-build-then-feature="showBuildThenFeature"
              :edit-match="editMatch"
              :match-type-of-iri="selectedBaseType?.iri!"
            />
          </div>
          <Button
            v-if="!isRootFeature && editMatch?.match?.length > 1 && isBooleanEditor"
            class="builder-button group-button"
            severity="warning"
            icon="fa-solid fa-brackets-curly"
            :outlined="!hover"
            :class="[!hover && 'hover-button', 'strike-through']"
            @click.stop="emit('ungroupMatches', editMatch)"
            v-tooltip="'Remove brackets'"
          />
        </div>
      </div>
      <div v-if="editMatch?.where" class="where-group">
        <Button
          v-if="editMatch.where.length > 1"
          class="expanding-button builder-button conjunction-button vertical-button"
          :label="editMatch.boolWhere?.toUpperCase() ?? 'AND'"
          @click.stop="toggleWhereBool(editMatch)"
        />
        <div class="where-list">
          <EditWhere
            v-for="[index, nestedWhere] in editMatch.where.entries()"
            :edit-where="nestedWhere"
            :focused="!isBooleanEditor && editMatch['@id'] === focusedId"
            :focused-id="focusedId"
            :match-type-of-iri="typeOf ?? props.parentMatchType ?? selectedBaseType?.iri"
            :is-boolean-editor="isBooleanEditor"
            @on-update-dialog-focus="onNestedUpdateDialogFocus"
            @delete-property="editMatch.where?.splice(index, 1)"
          />

          <AddPropertyDialog
            v-model:show-dialog="showAddPropertyDialog"
            :dataModelIri="typeOf ?? props.parentMatchType ?? selectedBaseType?.iri"
            :header="'Add property'"
            :show-variable-options="false"
            @on-match-add="onMatchAdd"
            @on-property-add="onPropertyAdd"
          />
          <Button
            v-if="!isBooleanEditor && editMatch['@id'] === focusedId"
            label="Add property"
            severity="success"
            icon="fa-solid fa-plus"
            class="add-property-button"
            @click="showAddPropertyDialog = true"
          />
        </div>
      </div>
      <div v-if="editMatch.then">
        <div class="then-title">Then</div>
        <EditMatch
          :editMatch="editMatch.then"
          :focused-id="focusedId"
          :parent-match-type="typeOf ?? props.parentMatchType ?? selectedBaseType?.iri"
          :is-boolean-editor="isBooleanEditor"
          @on-update-dialog-focus="onNestedUpdateDialogFocus"
          @delete-match="onDeleteMatch"
        />
      </div>
      <EditOrderBy v-if="focusedId === editMatch['@id'] && editMatch.orderBy" :editMatch="editMatch" :order-by="editMatch.orderBy" :dm-iri="typeOf" />
      <div v-else-if="editMatch.orderBy" v-html="editMatch.orderBy.description" />
    </div>
    <Button
      v-if="!isRootFeature"
      severity="danger"
      icon="fa-solid fa-trash"
      class="builder-button"
      @click.stop="emit('deleteMatch', props.editMatch['@id']!)"
    />
  </div>
</template>

<script setup lang="ts">
import { Bool, Match, SearchResultSummary, Where } from "@im-library/interfaces/AutoGen";
import MatchSelector from "./MatchSelector.vue";
import EditWhere from "./EditWhere.vue";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import { MenuItem } from "primevue/menuitem";
import { Ref, inject, onMounted, ref, watch } from "vue";
import EditOrderBy from "./EditOrderBy.vue";
import { cloneDeep } from "lodash-es";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import AddPropertyDialog from "./AddPropertyDialog.vue";
import AddMatch from "./AddMatch.vue";

interface Props {
  isRootFeature?: boolean;
  editMatch: Match;
  focusedId?: string;
  parentMatchType?: string;
  isBooleanEditor?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits({
  onUpdateDialogFocus: (payload: MenuItem[]) => payload,
  deleteMatch: (payload: string) => payload,
  ungroupMatches: (payload: Match) => payload
});
const addFeatureMenu = ref();
const hover: Ref<boolean> = ref(false);
const { getMenuItemFromMatch, isFlatMatch, toggleMatchBool, toggleWhereBool, getTypeOfMatch } = setupIMQueryBuilderActions();
const group: Ref<number[]> = ref([]);
const typeOf: Ref<string> = ref("");
const selectedBaseType = inject("selectedBaseType") as Ref<SearchResultSummary | undefined>;
const fullQuery = inject("fullQuery") as Ref<Match | undefined>;
const showAddPropertyDialog: Ref<boolean> = ref(false);
const showAddPopulation: Ref<boolean> = ref(false);
const showBuildFeature: Ref<boolean> = ref(false);
const showBuildThenFeature: Ref<boolean> = ref(false);
const showAddFeature: Ref<boolean> = ref(false);
const addOptions = [
  {
    label: "Add new feature",
    command: () => {
      showBuildFeature.value = true;
    }
  },
  {
    label: "Add parent cohort",
    command: () => {
      showAddPopulation.value = true;
    }
  },
  {
    label: "Add existing feature",
    command: () => {
      showAddFeature.value = true;
    }
  }
];
onMounted(() => {
  if (fullQuery.value) typeOf.value = getTypeOf(fullQuery.value);
});

watch(
  () => cloneDeep(props.editMatch),
  () => {
    if (fullQuery.value) typeOf.value = typeOf.value = getTypeOf(fullQuery.value);
  }
);

function onNestedUpdateDialogFocus(menuItems: MenuItem[]) {
  menuItems.unshift(getMenuItemFromMatch(props.editMatch));
  emit("onUpdateDialogFocus", menuItems);
}

function onDeleteMatch(matchId: string) {
  if (props.editMatch.match) props.editMatch.match = props.editMatch.match?.filter(nestedMatch => nestedMatch["@id"] !== matchId);
  if (props.editMatch.then && props.editMatch.then["@id"] === matchId) delete props.editMatch.then;
}

function onPropertyAdd(property: Where) {
  const hasProperty = props.editMatch.where?.some(where => where["@id"] === property["@id"]);
  if (!hasProperty) {
    props.editMatch.where?.push(property);
    describeMatch(props.editMatch, 0, false);
  }
}

function onMatchAdd(match: Match) {
  if (!isArrayHasLength(props.editMatch.match)) props.editMatch.match = [];
  props.editMatch.match?.push(match);
}

function bracketItems() {
  if (group.value.length) {
    const newMatch: Match = { boolMatch: Bool.and, match: [] };
    for (const index of group.value.toSorted((a, b) => a - b).toReversed()) {
      if (props.editMatch.match) {
        const nestedMatch = props.editMatch.match.splice(index, 1)[0];
        newMatch.match?.push(nestedMatch);
      }
    }
    props.editMatch.match?.push(newMatch);
  }
  group.value = [];
}

function ungroupMatches(nestedMatch: Match) {
  if (nestedMatch.match) {
    for (const match of nestedMatch.match) {
      props.editMatch.match?.push(match);
    }

    const index = props.editMatch.match?.findIndex(match => nestedMatch["@id"] === match["@id"]);
    if (index !== -1) props.editMatch.match?.splice(index!, 1);
  }
}

function getTypeOf(fullQuery: Match) {
  return props.editMatch.typeOf?.["@id"] ?? getTypeOfMatch(fullQuery, props.editMatch["@id"]!) ?? props.parentMatchType ?? selectedBaseType.value?.iri;
}
</script>

<style scoped>
.edit-match-container {
  width: 99%;
  padding: 0.5rem;
  border: var(--p-imquery-editor-border-color) 1px solid;
  border-radius: 5px;
  background-color: var(--p-imquery-editor-background-color);
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
  border: var(--p-imquery-editor-hover-border-color) 1px solid;
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

.add-feature-button {
  width: 15%;
  display: flex;
  margin-top: 0.3rem;
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
</style>
