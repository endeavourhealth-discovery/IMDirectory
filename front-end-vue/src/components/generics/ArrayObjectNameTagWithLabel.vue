<template>
  <div class="container" :style="{ width: size }">
    <strong class="label">{{ label }}: </strong>
    <span v-if="isArrayObject">
      <Tag v-for="item of data" :key="item['@id']" :value="item.name" :severity="getSeverity(item)" class="data-tag" />
    </span>
    <span v-else class="data">None</span>
  </div>
</template>

<script lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { TTIriRef } from "@/models/TripleTree";
import LoggerService from "@/services/LoggerService";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "ArrayObjectNameTagWithLabel",
  props: {
    label: { type: String },
    data: { type: Array as PropType<Array<TTIriRef>> },
    size: String
  },
  methods: {
    getSeverity(item: TTIriRef): string {
      let result = "info";
      if (item && isObjectHasKeys(item, ["name"])) {
        switch (item.name) {
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
  },
  computed: {
    isArrayObject(): boolean {
      if (this.data && isArrayHasLength(this.data) && isObjectHasKeys(this.data[0], ["@id"])) {
        return true;
      } else {
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
