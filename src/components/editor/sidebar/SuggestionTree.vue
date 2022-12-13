<template>
  <div class="flex flex-column justify-content-start" id="hierarchy-tree-bar-container">
    <Listbox
      v-model="selected"
      :options="root"
      :multiple="true"
      :filter="true"
      optionLabel="name"
      class="tree-root"
      filterPlaceholder="Search"
      @change="onChange"
    >
      <template #option="{ option }">
        <div
          class="tree-row grabbable"
          @mouseover="showOverlay($event, option)"
          @mouseleave="hideOverlay($event)"
          draggable="true"
          @dragstart="dragStart($event, option)"
        >
          <i class="fa-solid fa-grip-vertical drag-icon grabbable"></i>
          <span v-if="!option.loading">
            <div :style="'color:' + option.color">
              <i :class="option.typeIcon" class="fa-fw" aria-hidden="true"></i>
            </div>
          </span>

          <span>{{ option.label }}</span>
        </div>
      </template>
    </Listbox>

    <OverlayPanel v-if="hoveredResult.iri === 'load'" ref="navTreeOP" id="nav_tree_overlay_panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
      <div class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 1rem">
        <span>{{ hoveredResult.name }}</span>
      </div>
    </OverlayPanel>
    <OverlayPanel v-else ref="navTreeOP" id="nav_tree_overlay_panel" style="width: 50vw" :breakpoints="{ '960px': '75vw' }">
      <div v-if="hoveredResult.name" class="flex flex-row justify-contents-start result-overlay" style="width: 100%; gap: 1rem">
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
            <span>{{ getNamesAsStringFromTypes(hoveredResult.entityType) }}</span>
          </p>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, Ref, watch, ComputedRef, onMounted, onBeforeUnmount, PropType } from "vue";
import { useStore } from "vuex";
import { IMTreeNode, TTIriRef, EntityReferenceNode, ConceptSummary, QueryRequest, Query } from "@/im_library/interfaces";
import _ from "lodash";
import { isArrayHasLength, isObjectHasKeys } from "@/im_library/helpers/modules/DataTypeCheckers";
import {
  getColourFromType,
  getFAIconFromType,
  getNamesAsStringFromTypes,
  isConcept,
  isQuery,
  isValueSet,
  isRecordModel
} from "@/im_library/helpers/modules/ConceptTypeMethods";
import { byKey } from "@/im_library/helpers/modules/Sorters";
import { EntityService, QueryService } from "@/im_library/services";
import { IM, RDF, RDFS } from "@/im_library/vocabulary";
import { DisplayTTIriRef, SuggestionInfo } from "../shapeComponents/SimpleQueryBuilder.vue";
import { ignorableKeyModifiers } from "@vue/test-utils/dist/constants/dom-events";

const props = defineProps({
  propertyId: { type: String, required: false },
  suggestionSearchTerm: { type: String, required: false },
  suggestionIri: { type: String, required: false }
});

const store = useStore();
const suggestionInfo: ComputedRef<SuggestionInfo> = computed(() => store.state.suggestionInfo);
const selected: Ref<IMTreeNode[]> = ref([]);
const root: Ref<IMTreeNode[]> = ref([]);
const loading = ref(true);
const hoveredResult: Ref<ConceptSummary> = ref({} as ConceptSummary);
const overlayLocation: Ref<any> = ref({});
const pageSize: number = 20;

const navTreeOP = ref();

watch(
  () => suggestionInfo.value.propertyId,
  async () => await init()
);

onMounted(async () => {
  await init();
});

onBeforeUnmount(() => {
  if (isObjectHasKeys(overlayLocation.value)) {
    hideOverlay(overlayLocation.value);
  }
});

async function init() {
  loading.value = true;
  root.value = [];
  selected.value = [];
  if (isArrayHasLength(suggestionInfo.value.propertyValue)) populateSelected();
  if (suggestionInfo.value.suggestionIri) await populateRootFromIri(suggestionInfo.value.suggestionIri);
  loading.value = false;
}

function populateSelected() {
  selected.value = getTreeNodesFromDisplayIriRefs(suggestionInfo.value.propertyValue);
}

function getTreeNodesFromDisplayIriRefs(iriRefs: DisplayTTIriRef[]) {
  return iriRefs.map(value => createTreeNode(value.name, value["@id"], value.types, false));
}

async function populateRootFromIri(iri: string) {
  let rootNodes: IMTreeNode[] = [];
  const typeEntity = await EntityService.getPartialEntity(iri, []);
  if (isValueSet(typeEntity[RDF.TYPE])) {
    const definitionEntity = await EntityService.getPartialEntity(iri, [IM.DEFINITION]);
    if (isObjectHasKeys(definitionEntity, [IM.DEFINITION])) {
      rootNodes = await getNodesFromQuery(JSON.parse(definitionEntity[IM.DEFINITION]));
    }
  } else if (isQuery(typeEntity[RDF.TYPE])) {
    const definitionEntity = await EntityService.getPartialEntity(iri, [IM.DEFINITION]);
    if (isObjectHasKeys(definitionEntity, [IM.DEFINITION])) {
      rootNodes = await getNodesFromQuery(JSON.parse(definitionEntity[IM.DEFINITION]));
    }
  } else if (isConcept(typeEntity[RDF.TYPE])) {
    rootNodes = await getNodesFromConcept(iri);
  } else if (isRecordModel(typeEntity[RDF.TYPE])) {
    console.log("record model");
  }
  root.value = root.value.concat(rootNodes);
  root.value.sort(byKey);
}

async function getNodesFromConcept(iri: string): Promise<IMTreeNode[]> {
  const nodes: IMTreeNode[] = [];
  const directChildren = await EntityService.getEntityChildren(iri);
  for (let child of directChildren) {
    nodes.push(createTreeNode(child.name, child["@id"], child.type, child.hasGrandChildren, child.orderNumber));
  }
  return nodes;
}

async function getNodesFromQuery(query: Query): Promise<IMTreeNode[]> {
  const nodes: IMTreeNode[] = [];
  const selectedProperties = [RDFS.LABEL, RDF.TYPE, IM.HAS_CHILDREN];
  const querySelect: any = [];
  for (const selectedProperty of selectedProperties) {
    querySelect.push({ property: { "@id": selectedProperty } });
  }
  query.select = querySelect;
  const queryRequest: QueryRequest = { query: query } as QueryRequest;
  if (suggestionInfo.value.searchTerm) queryRequest.textSearch = suggestionInfo.value.searchTerm;

  let result = await QueryService.queryIM(queryRequest);

  if (!isArrayHasLength(result.entities)) {
    delete (queryRequest as any).textSearch;
    result = await QueryService.queryIM(queryRequest);
  }

  return result.entities.map(entity => createTreeNode(entity[RDFS.LABEL], entity["@id"], entity[RDF.TYPE], false));
}

function createTreeNode(conceptName: string, conceptIri: string, conceptTypes: TTIriRef[], hasChildren: boolean, order?: number): IMTreeNode {
  return {
    key: conceptName,
    label: conceptName,
    typeIcon: getFAIconFromType(conceptTypes),
    color: getColourFromType(conceptTypes),
    data: conceptIri,
    leaf: !hasChildren,
    loading: false,
    children: [] as IMTreeNode[],
    order: order
  } as IMTreeNode;
}

function createLoadMoreNode(parentNode: IMTreeNode, nextPage: number, totalCount: number): any {
  return {
    key: "loadMore" + parentNode.data,
    label: "Load more...",
    typeIcon: null,
    color: null,
    data: "loadMore",
    leaf: true,
    loading: false,
    children: [] as IMTreeNode[],
    parentNode: parentNode,
    nextPage: nextPage,
    totalCount: totalCount,
    style: "font-weight: bold;"
  };
}

function onChange(node: any): void {
  if (node.data === "loadMore") {
    loadMore(node);
  }
  suggestionInfo.value.propertyValue = getIriRefsFromNodes(node.value);
}

function getIriRefsFromNodes(nodes: IMTreeNode[]) {
  return nodes.map(treeNode => {
    return { "@id": treeNode.data, name: treeNode.label, types: treeNode.conceptTypes } as DisplayTTIriRef;
  });
}

async function loadMore(node: any) {
  if (node.nextPage * pageSize < node.totalCount) {
    const children = await EntityService.getPagedChildren(node.parentNode.data, node.nextPage, pageSize);
    node.parentNode.children.pop();
    children.result.forEach((child: any) => {
      if (!nodeHasChild(node.parentNode, child)) node.parentNode.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
    });
    node.nextPage = node.nextPage + 1;
    node.parentNode.children.push(createLoadMoreNode(node.parentNode, node.nextPage, node.totalCount));
  } else if (node.nextPage * pageSize > node.totalCount) {
    const children = await EntityService.getPagedChildren(node.parentNode.data, node.nextPage, pageSize);
    node.parentNode.children.pop();
    children.result.forEach((child: any) => {
      if (!nodeHasChild(node.parentNode, child)) node.parentNode.children.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
    });
  } else {
    node.parentNode.children.pop();
  }
}

function nodeHasChild(node: IMTreeNode, child: EntityReferenceNode) {
  return !!node.children.find(nodeChild => child["@id"] === nodeChild.data);
}

async function showOverlay(event: any, node?: any): Promise<void> {
  if (node.data === "loadMore") {
    const x: any = navTreeOP.value;
    overlayLocation.value = event;
    x.show(overlayLocation.value);
    hoveredResult.value.iri = "load";
    hoveredResult.value.name = node.parentNode.label;
  } else if (node.data && node.data !== IM.FAVOURITES) {
    const x: any = navTreeOP.value;
    overlayLocation.value = event;
    x.show(overlayLocation.value);
    hoveredResult.value = await EntityService.getEntitySummary(node.data);
  }
}

function hideOverlay(event: any): void {
  const x: any = navTreeOP.value;
  x.hide(event);
  overlayLocation.value = {};
}

function dragStart(event: any, data: any) {
  event.dataTransfer.setData("text/plain", JSON.stringify(data));
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.dropEffect = "copy";
  hideOverlay(overlayLocation.value);
}
</script>

<style scoped>
#hierarchy-tree-bar-container {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.loading-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
}

.p-tree .p-tree-container .p-treenode .p-treenode-content {
  padding: 0rem !important;
  transition: box-shadow 3600s 3600s !important;
}

.p-tree-toggler {
  margin-right: 0 !important;
}

.tree-root {
  height: 100%;
  overflow: auto;
  border: none;
  padding: 0;
}
.tree-root ::v-deep(.p-tree-toggler) {
  min-width: 2rem;
}

.tree-row .p-progress-spinner {
  width: 1.25em !important;
  height: 1.25em !important;
}

.tree-row {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.25rem;
}

#parent-button-bar {
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
}

.toggle-buttons-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.tree-locked-button,
.tree-lock-button,
.home-button,
.next-parent-button {
  width: fit-content !important;
}

#hierarchy-tree-bar-container::v-deep(.p-tree-toggler) {
  height: 1.25rem !important;
  margin: 0 0 0 0 !important;
}

.drag-icon {
  cursor: move;
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}

.grabbable:active {
  cursor: grabbing;
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
}
</style>
