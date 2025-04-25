<template>
  <div id="tree-container">
    <Tree v-model:expandedKeys="expandedKeys" :loading="loading" :value="data" icon="loading" @node-expand="onNodeExpand" @node-collapse="onNodeCollapse">
      <template #property="{ node }: any">
        <div class="items-center">
          <ProgressSpinner v-if="node.loading" class="progress-spinner" />
          <IMFontAwesomeIcon
            v-if="node.data.typeIcon && !node.loading"
            v-tooltip.top="'Cardinality: ' + node.data.cardinality"
            :icon="node.data.typeIcon"
            :style="'color:' + node.data.color"
            class="mr-2"
            fixed-width
          />
          <IMViewerLink :iri="node.data.iri" :label="node.label" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </div>
      </template>
      <template #type="{ node }: any">
        <div class="items-center">
          <ProgressSpinner v-if="node.loading" class="progress-spinner" />
          <IMFontAwesomeIcon
            v-if="node.data.typeIcon && !node.loading"
            :icon="node.data.typeIcon"
            :style="'color:' + node.data.color"
            class="mr-2"
            fixed-width
          />
          <IMViewerLink :iri="node.data.iri" :label="node.label" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </div>
      </template>
      <template #parameter="{ node }: any">
        <div class="items-center">
          <ProgressSpinner v-if="node.loading" class="progress-spinner" />
          <IMFontAwesomeIcon
            v-if="node.data.typeIcon && !node.loading"
            :icon="node.data.typeIcon"
            :style="'color:' + node.data.color"
            class="mr-2"
            fixed-width
          />
          <IMViewerLink :iri="node.data.iri" :label="node.label" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </div>
      </template>
    </Tree>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from "vue";
import { DataModelService } from "@/services";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import type { TreeNode } from "primevue/treenode";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { IM, RDFS, RDF } from "@/vocabulary";
import { PropertyShape, TTIriRef, PropertyRange } from "@/interfaces/AutoGen";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";

const props = defineProps<{
  entityIri: string;
  entityName: string;
}>();

const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

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
  const children = await getDataModelPropertiesDisplay(iri, "0");
  data.value.push({ key: "0", label: props.entityName ?? iri, children: children, type: "root", data: { iri: iri } } as TreeNode);
  await onNodeExpand(data.value[0]);
  if (data.value[0].key) expandedKeys.value = { [data.value[0].key]: true };
  loading.value = false;
}

async function onNodeExpand(node: TreeNode) {
  if (node.children && node.children.length) {
    if (node.type === "property") {
      for (const child of node.children) {
        if (child.children && !child.children.length) {
          child.loading = true;
          const children = await getDataModelPropertiesDisplay(child.data.iri, child.key!);
          if (children.length) child.children = children;
          child.loading = false;
        }
      }
      if (node.children[0].children && node.children[0].children.length && node.children[0].type === "type") {
        node.children = node.children[0].children;
      }
    }
  }
}

function onNodeCollapse(node: TreeNode) {
  for (const key of Object.keys(expandedKeys.value)) {
    if (key.toString().startsWith(node.key! + "-")) {
      delete expandedKeys.value[key];
    }
  }
}

function createGroupNode(property: PropertyShape, index: any, propertyList: TreeNode[], parentKey: string) {
  if (property.group) {
    const name = property.group.name;

    const groupNode = {
      key: parentKey + "-" + index.toString(),
      label: name,
      children: [] as TreeNode[],
      selectable: true,
      loading: false,
      data: {
        typeIcon: getFAIconFromType([{ "@id": IM.FOLDER }]),
        color: getColourFromType([{ "@id": IM.FOLDER }]),
        iri: property.group["@id"]
      },
      type: "type"
    } as TreeNode;
    if (property.property) {
      for (const [index, groupedProperty] of property.property.entries()) {
        createPropertyNode(groupedProperty, index, groupNode.children as TreeNode[], groupNode.key);
      }
    }

    propertyList.push(groupNode);
  }
}

function createQualifierNode(property: PropertyShape, rangeNode: TreeNode) {
  if (property.datatype) {
    if (property.datatype.qualifier) {
      let qualifiers = "qualifiers ->";
      qualifiers = qualifiers + property.datatype.qualifier.map(item => item.name).join(", ");
      setQualifierNode(qualifiers, rangeNode, property.datatype["@id"], 0);
    }
    if (property.datatype.units) {
      setQualifierNode("units : " + property.datatype.units.name, rangeNode, property.datatype["@id"], 1);
    }
    if (property.datatype.operator) {
      setQualifierNode("operators : <,>,<=,>=", rangeNode, property.datatype["@id"], 2);
    }
  }
}
function setQualifierNode(qualifiers: string, rangeNode: TreeNode, iri: string, index: number) {
  const qualifierNode = {
    key: rangeNode.key + "-q" + index,
    label: qualifiers,
    children: [] as TreeNode[],
    selectable: true,
    loading: false,
    data: {
      typeIcon: getFAIconFromType([{ "@id": IM.CONCEPT }]),
      color: getColourFromType([{ "@id": IM.CONCEPT }]),
      iri: iri
    },
    type: "type"
  } as TreeNode;
  rangeNode.children!.push(qualifierNode);
}

function createParameterNode(property: PropertyShape, rangeNode: TreeNode) {
  if (property.parameter && property.parameter.length) {
    for (const [index, parameter] of property.parameter.entries()) {
      if (parameter.type) {
        const parameterNode = {
          key: rangeNode.key + "-p" + index.toString(),
          label: "parameter -> " + parameter.label + ", type :" + parameter.type?.name,
          children: [] as TreeNode[],
          selectable: true,
          loading: false,
          data: {
            typeIcon: getFAIconFromType([{ "@id": IM.CONCEPT }]),
            color: getColourFromType([{ "@id": IM.CONCEPT }]),
            iri: parameter.type["@id"]
          },
          type: "type"
        } as TreeNode;
        rangeNode.children!.push(parameterNode);
      }
    }
  }
}

function createRangeNode(property: PropertyShape, propertyNode: TreeNode) {
  let range: PropertyRange | null = null;
  let rangeType: TTIriRef | null = null;
  if (property.clazz) {
    range = property.clazz;
    if (property.clazz.type) rangeType = property.clazz.type;
  } else if (property.node) {
    range = property.node;
    if (property.node.type) rangeType = property.node.type;
  } else if (property.datatype) {
    range = property.datatype;
    if (property.datatype.type) rangeType = property.datatype.type;
  }
  if (range && rangeType) {
    const rangeNode = {
      key: propertyNode.key + "-0",
      label: range.name,
      children: [] as TreeNode[],
      selectable: true,
      loading: false,
      data: {
        typeIcon: getFAIconFromType([rangeType]),
        color: getColourFromType([rangeType]),
        iri: range["@id"]
      },
      type: "type"
    } as TreeNode;
    propertyNode.children!.push(rangeNode);
    createParameterNode(property, rangeNode);
    createQualifierNode(property, rangeNode);
  }
}

function createPropertyNode(property: PropertyShape, index: any, propertyList: TreeNode[], parentKey: string) {
  if (property.group) {
    createGroupNode(property, index, propertyList, parentKey);
  } else {
    const cardinality = `${property["minCount"] || 0} : ${property["maxCount"] || "*"}`;
    let range: PropertyRange | null = null;
    let rangeType: TTIriRef | null = null;
    if (property.clazz) {
      range = property.clazz;
      if (property.clazz.type) rangeType = property.clazz.type;
    } else if (property.node) {
      range = property.node;
      if (property.node.type) rangeType = property.node.type;
    } else if (property.datatype) {
      range = property.datatype;
      if (property.datatype.type) rangeType = property.datatype.type;
    }

    let name = property.path.name;
    if (property.hasValue) {
      const value = property.hasValueType?.["@id"] === RDFS.RESOURCE ? property.hasValue.name : property.hasValue;
      name += ` (${value})`;
    }
    const propertyType = { "@id": RDF.PROPERTY } as TTIriRef;
    if (range && rangeType) {
      const propertyNode = {
        key: parentKey + "-" + index.toString(),
        label: name,
        children: [] as TreeNode[],
        selectable: true,
        loading: false,
        data: {
          rangeType: [range],
          cardinality: cardinality,
          typeIcon: getFAIconFromType([propertyType]),
          color: getColourFromType([propertyType]),
          iri: property.path["@id"]
        },
        type: "property"
      } as TreeNode;

      createRangeNode(property, propertyNode);
      propertyList.push(propertyNode);
    }
  }
}

async function getDataModelPropertiesDisplay(iri: string, parentKey: string): Promise<TreeNode[]> {
  const entity = await DataModelService.getDataModelProperties(iri);
  const propertyList = [] as TreeNode[];
  if (entity.property && isArrayHasLength(entity.property)) {
    for (const [index, property] of entity.property.entries()) {
      createPropertyNode(property, index, propertyList, parentKey);
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

.progress-spinner {
  width: 1.25em !important;
  height: 1.25em !important;
  flex: 0 0 auto;
}
</style>
