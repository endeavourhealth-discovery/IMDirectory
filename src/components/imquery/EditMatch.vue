<template>
  <div class="edit-match-wrapper">
    <Button
      v-if="!isEmptyMatch()"
      v-tooltip="'Exclude'"
      :class="!editMatch.exclude && 'hover-button'"
      :outlined="!editMatch.exclude"
      :severity="editMatch.exclude ? 'danger' : 'secondary'"
      class="builder-button exclude-button vertical-button not-button"
      label="NOT"
      size="small"
      @click.stop="editMatch!.exclude = !editMatch!.exclude"
    />
    <div
      :class="[hover ? 'hover-edit-match-container' : 'edit-match-container']"
      class=""
      @mouseover.stop="hover = true"
      @mouseout.stop="hover = false"
      @click.stop="emit('onUpdateDialogFocus', [getMenuItemFromMatch(props.editMatch)])"
    >
      <MatchSelector
        v-if="focusedId === editMatch['@id'] && isFlatMatch(editMatch)"
        :dataModelIri="typeOf ?? props.parentMatchType ?? selectedBaseType?.iri"
        :editMatch="editMatch"
      />
      <div v-else-if="editMatch?.typeOf?.name">{{ editMatch.typeOf.name }}</div>
      <div v-else-if="editMatch?.instanceOf">
        {{ editMatch.instanceOf.map(instanceOf => instanceOf.qualifier + " " + instanceOf.name).join(",") }}
      </div>
      <div v-else-if="editMatch?.name">{{ editMatch?.name }}</div>
      <div v-if="editMatch?.match" class="feature-group">
        <Button
          v-if="isBooleanEditor && editMatch?.match.length > 1"
          :label="editMatch.boolMatch?.toUpperCase() ?? 'AND'"
          class="p-button-secondary p-button-outlined expanding-button builder-button conjunction-button vertical-button"
          @click.stop="toggleMatchBool(editMatch)"
        />
        <div class="feature-bracket-group">
          <div class="feature-list">
            <div v-for="[index, nestedMatch] in editMatch.match.entries()" class="nested-match">
              <span v-if="isBooleanEditor" class="left-container">
                <div class="group-checkbox">
                  <Checkbox v-model="group" :inputId="'group' + index" :value="index" name="Group" @click.stop />
                  <label :for="'group' + index">Select</label>
                </div>
                <Button
                  v-if="group.includes(index)"
                  v-tooltip="'Bracket selected items'"
                  :disabled="!group.length"
                  icon="fa-solid fa-brackets-curly"
                  severity="help"
                  @click.stop="bracketItems()"
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
              :disabled="!selectedBaseType"
              aria-controls="overlay_menu"
              aria-haspopup="true"
              class="add-feature-button"
              icon="fa-solid fa-plus"
              label="Add feature"
              severity="success"
              type="button"
              @click.stop="showBuildFeature = true"
            />
            <AddMatch
              v-model:show-build-feature="showBuildFeature"
              v-model:show-build-then-feature="showBuildThenFeature"
              :edit-match="editMatch"
              :match-type-of-iri="selectedBaseType?.iri!"
              @add-feature="onMatchAdd"
              @add-then="onThenAdd"
            />
          </div>
          <Button
            v-if="!isRootFeature && editMatch?.match?.length > 1 && isBooleanEditor"
            v-tooltip="'Remove brackets'"
            :class="[!hover && 'hover-button', 'strike-through']"
            :outlined="!hover"
            class="builder-button group-button"
            icon="fa-solid fa-brackets-curly"
            severity="warning"
            @click.stop="emit('ungroupMatches', editMatch)"
          />
        </div>
      </div>
      <div v-if="editMatch?.where" class="where-group">
        <Button
          v-if="editMatch.where.length > 1"
          :label="editMatch.boolWhere?.toUpperCase() ?? 'AND'"
          class="p-button-secondary p-button-outlined expanding-button builder-button conjunction-button vertical-button"
          @click.stop="toggleWhereBool(editMatch)"
        />
        <div class="where-list">
          <EditWhere
            v-for="[index, nestedWhere] in editMatch.where.entries()"
            :edit-where="nestedWhere"
            :focused="!isBooleanEditor && editMatch['@id'] === focusedId"
            :focused-id="focusedId"
            :is-boolean-editor="isBooleanEditor"
            :match-type-of-iri="typeOf ?? props.parentMatchType ?? selectedBaseType?.iri"
            :parent-match="editMatch"
            @on-update-dialog-focus="onNestedUpdateDialogFocus"
            @delete-property="editMatch.where?.splice(index, 1)"
          />

          <Dialog v-model:visible="showAddPropertyDialog" :header="'Add property'" :style="{ minWidth: '50vw' }" maximizable modal>
            <AddProperty
              :dataModelIri="typeOf ?? props.parentMatchType ?? selectedBaseType?.iri"
              :match="editMatch"
              :show-variable-options="false"
              @on-match-add="onMatchAdd"
              @on-property-add="onPropertyAdd"
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
      <div v-if="editMatch.then">
        <div class="then-title">Then</div>
        <EditMatch
          :editMatch="editMatch.then"
          :focused-id="focusedId"
          :is-boolean-editor="isBooleanEditor"
          :parent-match-type="typeOf ?? props.parentMatchType ?? selectedBaseType?.iri"
          @on-update-dialog-focus="onNestedUpdateDialogFocus"
          @delete-match="onDeleteMatch"
        />
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
      @click.stop="emit('deleteMatch', props.editMatch['@id']!)"
      @mouseover.stop="hover = true"
      @mouseout.stop="hover = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { Bool, Match, Query, SearchResultSummary, Where } from "@/interfaces/AutoGen";
import MatchSelector from "./MatchSelector.vue";
import EditWhere from "./EditWhere.vue";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import type { MenuItem } from "primevue/menuitem";
import { inject, onMounted, Ref, ref, watch } from "vue";
import EditOrderBy from "./EditOrderBy.vue";
import { cloneDeep } from "lodash-es";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import AddProperty from "./AddProperty.vue";
import AddMatch from "./AddMatch.vue";
import { QueryService } from "@/services";

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
const hover: Ref<boolean> = ref(false);
const { getMenuItemFromMatch, isFlatMatch, toggleMatchBool, toggleWhereBool, getTypeOfMatch } = setupIMQueryBuilderActions();
const group: Ref<number[]> = ref([]);
const typeOf: Ref<string> = ref("");
const selectedBaseType = inject("selectedBaseType") as Ref<SearchResultSummary | undefined>;
const fullQuery = inject("fullQuery") as Ref<Match | undefined>;
const showAddPropertyDialog: Ref<boolean> = ref(false);
const showBuildFeature: Ref<boolean> = ref(false);
const showBuildThenFeature: Ref<boolean> = ref(false);

onMounted(() => {
  if (fullQuery.value) typeOf.value = getTypeOf(fullQuery.value);
});

watch(
  () => cloneDeep(props.editMatch),
  () => {
    if (fullQuery.value) typeOf.value = getTypeOf(fullQuery.value);
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

async function onPropertyAdd(property: Where) {
  if (!props.editMatch.where) props.editMatch.where = [];
  const propertyIndex = props.editMatch.where.findIndex(where => where["@id"] === property["@id"]);
  if (propertyIndex && propertyIndex !== -1) {
    props.editMatch.where[propertyIndex] = property;
  } else {
    props.editMatch.where.push(property);
  }
  const describedMatch = await QueryService.getQueryDisplayFromQuery({ match: [props.editMatch] } as Query, false);
  if (describedMatch?.match?.[0]?.where) props.editMatch.where = describedMatch.match?.[0].where;
}

function onMatchAdd(match: Match) {
  if (!isArrayHasLength(props.editMatch.match)) props.editMatch.match = [];
  props.editMatch.match?.push(match);
}

function onThenAdd(match: Match) {
  props.editMatch.then = match;
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

function isEmptyMatch() {
  if (!isObjectHasKeys(props.editMatch)) return true;
  return (
    JSON.stringify(props.editMatch) === JSON.stringify({ match: [], boolMatch: "and" }) ||
    JSON.stringify(props.editMatch) === JSON.stringify({ match: [], boolMatch: "and", exclude: false })
  );
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
