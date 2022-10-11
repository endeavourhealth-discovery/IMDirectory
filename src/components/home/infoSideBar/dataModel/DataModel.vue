<template>
  <div class="graph-controls-container">
    <TangledTree :data="data" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { TangledTreeData } from "im-library/dist/types/interfaces/Interfaces";
import { Services } from "im-library";
import axios from "axios";
import TangledTree from "@/components/home/infoSideBar/dataModel/TangledTree.vue";

const { EntityService } = Services;

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const entityService = new EntityService(axios);

watch(
    () => props.conceptIri,
    async newValue => await getDataModel(newValue)
);

let loading = ref(false);
let data: Ref<TangledTreeData[][]> = ref([]);
let twinNode = ref("twin-node-");

onMounted(async () => await getDataModel(props.conceptIri));

async function getDataModel(iri: string) {
  loading.value = true;
  const name = (await entityService.getNames([iri]))[0].name;
  data.value.push([{id:iri, parents:[], name:name || iri, type:"root"}] );
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
                      type: "property"
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
.graph-controls-container {
  flex: 1 1 auto;
  width: 100%;
  position: relative;
  overflow: hidden;
}
</style>