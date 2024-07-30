<template>
  <div class="flex flex-row justify-contents-center items-center loading-container" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else class="flex flex-col justify-contents-center items-center flex-auto">
    <OrganizationChart :value="data" data-testid="mappings">
      <template #hasMap="{ node }: any">
        <span>{{ node.data.label }}</span>
      </template>
      <template #oneOf="{ node }: any">
        <span>{{ node.data.label }}</span>
      </template>
      <template #comboOf="{ node }: any">
        <span>{{ node.data.label }}</span>
      </template>
      <template #someOf="{ node }: any">
        <span>{{ node.data.label }}</span>
      </template>
      <template #matchedFrom="{ node }: any">
        <span>{{ node.data.label }}</span>
      </template>
      <template #matchedTo="{ node }: any">
        <span>{{ node.data.label }}</span>
      </template>
      <template #childList="{ node }: any">
        <table aria-label="Concept map children" data-testid="hasMap">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Priority</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="mapItem of node.data.mapItems"
              :key="mapItem"
              @mouseenter="toggle($event, mapItem, 'opMap')"
              @mouseleave="toggle($event, mapItem, 'opMap')"
            >
              <td>{{ mapItem.name }}</td>
              <td>{{ mapItem.priority }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template #matchedFromList="{ node }: any">
        <SimpleMaps v-if="node.data.mapItems.length" :data="node.data.mapItems" @toggleOverlay="handleMatchedFromToggle" data-testid="matchedFrom" />
        <span v-else>None</span>
      </template>
      <template #matchedToList="{ node }: any">
        <SimpleMaps v-if="node.data.mapItems.length" :data="node.data.mapItems" @toggleOverlay="handleMatchedToToggle" data-testid="matchedTo" />
        <span v-else>None</span>
      </template>
      <template #default>
        <p class="text-centered">None</p>
      </template>
    </OrganizationChart>

    <Popover ref="opMap" id="overlay-panel-maps">
      <div class="flex flex-col justify-contents-start map-overlay">
        <p><strong>Name: </strong>{{ hoveredResult.name }}</p>
        <p><strong>Iri: </strong>{{ hoveredResult.iri }}</p>
        <p><strong>Priority: </strong>{{ hoveredResult.priority }}</p>
        <p>
          <strong>Assurance level: </strong>
          {{ hoveredResult.assuranceLevel }}
        </p>
      </div>
    </Popover>

    <Popover ref="opMatchedFrom" id="overlay-panel-simple-maps">
      <div class="flex flex-col justify-contents-start simple-maps-overlay" data-testid="matchedFromOverlay">
        <p><strong>Name: </strong>{{ hoveredResult.name }}</p>
        <p><strong>Iri: </strong>{{ hoveredResult.iri }}</p>
        <p><strong>Namespace: </strong>{{ hoveredResult.scheme }}</p>
        <p><strong>Code: </strong>{{ hoveredResult.code }}</p>
      </div>
    </Popover>

    <Popover ref="opMatchedTo" id="overlay-panel-simple-maps">
      <div class="flex flex-col justify-contents-start simple-maps-overlay" data-testid="matchedToOverlay">
        <p><strong>Name: </strong>{{ hoveredResult.name }}</p>
        <p><strong>Iri: </strong>{{ hoveredResult.iri }}</p>
        <p><strong>Namespace: </strong>{{ hoveredResult.scheme }}</p>
        <p><strong>Code: </strong>{{ hoveredResult.code }}</p>
      </div>
    </Popover>
    <div v-if="contextMaps.length" class="context-table">
      <DataTable v-model:expandedRows="contextExpandedRows" :value="contextMaps" dataKey="id">
        <Column expander style="width: 5rem" />
        <Column field="property" header="Property"></Column>
        <Column field="node" header="Map node"></Column>
        <Column field="value" header="Value"></Column>
        <Column field="regex" header="Regex"></Column>
        <template #expansion="{ data }: { data: { context: Context[] } }">
          <div class="p-4">
            <DataTable :value="data.context">
              <Column field="publisher" header="Publisher"></Column>
              <Column field="system" header="System"></Column>
              <Column field="schema" header="Schema"></Column>
              <Column field="table" header="Table"></Column>
              <Column field="field" header="Field"></Column>
            </DataTable>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import SimpleMaps from "./SimpleMaps.vue";
import { Namespace, SimpleMap, SimpleMapIri, MapItem, ChartTableNode, ChartMapNode, ContextMap } from "@im-library/interfaces";
import { DataTypeCheckers, Sorters } from "@im-library/helpers";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { Context } from "@im-library/interfaces/Context";

const { isArrayHasLength, isObjectHasKeys } = DataTypeCheckers;
const { byPriority, byScheme } = Sorters;

interface Props {
  entityIri: string;
}

const props = defineProps<Props>();

const mappings: Ref<any[]> = ref([]);
const contextMaps: Ref<ContextMap[]> = ref([]);
const data: Ref = ref({});
const hoveredResult: Ref = ref({});
const matchedFrom: Ref<SimpleMap[]> = ref([]);
const matchedTo: Ref<SimpleMap[]> = ref([]);
const namespaces: Ref<Namespace[]> = ref([]);
const loading = ref(false);
const contextExpandedRows: Ref<ContextMap[]> = ref([]);

const opMap = ref(null);
const opMatchedTo = ref(null);
const opMatchedFrom = ref(null);

watch(
  () => props.entityIri,
  async () => await updateMappings()
);

onMounted(async () => await updateMappings());

async function updateMappings() {
  loading.value = true;
  await getMappings();
  getSimpleMapsNamespaces();
  data.value = createChartStructure(mappings.value);
  loading.value = false;
}

async function getMappings(): Promise<void> {
  mappings.value = (await EntityService.getPartialEntity(props.entityIri, [IM.HAS_MAP]))[IM.HAS_MAP] ?? [];
  contextMaps.value = (await EntityService.getContextMaps(props.entityIri)) ?? [];
  data.value = {};

  namespaces.value = await EntityService.getNamespaces();
  matchedFrom.value = await EntityService.getMatchedFrom(props.entityIri);
  matchedTo.value = await EntityService.getMatchedTo(props.entityIri);
}

function createChartTableNode(
  items:
    | {
        assuranceLevel: string;
        iri: string;
        name: string;
        priority: number;
      }[]
    | SimpleMapIri[],
  location: string,
  position: number,
  type: string
): ChartTableNode {
  return {
    key: location + "_" + position,
    type: type,
    data: { mapItems: items }
  };
}

function createChartMapNode(item: string, location: string, positionInLevel: number): ChartMapNode | undefined {
  switch (item) {
    case IM.ONE_OF:
      return {
        key: location + "_" + positionInLevel,
        type: "oneOf",
        data: { label: "One of" },
        children: [] as ChartMapNode[]
      };
    case IM.COMBINATION_OF:
      return {
        key: location + "_" + positionInLevel,
        type: "comboOf",
        data: { label: "Combination of" },
        children: [] as ChartMapNode[]
      };
    case IM.SOME_OF:
      return {
        key: location + "_" + positionInLevel,
        type: "someOf",
        data: { label: "Some of" },
        children: [] as ChartMapNode[]
      };
    default:
      return undefined;
  }
}

function generateChildNodes(mapObject: any, location: string, positionInLevel: number): ChartMapNode[] | ChartTableNode[] {
  if (isObjectHasKeys(mapObject[0], [IM.MAPPED_TO])) {
    const mappedList = [] as MapItem[];
    mapObject.forEach((item: any) => {
      mappedList.push({
        name: item[IM.MAPPED_TO][0].name,
        iri: item[IM.MAPPED_TO][0]["@id"],
        priority: item[IM.MAP_PRIORITY],
        assuranceLevel: item[IM.ASSURANCE_LEVEL][0].name
      });
    });
    mappedList.sort(byPriority);
    return [createChartTableNode(mappedList, location, positionInLevel, "childList")];
  } else {
    // is array
    const results = [] as ChartMapNode[];
    let count = 0;
    for (const item of mapObject) {
      let mapNode = createChartMapNode(Object.keys(item)[0], location, count);
      if (mapNode) {
        mapNode.children = generateChildNodes(item[Object.keys(item)[0]], location + "_" + count, 0);
        results.push(mapNode);
      }
      count++;
    }
    return results;
  }
}

function createChartStructure(mappingObject: any): ChartMapNode | [] {
  const parentNode = {
    key: "0",
    type: "hasMap",
    data: { label: "Has map" },
    children: [] as ChartMapNode[] | ChartTableNode[]
  };
  if (!(isArrayHasLength(mappingObject) || isObjectHasKeys(mappingObject)) && !isArrayHasLength(matchedFrom.value) && !isArrayHasLength(matchedTo.value)) {
    return [];
  }
  if (isArrayHasLength(mappingObject) || isObjectHasKeys(mappingObject)) {
    parentNode.children = generateChildNodes(mappingObject, "0", 0);
  }
  if (isArrayHasLength(matchedFrom.value)) {
    const matchedFromChildren = generateSimpleMapsNodes(matchedFrom.value, "0_" + parentNode.children.length, 0, "matchedFromList");
    parentNode.children.push({
      key: "0_" + parentNode.children.length,
      type: "matchedFrom",
      data: { label: "Matched From" },
      children: matchedFromChildren
    });
  }
  if (isArrayHasLength(matchedTo.value)) {
    const matchedToChildren = generateSimpleMapsNodes(matchedTo.value, "0_" + parentNode.children.length, 0, "matchedToList");
    parentNode.children.push({
      key: "0_" + parentNode.children.length,
      type: "matchedTo",
      data: { label: "Matched To" },
      children: matchedToChildren
    });
  }
  return parentNode;
}

function generateSimpleMapsNodes(simpleMaps: SimpleMap[], location: string, positionInLevel: number, type: string): ChartTableNode[] {
  if (!isArrayHasLength(simpleMaps)) {
    return [createChartTableNode([], location, positionInLevel, type)];
  }
  const simpleMapsList = [] as SimpleMapIri[];
  simpleMaps.forEach((mapItem: SimpleMap) => {
    simpleMapsList.push({
      name: mapItem.name,
      iri: mapItem["@id"],
      scheme: mapItem.scheme,
      code: mapItem.code
    });
  });
  simpleMapsList.sort(byScheme);
  return [createChartTableNode(simpleMapsList, location, positionInLevel, type)];
}

function getSimpleMapsNamespaces(): void {
  if (isArrayHasLength(matchedFrom.value) && isArrayHasLength(namespaces.value)) {
    matchedFrom.value.forEach((mapItem: SimpleMap) => {
      const found = namespaces.value.find((namespace: Namespace) => namespace.iri.toLowerCase() === (mapItem["@id"].split("#")[0] + "#").toLowerCase());
      if (found && isObjectHasKeys(found, ["name"])) {
        mapItem.scheme = found.name;
      } else {
        mapItem.scheme = "None";
      }
    });
  }
  if (isArrayHasLength(matchedTo.value) && isArrayHasLength(namespaces.value)) {
    matchedTo.value.forEach((mapItem: SimpleMap) => {
      const found = namespaces.value.find((namespace: Namespace) => namespace.iri.toLowerCase() === (mapItem["@id"].split("#")[0] + "#").toLowerCase());
      if (found && isObjectHasKeys(found, ["name"])) {
        mapItem.scheme = found.name;
      } else {
        mapItem.scheme = "None";
      }
    });
  }
}

function toggle(event: any, data: MapItem, refId: string): void {
  hoveredResult.value = data;
  let x: any;
  switch (refId) {
    case "opMap":
      x = opMap;
      break;
    case "opMatchedTo":
      x = opMatchedTo;
      break;
    case "opMatchedFrom":
      x = opMatchedFrom;
      break;
  }
  if (x) x.value.toggle(event);
}

function handleMatchedFromToggle(event: any, data: any) {
  toggle(event, data, "opMatchedFrom");
}

function handleMatchedToToggle(event: any, data: any) {
  toggle(event, data, "opMatchedTo");
}
</script>

<style scoped>
td,
th {
  border: 1px solid var(--p-textarea-border-color);
  padding: 0.5rem;
  text-align: left;
  overflow-wrap: break-word;
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
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  height: 20rem;
  width: 100%;
}

.context-table {
  width: 100%;
}
</style>
