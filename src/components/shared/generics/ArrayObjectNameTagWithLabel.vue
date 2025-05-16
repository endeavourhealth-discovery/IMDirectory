<template>
  <div class="container" :style="{ width: size }" :id="id">
    <strong class="label" data-testid="label">{{ label }}: </strong>
    <div v-if="isArrayObject" class="tag-container">
      <Tag v-for="item of data" :key="item['@id']" :value="item.name" :severity="getSeverity(item)" class="data-tag" data-testid="data-tag" />
    </div>
    <span v-else class="tag-container">None</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { TTIriRef } from "@/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { getLogger } from "@/logger/LogConfig";
import { TagSeverity } from "@/enums";
import { useSharedStore } from "@/stores/sharedStore";

const log = getLogger("components.shared.generics.ArrayObjectNameTagWithLabel");

interface Props {
  label: string;
  data: TTIriRef[];
  size?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "100%",
  id: "array-object-name-tag-with-label"
});

const sharedStore = useSharedStore();
const tagSeverityMatches = computed(() => sharedStore.tagSeverityMatches);

const isArrayObject = computed(() => {
  if (props.data && isArrayHasLength(props.data) && isObjectHasKeys(props.data[0], ["@id"])) {
    return true;
  } else {
    return false;
  }
});

function getSeverity(item: TTIriRef): TagSeverity {
  let result = TagSeverity.INFO;
  if (!tagSeverityMatches.value) throw new Error("Missing vuex sharedStore property 'tagSeverityMatches'");
  if (item && isObjectHasKeys(item, ["name"])) {
    const found = tagSeverityMatches.value.find((severity: { "@id": string; severity: string }) => severity["@id"] === item["@id"]);
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

.tag-container {
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}
</style>
