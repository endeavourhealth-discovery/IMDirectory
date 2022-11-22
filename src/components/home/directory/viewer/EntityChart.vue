<template>
  <div class="flex flex-row justify-contents-center align-items-center loading -container" v-if="loading">
    <ProgressSpinner />
  </div>
  <OrganizationChart v-else :value="graph" :collapsible="true" data-testid="orgChart">
    <template #NONE>
      <p class="text-centered">None</p>
    </template>
    <template #default="slotProps">
      <span>{{ slotProps.node.name }}</span>
    </template>
    <template #PROPERTIES="slotProps">
      <table aria-label="graph semantic properties table" data-testid="properties">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop of slotProps.node.leafNodes" :key="prop">
            <td @click="navigate(prop.iri)">{{ prop.name }}</td>
            <td @click="navigate(prop.valueTypeIri)">
              {{ prop.valueTypeName || getTypeFromIri(prop.valueTypeIri) }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>
    <template #ISA="slotProps">
      <table aria-label="graph isa's table" data-testid="isA">
        <thead>
          <tr>
            <th scope="col">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="isa of slotProps.node.leafNodes" :key="isa">
            <td @click="navigate(isa.iri)">{{ isa.name }}</td>
          </tr>
        </tbody>
      </table>
    </template>
    <template #SUBTYPE="slotProps">
      <table aria-label="graph subtypes table" data-testid="subtype">
        <thead>
          <tr>
            <th scope="col">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subtype of slotProps.node.leafNodes" :key="subtype">
            <td @click="navigate(subtype.iri)">{{ subtype.name }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </OrganizationChart>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { RouteRecordName, useRoute, useRouter } from "vue-router";
import { GraphData } from "im-library/dist/types/interfaces/Interfaces";
import { Services } from "im-library";
import axios from "axios";
const { EntityService } = Services;

const props = defineProps({
  conceptIri: { type: String, required: true }
});

const entityService = new EntityService(axios);
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const graph: Ref<GraphData> = ref({} as GraphData);

watch(
  () => props.conceptIri,
  async newValue => await getGraph(newValue)
);

onMounted(async () => await getGraph(props.conceptIri));

function getTypeFromIri(iri: string): string {
  if (!iri.includes("#")) {
    return iri;
  }
  let part = iri.split("#")[1];
  part = part.includes(":") ? part.split(":")[1] : part;
  return part.charAt(0).toUpperCase() + part.slice(1);
}

async function getGraph(iri: string): Promise<void> {
  loading.value = true;
  graph.value = await entityService.getEntityGraph(iri);
  loading.value = false;
}

function navigate(iri: string): void {
  const currentRoute = route.name as RouteRecordName | undefined;
  if (iri)
    router.push({
      name: currentRoute,
      params: { selectedIri: iri }
    });
}
</script>

<style scoped>
td,
th {
  border: 1px solid lightgray;
  padding: 0.5rem;
  overflow-wrap: break-word;
  text-align: left;
}

td {
  cursor: pointer;
}

tr:nth-child(even) {
  background-color: #f8f9fa;
}

th[scope="col"] {
  background-color: #f8f9fa;
  color: #495057;
}

table {
  border-collapse: collapse;
  border: 2px solid rgb(200, 200, 200);
}

.p-organizationchart {
  height: 100%;
  width: 100%;
  overflow: auto;
}
</style>
