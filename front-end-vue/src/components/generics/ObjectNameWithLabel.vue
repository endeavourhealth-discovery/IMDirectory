<template>
  <div class="container" :style="{ width: size }">
    <strong class="label">{{ label }}: </strong>
    <span v-if="isObjectWithName" class="data break-text">
      {{ data.name }}
    </span>
    <span v-else class="data">None</span>
  </div>
</template>

<script lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import LoggerService from "@/services/LoggerService";
import { defineComponent } from "vue";

export default defineComponent({
  name: "TextWithLabel",
  props: { label: String, data: Object, size: String },
  computed: {
    isObjectWithName(): boolean {
      if (isObjectHasKeys(this.data, ["name"])) {
        return true;
      } else {
        LoggerService.error(undefined, "No data, data is not Object or Object has no property 'name' for use within component ObjectNameWithLabel.vue");
        return false;
      }
    }
  }
});
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
