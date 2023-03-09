<template>
  <div id="quantifier-tree-container">
    <Tree
      :value="root"
      selectionMode="single"
      v-model:selectionKeys="selected"
      :expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-expand="onNodeExpand"
      class="tree-root"
      :loading="loading"
    >
      <template #default="slotProps">
        <div class="tree-row">
          <span v-if="!slotProps.node.loading">
            <div :style="'color:' + slotProps.node.color">
              <i :class="slotProps.node.typeIcon" class="fa-fw"></i>
            </div>
          </span>
          <ProgressSpinner v-else />
          <span>{{ slotProps.node.label }}</span>
        </div>
      </template>
    </Tree>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { EntityReferenceNode, TreeNode } from "@im-library/interfaces";
import { TTIriRef } from "@im-library/models/AutoGen";
import { getColourFromType, getFAIconFromType } from "@im-library/helpers/ConceptTypeMethods";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { byKey } from "@im-library/helpers/Sorters";
import { EntityService } from "@/services";

export default defineComponent({
  name: "QuantifierTree",
  props: {
    quantifier: { type: Object as PropType<TTIriRef>, required: false },
    isAs: { type: Array as PropType<string[]>, required: true }
  },
  emits: { treeNodeSelected: (_payload: TTIriRef) => true },
  async mounted() {
    this.loading = true;
    await this.addIsAsToRoot();
    if (this.quantifier) await this.findPathToNode(this.quantifier["@id"]);
    this.loading = false;
  },
  data() {
    return {
      selected: {} as any,
      selectedNode: {} as TreeNode,
      root: [] as TreeNode[],
      loading: true,
      expandedKeys: {} as any
    };
  },
  methods: {
    async addIsAsToRoot() {
      for (const isA of this.isAs) {
        const asNode = await EntityService.getEntityAsEntityReferenceNode(isA);
        const hasNode = !!this.root.find(node => node.data === asNode["@id"]);
        if (!hasNode) this.root.push(this.createTreeNode(asNode.name, asNode["@id"], asNode.type, asNode.hasGrandChildren));
      }
      this.root.sort(byKey);
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

    onNodeSelect(node: any): void {
      this.selectedNode = node;
      this.$emit("treeNodeSelected", { "@id": node.data, name: node.label } as TTIriRef);
    },

    async onNodeExpand(node: any) {
      if (isObjectHasKeys(node)) {
        node.loading = true;
        const children = await EntityService.getEntityChildren(node.data);
        children.forEach(child => {
          if (!this.nodeHasChild(node, child)) node.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
        });
        node.loading = false;
      }
    },

    nodeHasChild(node: TreeNode, child: EntityReferenceNode) {
      return !!node.children.find(nodeChild => child["@id"] === nodeChild.data);
    },

    selectKey(selectedKey: string) {
      Object.keys(this.selected).forEach(key => {
        this.selected[key] = false;
      });
      this.selected[selectedKey] = true;
    },

    async findPathToNode(iri: string) {
      this.loading = true;
      let path = [] as any[];
      for (const isA of this.isAs) {
        const result = await EntityService.getPathBetweenNodes(iri, isA);
        if (isArrayHasLength(result)) path = result;
      }
      if (!isArrayHasLength(path)) {
        this.loading = false;
        return;
      }
      // Recursively expand
      let n = this.root.find(c => path.find(p => p["@id"] === c.data));
      let i = 0;
      if (n) {
        this.expandedKeys = {};
        while (n && n.data != path[0]["@id"] && i++ < 50) {
          this.selectKey(n.key);
          if (!n.children || n.children.length == 0) {
            await this.onNodeExpand(n);
          }
          this.expandedKeys[n.key] = true;

          // Find relevant child
          n = n.children.find(c => path.find(p => p["@id"] === c.data));
        }

        if (n && n.data === path[0]["@id"]) {
          this.selectKey(n.key);
          // Expand node if necessary
          if (!n.children || n.children.length == 0) {
            await this.onNodeExpand(n);
          }
          for (const gc of n.children) {
            if (gc.data === iri) {
              this.selectKey(gc.key);
            }
          }
          this.expandedKeys[n.key] = true;
          this.selectedNode = n;
        } else {
          this.$toast.add({
            severity: "warn",
            summary: "Unable to locate",
            detail: "Unable to locate concept in the current hierarchy"
          });
        }
        const container = document.getElementById("quantifier-tree-container") as HTMLElement;
        const highlighted = container.getElementsByClassName("p-highlight")[0];
        if (highlighted) highlighted.scrollIntoView();
      }
    }
  }
});
</script>

<style scoped>
#quantifier-tree-container {
  max-height: 30vh;
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
</style>
