<template>
  <div class="match-description-wrapper">
    <Button
      v-if="match.exclude"
      :severity="'danger'"
      label="NOT"
      outlined
      disabled
      class="builder-button exclude-button vertical-button not-button"
      v-tooltip="'Exclude'"
      size="small"
    />
    <div v-if="match" class="match-description-container">
      <div v-if="match.description" class="match-description" v-html="match.description"></div>
      <div v-if="match.match" class="feature-group">
        <Button class="builder-button conjunction-button vertical-button" :label="match.bool?.toUpperCase() ?? 'AND'" severity="secondary" disabled outlined />
        <div class="feature-list">
          <MatchDisplay v-for="(nestedMatch, index) in match.match" :match="nestedMatch" class="match-display" v-bind:key="index" />
        </div>
      </div>
      <div v-if="match.where" class="where-group">
        <Button
          v-if="match.where.length > 1"
          class="builder-button conjunction-button vertical-button"
          :label="match.bool?.toUpperCase() ?? 'AND'"
          severity="secondary"
          disabled
          outlined
        />
        <div class="where-list"><WhereDisplay v-for="(nestedWhere, index) in match.where" :where="nestedWhere" v-bind:key="index" /></div>
      </div>
      <div v-if="match.orderBy" v-html="match.orderBy.description" />
      <div v-if="match.variable" class="variable-display">
        <div class="saved-as">saved as</div>
        <div class="variable">{{ match.variable }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Match } from "@/interfaces/AutoGen";
import WhereDisplay from "./WhereDisplay.vue";

defineProps<{
  match: Match;
}>();
</script>

<style scoped>
.match-description-container {
  width: 100%;
  display: flex;
  flex-flow: column;
}

.match-description-wrapper {
  width: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
}

.match-description {
  width: 100%;
  height: 100%;
}

.feature-group,
.where-group {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  overflow: auto;
  width: 100%;
  gap: 0.2rem;
}

.feature-list,
.where-list {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column;
  overflow: auto;
  gap: 0.2rem;
}

.match-display {
  width: 100%;
  height: 100%;
}

.variable-display {
  display: flex;
  padding-top: 1rem;
  padding-left: 1rem;
}

.saved-as {
  padding-right: 0.5rem;
}

.builder-button {
  width: 2rem;
}

.not-button {
  align-self: stretch;
}

.vertical-button {
  writing-mode: vertical-lr;
  transform: scale(-1);
  align-self: stretch;
}
</style>
