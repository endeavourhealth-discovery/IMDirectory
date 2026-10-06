<template>
  <div class="json-display" @click="handleClick" @pointerover="handlePointerOver" @pointerout="handlePointerOut">
    <div v-html="displayHtml" />
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

function findLastAs(object: JsonObject): string | null {
  let lastName: string | null = null;

  for (const [key, value] of Object.entries(object)) {
    if (key === "as" && typeof value === "string") {
      lastName = value;
    }
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
    return value.map(item => renderValue(item)).join("");
  }

  return renderObject(value);
}

function renderObject(object: JsonObject, indent = 0): string {
  let html = "";
  const entries = Object.entries(object);

  entries.forEach(([key, child], index) => {
    const comma = index < entries.length - 1 ? "," : "";

    if ((key === "and" || key === "or") && Array.isArray(child)) {
      html += `<div class="json-group">`;
      html += `<pre class="json-text">${" ".repeat(indent)}"${key}": [</pre>`;

      child.forEach((item, childIndex) => {
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          html += renderBlockObject(item as JsonObject, indent + 2, childIndex < child.length - 1);
        } else {
          html += `<pre class="json-text">${" ".repeat(indent + 2)}${escapeHtml(JSON.stringify(item))}${childIndex < child.length - 1 ? "," : ""}</pre>`;
        }
      });

      html += `<pre class="json-text">${" ".repeat(indent)}]${comma}</pre>`;
      html += `</div>`;
      return;
    }

    if (child !== null && typeof child === "object" && !Array.isArray(child)) {
      html += `<pre class="json-text">${" ".repeat(indent)}"${escapeHtml(key)}": {</pre>`;
      html += renderObject(child as JsonObject, indent + 2);
      html += `<pre class="json-text">${" ".repeat(indent)}}${comma}</pre>`;
      return;
    }

    html += `<pre class="json-text">${" ".repeat(indent)}"${escapeHtml(key)}": ${escapeHtml(JSON.stringify(child))}${comma}</pre>`;
  });

  return html;
}

function renderBlockObject(object: JsonObject, indent: number, hasComma: boolean): string {
  const name = findLastAs(object);
  const attributes = name ? `data-json-block data-block-name="${escapeHtml(name)}"` : "";

  const className = name ? "json-object json-block-clickable" : "json-object";

  return `<div class="${className}" ${attributes}>
<pre class="json-text">${" ".repeat(indent)}{</pre>${renderObject(object, indent + 2)}<pre class="json-text">${" ".repeat(indent)}}${hasComma ? "," : ""}</pre>
</div>`;
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

  const block = event.target.closest("[data-json-block]");
  if (!(block instanceof HTMLElement)) return;
  const name = block.dataset.blockName;
  if (name) {
    event.stopPropagation();
    emit("click-block", name);
  }
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
