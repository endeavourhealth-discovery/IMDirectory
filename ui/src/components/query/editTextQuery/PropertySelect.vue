<template>
  <InputText type="text" @click="visible = true" v-model="selectedProperty.label" />

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
import { ITextQuery, TTProperty } from "@im-library/interfaces";
import { TreeNode } from "primevue/tree";
import { onMounted, PropType, Ref, ref } from "vue";
import { getTreeNodes } from "@im-library/helpers/PropertyTreeNodeBuilder";
import { SHACL } from "@im-library/vocabulary";
import AncestorDescendantSelect from "./AncestorDescendantSelect.vue";

const emit = defineEmits({ onSelect: (payload: TreeNode) => payload });

const props = defineProps({
  from: { type: Object as PropType<ITextQuery>, required: true },
  property: { type: Object as PropType<TreeNode>, required: false }
});
const visible: Ref<boolean> = ref(false);
const selectedKey = ref(undefined);
const selectedProperty: Ref<TreeNode> = ref({} as TreeNode);
const expandedKeys: Ref<any> = ref({});
const nodes: Ref<TreeNode[]> = ref([]);

onMounted(async () => {
  const iri: string = props.from.data["@id"] || props.from.data["@type"] || props.from.data["@set"];
  const entity = await EntityService.getPartialEntity(resolveIri(iri), [SHACL.PROPERTY]);
  nodes.value = getTreeNodes(entity, { children: [] });
});

function selectNode(node: TreeNode) {
  selectedProperty.value = node;
  emit("onSelect", selectedProperty);
}

async function expandNode(node: TreeNode) {
  if (!isArrayHasLength(node.children) && "dataModel" === node.type) {
    const iri = (node.data as TTProperty)["http://www.w3.org/ns/shacl#node"]![0]["@id"];
    const entity = await EntityService.getPartialEntity(iri, [SHACL.PROPERTY]);
    node.children = getTreeNodes(entity, node);
  }
}

function select() {
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
