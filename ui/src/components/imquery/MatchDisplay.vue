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
    <div class="match-description-container">
      <div class="match-description" v-html="match?.description"></div>
      <div v-if="match?.match" class="feature-group">
        <Button
          class="builder-button conjunction-button vertical-button"
          :label="match.boolMatch?.toUpperCase() ?? 'AND'"
          severity="secondary"
          disabled
          outlined
        />
        <div class="feature-list"><MatchDisplay v-for="nestedMatch in match.match" :match="nestedMatch" class="match-display" /></div>
      </div>
      <div v-if="match?.where" class="where-group">
        <Button
          v-if="match.where.length > 1"
          class="builder-button conjunction-button vertical-button"
          :label="match.boolWhere?.toUpperCase() ?? 'AND'"
          severity="secondary"
          disabled
          outlined
        />
        <div class="where-list"><WhereDisplay v-for="nestedWhere in match.where" :where="nestedWhere" /></div>
      </div>
      <div v-if="match.orderBy" v-html="match.orderBy.description" />
      <div v-if="match.then">
        <div class="then-title">Then</div>
        <MatchDisplay :match="match.then" />
      </div>
      <div v-if="match.variable" class="variable-display">
        <div class="saved-as">saved as</div>
        <div class="variable">{{ match.variable }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Match } from "@im-library/interfaces/AutoGen";
import WhereDisplay from "./WhereDisplay.vue";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";

interface Props {
  match: Match;
}
const props = defineProps<Props>();

const { toggleMatchBool, toggleWhereBool } = setupIMQueryBuilderActions();
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
  margin-left: 0.1rem;
}

.feature-group,
.where-group {
  display: flex;
  flex-flow: row;
  align-items: center;
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

.bool-display {
  align-items: center;
}
</style>
