<template>
  <div class="details-container">
    <div style="margin-bottom: 1em">
      <Button class="details-tree-button" icon="pi pi-plus" label="Expand All" @click="expandAll" />
      <Button class="details-tree-button p-button-secondary" icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
    </div>
    <Tree :value="definition" :expandedKeys="expandedKeys" class="tree-container">
      <template #default="{ node }">
        {{ node.label }}
      </template>
      <template #property="{ node }"> {{ node.label }}: <IMViewerLink :iri="node.data['@id']" :label="node.data.name" /> </template>
      <template #link="{ node }">
        <IMViewerLink :iri="node.key!" :label="node.label" />
      </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@/im_library/helpers/modules/DataTypeCheckers";
import { TTBundle } from "@/im_library/interfaces";
import { EntityService } from "@/im_library/services";
import { IM, RDF, RDFS, SHACL } from "@/im_library/vocabulary";
import { TreeNode } from "primevue/tree";
import { onMounted, Ref, ref, watch } from "vue";
import IMViewerLink from "@/im_library/components/modules/IMViewerLink.vue";
const props = defineProps({
  conceptIri: { type: String, required: true }
});

const definition: Ref<any> = ref();
const expandedKeys: Ref<any> = ref({});

watch(
  () => props.conceptIri,
  async newValue => getDefinition()
);

onMounted(async () => await getDefinition());

const expandAll = () => {
  for (let node of definition.value) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
};
const collapseAll = () => {
  expandedKeys.value = {};
};
const expandNode = (node: TreeNode) => {
  if (node.children && node.children.length) {
    expandedKeys.value[node.key!] = true;

    for (let child of node.children) {
      expandNode(child);
    }
  }
};

async function getDefinition() {
  // TODO - move conversion logic to node api
  // definition.value = await EntityService.getEntityDefinition(props.conceptIri);
  const response = await EntityService.getBundleByPredicateExclusions(props.conceptIri, [IM.CODE, RDF.TYPE, RDFS.LABEL, IM.HAS_STATUS, RDFS.COMMENT]);
  definition.value = convertDefinitionToTreeData(response);
}

function buildTreeDataRecursively(treeNode: TreeNode, entity: any, predicates: any) {
  if (isObjectHasKeys(entity)) {
    for (const key of Object.keys(entity)) {
      if (key === SHACL.PROPERTY) {
        const newTreeNode = { key: key, label: predicates[key] || entity[key]?.path?.[0]?.name || key, children: [] } as TreeNode;
        treeNode.children?.push(newTreeNode);
        if (isArrayHasLength(entity[key])) {
          for (const property of entity[key]) {
            const propertyNode = {
              key: property?.[SHACL.PATH]?.[0]?.["@id"] || key,
              label: property?.[SHACL.PATH]?.[0]?.name || predicates[key] || key,
              children: []
            } as TreeNode;
            newTreeNode.children?.push(propertyNode);

            for (const propertyKey of Object.keys(property)) {
              if (SHACL.NAMESPACE + "order" === propertyKey) {
                propertyNode.children?.push({
                  key: key + "." + propertyKey,
                  label: predicates[propertyKey] + ": " + property[propertyKey]
                });
              } else {
                propertyNode.children?.push({
                  key: key + "." + propertyKey,
                  label: predicates[propertyKey],
                  data: property[propertyKey]?.[0],
                  type: "property"
                });
              }
            }

            // console.log(property)
            // buildTreeDataRecursively(propertyNode, property, predicates);
          }
        }
      } else if (key !== "@id") {
        const newTreeNode = { key: key, label: predicates[key], children: [] };
        treeNode.children?.push(newTreeNode);
        buildTreeDataRecursively(newTreeNode, entity[key], predicates);
      }
    }
  } else if (isArrayHasLength(entity)) {
    for (const item of entity) {
      treeNode.children?.push({ key: item["@id"], label: item.name, type: "link" });
    }
  } else {
    treeNode.label += ": " + entity;
  }
}

function convertDefinitionToTreeData(definition: TTBundle): TreeNode {
  const treeNode = { children: [] } as TreeNode;
  buildTreeDataRecursively(treeNode, definition.entity, definition.predicates);
  return treeNode.children!;
}
</script>

<style scoped>
.details-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
}
.tree-container {
  height: 100vh;
  overflow-y: auto;
}

.details-tree-button {
  margin-right: 0.5rem;
}
</style>
