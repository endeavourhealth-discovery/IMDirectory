<template>
  <div v-if="show" class="container" :style="{ width: size }" :id="id">
    <strong class="label" data-testid="label">{{ label }}: </strong>
    <span v-if="data && isObjectWithName" class="data break-text" data-testid="text">
      {{ data.name }}
    </span>
    <span v-else class="data">None</span>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent } from "vue";
import { isObjectHasKeys } from "../../../helpers/modules/DataTypeCheckers";
import LoggerService from "../../../services/modules/LoggerService";

const props = defineProps({
  label: { type: String, required: true },
  data: { type: Object, required: true },
  size: { type: String, default: "100%" },
  id: { type: String, default: "object-name-with-label" },
  show: { type: Boolean, required: true }
});

const isObjectWithName = computed(() => isObjectHasKeys(props.data, ["name"]));
</script>

<style scoped>
.container {
  margin: 0;
  padding: 0.25rem 0.5rem 0 0;
}

.break-text {
  word-break: break-all;
}
</style>
