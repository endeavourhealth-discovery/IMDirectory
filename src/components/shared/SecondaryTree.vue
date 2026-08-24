<template>
  <div class="justify-contents-start flex flex-col" id="secondary-tree-bar-container">
    <div id="alternate-parents-container" class="justify-contents-start flex flex-col items-start">
      <Button
        v-for="altParent of alternateParents"
        :key="altParent.iri"
        :label="altParent.name"
        :disabled="loading || altParent.name === ''"
        icon="fa-solid fa-chevron-up"
        @click="expandParents(altParent.listPosition)"
        @mouseenter="showOverlay($event, altParent.iri)"
        @mouseleave="hideOverlay"
        class="p-button-text p-button-plain"
        data-testid="alt-parent"
      />
    </div>
    <div class="justify-contents-start flex flex-row" id="secondary-tree-parents-bar">
      <Button
        :label="currentParent?.name"
        :disabled="loading || !currentParent"
        icon="fa-solid fa-chevron-up"
        @click="expandParents(parentPosition)"
        @mouseenter="showOverlay($event, currentParent?.iri)"
        @mouseleave="hideOverlay"
        class="p-button-text p-button-plain"
        data-testid="parent"
      />
    </div>
    <Tree
      :value="root"
      selectionMode="single"
      v-model:selectionKeys="selectedKeys"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="onNodeExpand"
      @node-collapse="onNodeCollapse"
      class="tree-root"
      :loading="loading"
    >
      <template #default="{ node }: any">
        <div v-if="node.key.includes('loadMore')" class="tree-row">
          <ProgressSpinner v-if="node.loading" />
          <span class="tree-node-label">{{ node.label }}</span>
        </div>
        <div
          v-else
          class="tree-row"
          @click="customOnClick($event, node, true)"
          @mouseover="showOverlayTreeNode($event, node.data)"
          @mouseleave="hideOverlay"
          data-testid="row"
        >
          <span v-if="!node.loading">
            <IMFontAwesomeIcon v-if="node.typeIcon" :icon="node.typeIcon" fixed-width :style="'color:' + node.color" />
          </span>
          <ProgressSpinner v-if="node.loading" />
          <span class="tree-node-label" data-testid="row-label">{{ node.label }}</span>
          <Button v-if="showSelect" label="Add" @click.stop="emit('onSelect', node)" v-tooltip="'Add to list'" class="self-center" data-testid="add-button" />
        </div>
      </template>
    </Tree>
    <small>CTRL+click to open in new tab</small>

    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { isTTIriRef, useUserStore } from "@endeavour/vue-library";
import { IMFontAwesomeIcon } from "@endeavour/vue-library/components";
import { OverlaySummary } from "@endeavour/vue-library/components";
import { useTree } from "@endeavour/vue-library/composables";
import { useOverlay } from "@endeavour/vue-library/composables";
import { IM, RDF, RDFS } from "@endeavour/vue-library/enums";
import { isArrayHasLength, isArrayOf, isObjectHasKeys } from "@endeavour/vue-library/helpers";
import type { ExtendedEntityReferenceNode, TTEntity, TTIriRef } from "@endeavour/vue-library/models";

import { isArray, isBoolean, isString } from "lodash-es";
import type { TreeNode } from "primevue/treenode";

import type { ConceptAggregate, TreeParent } from "@/models";
import { EntityService } from "@/services";

interface Props {
  entityIri: string;
  showSelect?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  rowClicked: [payload: string];
  rowControlClicked: [payload: string];
  onSelect: [payload: string];
  rowSelected: [payload: TreeNode | undefined];
}>();

const userStore = useUserStore();
const favourites = computed(() => userStore.favourites);

const { root, expandedKeys, selectedKeys, createLoadMoreNode, createTreeNode, createNodeSummary, onNodeCollapse, customOnClick, onNodeExpand, loadMore } =
  useTree(favourites, emit, 20);
const { showOverlay, showOverlayTreeNode, hideOverlay, OS } = useOverlay();

const conceptAggregate: Ref<ConceptAggregate> = ref({} as ConceptAggregate);
const currentParent: Ref<TreeParent | null> = ref(null);
const alternateParents: Ref<TreeParent[]> = ref([]);
const parentPosition = ref(0);
const overlayLocation: Ref<MouseEvent | undefined> = ref();
const loading = ref(false);
const totalCount = ref(0);
const pageSize = ref(20);

watch(
  () => props.entityIri,
  async newValue => {
    selectedKeys.value = {};
    alternateParents.value = [];
    expandedKeys.value = {};
    await getConceptAggregate(newValue);
    await createTree(parentPosition.value);
  }
);

watch(loading, newValue => {
  if (newValue) hideOverlay();
});

onMounted(async () => {
  await getConceptAggregate(props.entityIri);
  await createTree(0);
});

onBeforeUnmount(() => {
  if (overlayLocation.value) {
    hideOverlay();
  }
});

async function getConceptAggregate(iri: string): Promise<void> {
  loading.value = true;
  const conceptNode = await EntityService.getAsEntityReferenceNodes([iri]);
  conceptAggregate.value.concept = conceptNode[0];
  conceptAggregate.value.parents = await EntityService.getEntityParents(iri);

  const pagedChildren = await EntityService.getPagedChildren(iri, 1, pageSize.value);
  totalCount.value = pagedChildren.totalCount;
  conceptAggregate.value.children = pagedChildren.result as ExtendedEntityReferenceNode[];
  loading.value = false;
}

async function createTree(parentPosition: number) {
  loading.value = true;
  const selectedConcept = createTreeNode(
    conceptAggregate.value.concept.name,
    conceptAggregate.value.concept.iri,
    conceptAggregate.value.concept.type as TTIriRef[],
    createNodeSummary(conceptAggregate.value.concept),
    isBoolean(conceptAggregate.value.concept.hasChildren) ? conceptAggregate.value.concept.hasChildren : false,
    null,
    undefined
  );
  conceptAggregate.value.children.forEach(child => {
    if (isArrayOf(child.type, isTTIriRef)) {
      selectedConcept.children?.push(
        createTreeNode(child.name, child.iri, child.type, createNodeSummary(child), child.hasChildren, selectedConcept, child.orderNumber)
      );
    }
  });
  if (totalCount.value >= pageSize.value) {
    selectedConcept.children?.push(createLoadMoreNode(selectedConcept, 2, totalCount.value));
  }
  root.value = [] as TreeNode[];
  setParents(conceptAggregate.value.parents, parentPosition);
  root.value.push(selectedConcept);
  if (selectedConcept.key && !isObjectHasKeys(expandedKeys, [selectedConcept.key])) {
    expandedKeys.value[selectedConcept.key] = true;
  }
  if (selectedConcept.key) selectedKeys.value[selectedConcept.key] = true;
  loading.value = false;
}

function setParents(parentHierarchy: ExtendedEntityReferenceNode[], parentPosition: number): void {
  if (isArrayHasLength(parentHierarchy)) {
    if (parentHierarchy.length === 1) {
      currentParent.value = {
        name: parentHierarchy[parentPosition].name ?? "",
        iri: parentHierarchy[parentPosition].iri,
        listPosition: 0
      };
      alternateParents.value = [] as TreeParent[];
    } else {
      for (let i = 0; i < parentHierarchy.length; i++) {
        if (i === parentPosition) {
          currentParent.value = {
            name: parentHierarchy[parentPosition].name ?? "",
            iri: parentHierarchy[parentPosition].iri,
            listPosition: i
          };
        } else {
          alternateParents.value.push({
            name: parentHierarchy[i].name ?? "",
            iri: parentHierarchy[i].iri,
            listPosition: i
          });
        }
      }
    }
  } else {
    currentParent.value = null;
    alternateParents.value = [] as TreeParent[];
  }
}

async function expandParents(parentPosition: number): Promise<void> {
  loading.value = true;
  if (!isArrayHasLength(root.value)) return;
  if (root.value[0].key && !expandedKeys.value[root.value[0].key]) {
    expandedKeys.value[root.value[0].key] = true;
  }
  const parents = await EntityService.getEntityParents(root.value[0].key);
  const parentNode = createExpandedParentTree(parents, parentPosition);
  root.value = [] as TreeNode[];
  root.value.push(parentNode);
  await setExpandedParentParents();
  // this refreshes the keys so they start open if children and parents were both expanded
  expandedKeys.value = { ...expandedKeys.value };
  loading.value = false;
}

function createExpandedParentTree(parents: ExtendedEntityReferenceNode[], parentPosition: number): TreeNode {
  let parentNode = {} as TreeNode;
  for (let i = 0; i < parents.length; i++) {
    if (i === parentPosition) {
      parentNode = createTreeNode(parents[i].name, parents[i].iri, parents[i].type as TTIriRef[], createNodeSummary(parents[i]), true, null, undefined);
      if (parentNode.children && parentNode.key) {
        parentNode.children.push(root.value[0]);
        if (!expandedKeys.value[parentNode.key]) {
          expandedKeys.value[parentNode.key] = true;
        }
      }
    }
  }
  return parentNode;
}

async function setExpandedParentParents(): Promise<void> {
  const result = await EntityService.getEntityParents(root.value[0].key);
  currentParent.value = null;
  alternateParents.value = [] as TreeParent[];
  if (!isArrayHasLength(result)) return;
  if (result.length === 1) {
    parentPosition.value = 0;
    currentParent.value = {
      name: result[0].name ?? "",
      iri: result[0].iri,
      listPosition: 0
    };
  } else {
    for (let i = 0; i < result.length; i++) {
      if (i === 0) {
        currentParent.value = {
          name: result[i].name ?? "",
          iri: result[i].iri,
          listPosition: i
        };
      } else {
        alternateParents.value.push({
          name: result[i].name ?? "",
          iri: result[i].iri,
          listPosition: i
        });
      }
    }
  }
}

async function onNodeSelect(node: TreeNode): Promise<void> {
  if (node.key.includes("loadMore")) {
    if (!node.loading) await loadMore(node);
  }
  await nextTick();
  selectedKeys.value = {};
  if (isString(conceptAggregate.value.concept.name)) {
    selectedKeys.value[conceptAggregate.value.concept.name] = true;
  }
}
</script>

<style scoped>
.tree-root {
  overflow: auto;
  border: 0;
  padding-top: 0;
}

.tree-root ::v-deep(.p-tree-toggler) {
  min-width: 2rem;
}

.tree-root ::v-deep(.p-tree-node-label) {
  width: 100% !important;
}

#secondary-tree-bar-container {
  flex: 1 1 auto;
  border-top: 1px solid var(--p-textarea-border-color);
}

#secondary-tree-bar-container ::v-deep(.p-treenode-selectable) {
  cursor: default !important;
}

.tree-row {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.25rem;
}

.tree-node-label {
  flex: 1 1 auto;
  word-break: break-all;
}
</style>
