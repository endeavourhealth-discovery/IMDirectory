<template>
  <div class="container" :style="{ width: size }" :id="id">
    <strong class="label" data-testid="label">{{ label }}: </strong>
    <span v-if="data && isObjectWithName" class="data break-text" data-testid="text">
      {{ data.name }}
    </span>
    <span v-else class="data">None</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

interface Props {
  label: string;
  data: any;
  size?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "100%",
  id: "object-name-with-label"
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
