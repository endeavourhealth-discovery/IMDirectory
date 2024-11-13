<template>
  <div id="tree-container" :class="loading ? 'overflow-hidden' : 'overflow-auto'">
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
      <template #or="{ node }: any">
        <div class="items-center">
          <ProgressSpinner v-if="node.loading" class="progress-spinner" />
          <span> {{ node.label }}</span>
        </div>
      </template>
    </Tree>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from "vue";
import { DataModelService, EntityService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { TreeNode } from "primevue/treenode";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { RDF, SHACL } from "@/vocabulary";
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
    } else if (node.type === "type" || node.type === "root") {
      for (const child of node.children) {
        if (child.type === "or") expandedKeys.value[child.key!] = true;
        if (child.children && !child.children.length) {
          child.loading = true;
          processChildTypes(child);
          child.loading = false;
        }
      }
      await setIconData(node);
    }
  }
}

function processChildTypes(child: TreeNode) {
  if (isObjectHasKeys(child.data, ["type"])) {
    for (const [index, type] of child.data.type.entries()) {
      const newChild = {
        key: child.key + "-" + index.toString(),
        label: type.name,
        children: [] as TreeNode[],
        selectable: true,
        type: "type",
        loading: false,
        data: {
          iri: type["@id"]
        }
      } as TreeNode;
      if (child.children && !child.children.includes(newChild)) child.children!.push(newChild);
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

async function setIconData(node: TreeNode) {
  const iris = [];
  if (node.children) {
    for (const child of node.children) {
      for (const child2 of child.children!) {
        if (child2.data.iri) iris.push(child2.data.iri);
      }
    }
    const typeEntities = await EntityService.getPartialEntities(iris, [RDF.TYPE]);
    for (const typeEntity of typeEntities) {
      node.children.forEach((child: TreeNode) => {
        child.children!.forEach((child2: TreeNode) => {
          if (child2.data.iri === typeEntity["@id"]) {
            child2.data.typeIcon = getFAIconFromType(typeEntity[RDF.TYPE]);
            child2.data.color = getColourFromType(typeEntity[RDF.TYPE]);
          }
        });
      });
    }
  }
}

async function createOrNode(ttproperty: any, cardinality: string, index: any, propertyList: TreeNode[], parentKey: string) {
  const property = {
    key: parentKey + "-" + index.toString(),
    label: "or",
    children: [] as TreeNode[],
    selectable: true,
    loading: false,
    data: {
      cardinality: cardinality,
      isOr: true,
      type: [] as TreeNode[],
      iri: ""
    },
    type: "or"
  } as TreeNode;
  for (const [index2, orProperty] of ttproperty[SHACL.OR].entries()) {
    if (property.children && property.children.length < ttproperty[SHACL.OR].length) {
      const type = orProperty[SHACL.CLASS] || orProperty[SHACL.NODE] || orProperty[SHACL.DATATYPE] || [];
      const types = isArrayHasLength(type) ? type[0] : {};
      const name = `${orProperty[SHACL.PATH]?.[0].name}  ${
        isArrayHasLength(type) ? "(" + (type[0].name ? type[0].name : type[0]["@id"].slice(type[0]["@id"].indexOf("#") + 1)) + ")" : ""
      }`;
      property.data.typeIcon = getFAIconFromType(types);
      property.data.color = getColourFromType(types);
      const newChild = {
        key: property.key + "-" + index2.toString(),
        label: name,
        children: [] as TreeNode[],
        selectable: true,
        type: "property",
        loading: false,
        data: {
          iri: orProperty[SHACL.PATH][0]["@id"],
          type: type
        }
      } as TreeNode;
      property.children!.push(newChild);
    }
  }
  for (const child of property.children!) {
    child.loading = true;
    for (const [index, type] of child.data.type.entries()) {
      const newChild = {
        key: child.key + "-" + index.toString(),
        label: type.name,
        children: [] as TreeNode[],
        selectable: true,
        type: "type",
        loading: false,
        data: {
          iri: type["@id"]
        }
      } as TreeNode;
      if (child.children && !child.children.includes(newChild)) child.children!.push(newChild);
    }
    child.loading = false;
    await setIconData(property);
  }
  propertyList.push(property);
}

function createNode(ttproperty: any, entity2: any[], index: any, cardinality: string, propertyList: TreeNode[], parentKey: string) {
  const type = ttproperty[SHACL.CLASS] || ttproperty[SHACL.NODE] || ttproperty[SHACL.DATATYPE] || ttproperty[SHACL.NAMESPACE + "dataType"] || [];
  const group = ttproperty?.[SHACL.GROUP]?.[0];
  let name = ttproperty[SHACL.PATH]?.[0].name;
  if (isArrayHasLength(type)) {
    if (type.length == 1) {
      name = name + " (" + (type[0].name ? type[0].name : type[0]["@id"]) + ")";
    } else name = name + " (any of the below)";
  }

  const typeTypes = isObjectHasKeys(entity2[index], [RDF.TYPE]) ? entity2[index][RDF.TYPE] : [];
  const property = {
    key: parentKey + "-" + index.toString(),
    label: name,
    children: [] as TreeNode[],
    selectable: true,
    loading: false,
    data: {
      type: isArrayHasLength(type) ? [...type] : [],
      cardinality: cardinality,
      isOr: false,
      typeIcon: getFAIconFromType(typeTypes),
      color: getColourFromType(typeTypes),
      iri: ttproperty[SHACL.PATH][0]["@id"]
    },
    type: "property"
  } as TreeNode;

  if (group) {
    property.group = group;
  }

  propertyList.push(property);
}

async function getDataModelPropertiesDisplay(iri: string, parentKey: string, parent: null | string): Promise<TreeNode[]> {
  const entity = await DataModelService.getDataModelProperties(iri, parent);
  const propertyList = [] as TreeNode[];
  if (isObjectHasKeys(entity, [SHACL.PROPERTY]) && isArrayHasLength(entity[SHACL.PROPERTY])) {
    const iris = [];
    for (const ttproperty2 of entity[SHACL.PROPERTY]) {
      if (isObjectHasKeys(ttproperty2, [SHACL.PATH])) iris.push(ttproperty2[SHACL.PATH][0]["@id"]);
    }
    const entity2 = await EntityService.getPartialEntities(iris, [RDF.TYPE]);
    for (const [index, ttproperty] of entity[SHACL.PROPERTY].entries()) {
      const cardinality = `${ttproperty[SHACL.MINCOUNT] || 0} : ${ttproperty[SHACL.MAXCOUNT] || "*"}`;
      if (isObjectHasKeys(ttproperty, [SHACL.OR])) {
        await createOrNode(ttproperty, cardinality, index, propertyList, parentKey);
      } else {
        createNode(ttproperty, entity2, index, cardinality, propertyList, parentKey);
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
