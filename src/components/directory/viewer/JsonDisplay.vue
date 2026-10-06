<template>
  <div class="json-display">
    <div v-html="displayHtml" @click="handleClick" @pointerover="handlePointerOver" @pointerout="handlePointerOut" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, watch } from "vue";

interface Props {
  json: string;
  hoveredName: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "block-names": [names: string[]];
  "hover-block": [name: string];
  "leave-block": [];
  "click-block": [name: string];
}>();

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

interface JsonObject {
  [key: string]: JsonValue;
}

interface Block {
  name: string | null;
  value: JsonObject;
}

const parsedJson = computed<JsonValue | null>(() => {
  if (!props.json) return null;

  try {
    return JSON.parse(props.json) as JsonValue;
  } catch (error) {
    console.error("Unable to parse JSON:", error);
    return null;
  }
});

const displayHtml = computed(() => {
  if (parsedJson.value === null) return "";
  return renderValue(parsedJson.value);
});

watch(() => props.hoveredName, updateHoveredJsonBlocks, { immediate: true });

watch(
  () => props.json,
  () => nextTick(updateHoveredJsonBlocks)
);

function findLastAs(value: JsonValue): string | null {
  let lastName: string | null = null;

  if (value === null || typeof value !== "object") return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const name = findLastAs(item);
      if (name !== null) lastName = name;
    }
    return lastName;
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === "as" && typeof child === "string") {
      lastName = child;
    }

    const nestedName = findLastAs(child);
    if (nestedName !== null) lastName = nestedName;
  }

  return lastName;
}

function findBlocks(value: JsonValue): Block[] {
  const blocks: Block[] = [];
  if (value === null || typeof value !== "object") return blocks;

  if (Array.isArray(value)) {
    for (const item of value) {
      blocks.push(...findBlocks(item));
    }
    return blocks;
  }

  for (const [key, child] of Object.entries(value)) {
    if ((key === "and" || key === "or") && Array.isArray(child)) {
      for (const item of child) {
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          blocks.push({
            name: findLastAs(item),
            value: item as JsonObject
          });
        }
      }

      blocks.push(...findBlocks(child));
    } else {
      blocks.push(...findBlocks(child));
    }
  }
  return blocks;
}

const blocks = computed(() => {
  if (parsedJson.value === null) return [];
  return findBlocks(parsedJson.value);
});

watch(
  blocks,
  value => {
    emit(
      "block-names",
      value.map(block => block.name).filter((name): name is string => !!name)
    );
  },
  { immediate: true }
);

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function renderValue(value: JsonValue): string {
  if (value === null || typeof value !== "object") {
    return escapeHtml(JSON.stringify(value));
  }

  if (Array.isArray(value)) {
    return escapeHtml(JSON.stringify(value, null, 2));
  }

  let html = "";

  for (const [key, child] of Object.entries(value)) {
    if ((key === "and" || key === "or") && Array.isArray(child)) {
      html += `
<div class="json-group">
<pre class="json-text">"${key}": [</pre>`;

      for (const item of child) {
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          const object = item as JsonObject;
          const name = findLastAs(object);

          const attributes = name ? `data-json-block data-block-name="${escapeHtml(name)}"` : "";

          const className = name ? "json-object json-block-clickable" : "json-object";

          html += `
<div class="${className}" ${attributes}>
<pre class="json-text">${escapeHtml(JSON.stringify(object, null, 2))}</pre>
</div>`;
        } else {
          html += `
<pre class="json-text">${escapeHtml(JSON.stringify(item, null, 2))}</pre>`;
        }
      }

      html += `
<pre class="json-text">]</pre>
</div>`;
    } else {
      html += `
<pre class="json-text">${escapeHtml(JSON.stringify({ [key]: child }, null, 2))}</pre>`;
    }
  }
  return html;
}

function findNamedJsonBlock(target: HTMLElement): HTMLElement | null {
  let element: HTMLElement | null = target;

  while (element) {
    if (element.matches("[data-json-block]") && element.dataset.blockName) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

function handleClick(event: MouseEvent): void {
  if (!(event.target instanceof HTMLElement)) return;

  const block = findNamedJsonBlock(event.target);
  const name = block?.dataset.blockName;
  if (name) emit("click-block", name);
}

function handlePointerOver(event: PointerEvent): void {
  if (!(event.target instanceof HTMLElement)) return;

  const block = findNamedJsonBlock(event.target);
  const name = block?.dataset.blockName;

  if (name) emit("hover-block", name);
}

function handlePointerOut(event: PointerEvent): void {
  if (!(event.target instanceof HTMLElement)) return;

  const block = findNamedJsonBlock(event.target);
  if (!block) return;

  const relatedTarget = event.relatedTarget;
  if (relatedTarget instanceof Node && block.contains(relatedTarget)) return;

  emit("leave-block");
}

async function updateHoveredJsonBlocks(): Promise<void> {
  await nextTick();

  const elements = document.querySelectorAll("[data-json-block]");

  elements.forEach(element => {
    element.classList.remove("json-block-hovered");

    if (props.hoveredName && element instanceof HTMLElement && element.dataset.blockName === props.hoveredName) {
      element.classList.add("json-block-hovered");
    }
  });
}
</script>

<style scoped>
.json-display {
  font-family: inherit;
}

.json-display :deep(.json-text) {
  margin: 0;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  white-space: pre;
}

.json-display :deep(.json-group),
.json-display :deep(.json-object) {
  margin: 0;
  padding: 0;
}

.json-display :deep(.json-block-clickable) {
  cursor: pointer;
}

.json-display :deep(.json-block-clickable:hover),
.json-display :deep(.json-block-hovered) {
  background: color-mix(in srgb, var(--p-primary-color) 20%, transparent);
}
</style>
