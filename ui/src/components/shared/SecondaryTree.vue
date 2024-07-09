<template>
  <div class="flex flex-column justify-contents-start" id="secondary-tree-bar-container">
    <div id="alternate-parents-container" class="flex flex-column justify-contents-start align-items-start">
      <Button
        v-for="altParent of alternateParents"
        :key="altParent.iri"
        :label="altParent.name"
        :disabled="loading || altParent.name === ''"
        icon="fa-solid fa-chevron-up"
        @click="expandParents(altParent.listPosition)"
        @mouseenter="showPopup($event, altParent.iri)"
        @mouseleave="hidePopup($event)"
        class="p-button-text p-button-plain"
        data-testid="alt-parent"
      />
    </div>
    <div class="flex flex-row justify-contents-start" id="secondary-tree-parents-bar">
      <Button
        :label="currentParent?.name"
        :disabled="loading || !currentParent"
        icon="fa-solid fa-chevron-up"
        @click="expandParents(parentPosition)"
        @mouseenter="showPopup($event, currentParent?.iri)"
        @mouseleave="hidePopup($event)"
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
          @click="navigate($event, node.data)"
          @dblclick="onNodeDblClick($event, node)"
          v-tooltip.top="'CTRL+click to navigate'"
          data-testid="row"
        >
          <span v-if="!node.loading">
            <IMFontAwesomeIcon v-if="node.typeIcon" :icon="node.typeIcon" fixed-width :style="'color:' + node.color" />
          </span>
          <ProgressSpinner v-if="node.loading" />
          <span class="tree-node-label" data-testid="row-label" @mouseover="showPopup($event, node.data, node)" @mouseleave="hidePopup($event)">{{
            node.label
          }}</span>
          <Button icon="fa-regular fa-square-plus" text @click.stop="emit('onSelect', node.data)" v-tooltip="'Add to list'" data-testid="add-button" />
          <!-- <Button v-if="showSelect" icon="pi pi-plus" v-tooltip="'Add to list'" outlined @click="emit('onSelect', node.data)" /> -->
        </div>
      </template>
    </Tree>

    <Popover v-if="hoveredResult.iri === 'load'" ref="altTreeOP" id="secondary_tree_overlay_panel" style="width: 700px" :breakpoints="{ '960px': '75vw' }">
      <div class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 7px">
        <span>{{ hoveredResult.name }}</span>
      </div>
    </Popover>
    <Popover v-else ref="altTreeOP" id="secondary_tree_overlay_panel" style="width: 700px" :breakpoints="{ '960px': '75vw' }">
      <div v-if="hoveredResult.name" class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 7px">
        <div class="left-side" style="width: 50%">
          <p>
            <strong>Name: </strong>
            <span>{{ hoveredResult.name }}</span>
          </p>
          <p>
            <strong>Iri: </strong>
            <span style="word-break: break-all">{{ hoveredResult.iri }}</span>
          </p>
          <p v-if="hoveredResult.code">
            <strong>Code: </strong>
            <span>{{ hoveredResult.code }}</span>
          </p>
        </div>
        <div class="right-side" style="width: 50%">
          <p v-if="hoveredResult.status">
            <strong>Status: </strong>
            <span>{{ hoveredResult.status.name }}</span>
          </p>
          <p v-if="hoveredResult.scheme">
            <strong>Scheme: </strong>
            <span>{{ hoveredResult.scheme.name }}</span>
          </p>
          <p v-if="hoveredResult.entityType">
            <strong>Type: </strong>
            <span>{{ getConceptTypes(hoveredResult.entityType) }}</span>
          </p>
        </div>
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch, nextTick, onBeforeUnmount } from "vue";
import IMFontAwesomeIcon from "./IMFontAwesomeIcon.vue";
import { getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength, isObject, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ConceptAggregate, EntityReferenceNode, TreeParent } from "@im-library/interfaces";
import { TTIriRef, SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { DirectService, EntityService } from "@/services";
import setupTree from "@/composables/setupTree";
import { TreeNode } from "primevue/treenode";

interface Props {
  entityIri: string;
  showSelect?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits({
  navigateTo: (_payload: string) => true,
  onSelect: (_payload: string) => true
});

const { root, expandedKeys, selectedKeys, createLoadMoreNode, createTreeNode, onNodeCollapse, onNodeDblClick, onNodeExpand, loadMore } = setupTree();

const conceptAggregate: Ref<ConceptAggregate> = ref({} as ConceptAggregate);
const currentParent: Ref<TreeParent | null> = ref(null);
const alternateParents: Ref<TreeParent[]> = ref([]);
const parentPosition = ref(0);
const hoveredResult: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const overlayLocation: Ref = ref({});
const loading = ref(false);
const totalCount = ref(0);
const pageSize = ref(20);

const altTreeOP = ref();

watch(
  () => props.entityIri,
  async newValue => {
    selectedKeys.value = {};
    alternateParents.value = [];
    expandedKeys.value = {};
    await getConceptAggregate(newValue);
    await createTree(conceptAggregate.value.concept, conceptAggregate.value.parents, conceptAggregate.value.children, parentPosition.value);
  }
);

watch(loading, newValue => {
  if (newValue) hidePopup(overlayLocation.value);
});

onMounted(async () => {
  await getConceptAggregate(props.entityIri);
  await createTree(conceptAggregate.value.concept, conceptAggregate.value.parents, conceptAggregate.value.children, 0);
});

onBeforeUnmount(() => {
  if (isObject(overlayLocation.value) && isArrayHasLength(Object.keys(overlayLocation.value))) {
    hidePopup(overlayLocation.value);
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

async function createTree(concept: any, parentHierarchy: EntityReferenceNode[], children: EntityReferenceNode[], parentPosition: number): Promise<void> {
  loading.value = true;
  const selectedConcept = createTreeNode(concept[RDFS.LABEL], concept[IM.IRI], concept[RDF.TYPE], concept.hasChildren, null, undefined);
  children.forEach((child: EntityReferenceNode) => {
    selectedConcept.children?.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren, selectedConcept, child.orderNumber));
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

function setParents(parentHierarchy: EntityReferenceNode[], parentPosition: number): void {
  if (isArrayHasLength(parentHierarchy)) {
    if (parentHierarchy.length === 1) {
      currentParent.value = {
        name: parentHierarchy[parentPosition].name,
        iri: parentHierarchy[parentPosition]["@id"],
        listPosition: 0
      };
      alternateParents.value = [] as TreeParent[];
    } else {
      for (let i = 0; i < parentHierarchy.length; i++) {
        if (i === parentPosition) {
          currentParent.value = {
            name: parentHierarchy[parentPosition].name,
            iri: parentHierarchy[parentPosition]["@id"],
            listPosition: i
          };
        } else {
          alternateParents.value.push({
            name: parentHierarchy[i].name,
            iri: parentHierarchy[i]["@id"],
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

function containsChild(nodeChildren: TreeNode[], child: EntityReferenceNode): boolean {
  return nodeChildren.some(nodeChild => nodeChild.data === child["@id"]);
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

function createExpandedParentTree(parents: any, parentPosition: number): TreeNode {
  let parentNode = {} as TreeNode;
  for (let i = 0; i < parents.length; i++) {
    if (i === parentPosition) {
      parentNode = createTreeNode(parents[i].name, parents[i]["@id"], parents[i].type, true, null, undefined);
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
      iri: result[0]["@id"],
      listPosition: 0
    };
  } else {
    for (let i = 0; i < result.length; i++) {
      if (i === 0) {
        currentParent.value = {
          name: result[i].name,
          iri: result[i]["@id"],
          listPosition: i
        };
      } else {
        alternateParents.value.push({
          name: result[i].name,
          iri: result[i]["@id"],
          listPosition: i
        });
      }
    }
  }
}

async function onNodeSelect(node: any): Promise<void> {
  if (node.data === "loadMore") {
    if (!node.loading) await loadMore(node);
  } else {
  }
  await nextTick();
  selectedKeys.value = {};
  selectedKeys.value[conceptAggregate.value.concept[RDFS.LABEL]] = true;
}

async function showPopup(event: any, iri?: string, node?: any): Promise<void> {
  if (iri === "loadMore") {
    overlayLocation.value = event;
    const x = altTreeOP.value as any;
    x.show(event);
    hoveredResult.value.iri = "load";
    hoveredResult.value.name = node.parentNode.label;
  } else if (iri) {
    overlayLocation.value = event;
    const x = altTreeOP.value as any;
    x.show(event);
    hoveredResult.value = await EntityService.getEntitySummary(iri);
  }
}

function hidePopup(event: any): void {
  const x = altTreeOP.value as any;
  x.hide(event);
  overlayLocation.value = {} as any;
}

function getConceptTypes(types: TTIriRef[]): string {
  return getNamesAsStringFromTypes(types);
}

function navigate(event: any, iri: string): void {
  if (event.metaKey || event.ctrlKey) emit("navigateTo", iri);
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

#secondary-tree-bar-container {
  flex: 1 1 auto;
  border-top: 1px solid var(--p-surface-border);
}

.p-progress-spinner {
  width: 1.25em !important;
  height: 1.25em !important;
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
  word-break: break-all;
}
</style>
