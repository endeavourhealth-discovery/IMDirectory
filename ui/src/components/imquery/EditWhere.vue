<template>
  <div class="property-description-container">
    <div class="property-description" v-html="editWhere?.description"></div>
    <div v-if="editWhere?.where" class="where-group">
      <Button v-if="editWhere.where.length > 1" class="builder-button conjunction-button vertical-button" :label="editWhere.bool?.toUpperCase() ?? 'AND'" />
      <div class="where-list"><EditWhere v-for="nestedWhere in editWhere.where" :editWhere="nestedWhere" /></div>
    </div>
    <EditMatch v-if="editWhere?.match" :edit-match="editWhere.match" />
  </div>
</template>

<script setup lang="ts">
import { Where } from "@im-library/interfaces/AutoGen";
import EditMatch from "./EditMatch.vue";
interface Props {
  editWhere: Where;
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

.where-list {
  display: flex;
  width: 100%;
}

.where-group {
  display: flex;
  width: 100%;
}
</style>
