<template>
  <div class="flex flex-column justify-contents-start" id="ecl-tree-bar-container">
    <div class="search-container">
      <small v-if="searchResultsLimited" class="limited-results">Results limited to first 100. Please refine your search for more accuracy.</small>
      <AutoComplete
        forceSelection
        style="flex: 1"
        input-style="flex: 1"
        optionLabel="name"
        dataKey="iri"
        v-model="selectedSearchResult"
        :suggestions="filteredSearchOptions"
        @complete="search($event.query)"
        placeholder="search..."
        :disabled="loading"
        @blur="searchResultsLimited = false"
      />
    </div>
    <div v-if="hasFocus && hasType" id="parent-container" class="flex flex-column justify-contents-start align-items-start">
      <p>
        {{ toTitleCase(getType) }} options for {{ getType === "property" ? "concept" : "property" }}:
        {{ getFocus.name }}
      </p>
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
      <template #default="slotProps">
        <div v-if="slotProps.node.data === 'loadMore'" class="tree-row">
          <ProgressSpinner v-if="slotProps.node.loading" />
          <span class="tree-node-label">{{ slotProps.node.label }}</span>
        </div>
        <div v-else class="tree-row" @click="onNodeSelect($event)" data-testid="row">
          <span v-if="!slotProps.node.loading">
            <div :style="'color:' + slotProps.node.color">
              <i :class="slotProps.node.typeIcon" class="fa-fw" aria-hidden="true" />
            </div>
          </span>
          <ProgressSpinner v-if="slotProps.node.loading" />
          <span
            class="tree-node-label"
            data-testid="row-label"
            @mouseover="showPopup($event, slotProps.node.data, slotProps.node)"
            @mouseleave="hidePopup($event)"
            >{{ slotProps.node.label }}</span
          >
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
import { onMounted, ref, Ref, watch, inject, onBeforeUnmount, computed } from "vue";
import { getNamesAsStringFromTypes } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength, isObject, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ConceptAggregate, ConceptSummary, EntityReferenceNode, TTIriRef, AliasEntity } from "@im-library/interfaces";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { EntityService, QueryService } from "@/services";
import setupTree from "@/composables/setupTree";
import { TreeNode } from "primevue/tree";
import { toTitleCase } from "@im-library/helpers/StringManipulators";
import { useToast } from "primevue/usetoast";
import { AbortController } from "abortcontroller-polyfill/dist/cjs-ponyfill";

const {
  root,
  expandedKeys,
  selectedKeys,
  createLoadMoreNode,
  createTreeNode,
  onNodeCollapse,

  onNodeExpand,

  loadMore,
  selectAndExpand,
  scrollToHighlighted,
  loadMoreChildren,
  locateChildInLoadMore,
  selectKey,
  selectedNode
} = setupTree();

const toast = useToast();

const dialogRef: Ref<any> | undefined = inject("dialogRef");

const rootConceptIri = ref("");
const conceptAggregates: Ref<ConceptAggregate[]> = ref([]);
const hoveredResult: Ref<ConceptSummary> = ref({} as ConceptSummary);
const overlayLocation: Ref = ref({});
const loading = ref(false);
const totalCount = ref(0);
const superiorsCount = ref(0);
const pageSize = ref(20);
const selectedSearchResult: Ref<null | AliasEntity> = ref(null);
const filteredSearchOptions: Ref<AliasEntity[]> = ref([]);
const controller: Ref<AbortController | undefined> = ref(undefined);
const searchResultsLimited = ref(false);

const altTreeOP = ref();

const hasFocus = computed(() => {
  return dialogRef && dialogRef.value && dialogRef.value.data && dialogRef.value.data.focus ? true : false;
});
const hasType = computed(() => {
  return dialogRef && dialogRef.value && dialogRef.value.data && dialogRef.value.data.type ? true : false;
});
const hasCurrentValue = computed(() => {
  return dialogRef && dialogRef.value && dialogRef.value.data && dialogRef.value.data.currentValue ? true : false;
});
const getFocus = computed(() => (hasFocus.value ? dialogRef?.value.data.focus : undefined));
const getType = computed(() => (hasType.value ? dialogRef?.value.data.type : undefined));
const getCurrentValue = computed(() => (hasCurrentValue.value ? dialogRef?.value.data.currentValue : undefined));

watch(getFocus, async newValue => {
  selectedKeys.value = {};
  expandedKeys.value = {};
  if (newValue && newValue.iri) {
    await getConceptAggregates();
    for (const aggregate of conceptAggregates.value) {
      await createTree(aggregate.concept, aggregate.children);
    }
  }
});

watch(loading, newValue => {
  if (newValue) hidePopup(overlayLocation.value);
});

watch(selectedSearchResult, async newValue => {
  if (newValue && newValue.iri) await findSelected(newValue.iri);
});

onMounted(async () => {
  setRootConceptIri();
  if (rootConceptIri.value && hasFocus.value) {
    await getConceptAggregates();
    for (const aggregate of conceptAggregates.value) {
      await createTree(aggregate.concept, aggregate.children);
    }
    if (root.value.length < superiorsCount.value) {
      root.value.push(
        createLoadMoreNode(
          createTreeNode(getFocus.value.iri, getFocus.value.name, [{ "@id": IM.CONCEPT, name: "Concept" }], false, null),
          1,
          superiorsCount.value
        )
      );
    }
    if (hasCurrentValue.value) {
      await findSelected(getCurrentValue.value.iri);
    }
  }
});

onBeforeUnmount(() => {
  if (isObject(overlayLocation.value) && isArrayHasLength(Object.keys(overlayLocation.value))) {
    hidePopup(overlayLocation.value);
  }
  if (controller.value) controller.value.abort();
  if (dialogRef) dialogRef.value.close();
});

function setRootConceptIri() {
  if (hasFocus.value) rootConceptIri.value = getFocus.value.iri;
}

async function getConceptAggregates(): Promise<void> {
  loading.value = true;
  let superiors = [];
  if (getType.value === "property") {
    const results = await EntityService.getSuperiorPropertiesPaged(rootConceptIri.value, 1, pageSize.value);
    superiors = results.result;
    superiorsCount.value = results.totalCount;
  } else if (getType.value === "value") {
    const results = await EntityService.getSuperiorPropertyValuesPaged(rootConceptIri.value, 1, pageSize.value);
    superiors = results.result;
    superiorsCount.value = results.totalCount;
  }
  for (const superior of superiors) {
    let superiorAggregate = { concept: {}, parents: [], children: [] } as ConceptAggregate;
    superiorAggregate.concept = superior;
    conceptAggregates.value.push(superiorAggregate);
  }
  loading.value = false;
}

async function createTree(concept: any, children: EntityReferenceNode[]): Promise<void> {
  loading.value = true;
  const selectedConcept = createTreeNode(concept.name, concept["@id"], concept.type, concept.hasChildren, null, concept.orderNumber);
  children.forEach((child: EntityReferenceNode) => {
    selectedConcept.children?.push(createTreeNode(child.name, child["@id"], child.type, child.hasChildren, selectedConcept, child.orderNumber));
  });
  if (totalCount.value >= pageSize.value) {
    selectedConcept.children?.push(createLoadMoreNode(selectedConcept, 2, totalCount.value));
  }
  root.value.push(selectedConcept);
  if (selectedConcept.key && !isObjectHasKeys(expandedKeys, [selectedConcept.key])) {
    expandedKeys.value[selectedConcept.key] = true;
  }
  loading.value = false;
}

function containsChild(nodeChildren: TreeNode[], child: EntityReferenceNode): boolean {
  return nodeChildren.some(nodeChild => nodeChild.data === child["@id"]);
}

async function onNodeSelect(node: any): Promise<void> {
  if (node.data === "loadMore") {
    if (!node.loading) {
      if (node.parentNode.data !== rootConceptIri.value) await loadMore(node);
      else await rootLoadMore(node);
    }
  } else {
    if (node.data) await selectItem(node.data);
  }
}

async function rootLoadMore(node: any) {
  node.loading = true;
  if (node.nextPage * superiorsCount.value < node.totalCount) {
    let results;
    if (getType.value === "property") {
      results = await EntityService.getSuperiorPropertiesPaged(rootConceptIri.value, node.nextPage, pageSize.value);
    } else {
      results = await EntityService.getSuperiorPropertyValuesPaged(rootConceptIri.value, node.nextPage, pageSize.value);
    }
    root.value.pop();
    results.result.forEach((superior: any) => {
      root.value.push(createTreeNode(superior[RDFS.LABEL], superior[IM.IRI], superior[RDF.TYPE], superior.hasChildren, null, undefined));
    });
    node.nextPage = node.nextPage + 1;
    root.value.push(
      createLoadMoreNode(
        createTreeNode(getFocus.value.iri, getFocus.value.name, [{ "@id": IM.CONCEPT, name: "Concept" }], false, null),
        node.nextPage,
        node.totalCount
      )
    );
  } else if (node.nextPage * pageSize.value > node.totalCount) {
    let results;
    if (getType.value === "property") {
      results = await EntityService.getSuperiorPropertiesPaged(rootConceptIri.value, node.nextPage, pageSize.value);
    } else {
      results = await EntityService.getSuperiorPropertyValuesPaged(rootConceptIri.value, node.nextPage, pageSize.value);
    }
    root.value.pop();
    results.result.forEach((superior: any) => {
      root.value.push(createTreeNode(superior[RDFS.LABEL], superior[IM.IRI], superior[RDF.TYPE], superior.hasChildren, null, undefined));
    });
  } else {
    root.value.pop();
  }
  node.loading = false;
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

async function findSelected(selectedIri: string) {
  if (selectedIri) {
    selectedKeys.value = {};
    loading.value = true;
    const found = root.value.find(node => node.data === selectedIri);
    if (found) {
      selectedKeys.value[selectedIri] = true;
      loading.value = false;
      return;
    } else {
      for (const rootNode of root.value) {
        if (selectedKeys.value[selectedIri]) return;
        const pathToNode = await EntityService.getPathBetweenNodes(selectedIri, rootNode.data);
        if (isArrayHasLength(pathToNode)) {
          await findInTreeAndSelect(selectedIri, pathToNode);
          loading.value = false;
          return;
        }
      }
      if (!selectedKeys.value[selectedIri]) throw new Error("Unable to find selected item within tree");
    }
    loading.value = false;
  }
}

async function findInTreeAndSelect(iri: string, pathToNode: TTIriRef[]) {
  // Recursively expand
  let n = root.value.find(c => pathToNode.find(p => p["@id"] === c.data));
  let i = 0;
  if (n) {
    expandedKeys.value = {};
    while (n && n.data != pathToNode[0]["@id"] && i++ < 50) {
      await selectAndExpand(n);
      // Find relevant child
      n = await locateChildInLoadMore(n, pathToNode);
    }
    if (n && n.data === pathToNode[0]["@id"]) {
      await selectAndExpand(n);

      while (!n.children?.some(child => child.data === iri)) {
        await loadMoreChildren(n);
      }
      for (const gc of n.children) {
        if (gc.data === iri && gc.key) {
          selectKey(gc.key);
        }
      }
      selectedNode.value = n;
    } else {
      toast.add({
        severity: "warn",
        summary: "Unable to locate",
        detail: "Unable to locate concept in the current hierarchy"
      });
    }
  }
  scrollToHighlighted("ecl-tree-bar-container");
}

async function search(selected: string) {
  if (selected.length > 2) {
    if (controller.value) controller.value.abort();
    controller.value = new AbortController();
    if (getType.value === "property") {
      const results = await QueryService.getAllowablePropertySuggestions(rootConceptIri.value, selected, controller.value);
      if (results && results.length) {
        if (results.length > 100) filteredSearchOptions.value = results.slice(0, 100);
        else filteredSearchOptions.value = results;
      } else filteredSearchOptions.value = [];
      searchResultsLimited.value = results.length > 100;
    } else if (getType.value === "value") {
      const results = await QueryService.getAllowableRangeSuggestions(rootConceptIri.value, selected, controller.value);
      if (results && results.length) {
        if (results.length > 100) filteredSearchOptions.value = results.slice(0, 100);
        else filteredSearchOptions.value = results;
      } else filteredSearchOptions.value = [];
      searchResultsLimited.value = results.length > 100;
    }
    controller.value = undefined;
  } else filteredSearchOptions.value = [];
}

function hidePopup(event: any): void {
  const x = altTreeOP.value as any;
  x.hide(event);
  overlayLocation.value = {} as any;
}

function getConceptTypes(types: TTIriRef[]): string {
  return getNamesAsStringFromTypes(types);
}

async function selectItem(iri: string): Promise<void> {
  const entity = await EntityService.getEntitySummary(iri);
  if (dialogRef) dialogRef.value.close({ entity: { iri: entity.iri, code: entity.code, name: entity.name }, type: getType.value });
}
</script>

<style scoped>
.search-container {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}
.tree-root {
  overflow: auto;
  border: 0;
  padding-top: 0;
}

.tree-root ::v-deep(.p-tree-toggler) {
  min-width: 2rem;
}

#ecl-tree-bar-container {
  flex: 1 1 auto;
}

.p-progress-spinner {
  width: 1.25em !important;
  height: 1.25em !important;
}

#ecl-tree-bar-container ::v-deep(.p-treenode-selectable) {
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

.loading-icon {
  flex: 0 0 auto;
  height: 1.5rem;
  width: 1.5rem;
}

.limited-results {
  width: 100%;
  height: 1rem;
  padding: 0 0 0.25rem 0;
  color: #e24c4c;
}
</style>
