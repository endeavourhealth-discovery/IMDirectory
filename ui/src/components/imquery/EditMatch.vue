<template>
  <div class="edit-match-wrapper">
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
            v-for="nestedWhere in editMatch.where"
            :edit-where="nestedWhere"
            :focused="editMatch['@id'] === focusedId"
            :focused-id="focusedId"
            :match-type-of-iri="editMatch.typeOf?.['@id'] ?? matchTypeOfIri"
            @on-update-dialog-focus="onNestedUpdateDialogFocus"
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
import { Match } from "@im-library/interfaces/AutoGen";
import MatchSelector from "./MatchSelector.vue";
import EditWhere from "./EditWhere.vue";
import setupHover from "@/composables/setupHover";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
import { MenuItem } from "primevue/menuitem";

interface Props {
  isRootFeature?: boolean;
  editMatch: Match;
  matchTypeOfIri: string;
  focusedId: string | undefined;
}
const props = defineProps<Props>();
const emit = defineEmits({ onUpdateDialogFocus: (payload: MenuItem[]) => payload, deleteMatch: (payload: string) => payload });

const { hover, mouseout, mouseover } = setupHover();
const { getMenuItemFromMatch, isFlatMatch } = setupIMQueryBuilderActions();

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
</style>
