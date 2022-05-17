<template>
  Select folder(s) to move the entity into:
  <TreeSelect
    v-if="root.length"
    :options="root"
    v-model="selectedValues"
    selectionMode="multiple"
    :metaKeySelection="false"
    :expandedKeys="expandedKeys"
    @node-expand="onNodeExpand"
    @node-select="onNodeSelect"
    @node-unselect="onNodeUnselect"
    :loading="loading"
  >
    <template #value="{value}">
      {{ getDisplay(value) }}
    </template>
  </TreeSelect>
  <Button icon="pi pi-fw pi-eye" class="p-button-rounded p-button-text p-button-plain row-button" @click="addToFolders" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EntityService from "@/services/EntityService";
import { TreeNode, TTIriRef, EntityReferenceNode } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers } from "im-library";
const { IM } = Vocabulary;
const {
  DataTypeCheckers: { isObjectHasKeys },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isFolder }
} = Helpers;

export default defineComponent({
  name: "MoveToFolder",
  props: ["selectedIri"],

  data() {
    return {
      selectedValues: {} as any,
      selectedNodes: [] as TreeNode[],
      root: [] as TreeNode[],
      loading: true,
      expandedKeys: {} as any
    };
  },
  async mounted() {
    this.loading = true;
    this.root = await this.addParentFoldersToRoot();
    this.loading = false;
  },
  methods: {
    getDisplay(values: TreeNode[]): string {
      if (!values.length) return "None";
      return values.map(value => value.label).join(", ");
    },

    async addToFolders() {
      const entity = { "@id": this.selectedIri } as any;
      entity[IM.IS_CONTAINED_IN] = [] as any[];
      this.selectedNodes.forEach(node => {
        entity[IM.IS_CONTAINED_IN].push({ "@id": node.data });
      });
      const updated = await EntityService.updateHierarchy(entity);
      console.log(updated);
    },
    async addParentFoldersToRoot() {
      const root = [...this.root];
      const IMChildren = await EntityService.getEntityChildren(IM.NAMESPACE + "InformationModel");
      for (let IMchild of IMChildren) {
        const hasNode = !!root.find(node => node.data === IMchild["@id"]);
        if (!hasNode) root.push(this.createTreeNode(IMchild.name, IMchild["@id"], IMchild.type, IMchild.hasGrandChildren));
      }
      root.sort(this.byKey);
      return root;
    },

    byKey(a: any, b: any): number {
      if (a.key > b.key) {
        return 1;
      } else if (b.key > a.key) {
        return -1;
      } else {
        return 0;
      }
    },

    createTreeNode(conceptName: string, conceptIri: string, conceptTypes: TTIriRef[], hasChildren: boolean): TreeNode {
      return {
        key: conceptName,
        label: conceptName,
        typeIcon: ["fas", "folder"],
        color: "#3f51a388",
        data: conceptIri,
        leaf: !hasChildren,
        loading: false,
        children: [] as TreeNode[]
      };
    },

    onNodeUnselect(node: TreeNode) {
      this.selectedNodes = this.selectedNodes.filter(selectedNode => selectedNode.key !== node.key);
      this.selectedValues[node.data] = false;
    },

    onNodeSelect(node: TreeNode) {
      this.selectedNodes.push(node);
      this.selectedValues[node.data] = true;
    },

    async onNodeExpand(node: TreeNode) {
      if (isObjectHasKeys(node)) {
        node.loading = true;
        const children = await EntityService.getEntityChildren(node.data);
        children.forEach(child => {
          if (!this.nodeHasChild(node, child) && isFolder(child.type))
            node.children.push(this.createTreeNode(child.name, child["@id"], child.type, child.hasChildren));
        });
        node.loading = false;
      }
    },

    nodeHasChild(node: TreeNode, child: EntityReferenceNode) {
      return !!node.children.find(nodeChild => child["@id"] === nodeChild.data);
    }
  }
});
</script>

<style scoped></style>
