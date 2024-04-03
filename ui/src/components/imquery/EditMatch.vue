<template>
  <div class="edit-match-container">
    <!-- {{ editMatch }} -->
    <!-- Match -->
    <Button
      :severity="editMatch.exclude ? 'danger' : 'secondary'"
      :outlined="!editMatch.exclude"
      label="NOT"
      @click="editMatch.exclude = !editMatch.exclude"
      class="builder-button exclude-button vertical-button not-button"
      :class="!editMatch.exclude && 'hover-button'"
      v-tooltip="'Exclude'"
      size="small"
    />
    <MatchSelector :editMatch="editMatch" />
    <div v-if="editMatch?.match" class="feature-group">
      <Button class="builder-button conjunction-button vertical-button" :label="editMatch.bool?.toUpperCase()" />
      <div class="feature-list"><EditMatch v-for="nestedMatch in editMatch.match" :editMatch="nestedMatch" /></div>
    </div>
    <div v-if="editMatch?.where" class="where-group">
      <Button v-if="editMatch.where.length > 1" class="builder-button conjunction-button vertical-button" :label="editMatch.bool?.toUpperCase() ?? 'AND'" />
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

interface Props {
  editMatch: Match;
}
const props = defineProps<Props>();
</script>

<style scoped>
.edit-match-container {
  width: 100%;
  /* height: 10%; */
  display: flex;
  flex-flow: row;
}
.match-description {
  width: 100%;
  height: 100%;
  margin-left: 0.1rem;
}

.feature-group,
.where-group {
  display: flex;
  flex-flow: row;
}

.feature-list,
.where-list {
  display: flex;
  flex-flow: column;
}

.then-title {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
