<template>
  <div class="property-description-container">
    <EditProperty v-if="focused && !editWhere?.match" :property="editWhere" :data-model-iri="matchTypeOfIri" @delete-property="$emit('deleteProperty')" />
    <div v-else class="property-description" v-html="editWhere?.description"></div>

    <div v-if="editWhere?.where" class="where-group">
      <div class="where-list">
        <EditWhere
          v-for="[index, nestedWhere] in editWhere.where.entries()"
          :focused="focused"
          :focused-id="focusedId"
          :match-type-of-iri="matchTypeOfIri"
          :editWhere="nestedWhere"
          @on-update-dialog-focus="(items: MenuItem[]) => $emit('onUpdateDialogFocus', items)"
          @delete-property="editWhere.where?.splice(index, 1)"
        />
      </div>
    </div>
    <EditMatch
      v-if="editWhere?.match"
      :edit-match="editWhere.match"
      :match-type-of-iri="matchTypeOfIri"
      :focused-id="focusedId"
      @on-update-dialog-focus="(items: MenuItem[]) => $emit('onUpdateDialogFocus', items)"
      @delete-match="onDeleteMatch"
    />
  </div>
</template>

<script setup lang="ts">
import { Where } from "@im-library/interfaces/AutoGen";
import EditMatch from "./EditMatch.vue";
import { MenuItem } from "primevue/menuitem";
import EditProperty from "./EditProperty.vue";
interface Props {
  matchTypeOfIri: string;
  editWhere: Where;
  focused: boolean;
  focusedId: string | undefined;
}
const props = defineProps<Props>();
const emit = defineEmits({ onUpdateDialogFocus: (payload: MenuItem[]) => payload, deleteProperty: () => true });

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
  width: 100%;
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
</style>
