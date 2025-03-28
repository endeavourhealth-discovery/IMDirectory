<template>
  <div class="property-description-container">
    <div v-if="where.name && !where.description && where?.match" v-html="where.name"></div>
    <MatchDisplay v-if="where?.match" :match="where.match" />
    <div v-if="where?.where" class="where-group">
      <div v-if="where.where.length > 1" class="vertical-button-container">
        <Button text class="builder-button conjunction-button vertical-button" :label="where.bool?.toUpperCase() ?? 'AND'" severity="secondary" disabled />
      </div>
      <div class="where-list"><WhereDisplay v-for="nestedWhere in where.where" :where="nestedWhere" /></div>
    </div>
    <div class="property-description" v-html="where?.description"></div>
  </div>
</template>

<script setup lang="ts">
import { Where } from "@/interfaces/AutoGen";
import MatchDisplay from "./MatchDisplay.vue";
import setupIMQueryBuilderActions from "@/composables/setupIMQueryBuilderActions";
interface Props {
  where: Where;
}
const props = defineProps<Props>();
const { toggleWhereBool } = setupIMQueryBuilderActions();
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

.vertical-button-container {
  display: flex;
  flex-flow: row nowrap;
  width: fit-content;
  align-self: stretch;
}

.builder-button {
  width: 2rem;
}

.vertical-button {
  writing-mode: vertical-lr;
  transform: scale(-1);
}
</style>
