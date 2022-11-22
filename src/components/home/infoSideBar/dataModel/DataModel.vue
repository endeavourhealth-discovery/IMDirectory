<template>
  <div id="tree-container">
    <TangledTree :data="data" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from "vue";
import { TangledTreeData } from "@/im_library/interfaces";
import { EntityService } from "@/im_library/services";
import axios from "axios";
import TangledTree from "@/components/home/infoSideBar/dataModel/TangledTree.vue";
import { useStore } from "vuex";

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const store = useStore();
const selectedConceptIri = computed(() => store.state.selectedConceptIri);

watch(
  () => props.conceptIri,
  async newValue => await getDataModel(newValue)
);

watch(
  () => selectedConceptIri.value,
  async newValue => await getDataModel(newValue)
);

const loading = ref(false);
const data: Ref<TangledTreeData[][]> = ref([]);
const twinNode = ref("twin-node-");

onMounted(async () => await getDataModel(selectedConceptIri.value));

async function getDataModel(iri: string) {
  loading.value = true;
  const name = (await EntityService.getNames([iri]))[0].name;
  data.value.push([{ id: iri, parents: [], name: name || iri, type: "root" }]);
  await addPropertiesAndTypes(iri);
}
async function addPropertiesAndTypes(iri: any) {
  const properties = [] as any;
  const types = [] as any;

  const result = await EntityService.getDataModelProperties(iri);

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
  flex: 1 1 auto;
  width: 100%;
  position: relative;
  overflow: auto;
}
</style>
