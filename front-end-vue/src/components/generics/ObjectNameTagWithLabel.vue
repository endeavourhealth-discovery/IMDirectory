<template>
  <div class="container" :style="{ width: size }">
    <strong class="label">{{ label }}: </strong>
    <Tag v-if="isObjectWithName" :value="data.name" :severity="getSeverity" class="data-tag" />
    <span v-else class="data">None</span>
  </div>
</template>

<script lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { TTIriRef } from "@/models/TripleTree";
import LoggerService from "@/services/LoggerService";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "ObjectNameTagWithLabel",
  props: {
    label: { type: String },
    data: { type: Object as PropType<TTIriRef>, default: () => null },
    size: String
  },
  computed: {
    isObjectWithName(): boolean {
      if (isObjectHasKeys(this.data, ["name"])) {
        return true;
      } else {
        return false;
      }
    },

    getSeverity(): string {
      let result = "info";
      if (this.data && isObjectHasKeys(this.data, ["name"])) {
        switch (this.data.name) {
          case "Active":
            result = "success";
            break;
          case "Draft":
            result = "warning";
            break;
          case "Inactive":
            result = "danger";
            break;
          default:
            LoggerService.warn("TagWithLabel missing case for severity");
        }
      }
      return result;
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
