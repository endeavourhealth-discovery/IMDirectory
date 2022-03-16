<template>
  <div class="flex flex-column justify-content-start" id="hierarchy-tree-bar-container">
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
              <font-awesome-icon :icon="slotProps.node.typeIcon" class="fa-fw"></font-awesome-icon>
            </div>
          </span>
          <ProgressSpinner v-if="slotProps.node.loading" />
          <span>{{ slotProps.node.label }}</span>
        </div>
      </template>
    </Tree>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import EntityService from "@/services/EntityService";
import { TreeNode, TTIriRef, EntityReferenceNode } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers, Vocabulary } from "im-library";
const {
  ConceptTypeMethods: { getColourFromType, getFAIconFromType, isOfTypes },
  DataTypeCheckers: { isObjectHasKeys }
} = Helpers;
const { IM, RDF, RDFS } = Vocabulary;

export default defineComponent({
  name: "FavTree",
  computed: mapState(["conceptIri", "favourites"]),
  data() {
    return {
      selected: {} as any,
      root: [] as TreeNode[],
      loading: false,
      expandedKeys: {} as any
    };
  },
  watch: {
    favourites() {
      this.addFavouriteChildren();
    }
  },
  async mounted() {
    this.addFavouritesFolder();
  },
  methods: {
    async addFavouritesFolder() {
      this.root.push({
        key: "Favourites",
        label: "Favourites",
        typeIcon: ["fas", "star"],
        color: "#e39a36",
        data: IM.NAMESPACE + "Favourites",
        leaf: false,
        loading: false,
        children: [] as TreeNode[]
      });
      this.addFavouriteChildren();
    },

    async addFavouriteChildren() {
      this.root[0].loading = true;
      this.root[0].children = [];
      for (let favourite of this.favourites) {
        const entity = await EntityService.getPartialEntity(favourite, [RDF.TYPE, RDFS.LABEL, IM.HAS_CHILDREN]);
        this.root[0].children.push(this.createTreeNode(entity[RDFS.LABEL], favourite, entity[RDF.TYPE], entity[IM.HAS_CHILDREN]));
      }
      this.root[0].loading = false;
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
      this.$router.push({
        name: "Folder",
        params: { selectedIri: node.data }
      });
      this.$store.commit("updateSelectedConceptIri", node.data);
    },

    async onNodeExpand(node: TreeNode) {
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
    }
  }
});
</script>

<style scoped>
#hierarchy-tree-bar-container {
  height: calc(100%);
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
