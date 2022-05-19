<template>
  <Card>
    <template #subtitle>
      Select folder(s) to move the entity into:
    </template>
    <template #content>
      <TreeSelect
        style="width: 100%"
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
    </template>
    <template #footer>
      <div class="button-bar">
        <Button icon="pi pi-times" label="Cancel" class="p-button-secondary" @click="cancel" />
        <Button icon="pi pi-check" label="Update hierarchy" class="save-button" @click="addToFolders" />
      </div>
    </template>
  </Card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EntityService from "@/services/EntityService";
import { TreeNode, TTIriRef, EntityReferenceNode } from "im-library/dist/types/interfaces/Interfaces";
import { Vocabulary, Helpers, LoggerService } from "im-library";
const { IM } = Vocabulary;
const {
  DataTypeCheckers: { isObjectHasKeys, isArrayHasLength },
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isFolder }
} = Helpers;

export default defineComponent({
  name: "MoveToFolder",
  props: ["selectedIri"],
  emits: {
    containedInUpdated: () => true,
    closeMoveToDialog: () => true
  },
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
    const entity = await EntityService.getPartialEntity(this.selectedIri, [IM.IS_CONTAINED_IN]);
    if (isArrayHasLength(entity[IM.IS_CONTAINED_IN])) {
      entity[IM.IS_CONTAINED_IN].forEach((containedIn: TTIriRef) => {
        this.onNodeSelect(this.createTreeNode(containedIn.name, containedIn["@id"], [], false));
      });
    }
    this.loading = false;
  },
  methods: {
    getDisplay(values: TreeNode[]): string {
      if (!values.length) return "None";
      return values.map(value => value.label).join(", ");
    },

    cancel() {
      this.$emit("closeMoveToDialog");
    },

    async addToFolders() {
      const entity = { "@id": this.selectedIri } as any;
      entity[IM.IS_CONTAINED_IN] = [] as any[];
      this.selectedNodes.forEach(node => {
        entity[IM.IS_CONTAINED_IN].push({ "@id": node.data });
      });
      try {
        const updated = await EntityService.updateHierarchy(entity);
        let updateMessage = "";
        if (isArrayHasLength(updated[IM.IS_CONTAINED_IN])) {
          updateMessage = ". Can be found under: " + updated[IM.IS_CONTAINED_IN].map((containedIn: TTIriRef) => containedIn.name).join(", ");
        }
        this.$toast.add(LoggerService.success("Entity updated" + updateMessage));
      } catch (error) {
        this.$toast.add(LoggerService.success("Something went wrong and the entity was not updated"));
      }
      this.$emit("containedInUpdated");
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
      this.selectedValues[node.key] = true;
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

<style scoped>
.button-bar {
  flex: 0 1 auto;
  padding: 1rem 1rem 1rem 0;
  gap: 0.5rem;
  width: 100%;
  background-color: #ffffff;
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
}

.p-card {
  border: none;
  box-shadow: none;
}
</style>
