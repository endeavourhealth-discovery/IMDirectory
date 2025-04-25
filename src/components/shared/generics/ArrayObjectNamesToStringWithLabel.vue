<template>
  <div class="container" :style="{ width: size }" :id="id">
    <strong class="label" data-testid="label">{{ label }}: </strong>
    <span class="data-string" data-testid="data-string">
      {{ arrayToString ? arrayToString : "None" }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { SHACL } from "@/vocabulary";

interface Props {
  label: string;
  data?: string[];
  size?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "100%",
  id: "array-object-names-to-string-with-label"
});

const arrayToString = computed(() => {
  if (props.data && isArrayHasLength(props.data) && props.data.every(item => isObjectHasKeys(item, ["name"]))) {
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
</style>
