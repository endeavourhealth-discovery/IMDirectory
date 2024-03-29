<template>
  <div id="tree-container">
    <TangledTree :entityIri="entityIri" :data="data" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { PropertyDisplay, TangledTreeData } from "@im-library/interfaces";
import { EntityService } from "@/services";
import TangledTree from "./TangledTree.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { TTIriRef } from "@im-library/interfaces/AutoGen";

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
const data: Ref<TangledTreeData[][]> = ref([]);
const twinNode = ref("twin-node-");

onMounted(async () => await getDataModel(props.entityIri));

async function getDataModel(iri: string) {
  loading.value = true;
  const name = (await EntityService.getNames([iri]))[0].name;
  data.value.push([{ id: iri, parents: [], name: name ?? iri, type: "root" }]);
  await addPropertiesAndTypes(iri);
}

async function addPropertiesAndTypes(iri: any) {
  const result = await EntityService.getPropertiesDisplay(iri);
  const { groups, properties } = getGroupsPropertiesTypes(iri, twinNode, result);
  if (groups.length) data.value.push(groups.toSorted((a: TangledTreeData, b: TangledTreeData) => a.name.localeCompare(b.name)));
  else {
    data.value.push(properties);
  }
}

function getGroupsPropertiesTypes(iri: any, twinNode: any, propertyDisplay: PropertyDisplay[]) {
  let properties = [] as TangledTreeData[];
  let types = [] as any[];
  const groups = [] as TangledTreeData[];
  propertyDisplay.forEach(property => {
    if (isObjectHasKeys(property, ["group"])) {
      addGroup(groups, properties, property, iri);
    } else {
      addProperty(properties, property, iri);
    }
  });
  properties = Object.values(properties.reduce((acc, obj) => ({ ...acc, [obj.id]: obj }), {}));
  return { properties, types, groups };
}

function addGroup(groups: TangledTreeData[], properties: TangledTreeData[], property: PropertyDisplay, parent: any) {
  let groupData = groups.find(prop => prop.id === property.group?.["@id"]);
  if (!groupData) {
    groupData = {
      id: property.group?.["@id"] as string,
      parents: [parent],
      name: (property.group?.name ?? property.group?.["@id"]) as string,
      type: "group"
    };
    groups.push(groupData);
  }

  addProperty(properties, property, groupData);
}
function addProperty(properties: TangledTreeData[], property: PropertyDisplay, parent: any) {
  let propId = "";
  let propName = "";
  const range = [] as TTIriRef[];
  property.property.forEach(p => {
    propId = `${propId}${propId !== "" ? "OR" : ""}${p["@id"]}`;
    propName = `${propName} ${propName !== "" ? "OR" : ""} ${p.name as string}`;
  });
  property.type?.forEach(t => {
    range.push(t);
  });
  properties.push({
    id: propId,
    parents: [parent],
    name: propName,
    type: "property",
    cardinality: property.cardinality,
    isOr: property.isOr,
    range: range
  });
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
