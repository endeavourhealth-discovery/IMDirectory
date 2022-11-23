<template>
  <div id="tree-container">
    <TangledTree :conceptIri="conceptIri" :data="data" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { TangledTreeData } from "im-library/dist/types/interfaces/Interfaces";
import { Services, Vocabulary } from "im-library";
import axios from "axios";
import TangledTree from "../dataModel/TangledTree.vue";
const { RDFS } = Vocabulary;

const { EntityService } = Services;

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const entityService = new EntityService(axios);

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
  const name = (await entityService.getPartialEntity(iri, [RDFS.LABEL]))[RDFS.LABEL];
  data.value.push([{ id: iri, parents: [], name: name || iri, type: "root" }]);
  await addPropertiesAndTypes(iri);
}
async function addPropertiesAndTypes(iri: any) {
  const properties = [] as any;
  const types = [] as any;

  const result = await entityService.getDataModelProperties(iri);

  result.forEach((r: any) => {
    properties.push({
      id: r.property["@id"],
      parents: [iri],
      name: r.property.name || r.property["@id"],
      type: "property",
      cardinality: `${r.minExclusive || r.minInclusive || 0} : ${r.maxExclusive || r.maxInclusive || "*"}`
    });
    if (r.type["@id"] === iri) {
      if (types.some((t: any) => t.id === twinNode + r.type["@id"])) {
        const index = types.findIndex((t: any) => t.id === twinNode + r.type["@id"]);
        types[index].parents.push(r.property["@id"]);
      } else {
        types.push({
          id: twinNode + r.type["@id"],
          parents: [r.property["@id"]],
          name: r.type.name || r.type["@id"],
          type: "type"
        });
      }
    } else {
      if (types.some((t: any) => t.id === r.type["@id"])) {
        const index = types.findIndex((t: any) => t.id === r.type["@id"]);
        types[index].parents.push(r.property["@id"]);
      } else {
        types.push({
          id: r.type["@id"],
          parents: [r.property["@id"]],
          name: r.type.name || r.type["@id"],
          type: "type"
        });
      }
    }
  });
  data.value.push(properties);
  data.value.push(types);
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
