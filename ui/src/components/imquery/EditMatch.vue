<template>
  <div class="edit-match-wrapper">
    <Button
      :severity="editMatch.exclude ? 'danger' : 'secondary'"
      :outlined="!editMatch.exclude"
      label="NOT"
      @click="editMatch!.exclude = !editMatch!.exclude"
      class="builder-button exclude-button vertical-button not-button"
      :class="!editMatch.exclude && 'hover-button'"
      v-tooltip="'Exclude'"
      size="small"
    />
    <div
      :class="[hover ? 'hover-edit-match-container' : 'edit-match-container']"
      class=""
      @mouseover="mouseover"
      @mouseout="mouseout"
      @click="updateDialogFocus"
    >
      <MatchSelector v-if="focusedId === editMatch['@id'] && isFlatMatch(editMatch)" :editMatch="editMatch" />
      <div v-else v-html="editMatch?.description" />

      <div v-if="editMatch?.match" class="feature-group">
        <Button
          class="builder-button conjunction-button vertical-button"
          :label="editMatch.bool?.toUpperCase()"
          @click="
            e => {
              e.stopPropagation();
              toggleMatchBool(editMatch);
            }
          "
        />
        <div class="feature-list">
          <EditMatch
            v-for="nestedMatch in editMatch.match"
            :editMatch="nestedMatch"
            :focused-id="focusedId"
            :match-type-of-iri="editMatch.typeOf?.['@id'] ?? matchTypeOfIri"
            @on-update-dialog-focus="onNestedUpdateDialogFocus"
            @delete-match="onDeleteMatch"
          />
        </div>
      </div>
      <div v-if="editMatch?.where" class="where-group">
        <div class="where-list">
          <EditWhere
            v-for="[index, nestedWhere] in editMatch.where.entries()"
            :edit-where="nestedWhere"
            :focused="editMatch['@id'] === focusedId"
            :focused-id="focusedId"
            :match-type-of-iri="editMatch.typeOf?.['@id'] ?? matchTypeOfIri"
            @on-update-dialog-focus="onNestedUpdateDialogFocus"
            @delete-property="editMatch.where?.splice(index, 1)"
          />
          <AddPropertyDialog
            v-model:show-dialog="showAddPropertyDialog"
            :dataModelIri="matchTypeOfIri"
            :header="'Add property'"
            :show-variable-options="false"
            @on-property-add="(properties: Where[]) => onPropertyAdd(properties)"
          />
          <Button
            v-if="editMatch['@id'] === focusedId"
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
          :match-type-of-iri="editMatch.typeOf?.['@id'] ?? matchTypeOfIri"
          @on-update-dialog-focus="onNestedUpdateDialogFocus"
          @delete-match="onDeleteMatch"
        />
      </div>
    </div>
    <Button v-if="!isRootFeature" severity="danger" icon="fa-solid fa-trash" class="builder-button" @click="onParentDelete" />
  </div>
</template>

<script setup lang="ts">
import { Match, Where } from "@im-library/interfaces/AutoGen";
import MatchSelector from "./MatchSelector.vue";
import EditWhere from "./EditWhere.vue";
import setupHover from "@/composables/setupHover";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import { MenuItem } from "primevue/menuitem";
import AddPropertyDialog from "../query/builder/edit/dialogs/AddPropertyDialog.vue";
import { Ref, ref } from "vue";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

interface Props {
  isRootFeature?: boolean;
  editMatch: Match;
  matchTypeOfIri: string;
  focusedId: string | undefined;
}
const props = defineProps<Props>();
const emit = defineEmits({ onUpdateDialogFocus: (payload: MenuItem[]) => payload, deleteMatch: (payload: string) => payload });
const showAddPropertyDialog: Ref<boolean> = ref(false);
const { hover, mouseout, mouseover } = setupHover();
const { getMenuItemFromMatch, isFlatMatch, toggleMatchBool, toggleWhereBool } = setupIMQueryBuilderActions();

function updateDialogFocus(event: Event) {
  event.stopPropagation();
  emit("onUpdateDialogFocus", [getMenuItemFromMatch(props.editMatch)]);
}

function onNestedUpdateDialogFocus(menuItems: MenuItem[]) {
  menuItems.unshift(getMenuItemFromMatch(props.editMatch));
  emit("onUpdateDialogFocus", menuItems);
}

function onDeleteMatch(matchId: string) {
  if (props.editMatch.match) props.editMatch.match = props.editMatch.match?.filter(nestedMatch => nestedMatch["@id"] !== matchId);
  if (props.editMatch.then && props.editMatch.then["@id"] === matchId) delete props.editMatch.then;
}

function onParentDelete(event: Event) {
  event.stopPropagation();
  emit("deleteMatch", props.editMatch["@id"]!);
}

function onPropertyAdd(properties: Where[]) {
  if (isArrayHasLength(properties)) {
    for (const property of properties) {
      const hasProperty = props.editMatch.where?.some(where => where["@id"] === property["@id"]);
      if (!hasProperty) props.editMatch.where?.push(property);
    }
  }
}
</script>

<style scoped>
.edit-match-container {
  width: 99%;
  padding: 0.5rem;
  border: var(--imquery-editor-border-color) 1px solid;
  border-radius: 5px;
  background-color: var(--imquery-editor-background-color);
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
  border: var(--imquery-editor-hover-border-color) 1px solid;
}

.match-description {
  width: 100%;
  height: 100%;
  margin-left: 0.1rem;
}

.feature-group,
.where-group {
  width: 100%;
  display: flex;
  flex-flow: row;
}

.feature-list,
.where-list {
  width: 100%;
  display: flex;
  flex-flow: column;
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
  width: 10rem;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
}
</style>
