<template>
  <InputText type="text" @click="visible = true" v-model="selectedProperty.label" placeholder="Property" />
  <Dialog v-model:visible="visible" modal header="Property" :style="{ width: '50vw' }">
    <Tree
      :value="nodes"
      selectionMode="single"
      v-model:selectionKeys="selectedKey"
      @node-select="selectNode"
      :expanded-keys="expandedKeys"
      @node-expand="expandNode"
    >
      <template #default="{ node }: { node: TreeNode }">
        {{ node.label }}
      </template>
    </Tree>

    <div class="footer-actions">
      <Button class="action-button" severity="secondary" label="Cancel" @click="visible = false"></Button>
      <Button class="action-button" label="Select" @click="select"></Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { resolveIri } from "@im-library/helpers/TTTransform";
import { TTProperty } from "@im-library/interfaces";
import { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";
import { getTreeNodes } from "@im-library/helpers/PropertyTreeNodeBuilder";
import { SHACL } from "@im-library/vocabulary";

const props = defineProps({
  baseEntityIri: { type: String, required: true },
  typeValue: { type: Object as PropType<TreeNode>, required: true }
});
const visible: Ref<boolean> = ref(false);
const selectedKey = ref(undefined);
const selectedProperty: Ref<TreeNode> = ref({} as TreeNode);
const expandedKeys: Ref<any> = ref({});
const nodes: Ref<TreeNode[]> = ref([]);

onMounted(async () => {
  console.log(props.typeValue);

  const entity = await EntityService.getPartialEntity(resolveIri(props.baseEntityIri), [SHACL.PROPERTY]);
  nodes.value = getTreeNodes(entity, { children: [] });
});

function selectNode(node: TreeNode) {
  selectedProperty.value = node;
}

async function expandNode(node: TreeNode) {
  if (!isArrayHasLength(node.children) && "dataModel" === node.type) {
    const iri = (node.data as TTProperty)["http://www.w3.org/ns/shacl#node"]![0]["@id"];
    const entity = await EntityService.getPartialEntity(iri, [SHACL.PROPERTY]);
    node.children = getTreeNodes(entity, node);
  }
}

function select() {
  console.log(props.typeValue);

  props.typeValue.data = selectedProperty.value.data;
  visible.value = false;
}
</script>

<style scoped>
.action-button {
  margin-right: 0.1rem;
}
.footer-actions {
  display: flex;
  justify-content: end;
}
</style>
