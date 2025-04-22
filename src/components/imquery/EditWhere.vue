<template>
  <div class="property-description-container">
    <EditProperty
      v-if="focused"
      :data-model-iri="matchTypeOfIri"
      :edit-match="parentMatch"
      :property="editWhere"
      @on-edit-property="edit"
      @delete-property="$emit('onDeleteWhere', editWhere!)"
    />

    <div v-else-if="editWhere.valueLabel" class="property-description">
      <span>{{ editWhere.name }} {{ editWhere.qualifier }} {{ editWhere.valueLabel }} </span>
      <span v-if="editWhere.relativeTo">
        relative to {{ editWhere.relativeTo.qualifier }} {{ editWhere.relativeTo.nodeRef }} {{ editWhere.relativeTo.name }}
      </span>
    </div>

    <div v-if="editWhere?.where" class="where-group">
      <div class="where-list">
        <Button
          :label="editWhere.bool?.toUpperCase() ?? 'AND'"
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
          :key="index"
          :editWhere="nestedWhere"
          :focused="focused"
          :focused-id="focusedId"
          :is-boolean-editor="isBooleanEditor"
          :match-type-of-iri="matchTypeOfIri"
          :parent-match="parentMatch"
          @on-edit-where="edit"
          @delete-property="editWhere.where?.splice(index, 1)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Match, Where } from "@/interfaces/AutoGen";
import EditProperty from "./EditProperty.vue";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";

interface Props {
  matchTypeOfIri: string;
  focused: boolean;
  focusedId: string | undefined;
  isBooleanEditor?: boolean;
  parentMatch: Match;
}

const props = defineProps<Props>();
const editWhere = defineModel<Where>("editWhere", { default: {} });
const { toggleWhereBool } = setupIMQueryBuilderActions();
const emit = defineEmits<{
  onEditWhere: [payload: Where];
  onDeleteWhere: [payload: Where];
}>();

function edit(where: Where) {
  emit("onEditWhere", where);
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
