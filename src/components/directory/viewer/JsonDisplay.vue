<template>
  <div class="json-display font-mono text-sm">
    <JsonNode
      v-if="parsedJson !== null"
      :value="parsedJson"
      :hovered-name="hoveredName"
      @hover-block="emit('hover-block', $event)"
      @leave-block="emit('leave-block')"
      @click-block="handleBlockClick"
    />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, watch } from "vue";

import JsonNode from "./JsonNode.vue";

export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

interface Props {
  json: string;
  hoveredName: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "block-names": [names: string[]];
  "hover-block": [name: string];
  "leave-block": [];
  "click-block": [name: string, element: HTMLElement];
}>();

const parsedJson = shallowRef<JsonValue | null>(null);
const blockRefs = new Map<string, HTMLElement[]>();

watch(
  () => props.json,
  value => {
    void parseJson(value);
  },
  { immediate: true }
);

function handleBlockClick(name: string, element: HTMLElement): void {
  emit("click-block", name, element);
}

function getBlock(name: string): HTMLElement | null {
  return blockRefs.get(name)?.[0] ?? null;
}

function getOwnBlockName(value: JsonValue): string | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;

  let name: string | null = null;

  for (const [key, child] of Object.entries(value)) {
    if (key === "as" && typeof child === "string") name = child;
  }
  return name;
}

function collectBlockNames(value: JsonValue): string[] {
  const names: string[] = [];

  if (value === null || typeof value !== "object") return names;

  if (Array.isArray(value)) {
    for (const item of value) names.push(...collectBlockNames(item));
    return names;
  }

  for (const [key, child] of Object.entries(value)) {
    if ((key === "and" || key === "or") && Array.isArray(child)) {
      for (const item of child) {
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          const name = getOwnBlockName(item);
          if (name) names.push(name);
        }
        names.push(...collectBlockNames(item));
      }
    } else {
      names.push(...collectBlockNames(child));
    }
  }
  return names;
}

async function parseJson(json: string): Promise<void> {
  blockRefs.clear();

  await new Promise(resolve => setTimeout(resolve, 0));

  try {
    if (!json) {
      parsedJson.value = null;
      emit("block-names", []);
      return;
    }

    const parsed = JSON.parse(json) as JsonValue;

    parsedJson.value = parsed;
    emit("block-names", collectBlockNames(parsed));
  } catch (error) {
    console.error("Unable to parse JSON:", error);
    parsedJson.value = null;
    emit("block-names", []);
  }
}

defineExpose({
  getBlock
});
</script>
