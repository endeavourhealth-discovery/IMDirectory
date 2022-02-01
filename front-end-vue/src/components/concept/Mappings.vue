<template>
  <div class="p-d-flex p-flex-row p-jc-center p-ai-center loading -container" v-if="loading">
    <ProgressSpinner />
  </div>
  <OrganizationChart v-else :value="data">
    <template #hasMap="slotProps">
      <span>{{ slotProps.node.data.label }}</span>
    </template>
    <template #oneOf="slotProps">
      <span>{{ slotProps.node.data.label }}</span>
    </template>
    <template #comboOf="slotProps">
      <span>{{ slotProps.node.data.label }}</span>
    </template>
    <template #someOf="slotProps">
      <span>{{ slotProps.node.data.label }}</span>
    </template>
    <template #simpleMaps="slotProps">
      <span>{{ slotProps.node.data.label }}</span>
    </template>
    <template #childList="slotProps">
      <table aria-label="Concept map children">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Priority</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="mapItem in slotProps.node.data.mapItems"
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
    <template #simpleMapsList="slotProps">
      <SimpleMaps v-if="slotProps.node.data.mapItems.length" :data="slotProps.node.data.mapItems" @toggleOverlay="handleSimpleMapsToggle" />
      <span v-else>None</span>
    </template>
    <template #default>
      <p class="p-text-centered">None</p>
    </template>
  </OrganizationChart>

  <OverlayPanel ref="opMap" id="overlay-panel-maps">
    <div class="p-d-flex p-flex-column p-jc-start map-overlay">
      <p><strong>Name: </strong>{{ hoveredResult.name }}</p>
      <p><strong>Iri: </strong>{{ hoveredResult.iri }}</p>
      <p><strong>Priority: </strong>{{ hoveredResult.priority }}</p>
      <p>
        <strong>Assurance level: </strong>
        {{ hoveredResult.assuranceLevel }}
      </p>
    </div>
  </OverlayPanel>

  <OverlayPanel ref="opSimpleMaps" id="overlay-panel-simple-maps">
    <div class="p-d-flex p-flex-column p-jc-start simple-maps-overlay">
      <p><strong>Name: </strong>{{ hoveredResult.name }}</p>
      <p><strong>Iri: </strong>{{ hoveredResult.iri }}</p>
      <p><strong>Namespace: </strong>{{ hoveredResult.scheme }}</p>
      <p><strong>Code: </strong>{{ hoveredResult.code }}</p>
    </div>
  </OverlayPanel>
</template>

<script lang="ts">
import EntityService from "@/services/EntityService";
import { IM } from "@/vocabulary/IM";
import { defineComponent } from "vue";
import SimpleMaps from "@/components/concept/mapping/SimpleMaps.vue";
import { Namespace } from "@/models/Namespace";
import { SimpleMap } from "@/models/mappings/SimpleMap";
import { SimpleMapIri } from "@/models/mappings/SimpleMapIri";
import { MapItem } from "@/models/mappings/MapItem";
import { ChartTableNode, ChartMapNode } from "@/models/mappings/MapChartTypes";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { byPriority, byScheme } from "@/helpers/Sorters";

export default defineComponent({
  name: "Mappings",
  components: { SimpleMaps },
  props: { conceptIri: { type: String, required: true } },
  watch: {
    async conceptIri() {
      await this.updateMappings();
    }
  },
  data() {
    return {
      mappings: [] as any[],
      data: {} as any,
      hoveredResult: {} as any,
      simpleMaps: [] as SimpleMap[],
      namespaces: [] as Namespace[],
      loading: false
    };
  },
  async mounted() {
    await this.updateMappings();
  },
  methods: {
    async updateMappings() {
      this.loading = true;
      await this.getMappings();
      this.getSimpleMapsNamespaces();
      this.data = this.createChartStructure(this.mappings);
      this.loading = false;
    },
    async getMappings(): Promise<void> {
      this.mappings = (await EntityService.getPartialEntity(this.conceptIri, [IM.HAS_MAP]))[IM.HAS_MAP] || [];
      this.data = {};

      this.namespaces = await EntityService.getNamespaces();
      this.simpleMaps = await EntityService.getSimpleMaps(this.conceptIri);
    },

    createChartTableNode(
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
    },

    createChartMapNode(item: string, location: string, positionInLevel: number): ChartMapNode | undefined {
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
    },

    generateChildNodes(mapObject: any, location: string, positionInLevel: number): ChartMapNode[] | ChartTableNode[] {
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
        return [this.createChartTableNode(mappedList, location, positionInLevel, "childList")];
      } else {
        // is array
        const results = [] as ChartMapNode[];
        let count = 0;
        for (const item of mapObject) {
          let mapNode = this.createChartMapNode(Object.keys(item)[0], location, count);
          if (mapNode) {
            mapNode.children = this.generateChildNodes(item[Object.keys(item)[0]], location + "_" + count, 0);
            results.push(mapNode);
          }
          count++;
        }
        return results;
      }
    },

    createChartStructure(mappingObject: any): ChartMapNode | [] {
      const parentNode = {
        key: "0",
        type: "hasMap",
        data: { label: "Has map" },
        children: [] as ChartMapNode[] | ChartTableNode[]
      };
      if (!(isArrayHasLength(mappingObject) || isObjectHasKeys(mappingObject)) && !isArrayHasLength(this.simpleMaps)) {
        return [];
      }
      if (isArrayHasLength(mappingObject) || isObjectHasKeys(mappingObject)) {
        parentNode.children = this.generateChildNodes(mappingObject, "0", 0);
      }
      if (isArrayHasLength(this.simpleMaps)) {
        const simpleMapsChildren = this.generateSimpleMapsNodes(this.simpleMaps, "0_" + parentNode.children.length, 0);
        parentNode.children.push({
          key: "0_" + parentNode.children.length,
          type: "simpleMaps",
          data: { label: "Simple maps" },
          children: simpleMapsChildren
        });
      }
      return parentNode;
    },

    generateSimpleMapsNodes(simpleMaps: SimpleMap[], location: string, positionInLevel: number): ChartTableNode[] {
      if (!isArrayHasLength(simpleMaps)) {
        return [this.createChartTableNode([], location, positionInLevel, "simpleMapsList")];
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
      return [this.createChartTableNode(simpleMapsList, location, positionInLevel, "simpleMapsList")];
    },

    getSimpleMapsNamespaces(): void {
      if (isArrayHasLength(this.simpleMaps) && isArrayHasLength(this.namespaces)) {
        this.simpleMaps.forEach((mapItem: SimpleMap) => {
          const found = this.namespaces.find((namespace: Namespace) => namespace.iri.toLowerCase() === (mapItem["@id"].split("#")[0] + "#").toLowerCase());
          if (found && isObjectHasKeys(found, ["name"])) {
            mapItem.scheme = found.name;
          } else {
            mapItem.scheme = "None";
          }
          mapItem.code = mapItem["@id"].split("#")[1];
        });
      }
    },

    toggle(event: any, data: MapItem, refId: string): void {
      this.hoveredResult = data;
      const x = this.$refs[refId] as any;
      x.toggle(event);
    },

    handleSimpleMapsToggle(event: any, data: any) {
      this.toggle(event, data, "opSimpleMaps");
    }
  }
});
</script>

<style scoped>
td,
th {
  border: 1px solid lightgray;
  padding: 0.5rem;
  text-align: left;
  overflow-wrap: break-word;
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
