<template>
  <div id="tree-container">
    <TangledTree :conceptIri="conceptIri" :data="data" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from "vue";
import { PropertyDisplay, TangledTreeData } from "@im-library/interfaces";
import { EntityService } from "@/services";
import TangledTree from "./TangledTree.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { useRootStore } from "@/stores/rootStore";

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const rootStore = useRootStore();
const conceptIri = computed(() => rootStore.conceptIri);

watch(
  () => props.conceptIri,
  async newValue => await getDataModel(newValue)
);

const loading = ref(false);
const data: Ref<TangledTreeData[][]> = ref([]);
const twinNode = ref("twin-node-");

onMounted(async () => await getDataModel(props.conceptIri));

async function getDataModel(iri: string) {
  loading.value = true;
  const name = (await EntityService.getNames([iri]))[0].name;
  data.value.push([{ id: iri, parents: [], name: name || iri, type: "root" }]);
  await addPropertiesAndTypes(iri);
}

async function addPropertiesAndTypes(iri: any) {
  const result = await EntityService.getPropertiesDisplay(iri);
  const { groups, properties, types } = getGroupsPropertiesTypes(iri, twinNode, result);
  if (groups.length) data.value.push(groups.sort((a: TangledTreeData, b: TangledTreeData) => a.name.localeCompare(b.name)));
  else {
    data.value.push(properties);
    data.value.push(types);
  }
}

function getGroupsPropertiesTypes(iri: any, twinNode: any, propertyDisplay: PropertyDisplay[]) {
  const properties = [] as TangledTreeData[];
  const types = [] as any[];
  const groups = [] as TangledTreeData[];
  propertyDisplay.forEach(property => {
    if (isObjectHasKeys(property, ["group"])) {
      addGroup(groups, properties, property, iri);
    } else {
      addProperty(properties, property, iri);
    }
    addTypes(types, property, twinNode, iri);
  });
  return { properties, types, groups };
}

function addGroup(groups: TangledTreeData[], properties: TangledTreeData[], property: PropertyDisplay, parent: any) {
  let groupData = groups.find(prop => prop.id === property.group["@id"]);
  if (!groupData) {
    groupData = {
      id: property.group["@id"],
      parents: [parent],
      name: property.group.name || property.group["@id"],
      type: "group"
    };
    groups.push(groupData);
  }

  addProperty(properties, property, groupData);
}
function addProperty(properties: TangledTreeData[], property: PropertyDisplay, parent: any) {
  properties.push({
    id: property.property["@id"],
    parents: [parent],
    name: property.property.name,
    type: "property",
    cardinality: property.cardinality
  });
}
function addTypes(types: any[], property: PropertyDisplay, twinNode: any, iri: any) {
  if (property.type["@id"] === iri) {
    if (types.some((type: any) => type.id === twinNode + property.type["@id"])) {
      const index = types.findIndex((t: any) => t.id === twinNode + property.type["@id"]);
      types[index].parents.push(property.property["@id"]);
    } else {
      types.push({
        id: twinNode + property.type["@id"],
        parents: [property.property["@id"]],
        name: property.type.name || property.type["@id"],
        type: "type"
      });
    }
  } else {
    if (types.some((type: any) => type.id === property.type["@id"])) {
      const index = types.findIndex((type: any) => type.id === property.type["@id"]);
      types[index].parents.push(property.property["@id"]);
    } else {
      types.push({
        id: property.type["@id"],
        parents: [property.property["@id"]],
        name: property.type.name || property.type["@id"],
        type: "type"
      });
    }
  }
}
</script>

<style scoped>
#tree-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
}
</style>
