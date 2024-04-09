<template>
  <div class="property-description-container">
    <div class="property-description" v-html="editWhere?.description"></div>
    <div v-if="editWhere?.where" class="where-group">
      <div class="where-list">
        <EditWhere
          v-for="nestedWhere in editWhere.where"
          :editWhere="nestedWhere"
          @on-update-dialog-focus="(items: MenuItem[]) => $emit('onUpdateDialogFocus', items)"
        />
      </div>
    </div>
    <EditMatch
      v-if="editWhere?.match"
      :edit-match="editWhere.match"
      @on-update-dialog-focus="(items: MenuItem[]) => $emit('onUpdateDialogFocus', items)"
      @delete-match="onDeleteMatch"
    />
  </div>
</template>

<script setup lang="ts">
import { Where } from "@im-library/interfaces/AutoGen";
import EditMatch from "./EditMatch.vue";
import { MenuItem } from "primevue/menuitem";
interface Props {
  editWhere: Where;
}
const props = defineProps<Props>();
const emit = defineEmits({ onUpdateDialogFocus: (payload: MenuItem[]) => payload });

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
