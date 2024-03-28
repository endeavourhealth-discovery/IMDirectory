<template>
  <div class="property-description-container">
    <div class="property-description" v-html="where?.description"></div>
    <MatchDisplay v-if="where?.match" :match="where.match" />
    <PropertyDisplay v-if="where?.where" v-for="nestedWhere in where.where" :where="nestedWhere" />
  </div>
</template>

<script setup lang="ts">
import { Where } from "@im-library/interfaces/AutoGen";
import MatchDisplay from "./MatchDisplay.vue";
interface Props {
  where: Where;
}
const props = defineProps<Props>();
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
