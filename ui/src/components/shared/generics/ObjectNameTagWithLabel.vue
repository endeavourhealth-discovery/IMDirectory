<template>
  <div v-if="show" class="container" :style="{ width: size }">
    <strong class="label" data-testid="label">{{ label }}: </strong>
    <Tag v-if="isObjectWithName" :value="data.name" :severity="getSeverity(data)" class="data-tag" data-testid="data-tag" />
    <span v-else class="data">None</span>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { getLogger } from "@im-library/logger/LogConfig";
import { TagSeverity } from "@im-library/enums";
import { useRootStore } from "@/stores/rootStore";

const log = getLogger("components.shared.generics.ObjectNameTagWithLabel");

const props = defineProps({
  label: { type: String, required: true },
  data: { type: Object as PropType<TTIriRef>, required: true },
  size: { type: String, default: "100%" },
  id: { type: String, default: "object-name-tag-with-label" },
  show: { type: Boolean, required: true }
});

const rootStore = useRootStore();
const tagSeverityMatches = computed(() => rootStore.tagSeverityMatches);

const isObjectWithName = computed(() => isObjectHasKeys(props.data, ["name"]));

function getSeverity(data: TTIriRef): TagSeverity {
  let result = TagSeverity.INFO;
  if (!tagSeverityMatches.value) throw new Error("Missing vuex rootStore property 'tagSeverityMatches'");
  if (data && isObjectHasKeys(data, ["@id"])) {
    const found = tagSeverityMatches.value.find((severity: { "@id": string; severity: string }) => severity["@id"] === data["@id"]);
    if (found) result = found.severity;
    else log.warn("TagWithLabel missing case for severity");
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
