<template>
  <div id="tree-container">
    <Tree
      v-model:expandedKeys="expandedKeys"
      :loading="loading"
      :value="data"
      icon="loading"
      @node-expand="onNodeExpand"
      @node-collapse="onNodeCollapse"
      v-model:selection-keys="selectedKey"
    >
      <template #property="{ node }: any">
        <div class="items-center" @mouseover="event => showOverlay(event, node.data.iri)" @mouseleave="hideOverlay">
          <ProgressSpinner v-if="node.loading" class="progress-spinner" />
          <IMFontAwesomeIcon
            v-if="node.data.typeIcon && !node.loading"
            v-tooltip.top="'Cardinality: ' + node.data.cardinality"
            :icon="node.data.typeIcon"
            :style="'color:' + node.data.color"
            class="mr-2"
            fixed-width
          />
          <span @click="emit('selected', node.data.iri)" class="cursor-pointer">{{ node.label ?? node.data.iri }}</span>
        </div>
      </template>
      <template #type="{ node }: any">
        <div class="items-center" @mouseover="event => showOverlay(event, node.data.iri)" @mouseleave="hideOverlay">
          <ProgressSpinner v-if="node.loading" class="progress-spinner" />
          <IMFontAwesomeIcon
            v-if="node.data.typeIcon && !node.loading"
            :icon="node.data.typeIcon"
            :style="'color:' + node.data.color"
            class="mr-2"
            fixed-width
          />
          <span @click="emit('selected', node.data.iri)" class="cursor-pointer">{{ node.label ?? node.data.iri }}</span>
        </div>
      </template>
      <template #parameter="{ node }: any">
        <div class="items-center" @mouseover="event => showOverlay(event, node.data.iri)" @mouseleave="hideOverlay">
          <ProgressSpinner v-if="node.loading" class="progress-spinner" />
          <IMFontAwesomeIcon
            v-if="node.data.typeIcon && !node.loading"
            :icon="node.data.typeIcon"
            :style="'color:' + node.data.color"
            class="mr-2"
            fixed-width
          />
          <Button
            v-else
            :label="node.label ?? node.data.iri"
            class="flex-auto justify-start p-0"
            link
            @click="emit('selected', node.data.iri)"
            @mouseleave="hideOverlay"
            @mouseover="showOverlay($event, node.data.iri)"
          />
          <span @click="emit('selected', node.data.iri)" class="cursor-pointer">{{ node.label ?? node.data.iri }}</span>
        </div>
      </template>
    </Tree>
    <OverlaySummary ref="OS" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from "vue";
import { DataModelService, EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import type { TreeNode } from "primevue/treenode";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { IM, RDF, RDFS, SHACL } from "@/vocabulary";
import { PropertyRange, PropertyShape, TTIriRef } from "@/interfaces/AutoGen";
import { getColourFromType, getFAIconFromType } from "@/helpers/ConceptTypeVisuals";
import IMFontAwesomeIcon from "@/components/shared/IMFontAwesomeIcon.vue";
import OverlaySummary from "@/components/shared/OverlaySummary.vue";
import setupOverlay from "@/composables/setupOverlay";

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();

const emit = defineEmits({
  navigateTo: (_payload: string) => true,
  selected: (_payload: string) => true
});

const { OS, showOverlay, hideOverlay } = setupOverlay();

watch(
  () => props.entityIri,
  async newValue => await getDataModel(newValue)
);

const loading = ref(false);
const data: Ref<TreeNode[]> = ref([]);
const expandedKeys = ref({} as any);
const selectedKey: Ref<{ key: string }[]> = ref([]);

onMounted(async () => {
  await getDataModel(props.entityIri);
});

async function getDataModel(iri: string) {
  loading.value = true;
  const name = (await EntityService.getNames([iri]))[0].name;
  const children = await getDataModelPropertiesDisplay(iri, "0", null);
  data.value.push({ key: "0", label: name ?? iri, children: children, type: "root", data: { iri: iri } } as TreeNode);
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
          const children = await getDataModelPropertiesDisplay(child.data.iri, child.key!, props.entityIri);
          if (children.length) child.children = children;
          child.loading = false;
        }
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
    let name = property.group.name;

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

function createParameterNode(property: PropertyShape, propertyNode: TreeNode) {
  if (property.parameter && property.parameter.length) {
    let params = "parameters : ";
    for (const [index, parameter] of property.parameter.entries()) {
      if (parameter.type) {
        const parameterNode = {
          key: propertyNode.key + "-p" + index.toString(),
          label: "parameter -> " + parameter.label + ", type :" + parameter.type?.name,
          children: [] as TreeNode[],
          selectable: true,
          loading: false,
          data: {
            typeIcon: getFAIconFromType([{ "@id": IM.CONCEPT }]),
            color: getColourFromType([{ "@id": IM.CONCEPT }]),
            iri: parameter.type["@id"]
          },
          type: "parameter"
        } as TreeNode;
        propertyNode.children!.push(parameterNode);
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
    const propertyType = property.type as TTIriRef[];
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
          typeIcon: getFAIconFromType(propertyType),
          color: getColourFromType(propertyType),
          iri: property.path["@id"]
        },
        type: "property"
      } as TreeNode;

      createRangeNode(property, propertyNode);
      createParameterNode(property, propertyNode);
      propertyList.push(propertyNode);
    }
  }
}

async function getDataModelPropertiesDisplay(iri: string, parentKey: string, parent: null | string): Promise<TreeNode[]> {
  const entity = await DataModelService.getDataModelProperties(iri, parent);
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

.tree-row {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.25rem;
}

.progress-spinner {
  width: 1.25em !important;
  height: 1.25em !important;
  flex: 0 0 auto;
}
</style>
