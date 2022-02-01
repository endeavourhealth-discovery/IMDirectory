<template>
  <div class="p-d-flex p-flex-column p-jc-start" id="hierarchy-tree-bar-container">
    <div id="parent-button-bar">
      <Button
        v-if="parentLabel !== '' && parentLabel !== 'Information Model'"
        :label="parentLabel"
        icon="pi pi-chevron-up"
        @click="expandParents"
        class="p-button-text p-button-plain next-parent-button"
      />
      <div class="toggle-buttons-container">
        <Button icon="pi pi-home" @click="resetConcept" class="p-button-rounded p-button-text p-button-plain home-button">
          <i class="fas fa-home" aria-hidden="true"></i>
        </Button>
        <Button
          v-if="$store.state.treeLocked"
          class="p-button-rounded p-button-text p-button-plain tree-locked-button"
          @click="toggleTreeLocked(false)"
          v-tooltip.right="'Toggle hierarchy tree to update on concept search'"
        >
          <i class="fas fa-link" aria-hidden="true"></i>
        </Button>
        <Button
          v-else
          class="p-button-rounded p-button-text p-button-plain tree-lock-button"
          @click="toggleTreeLocked(true)"
          v-tooltip.right="'Toggle hierarchy tree to update on concept search'"
        >
          <i class="fas fa-unlink" aria-hidden="true"></i>
        </Button>
      </div>
    </div>

    <Tree
      :value="root"
      selectionMode="single"
      v-model:selectionKeys="selectedKey"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="expandChildren"
      class="tree-root"
      :loading="loading"
    >
      <template #default="slotProps">
        <div class="tree-row" @mouseover="showPopup($event, slotProps.node.data)" @mouseleave="hidePopup($event)">
          <span v-if="!slotProps.node.loading">
            <div :style="'color:' + slotProps.node.color">
              <font-awesome-icon :icon="slotProps.node.typeIcon" class="fa-fw"></font-awesome-icon>
            </div>
          </span>
          <ProgressSpinner v-if="slotProps.node.loading" />
          <span>{{ slotProps.node.label }}</span>
        </div>
      </template>
    </Tree>

    <OverlayPanel ref="hierarchyTreeOP" id="hierarchy_tree_overlay_panel" style="width: 700px" :breakpoints="{ '960px': '75vw' }">
      <div v-if="hoveredResult.name" class="p-d-flex p-flex-row p-jc-start result-overlay" style="width: 100%; gap: 7px;">
        <div class="left-side" style="width: 50%;">
          <p>
            <strong>Name: </strong>
            <span>{{ hoveredResult.name }}</span>
          </p>
          <p>
            <strong>Iri: </strong>
            <span>{{ hoveredResult.iri }}</span>
          </p>
          <p v-if="hoveredResult.code">
            <strong>Code: </strong>
            <span>{{ hoveredResult.code }}</span>
          </p>
        </div>
        <div class="right-side" style="width: 50%;">
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

<script lang="ts">
import { HistoryItem } from "@/models/HistoryItem";
import { defineComponent } from "vue";
import { mapState } from "vuex";
import EntityService from "@/services/EntityService";
import { RDFS } from "@/vocabulary/RDFS";
import { RDF } from "@/vocabulary/RDF";
import { IM } from "@/vocabulary/IM";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeMethods";
import { TreeNode } from "@/models/TreeNode";
import { MODULE_IRIS } from "@/helpers/ModuleIris";
import { ConceptAggregate } from "@/models/ConceptAggregate";
import { EntityReferenceNode } from "@/models/EntityReferenceNode";
import { TTIriRef } from "@/models/TripleTree";
import { isArrayHasLength, isObject } from "@/helpers/DataTypeCheckers";
import { Namespace } from "@/models/Namespace";
import { FiltersAsIris } from "@/models/FiltersAsIris";
import { ConceptSummary } from "@/models/search/ConceptSummary";
import { byLabel, byName } from "@/helpers/Sorters";

export default defineComponent({
  name: "Hierarchy",
  props: { active: { type: Number, required: true } },
  emits: { showTree: () => true },
  computed: mapState(["conceptIri", "focusTree", "treeLocked", "sideNavHierarchyFocus", "resetTree", "hierarchySelectedFilters"]),
  watch: {
    async conceptIri(newValue) {
      await this.getConceptAggregate(newValue);
      if (!this.treeLocked) {
        this.selectedKey = {};
        this.refreshTree();
      }
      this.updateHistory();
    },
    hierarchySelectedFilters: {
      async handler() {
        await this.getConceptAggregate(this.conceptIri);
        this.selectedKey = {};
        this.refreshTree();
        this.updateHistory();
      },
      deep: true
    },
    async sideNavHierarchyFocus(newValue, oldValue) {
      if (newValue.iri !== oldValue.iri) {
        this.selectedKey = {};
        await this.getConceptAggregate(this.conceptIri);
        this.refreshTree();
        this.updateHistory();
      }
    },
    async focusTree(newValue) {
      if (newValue === true) {
        await this.getConceptAggregate(this.conceptIri);
        this.refreshTree();
        this.$store.commit("updateFocusTree", false);
        this.$emit("showTree");
      }
    },
    active(newValue, oldValue) {
      if (!this.treeLocked && newValue === 0 && oldValue !== 0) {
        this.refreshTree();
      }
    },
    async treeLocked(newValue) {
      if (!newValue) {
        await this.getConceptAggregate(this.conceptIri);
        this.refreshTree();
      }
    },
    async resetTree(newValue) {
      if (newValue) {
        this.selectedKey = {};
        this.parentLabel = "";
        this.expandedKeys = {};
        await this.getConceptAggregate(IM.MODULE_ONTOLOGY);
        this.refreshTree();
        this.$store.commit("updateResetTree", false);
      }
    }
  },
  data() {
    return {
      searchResult: "",
      conceptAggregate: {} as ConceptAggregate,
      root: [] as TreeNode[],
      expandedKeys: {} as any,
      selectedKey: {} as any,
      parentLabel: "",
      filters: {} as FiltersAsIris,
      hoveredResult: {} as ConceptSummary | any,
      overlayLocation: {} as any,
      loading: false
    };
  },
  async mounted() {
    await this.getConceptAggregate(this.conceptIri);
    this.refreshTree();
    this.updateHistory();
  },
  beforeUnmount() {
    if (isObject(this.overlayLocation) && isArrayHasLength(Object.keys(this.overlayLocation))) {
      this.hidePopup(this.overlayLocation);
    }
  },
  methods: {
    updateHistory(): void {
      if (!MODULE_IRIS.includes(this.conceptIri)) {
        this.$store.commit("updateHistory", {
          url: this.$route.fullPath,
          conceptName: this.conceptAggregate.concept[RDFS.LABEL],
          view: this.$route.name
        } as HistoryItem);
      }
    },
    async getConceptAggregate(iri: string): Promise<void> {
      this.loading = true;
      this.conceptAggregate.concept = await EntityService.getPartialEntity(iri, [RDFS.LABEL, RDFS.COMMENT, RDF.TYPE]);

      this.setFilters();
      this.conceptAggregate.parents = await EntityService.getEntityParents(iri, this.filters);

      this.conceptAggregate.children = await EntityService.getEntityChildren(iri, this.filters);
      this.loading = false;
    },

    refreshTree(): void {
      this.loading = true;
      const concept = this.conceptAggregate.concept;
      const parentHierarchy = this.conceptAggregate.parents;
      const children = this.conceptAggregate.children;
      this.expandedKeys = {};
      const selectedConcept = this.createTreeNode(concept[RDFS.LABEL], concept[IM.IRI], concept[RDF.TYPE], concept.hasChildren);

      children.forEach((child: EntityReferenceNode) => {
        selectedConcept.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
      });
      this.root = [] as TreeNode[];

      this.parentLabel = isArrayHasLength(parentHierarchy) ? parentHierarchy[0].name : "";

      this.root.push(selectedConcept);
      this.expandedKeys[selectedConcept.key] = true;
      this.selectedKey[selectedConcept.key] = true;
      this.loading = false;
    },

    createTreeNode(conceptName: string, conceptIri: string, conceptTypes: TTIriRef[], hasChildren: boolean): TreeNode {
      return {
        key: conceptName,
        label: conceptName,
        typeIcon: getFAIconFromType(conceptTypes),
        color: getColourFromType(conceptTypes),
        data: conceptIri,
        leaf: !hasChildren,
        loading: false,
        children: [] as TreeNode[]
      };
    },

    async onNodeSelect(node: TreeNode): Promise<void> {
      if (MODULE_IRIS.includes(node.data)) {
        await this.$router.push({ name: "Dashboard" });
      } else {
        await this.$router.push({
          name: "Concept",
          params: { selectedIri: node.data }
        });
        await this.getFirstParent(node);
      }
    },

    async expandChildren(node: TreeNode): Promise<void> {
      node.loading = true;
      this.resetExpandedKeys(node.children);
      this.expandedKeys = { ...this.expandedKeys };
      this.expandedKeys[node.key] = true;
      const children = await EntityService.getEntityChildren(node.data, this.filters);
      node.children = [];
      children.forEach((child: EntityReferenceNode) => {
        node.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
      });
      node.loading = false;
    },

    resetExpandedKeys(nodes: TreeNode[]) {
      if (nodes) {
        nodes.forEach(childNode => {
          this.expandedKeys[childNode.key] = false;
          this.resetExpandedKeys(childNode.children);
        });
      }
    },

    getSelectedNodeRecursively() {
      const selectedKey = Object.keys(this.selectedKey)[0];
      let result = [] as TreeNode[];
      this.recursiveSearchForNode(selectedKey, this.root, result);
      return result[0] || this.root[0];
    },

    getNodeToExpand() {
      const selectedKey = Object.keys(this.selectedKey)[0];
      return this.root.find(node => node.key === selectedKey) || this.root[0];
    },

    recursiveSearchForNode(key: string, nodes: TreeNode[], result: TreeNode[]) {
      if (nodes.length) {
        const foundNode = nodes.find(child => child.key === key);
        if (foundNode) {
          result.push(foundNode);
          return;
        }

        nodes.forEach(node => {
          this.recursiveSearchForNode(key, node.children, result);
        });
      }
    },

    nodeIsChildOf(child: TreeNode, parent: TreeNode): boolean {
      let result = [] as TreeNode[];
      this.recursiveSearchForNode(child.key, parent.children, result);
      return result[0] ? true : false;
    },

    async expandParents(): Promise<void> {
      const selected = this.getSelectedNodeRecursively();
      const nodeToExpand = this.getNodeToExpand();
      if (!MODULE_IRIS.includes(nodeToExpand.data)) {
        const parentsNodes = [] as TreeNode[];
        const parents = await EntityService.getEntityParents(nodeToExpand.data, this.filters);
        parents.forEach((parent: EntityReferenceNode) => {
          parentsNodes.push(this.createTreeNode(parent.name, parent["@id"], parent.type, true));
        });

        if (selected.key !== nodeToExpand.key && !this.nodeIsChildOf(selected, nodeToExpand)) {
          nodeToExpand.children.push(selected);
        }

        this.expandedKeys[nodeToExpand.key] = true;
        parentsNodes[parentsNodes.length - 1].children.push(nodeToExpand);
        this.expandedKeys[parentsNodes[parentsNodes.length - 1].key] = true;

        this.root = parentsNodes;
        await this.getFirstParent(this.root[0]);
      }
    },

    async getFirstParent(node: TreeNode): Promise<void> {
      const parentsReturn = await EntityService.getEntityParents(node.data, this.filters);
      this.parentLabel = parentsReturn[0] ? parentsReturn[0].name : "";
    },

    async resetConcept(): Promise<void> {
      this.selectedKey = {};
      this.$emit("showTree");
      this.$store.commit("updateConceptIri", this.sideNavHierarchyFocus.iri);
      await this.getConceptAggregate(this.conceptIri);
      this.refreshTree();
      await this.$router.push({ name: "Dashboard" });
    },

    toggleTreeLocked(value: boolean): void {
      this.$store.commit("updateTreeLocked", value);
    },

    setFilters(): void {
      this.filters = {
        types: [],
        status: [],
        schemes: this.hierarchySelectedFilters.map((scheme: Namespace) => scheme.iri)
      };
    },

    async showPopup(event: any, iri: string): Promise<void> {
      this.overlayLocation = event;
      const x = this.$refs.hierarchyTreeOP as any;
      x.show(event);
      this.hoveredResult = await EntityService.getEntitySummary(iri);
    },

    hidePopup(event: any): void {
      const x = this.$refs.hierarchyTreeOP as any;
      x.hide(event);
      this.overlayLocation = {} as any;
    },

    getConceptTypes(types: TTIriRef[]): string {
      return types
        .map((type: TTIriRef) => {
          return type.name;
        })
        .join(", ");
    }
  }
});
</script>

<style scoped>
#hierarchy-tree-bar-container {
  height: calc(100% - 5.25rem);
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
}
.tree-root ::v-deep(.p-tree-toggler) {
  min-width: 2rem;
}

.p-progress-spinner {
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
</style>
