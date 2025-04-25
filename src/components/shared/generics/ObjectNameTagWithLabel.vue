<template>
  <div class="container" :style="{ width: size }">
    <strong class="label" data-testid="label">{{ label }}: </strong>
    <Tag v-if="isObjectWithName" :value="data.name" :severity="getSeverity(data)" class="data-tag" data-testid="data-tag" />
    <span v-else class="data">None</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { TTIriRef } from "@/interfaces/AutoGen";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { getLogger } from "@/logger/LogConfig";
import { TagSeverity } from "@/enums";
import { useSharedStore } from "@/stores/sharedStore";

const log = getLogger("components.shared.generics.ObjectNameTagWithLabel");

interface Props {
  label: string;
  data: TTIriRef;
  size?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "100%",
  id: "object-name-tag-with-label"
});

const sharedStore = useSharedStore();
const tagSeverityMatches = computed(() => sharedStore.tagSeverityMatches);

const isObjectWithName = computed(() => isObjectHasKeys(props.data, ["name"]));

function getSeverity(data: TTIriRef): TagSeverity {
  let result = TagSeverity.INFO;
  if (!tagSeverityMatches.value) throw new Error("Missing vuex sharedStore property 'tagSeverityMatches'");
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
