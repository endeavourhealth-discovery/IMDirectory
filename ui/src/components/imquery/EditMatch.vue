<template>
  <div :class="[hover ? 'hover-edit-match-container' : 'edit-match-container']" class="" @mouseover="mouseover" @mouseout="mouseout">
    <MatchSelector :editMatch="editMatch" v-if="!isPathMatch(editMatch)" />
    <div v-else v-html="editMatch?.description" />
    <div v-if="editMatch?.match" class="feature-group">
      <div class="feature-list"><EditMatch v-for="nestedMatch in editMatch.match" :editMatch="nestedMatch" /></div>
    </div>
    <div v-if="editMatch?.where" class="where-group">
      <div class="where-list"><EditWhere v-for="nestedWhere in editMatch.where" :edit-where="nestedWhere" /></div>
    </div>
    <div v-if="editMatch.then">
      <div class="then-title">Then</div>
      <EditMatch :editMatch="editMatch.then" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Match } from "@im-library/interfaces/AutoGen";
import MatchSelector from "./MatchSelector.vue";
import EditWhere from "./EditWhere.vue";
import setupHover from "@/composables/setupHover";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";

interface Props {
  editMatch: Match;
}
const props = defineProps<Props>();

const { hover, mouseout, mouseover } = setupHover();
const { isPathMatch } = setupIMQueryBuilderActions();
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
</style>
