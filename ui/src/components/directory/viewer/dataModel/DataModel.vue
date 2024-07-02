<template>
  <div id="tree-container">
    <Tree :value="data" v-model:expandedKeys="expandedKeys" @node-expand="onNodeExpand" @node-collapse="onNodeCollapse" :loading="loading" icon="loading">
      <template #property="{ node }: any">
        <div class="tree-row">
          <ProgressSpinner v-if="node.loading" />
          <IMFontAwesomeIcon
            v-if="node.data.typeIcon && !node.loading"
            v-tooltip.top="'Cardinality: ' + node.data.cardinality"
            :icon="node.data.typeIcon"
            fixed-width
            :style="'color:' + node.data.color"
          />
          <IMViewerLink :iri="node.key" :label="node.label" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </div>
      </template>
      <template #type="{ node }: any">
        <div class="tree-row">
          <ProgressSpinner v-if="node.loading" />
          <IMFontAwesomeIcon v-if="node.data.typeIcon && !node.loading" :icon="node.data.typeIcon" fixed-width :style="'color:' + node.data.color" />
          <IMViewerLink :iri="node.key" :label="node.label" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </div>
      </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { TreeNode } from "primevue/treenode";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { RDF, SHACL } from "@im-library/vocabulary";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";

interface Props {
  entityIri: string;
}
const props = defineProps<Props>();

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

watch(
  () => props.entityIri,
  async newValue => await getDataModel(newValue)
);

const loading = ref(false);
const data: Ref<TreeNode[]> = ref([]);
const expandedKeys = ref({} as any);

onMounted(async () => {
  await getDataModel(props.entityIri);
});

async function getDataModel(iri: string) {
  loading.value = true;
  const name = (await EntityService.getNames([iri]))[0].name;
  const children = await getDataModelPropertiesDisplay(iri);
  data.value.push({ key: iri, label: name ?? iri, children: children, type: "root" } as TreeNode);
  await onNodeExpand(data.value[0]);
  if (data.value[0].key) expandedKeys.value = { [data.value[0].key]: true };
  loading.value = false;
}

async function onNodeExpand(node: TreeNode) {
  if (node.type === "property") {
    if (node.children && node.children.length) {
      for (const child of node.children) {
        child.loading = true;
        const children = await getDataModelPropertiesDisplay(child.key!);
        if (children.length) child.children = children;
        child.loading = false;
      }
    }
  } else {
    if (node.children && node.children.length) {
      for (const child of node.children) {
        child.loading = true;
        if (isObjectHasKeys(child.data, ["type"])) {
          for (const type of child.data.type) {
            const newChild = {
              key: type["@id"],
              label: type.name,
              children: [] as TreeNode[],
              selectable: true,
              type: "type",
              loading: false,
              data: {}
            } as TreeNode;
            if (child.children && !child.children.includes(newChild)) child.children!.push(newChild);
          }
        }
        const iris = [];
        for (const child of node.children) {
          for (const child2 of child.children!) {
            iris.push(child2.key!);
          }
        }
        const entity2 = await EntityService.getPartialEntities(iris, [RDF.TYPE]);
        for (const e in entity2) {
          node.children.forEach((child: TreeNode) => {
            child.children!.forEach((child2: TreeNode) => {
              if (child2.key === entity2[e]["@id"]) {
                child2.data.typeIcon = getFAIconFromType(entity2[e][RDF.TYPE]);
                child2.data.color = getColourFromType(entity2[e][RDF.TYPE]);
              }
            });
          });
        }
        child.loading = false;
      }
    }
  }
}

function onNodeCollapse(node: TreeNode) {
  for (const [key, value] of Object.entries(expandedKeys.value)) {
    node.children!.forEach((child: TreeNode) => {
      if (child.key === key) {
        delete expandedKeys.value[child.key];
      }
    });
  }
}

async function getDataModelPropertiesDisplay(iri: string): Promise<TreeNode[]> {
  const entity = await EntityService.getPartialEntity(iri, [SHACL.PROPERTY]);
  const propertyList = [] as TreeNode[];
  if (isObjectHasKeys(entity, [SHACL.PROPERTY]) && isArrayHasLength(entity[SHACL.PROPERTY])) {
    const iris = [];
    for (const ttproperty2 of entity[SHACL.PROPERTY]) {
      iris.push(ttproperty2[SHACL.PATH][0]["@id"]);
    }
    const entity2 = await EntityService.getPartialEntities(iris, [RDF.TYPE]);
    for (const [index, ttproperty] of entity[SHACL.PROPERTY].entries()) {
      const cardinality = `${ttproperty[SHACL.MINCOUNT] || 0} : ${ttproperty[SHACL.MAXCOUNT] || "*"}`;
      if (isObjectHasKeys(ttproperty, [SHACL.OR])) {
        const property = {
          key: ttproperty[SHACL.PATH][0]["@id"],
          label: ttproperty[SHACL.PATH][0].name,
          children: [] as TreeNode[],
          selectable: true,
          loading: false,
          data: {
            cardinality: cardinality,
            isOr: true,
            type: [] as TreeNode[]
          },
          type: "property"
        } as TreeNode;
        for (const orProperty of ttproperty[SHACL.OR]) {
          const type = orProperty[SHACL.CLASS] || orProperty[SHACL.NODE] || orProperty[SHACL.DATATYPE] || [];
          const name = `${orProperty[SHACL.PATH]?.[0].name}  (${
            isArrayHasLength(type) ? (type[0].name ? type[0].name : type[0]["@id"].slice(type[0]["@id"].indexOf("#") + 1)) : ""
          })`;
          property.property.push({ "@id": orProperty[SHACL.PATH]?.[0]["@id"], name: name });
          const types = isArrayHasLength(type) ? type[0] : {};
          property.data.type.push(types);
          property.data.typeIcon = getFAIconFromType(types);
          property.data.color = getColourFromType(types);
        }
        propertyList.push(property);
      } else {
        const type = ttproperty[SHACL.CLASS] || ttproperty[SHACL.NODE] || ttproperty[SHACL.DATATYPE] || [];
        const group = ttproperty?.[SHACL.GROUP]?.[0];
        const name = `${ttproperty[SHACL.PATH]?.[0].name}  (${isArrayHasLength(type) ? (type[0].name ? type[0].name : type[0]["@id"]) : ""})`;
        const typeTypes = entity2[index][RDF.TYPE];
        const property = {
          key: ttproperty[SHACL.PATH][0]["@id"],
          label: name,
          children: [] as TreeNode[],
          selectable: true,
          loading: false,
          data: {
            type: [isArrayHasLength(type) ? type[0] : ""],
            cardinality: cardinality,
            isOr: false,
            typeIcon: getFAIconFromType(typeTypes),
            color: getColourFromType(typeTypes)
          },
          type: "property"
        } as TreeNode;
        if (group) {
          property.group = group;
        }
        propertyList.push(property);
      }
    }
  }
  return propertyList;
}
</script>

<style scoped>
#tree-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
}

.tree-row {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.25rem;
}

.tree-row .p-progress-spinner {
  width: 1.25em !important;
  height: 1.25em !important;
  flex: 0 0 auto;
}
</style>
