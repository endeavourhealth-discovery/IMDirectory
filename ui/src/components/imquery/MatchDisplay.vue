<template>
  <div class="match-description-container">
    <div class="match-description" v-html="match?.description"></div>
    <div v-if="match?.match" class="feature-group">
      <Button class="builder-button conjunction-button vertical-button" :label="match.bool?.toUpperCase()" disabled />
      <div class="feature-list"><MatchDisplay v-for="nestedMatch in match.match" :match="nestedMatch" /></div>
    </div>
    <WhereDisplay v-if="match?.where" v-for="nestedWhere in match.where" :where="nestedWhere" />
  </div>
</template>

<script setup lang="ts">
import { Match } from "@im-library/interfaces/AutoGen";
import WhereDisplay from "./WhereDisplay.vue";

interface Props {
  match: Match;
}
const props = defineProps<Props>();
</script>

<style scoped>
.match-description-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
}
.match-description {
  width: 100%;
  height: 100%;
  margin-left: 0.1rem;
}

.feature-group {
  display: flex;
  flex-flow: row;
}

.feature-list {
  display: flex;
  flex-flow: column;
}
</style>
