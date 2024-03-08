<template>
  <div class="property-description-container">
    <div class="property-description" v-html="property?.description"></div>
    <MatchDisplay v-if="property?.match" :match="property.match" />
    <PropertyDisplay v-if="property?.property" v-for="nestedProperty in property.property" :property="nestedProperty" />
  </div>
</template>

<script setup lang="ts">
import { Property } from "@im-library/interfaces/AutoGen";
import MatchDisplay from "./MatchDisplay.vue";
interface Props {
  property: Property;
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
