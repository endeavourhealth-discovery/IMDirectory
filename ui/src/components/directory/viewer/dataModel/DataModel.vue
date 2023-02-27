<template>
  <div id="tree-container">
    <TangledTree :conceptIri="conceptIri" :data="data" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from "vue";
import { TangledTreeData } from "@im-library/interfaces";
import { EntityService } from "@/services";
import TangledTree from "./TangledTree.vue";
import { useStore } from "vuex";
import { getGroupsPropertiesTypes } from "@im-library/helpers/TangledTreeLayout";

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const store = useStore();
const conceptIri = computed(() => store.state.conceptIri);

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
  if (groups.length) data.value.push(groups.sort((a:TangledTreeData, b:TangledTreeData) => a.name.localeCompare(b.name)))
  else {
    data.value.push(properties);
    data.value.push(types);
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
