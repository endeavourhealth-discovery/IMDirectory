<template>
  <Splitter class="w-full border-none border-round overflow-hidden" style="height: 60vh; max-width: 75vw">
    <SplitterPanel :size="25" :minSize="2" class="overflow-hidden">
      <div ref="leftScroll" class="h-full overflow-auto surface-ground" style="min-height: 0">
        <div ref="leftHeader" class="sticky top-0 z-2 surface-card border-bottom-1 surface-border bg-surface-0">
          <div class="flex align-items-center gap-2 px-3 py-2">
            <span class="font-semibold"> JSON </span>
          </div>
        </div>
        <div class="font-mono text-sm w-max min-w-full">
          <div v-if="loadingJson" class="flex flex-row"><ProgressSpinner /></div>
          <JsonDisplay
            v-else
            :json="queryJson"
            :hovered-name="hoveredName"
            @block-names="handleJsonBlockNames"
            @hover-block="handleHoverBlock"
            @leave-block="hoveredName = null"
            @click-block="handleJsonClick"
          />
        </div>
      </div>
    </SplitterPanel>
    <SplitterPanel :size="25" :minSize="2" class="overflow-hidden">
      <div ref="rightScroll" class="h-full overflow-auto surface-ground" style="min-height: 0">
        <div ref="rightHeader" class="sticky top-0 z-2 surface-card border-bottom-1 surface-border bg-surface-0">
          <div class="flex align-items-center gap-2 px-3 py-2">
            <span class="font-semibold"> SQL </span>
          </div>
        </div>
        <div class="font-mono text-sm w-max min-w-full">
          <div v-if="loadingSql" class="flex flex-row"><ProgressSpinner /></div>
          <div
            v-else
            v-for="(block, index) in rightBlocks"
            :key="`${block.name}-${index}`"
            :ref="el => setRightBlockRef(block.name, el)"
            :data-block-name="block.name"
            class="border-bottom-1 surface-border transition-colors transition-duration-100 sql-block"
            :class="{
              'bg-primary-500/20': block.name && hoveredName === block.name,
              'cursor-pointer': !!block.name
            }"
            @mouseenter="block.name && (hoveredName = block.name)"
            @mouseleave="hoveredName = null"
            @click="block.name && alignBlock(block.name)"
          >
            <pre class="m-0 px-3 py-0 white-space-pre-wrap">{{ block.content }}</pre>
          </div>
        </div>
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";

import JsonDisplay from "@/components/directory/viewer/JsonDisplay.vue";

interface Props {
  queryJson: string;
  querySql: string;
}

const props = defineProps<Props>();

interface CBlock {
  name: string;
  content: string;
  children: CBlock[];
}

const rightBlocks = ref<CBlock[]>([]);
const leftBlockNames = ref<string[]>([]);
const leftScroll = ref<HTMLElement | null>(null);
const rightScroll = ref<HTMLElement | null>(null);
const leftHeader = ref<HTMLElement | null>(null);
const rightHeader = ref<HTMLElement | null>(null);
const hoveredName = ref<string | null>(null);
const loadingJson = ref(false);
const loadingSql = ref(false);

const rightBlockRefs = new Map<string, HTMLElement>();

function handleJsonBlockNames(names: string[]): void {
  leftBlockNames.value = names;
}

function handleHoverBlock(name: string): void {
  hoveredName.value = name;
}

watch(
  () => props.querySql,
  newValue => {
    if (!newValue) {
      rightBlocks.value = [];
      return;
    }
    rightBlocks.value = createSQLBlocks();
  },
  { immediate: true }
);

function createSQLBlocks(): CBlock[] {
  if (!props.querySql) return [];

  const lines = props.querySql.split(/\r?\n/);
  const blocks: CBlock[] = [];

  let currentLines: string[] = [];
  let currentName = "";
  let inBlock = false;
  let bracketDepth = 0;

  const addCurrentBlock = () => {
    if (currentLines.length === 0) return;

    blocks.push({ name: currentName, content: currentLines.join("\n"), children: [] });
    currentLines = [];
    currentName = "";
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const asMatch = line.match(/`([^`]+)`\s+AS\s*\(/i);

    if (!inBlock) {
      if (asMatch) {
        addCurrentBlock();

        currentName = asMatch[1];
        currentLines = [line];
        inBlock = true;
        bracketDepth = getBracketDepth(line);

        if (bracketDepth <= 0) {
          addCurrentBlock();

          inBlock = false;
          bracketDepth = 0;
        }
        continue;
      }
      currentLines.push(line);
      continue;
    }

    currentLines.push(line);
    bracketDepth += getBracketDepth(line);

    if (bracketDepth <= 0) {
      addCurrentBlock();
      inBlock = false;
      bracketDepth = 0;
    }
  }
  addCurrentBlock();
  return blocks;
}

function getBracketDepth(line: string): number {
  let depth = 0;

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const previous = line[i - 1];

    if (char === "'" && previous !== "\\" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (char === '"' && previous !== "\\" && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (char === "`" && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
      continue;
    }
    if (inSingleQuote || inDoubleQuote || inBacktick) continue;
    if (char === "(") depth++;
    if (char === ")") depth--;
  }
  return depth;
}

function setRightBlockRef(name: string, element: unknown): void {
  if (!name) return;

  if (element instanceof HTMLElement) rightBlockRefs.set(name, element);
  else rightBlockRefs.delete(name);
}

function scrollBlockToTop(panel: HTMLElement, block: HTMLElement, header: HTMLElement | null): void {
  const panelRect = panel.getBoundingClientRect();
  const blockRect = block.getBoundingClientRect();
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const blockPosition = panel.scrollTop + (blockRect.top - panelRect.top);
  const target = blockPosition - headerHeight;

  panel.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
}

function handleJsonClick(name: string, element: HTMLElement): void {
  if (!name) return;

  hoveredName.value = name;

  if (leftScroll.value) scrollBlockToTop(leftScroll.value, element, leftHeader.value);
  if (rightScroll.value) {
    const rightBlock = rightScroll.value.querySelector<HTMLElement>(`[data-block-name="${CSS.escape(name)}"]`);
    if (rightBlock) scrollBlockToTop(rightScroll.value, rightBlock, rightHeader.value);
  }
}

function alignBlock(name: string): void {
  if (!name) return;

  const rightBlock = rightBlockRefs.get(name);
  hoveredName.value = name;

  if (leftScroll.value) {
    const jsonBlocks = leftScroll.value.querySelectorAll("[data-json-block]");
    const leftBlock = Array.from(jsonBlocks).find(element => element instanceof HTMLElement && element.dataset.blockName === name) as HTMLElement | undefined;

    if (leftBlock) scrollBlockToTop(leftScroll.value, leftBlock, leftHeader.value);
  }
  if (rightScroll.value && rightBlock) scrollBlockToTop(rightScroll.value, rightBlock, rightHeader.value);
}
</script>

<style scoped>
.sql-block {
  width: 100%;
  box-sizing: border-box;
}
</style>
