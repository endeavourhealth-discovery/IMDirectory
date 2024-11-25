<template>
  <div class="property-description-container">
    <EditProperty
      v-if="focused && !editWhere?.match"
      :data-model-iri="matchTypeOfIri"
      :edit-match="parentMatch"
      :property="editWhere"
      @delete-property="$emit('deleteProperty')"
    />

    <div v-else="editWhere.valueLabel" class="property-description">
      <span>{{ editWhere.name }} {{ editWhere.qualifier }} {{ editWhere.valueLabel }} </span>
      <span v-if="editWhere.relativeTo">
        relative to {{ editWhere.relativeTo.qualifier }} {{ editWhere.relativeTo.nodeRef }} {{ editWhere.relativeTo.name }}
      </span>
    </div>

    <div v-if="editWhere?.where" class="where-group">
      <div class="where-list">
        <Button
          :label="editWhere.boolWhere?.toUpperCase() ?? 'AND'"
          class="builder-button conjunction-button vertical-button"
          @click="
            (e: MouseEvent) => {
              e.stopPropagation();
              toggleWhereBool(editWhere);
            }
          "
        />
        <EditWhere
          v-for="[index, nestedWhere] in editWhere.where.entries()"
          :editWhere="nestedWhere"
          :focused="focused"
          :focused-id="focusedId"
          :is-boolean-editor="isBooleanEditor"
          :match-type-of-iri="matchTypeOfIri"
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

<script lang="ts" setup>
import { Match, Where } from "@/interfaces/AutoGen";
import EditMatch from "./EditMatch.vue";
import type { MenuItem } from "primevue/menuitem";
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
