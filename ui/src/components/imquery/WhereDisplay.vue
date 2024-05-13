<template>
  <div class="property-description-container">
    <MatchDisplay v-if="where?.match" :match="where.match" />
    <div v-if="where?.where" class="where-group">
      <Button
        v-if="where.where.length > 1"
        text
        class="builder-button conjunction-button vertical-button"
        :label="where.boolWhere?.toUpperCase() ?? 'AND'"
        severity="secondary"
        disabled
      />
      <div class="where-list"><WhereDisplay v-for="nestedWhere in where.where" :where="nestedWhere" /></div>
    </div>
    <div class="property-description" v-html="where?.description"></div>
  </div>
</template>

<script setup lang="ts">
import { Where } from "@im-library/interfaces/AutoGen";
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
  width: 100%;
  height: 100%;
  margin-left: 1rem;
}
</style>
