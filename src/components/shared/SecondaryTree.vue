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
        @mouseenter="showPopup($event, altParent.iri)"
        @mouseleave="hidePopup"
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
        @mouseenter="showPopup($event, currentParent?.iri)"
        @mouseleave="hidePopup"
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
        <div v-if="node.data === 'loadMore'" class="tree-row">
          <ProgressSpinner v-if="node.loading" />
          <span class="tree-node-label">{{ node.label }}</span>
        </div>
        <div
          v-else
          class="tree-row"
          @click="customOnClick($event, node, true)"
          @mouseover="showPopup($event, node.data)"
          @mouseleave="hidePopup"
          data-testid="row"
        >
          <span v-if="!node.loading">
            <IMFontAwesomeIcon v-if="node.typeIcon" :icon="node.typeIcon" fixed-width :style="'color:' + node.color" />
          </span>
          <ProgressSpinner v-if="node.loading" />
          <span class="tree-node-label" data-testid="row-label">{{ node.label }}</span>
          <Button
            v-if="showSelect"
            label="Add"
            @click.stop="emit('onSelect', node.data)"
            v-tooltip="'Add to list'"
            class="self-center"
            data-testid="add-button"
          />
        </div>
      </template>
    </Tree>
    <small>CTRL+click to open in new tab</small>

    <OverlaySummary ref="OS" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch, nextTick, onBeforeUnmount } from "vue";
import IMFontAwesomeIcon from "./IMFontAwesomeIcon.vue";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { ConceptAggregate, TreeParent } from "@/interfaces";
import { RDF, RDFS } from "@/vocabulary";
import { EntityService } from "@/services";
import setupTree from "@/composables/setupTree";
import OverlaySummary from "./OverlaySummary.vue";
import type { TreeNode } from "primevue/treenode";
import setupOverlay from "@/composables/setupOverlay";
import { TTIriRef } from "@/interfaces/AutoGen";
import { ExtendedEntityReferenceNode, TTEntity } from "@/interfaces/ExtendedAutoGen";

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

const { root, expandedKeys, selectedKeys, createLoadMoreNode, createTreeNode, onNodeCollapse, customOnClick, onNodeExpand, loadMore } = setupTree(emit, 20);
const { showOverlay, hideOverlay, OS } = setupOverlay();

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
    await createTree(
      conceptAggregate.value.concept,
      conceptAggregate.value.parents as ExtendedEntityReferenceNode[],
      conceptAggregate.value.children as ExtendedEntityReferenceNode[],
      parentPosition.value
    );
  }
);

watch(loading, newValue => {
  if (newValue) hidePopup();
});

onMounted(async () => {
  await getConceptAggregate(props.entityIri);
  await createTree(
    conceptAggregate.value.concept,
    conceptAggregate.value.parents as ExtendedEntityReferenceNode[],
    conceptAggregate.value.children as ExtendedEntityReferenceNode[],
    0
  );
});

onBeforeUnmount(() => {
  if (overlayLocation.value) {
    hidePopup();
  }
});

async function getConceptAggregate(iri: string): Promise<void> {
  loading.value = true;
  conceptAggregate.value.concept = await EntityService.getPartialEntity(iri, [RDF.TYPE, RDFS.LABEL]);

  conceptAggregate.value.parents = await EntityService.getEntityParents(iri);

  const pagedChildren = await EntityService.getPagedChildren(iri, 1, pageSize.value);
  totalCount.value = pagedChildren.totalCount;
  conceptAggregate.value.children = pagedChildren.result;
  loading.value = false;
}

async function createTree(
  concept: TTEntity,
  parentHierarchy: ExtendedEntityReferenceNode[],
  children: ExtendedEntityReferenceNode[],
  parentPosition: number
): Promise<void> {
  loading.value = true;
  const selectedConcept = createTreeNode(concept[RDFS.LABEL], concept.iri as string, concept[RDF.TYPE], concept.hasChildren, null, undefined);
  children.forEach(child => {
    selectedConcept.children?.push(createTreeNode(child.name, child.iri, child.type as TTIriRef[], child.hasChildren, selectedConcept, child.orderNumber));
  });
  if (totalCount.value >= pageSize.value) {
    selectedConcept.children?.push(createLoadMoreNode(selectedConcept, 2, totalCount.value));
  }
  root.value = [] as TreeNode[];
  setParents(parentHierarchy, parentPosition);
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
        name: parentHierarchy[parentPosition].name,
        iri: parentHierarchy[parentPosition].iri,
        listPosition: 0
      };
      alternateParents.value = [] as TreeParent[];
    } else {
      for (let i = 0; i < parentHierarchy.length; i++) {
        if (i === parentPosition) {
          currentParent.value = {
            name: parentHierarchy[parentPosition].name,
            iri: parentHierarchy[parentPosition].iri,
            listPosition: i
          };
        } else {
          alternateParents.value.push({
            name: parentHierarchy[i].name,
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
  if (root.value[0].key && !isObjectHasKeys(expandedKeys.value, [root.value[0].key])) {
    expandedKeys.value[root.value[0].key] = true;
  }

  const parents = await EntityService.getEntityParents(root.value[0].data);
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
      parentNode = createTreeNode(parents[i].name, parents[i].iri, parents[i].type as TTIriRef[], true, null, undefined);
      if (parentNode.children && parentNode.key) {
        parentNode.children.push(root.value[0]);
        if (!isObjectHasKeys(expandedKeys.value, [parentNode.key])) {
          expandedKeys.value[parentNode.key] = true;
        }
      }
    }
  }
  return parentNode;
}

async function setExpandedParentParents(): Promise<void> {
  const result = await EntityService.getEntityParents(root.value[0].data);
  currentParent.value = null;
  alternateParents.value = [] as TreeParent[];
  if (!isArrayHasLength(result)) return;
  if (result.length === 1) {
    parentPosition.value = 0;
    currentParent.value = {
      name: result[0].name,
      iri: result[0].iri,
      listPosition: 0
    };
  } else {
    for (let i = 0; i < result.length; i++) {
      if (i === 0) {
        currentParent.value = {
          name: result[i].name,
          iri: result[i].iri,
          listPosition: i
        };
      } else {
        alternateParents.value.push({
          name: result[i].name,
          iri: result[i].iri,
          listPosition: i
        });
      }
    }
  }
}

async function onNodeSelect(node: TreeNode): Promise<void> {
  if (node.data === "loadMore") {
    if (!node.loading) await loadMore(node);
  }
  await nextTick();
  selectedKeys.value = {};
  selectedKeys.value[conceptAggregate.value.concept[RDFS.LABEL]] = true;
}

async function showPopup(event: MouseEvent, iri?: string): Promise<void> {
  if (iri && iri !== "loadMode") {
    showOverlay(event, iri);
  }
}

function hidePopup(): void {
  hideOverlay();
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
