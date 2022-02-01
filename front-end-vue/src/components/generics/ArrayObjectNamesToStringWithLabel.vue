<template>
  <div class="container" :style="{ width: size }">
    <strong class="label">{{ label }}: </strong>
    <span class="data-string">
      {{ arrayToString ? arrayToString : "None" }}
    </span>
  </div>
</template>

<script lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "ArrayObjectNamesToStringWithLabel",
  props: {
    label: { type: String },
    data: { type: Array as PropType<Array<string>>, default: () => [] },
    size: { type: String }
  },
  computed: {
    arrayToString(): string | undefined {
      if (isArrayHasLength(this.data) && this.data.every(item => isObjectHasKeys(item, ["name"]))) {
        return this.data
          .map(function(item: any) {
            return item.name;
          })
          .join(", ");
      } else {
        return undefined;
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
