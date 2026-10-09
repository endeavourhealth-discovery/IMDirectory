<template>
  <template v-if="isObject(value)">
    <div
      :data-json-block="blockName || undefined"
      :data-block-name="blockName || undefined"
      :class="{ 'json-block-hovered': highlighted, 'cursor-pointer': !!blockName }"
      @mouseenter="blockName && emit('hover-block', blockName)"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
    >
      <div class="json-line">{</div>
      <div class="json-indent">
        <template v-for="([key, child], index) in Object.entries(value)" :key="key">
          <div v-if="isPrimitive(child)" class="json-line">"{{ key }}": {{ primitiveText(child) }}{{ index < Object.keys(value).length - 1 ? "," : "" }}</div>
          <template v-else-if="isArray(child)">
            <div class="json-line">"{{ key }}": [</div>
            <div class="json-indent">
              <JsonNode
                v-for="(item, itemIndex) in child"
                :key="itemIndex"
                :value="item"
                :hovered-name="hoveredName"
                @hover-block="emit('hover-block', $event)"
                @leave-block="emit('leave-block')"
                @click-block="forwardClickBlock"
              />
            </div>
            <div class="json-line">]{{ index < Object.keys(value).length - 1 ? "," : "" }}</div>
          </template>
          <template v-else>
            <div class="json-line">"{{ key }}": {</div>
            <div class="json-indent">
              <JsonNode
                :value="child"
                :hovered-name="hoveredName"
                @hover-block="emit('hover-block', $event)"
                @leave-block="emit('leave-block')"
                @click-block="forwardClickBlock"
              />
            </div>
            <div class="json-line">}{{ index < Object.keys(value).length - 1 ? "," : "" }}</div>
          </template>
        </template>
      </div>
      <div class="json-line">}</div>
    </div>
  </template>
  <template v-else-if="isArray(value)">
    <div class="json-line">[</div>
    <div class="json-indent">
      <JsonNode
        v-for="(item, index) in value"
        :key="index"
        :value="item"
        :hovered-name="hoveredName"
        @hover-block="emit('hover-block', $event)"
        @leave-block="emit('leave-block')"
        @click-block="forwardClickBlock"
      />
    </div>
    <div class="json-line">]</div>
  </template>
  <template v-else>
    <div class="json-line">
      {{ primitiveText(value) }}
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { JsonObject, JsonValue } from "./JsonDisplay.vue";

interface Props {
  value: JsonValue;
  hoveredName: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "hover-block": [name: string];
  "leave-block": [];
  "click-block": [name: string, element: HTMLElement];
}>();

const blockName = computed(() => {
  if (!isObject(props.value)) return null;

  let name: string | null = null;

  for (const [key, value] of Object.entries(props.value)) {
    if (key === "as" && typeof value === "string") name = value;
  }
  return name;
});
const highlighted = computed(() => !!blockName.value && blockName.value === props.hoveredName);

function isObject(value: JsonValue): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isArray(value: JsonValue): value is JsonValue[] {
  return Array.isArray(value);
}

function isPrimitive(value: JsonValue): boolean {
  return value === null || typeof value !== "object";
}

function primitiveText(value: JsonValue): string {
  return JSON.stringify(value);
}

function handleClick(event: MouseEvent): void {
  if (!blockName.value || !(event.currentTarget instanceof HTMLElement)) return;

  event.stopPropagation();
  emit("click-block", blockName.value, event.currentTarget);
}

function forwardClickBlock(name: string, element: HTMLElement): void {
  emit("click-block", name, element);
}

function handleMouseLeave(event: MouseEvent): void {
  const relatedTarget = event.relatedTarget;

  if (!(relatedTarget instanceof HTMLElement)) {
    emit("leave-block");
    return;
  }

  const nextBlock = relatedTarget.closest<HTMLElement>("[data-json-block]");

  if (nextBlock?.dataset.blockName) {
    emit("hover-block", nextBlock.dataset.blockName);
  } else {
    emit("leave-block");
  }
}
</script>

<style scoped>
.json-line {
  white-space: pre;
  line-height: 1.5;
}

.json-indent {
  padding-left: 2ch;
}

.json-block-hovered {
  background: color-mix(in srgb, var(--p-primary-color) 20%, transparent);
  width: max-content;
  min-width: 100%;
}
</style>
