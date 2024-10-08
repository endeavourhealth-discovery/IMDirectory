<template>
  <div class="property-description-container">
    <div v-if="editWhere.name && !editWhere.displayLabel && editWhere?.match" v-html="editWhere.name"></div>
    <EditProperty
      v-if="focused && !editWhere?.match"
      :property="editWhere"
      :data-model-iri="matchTypeOfIri"
      :edit-match="parentMatch"
      @delete-property="$emit('deleteProperty')"
    />
    <div v-else-if="editWhere.displayLabel" class="property-description">{{ editWhere.displayLabel }}</div>

    <div v-if="editWhere?.where" class="where-group">
      <div class="where-list">
        <Button
          class="builder-button conjunction-button vertical-button"
          :label="editWhere.boolWhere?.toUpperCase() ?? 'AND'"
          @click="
            (e: MouseEvent) => {
              e.stopPropagation();
              toggleWhereBool(editWhere);
            }
          "
        />
        <EditWhere
          v-for="[index, nestedWhere] in editWhere.where.entries()"
          :focused="focused"
          :focused-id="focusedId"
          :match-type-of-iri="matchTypeOfIri"
          :editWhere="nestedWhere"
          :is-boolean-editor="isBooleanEditor"
          :parent-match="parentMatch"
          @on-update-dialog-focus="(items: MenuItem[]) => $emit('onUpdateDialogFocus', items)"
          @delete-property="editWhere.where?.splice(index, 1)"
        />
      </div>
    </div>
    <EditMatch
      v-if="editWhere?.match"
      :edit-match="editWhere.match"
      :focused-id="focusedId"
      :is-boolean-editor="isBooleanEditor"
      @on-update-dialog-focus="(items: MenuItem[]) => $emit('onUpdateDialogFocus', items)"
      @delete-match="onDeleteMatch"
    />
  </div>
</template>

<script setup lang="ts">
import { Match, Where } from "@im-library/interfaces/AutoGen";
import EditMatch from "./EditMatch.vue";
import { MenuItem } from "primevue/menuitem";
import EditProperty from "./EditProperty.vue";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
interface Props {
  matchTypeOfIri: string;
  editWhere: Where;
  focused: boolean;
  focusedId: string | undefined;
  isBooleanEditor?: boolean;
  parentMatch: Match;
}
const props = defineProps<Props>();
const emit = defineEmits({ onUpdateDialogFocus: (payload: MenuItem[]) => payload, deleteProperty: () => true });
const { toggleWhereBool } = setupIMQueryBuilderActions();

function onDeleteMatch(matchId: string) {
  if (props.editWhere.match && props.editWhere.match["@id"] === matchId) delete props.editWhere.match;
}
</script>

<style scoped>
.property-description-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
}
.property-description {
  width: calc(100% - 1rem);
  height: 100%;
  margin-left: 1rem;
}

.where-list {
  display: flex;
  width: 100%;
}

.where-group {
  display: flex;
  width: 100%;
}

.builder-button {
  width: 2rem;
}

.vertical-button {
  writing-mode: vertical-lr;
  transform: scale(-1);
}
</style>
