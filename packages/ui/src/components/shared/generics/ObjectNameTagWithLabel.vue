<template>
  <div v-if="show" class="container" :style="{ width: size }">
    <strong class="label" data-testid="label">{{ label }}: </strong>
    <Tag v-if="isObjectWithName" :value="data.name" :severity="getSeverity(data)" class="data-tag" data-testid="data-tag" />
    <span v-else class="data">None</span>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { TTIriRef } from "im-library/interfaces";
import { isObjectHasKeys } from "im-library/helpers/DataTypeCheckers";
import LoggerService from "im-library/services/LoggerService";
import { mapState, useStore } from "vuex";

const props = defineProps({
  label: { type: String, required: true },
  data: { type: Object as PropType<TTIriRef>, required: true },
  size: { type: String, default: "100%" },
  id: { type: String, default: "object-name-tag-with-label" },
  show: { type: Boolean, required: true }
});

const store = useStore();
const tagSeverityMatches = computed(() => store.state.tagSeverityMatches);

const isObjectWithName = computed(() => isObjectHasKeys(props.data, ["name"]));

function getSeverity(data: TTIriRef): string {
  let result = "info";
  if (!tagSeverityMatches.value) throw new Error("Missing vuex store property 'tagSeverityMatches'");
  if (data && isObjectHasKeys(data, ["@id"])) {
    const found = tagSeverityMatches.value.find((severity: { "@id": string; severity: string }) => severity["@id"] === data["@id"]);
    if (found) result = found.severity;
    else LoggerService.warn("TagWithLabel missing case for severity");
  }
  return result;
}
</script>

<style scoped>
.container {
  margin: 0;
  padding: 0.25rem 0.5rem 0 0;
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}
</style>
