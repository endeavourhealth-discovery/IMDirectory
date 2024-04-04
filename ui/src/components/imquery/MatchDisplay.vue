<template>
  <div class="match-description-container">
    <div class="match-description" v-html="match?.description"></div>
    <div v-if="match?.match" class="feature-group">
      <Button
        class="builder-button conjunction-button vertical-button"
        :label="match.bool?.toUpperCase()"
        @click="
          e => {
            e.stopPropagation();
            toggleBool(match);
          }
        "
      />
      <div class="feature-list"><MatchDisplay v-for="nestedMatch in match.match" :match="nestedMatch" /></div>
    </div>
    <div v-if="match?.where" class="where-group">
      <Button
        v-if="match.where.length > 1"
        class="builder-button conjunction-button vertical-button"
        :label="match.bool?.toUpperCase() ?? 'AND'"
        @click="
          e => {
            e.stopPropagation();
            toggleBool(match);
          }
        "
      />
      <div class="where-list"><WhereDisplay v-for="nestedWhere in match.where" :where="nestedWhere" /></div>
    </div>
    <div v-if="match.then">
      <div class="then-title">Then</div>
      <MatchDisplay :match="match.then" />
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

const { toggleBool } = setupIMQueryBuilderActions();
</script>

<style scoped>
.match-description-container {
  width: 100%;
  height: 50%;
  display: flex;
  flex-flow: column;
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
