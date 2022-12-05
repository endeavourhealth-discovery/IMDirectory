<template>
  <div class="flex flex-column justify-contents-start" id="secondary-tree-bar-container">
    <div id="alternate-parents-container" class="flex flex-column justify-contents-start align-items-start">
      <Button
        v-for="altParent of alternateParents"
        :key="altParent.iri"
        :label="altParent.name"
        :disabled="loading || altParent.name === ''"
        icon="pi pi-chevron-up"
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
        icon="pi pi-chevron-up"
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
      v-model:selectionKeys="selectedKey"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="expandChildren"
      @node-collapse="onNodeCollapse"
      class="tree-root"
      :loading="loading"
    >
      <template #default="slotProps">
        <div
          v-if="slotProps.node.data === 'loadMore'"
          class="tree-row"
          @mouseover="showPopup($event, slotProps.node.data, slotProps.node)"
          @mouseleave="hidePopup($event)"
        >
          <ProgressSpinner v-if="slotProps.node.loading" />
          <span class="tree-node-label">{{ slotProps.node.label }}</span>
        </div>
        <div
          v-else
          class="tree-row"
          @mouseover="showPopup($event, slotProps.node.data, slotProps.node)"
          @mouseleave="hidePopup($event)"
          @click="navigate($event, slotProps.node.data)"
          @dblclick="onDblClick(slotProps.node.data)"
          v-tooltip.top="'CTRL+click to navigate'"
          data-testid="row"
        >
          <span v-if="!slotProps.node.loading">
            <div :style="'color:' + slotProps.node.color">
              <i :class="slotProps.node.typeIcon" class="fa-fw" aria-hidden="true" />
            </div>
          </span>
          <ProgressSpinner v-if="slotProps.node.loading" />
          <span class="tree-node-label" data-testid="row-label">{{ slotProps.node.label }}</span>
        </div>
      </template>
    </Tree>

    <OverlayPanel v-if="hoveredResult.iri === 'load'" ref="altTreeOP" id="secondary_tree_overlay_panel" style="width: 700px" :breakpoints="{ '960px': '75vw' }">
      <div class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 7px">
        <span>{{ hoveredResult.name }}</span>
      </div>
    </OverlayPanel>
    <OverlayPanel v-else ref="altTreeOP" id="secondary_tree_overlay_panel" style="width: 700px" :breakpoints="{ '960px': '75vw' }">
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
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch, nextTick, inject, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getColourFromType, getFAIconFromType, getNamesAsStringFromTypes } from "../../helpers/modules/ConceptTypeMethods";
import { isArrayHasLength, isObject, isObjectHasKeys } from "../../helpers/modules/DataTypeCheckers";
import { ConceptAggregate, ConceptSummary, EntityReferenceNode, TreeNode, TreeParent, TTIriRef } from "../../interfaces";
import { IM, RDF, RDFS } from "../../vocabulary";
import { DirectService, EntityService } from "../../services";
import { useStore } from "vuex";

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const directService = new DirectService();

const conceptAggregate: Ref<ConceptAggregate> = ref({} as ConceptAggregate);
const root: Ref<TreeNode[]> = ref([]);
const expandedKeys: Ref = ref({});
const selectedKey: Ref = ref({});
const currentParent: Ref<TreeParent | null> = ref(null);
const alternateParents: Ref<TreeParent[]> = ref([]);
const parentPosition = ref(0);
const hoveredResult: Ref<ConceptSummary> = ref({} as ConceptSummary);
const overlayLocation: Ref = ref({});
const loading = ref(false);
const totalCount = ref(0);
const pageSize = ref(20);

const altTreeOP = ref();

watch(
  () => props.conceptIri,
  async newValue => {
    selectedKey.value = {};
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
  await getConceptAggregate(props.conceptIri);
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
  const selectedConcept = createTreeNode(concept[RDFS.LABEL], concept[IM.IRI], concept[RDF.TYPE], concept.hasChildren);
  children.forEach((child: EntityReferenceNode) => {
    selectedConcept.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
  });
  if (totalCount.value >= pageSize.value) {
    selectedConcept.children.push(createLoadMoreNode(selectedConcept, 2, totalCount.value));
  }
  root.value = [] as TreeNode[];
  setParents(parentHierarchy, parentPosition);
  root.value.push(selectedConcept);
  if (!isObjectHasKeys(expandedKeys, [selectedConcept.key])) {
    expandedKeys.value[selectedConcept.key] = true;
  }
  selectedKey.value[selectedConcept.key] = true;
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

function createTreeNode(conceptName: string, conceptIri: string, conceptTypes: TTIriRef[], hasChildren: boolean): TreeNode {
  return {
    key: conceptIri,
    label: conceptName,
    typeIcon: getFAIconFromType(conceptTypes),
    color: getColourFromType(conceptTypes),
    data: conceptIri,
    leaf: !hasChildren,
    loading: false,
    children: [] as TreeNode[]
  };
}

function createLoadMoreNode(parentNode: TreeNode, nextPage: number, totalCount: number): any {
  return {
    key: "loadMore" + parentNode.data,
    label: "Load more...",
    typeIcon: null,
    color: null,
    data: "loadMore",
    leaf: true,
    loading: false,
    children: [] as TreeNode[],
    parentNode: parentNode,
    nextPage: nextPage,
    totalCount: totalCount,
    style: "font-weight: bold;"
  };
}

async function expandChildren(node: TreeNode): Promise<void> {
  node.loading = true;
  if (!isObjectHasKeys(expandedKeys.value, [node.key])) {
    expandedKeys.value[node.key] = true;
  }
  const children = await EntityService.getPagedChildren(node.data, 1, pageSize.value);
  children.result.forEach((child: EntityReferenceNode) => {
    if (!containsChild(node.children, child)) {
      node.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
    }
  });
  if (children.totalCount >= pageSize.value) {
    node.children.push(createLoadMoreNode(node, 2, children.totalCount));
  }
  node.loading = false;
}

function containsChild(nodeChildren: TreeNode[], child: EntityReferenceNode): boolean {
  return nodeChildren.some(nodeChild => nodeChild.data === child["@id"]);
}

async function expandParents(parentPosition: number): Promise<void> {
  loading.value = true;
  if (!isArrayHasLength(root.value)) return;
  if (!isObjectHasKeys(expandedKeys.value, [root.value[0].key])) {
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
      parentNode = createTreeNode(parents[i].name, parents[i]["@id"], parents[i].type, true);
      parentNode.children.push(root.value[0]);
      if (!isObjectHasKeys(expandedKeys.value, [parentNode.key])) {
        expandedKeys.value[parentNode.key] = true;
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
    await loadMore(node);
  } else {
  }
  await nextTick();
  selectedKey.value = {};
  selectedKey.value[conceptAggregate.value.concept[RDFS.LABEL]] = true;
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
  if (event.metaKey || event.ctrlKey) directService.select(iri);
}

function onDblClick(iri: string) {
  directService.view(iri);
}

async function loadMore(node: any) {
  if (node.nextPage * pageSize.value < node.totalCount) {
    const children = await EntityService.getPagedChildren(node.parentNode.data, node.nextPage, pageSize.value);
    node.parentNode.children.pop();
    children.result.forEach((child: any) => {
      node.parentNode.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
    });
    node.nextPage = node.nextPage + 1;
    node.parentNode.children.push(createLoadMoreNode(node.parentNode, node.nextPage, node.totalCount));
  } else if (node.nextPage * pageSize.value > node.totalCount) {
    const children = await EntityService.getPagedChildren(node.parentNode.data, node.nextPage, pageSize.value);
    node.parentNode.children.pop();
    children.result.forEach((child: any) => {
      node.parentNode.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
    });
  } else {
    node.parentNode.children.pop();
  }
}

function onNodeCollapse(node: any) {
  node.children = [];
  node.leaf = false;
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
  border-top: 1px solid #dee2e6;
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
