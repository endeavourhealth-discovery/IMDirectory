<template>
  <div class="loading-container" v-if="loading">
    <ProgressSpinner />
  </div>
  <OrganizationChart v-else :value="graph" :collapsible="true" data-testid="orgChart">
    <template #NONE>
      <p class="text-centered">None</p>
    </template>
    <template #default="{ node }: any">
      <span>{{ node.name }}</span>
    </template>
    <template #PROPERTIES="{ node }: any">
      <table aria-label="graph semantic properties table" data-testid="properties">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop of node.leafNodes" :key="prop">
            <td @click="select(prop.iri)">{{ prop.name }}</td>
            <td @click="select(prop.valueTypeIri)">
              {{ prop.valueTypeName || getTypeFromIri(prop.valueTypeIri) }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>
    <template #ISA="{ node }: any">
      <table aria-label="graph isa's table" data-testid="isA">
        <thead>
          <tr>
            <th scope="col">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="isa of node.leafNodes" :key="isa">
            <td @click="select(isa.iri)">{{ isa.name }}</td>
          </tr>
        </tbody>
      </table>
    </template>
    <template #SUBTYPE="{ node }: any">
      <table aria-label="graph subtypes table" data-testid="subtype">
        <thead>
          <tr>
            <th scope="col">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subtype of node.leafNodes" :key="subtype">
            <td @click="select(subtype.iri)">{{ subtype.name }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </OrganizationChart>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from "vue";
import { EntityService } from "@/services";
import { OrganizationChartNode } from "primevue/organizationchart";

interface Props {
  entityIri: string;
}
const props = defineProps<Props>();

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

const loading = ref(false);
const graph: Ref<OrganizationChartNode> = ref({} as OrganizationChartNode);

watch(
  () => props.entityIri,
  async newValue => await getGraph(newValue)
);

onMounted(async () => await getGraph(props.entityIri));

function select(iri: string) {
  emit("navigateTo", iri);
}

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
  graph.value = await EntityService.getEntityGraph(iri);
  loading.value = false;
}
</script>

<style scoped>
td,
th {
  border: 1px solid var(--p-textarea-border-color);
  padding: 0.5rem;
  overflow-wrap: break-word;
  text-align: left;
}

td {
  cursor: pointer;
}

tr:nth-child(even) {
  background-color: var(--p-content-background);
}

th[scope="col"] {
  background-color: var(--p-content-background);
  color: var(--p-text-color);
}

table {
  border-collapse: collapse;
  border: 2px solid var(--p-textarea-border-color);
}

.p-organizationchart {
  height: 100%;
  width: 100%;
  overflow: auto;
}

.loading-container {
  height: 20rem;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
