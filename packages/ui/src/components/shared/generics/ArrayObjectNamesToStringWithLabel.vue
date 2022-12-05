<template>
  <div v-if="show" class="container" :style="{ width: size }" :id="id">
    <strong class="label" data-testid="label">{{ label }}: </strong>
    <span class="data-string" data-testid="data-string">
      {{ arrayToString ? arrayToString : "None" }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { isArrayHasLength, isObjectHasKeys } from "../../../helpers/modules/DataTypeCheckers";
import { SHACL } from "../../../vocabulary";

const props = defineProps({
  label: { type: String, required: true },
  data: { type: Array as PropType<string[]>, required: true },
  size: { type: String, default: "100%" },
  id: { type: String, default: "array-object-names-to-string-with-label" },
  show: { type: Boolean, required: true }
});

const arrayToString = computed(() => {
  if (isArrayHasLength(props.data) && props.data.every(item => isObjectHasKeys(item, ["name"]))) {
    return props.data
      .map(function (item: any) {
        if (item["@id"] === SHACL.NODESHAPE) return "Data model";
        return item.name;
      })
      .join(", ");
  } else {
    return undefined;
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
