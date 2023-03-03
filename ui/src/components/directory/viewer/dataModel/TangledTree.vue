<template>
  <div id="data-model-svg-container">
    <svg id="data-model-svg"></svg>
    <OverlayPanel id="overlay-context-menu" ref="menu" v-if="displayMenu" :style="{ width: '300px', top: overlayTop + 'px' }">
      <div class="p-field">
        <div class="p-inputgroup">
          <span class="p-float-label">
            <MultiSelect id="properties" v-model="selected" :options="multiselectMenu" optionLabel="label" display="chip" @change="change($event)" />
            <label for="properties">Select Properties</label>
          </span>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import { onMounted, PropType, reactive, ref, Ref, watch } from "vue";
import { PropertyDisplay, TangledTreeData } from "@im-library/interfaces";
import { TangledTreeLayout } from "@im-library/helpers";
import _ from "lodash";
import { DirectService, EntityService } from "@/services";
import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";

const { constructTangleLayout } = TangledTreeLayout;
const directService = new DirectService();

const props = defineProps({
  data: { type: Array as PropType<Array<TangledTreeData[]>>, required: true },
  conceptIri: { type: String, required: true }
});

watch(
  () => _.cloneDeep(props.data),
  newValue => {
    chartData.value = newValue;
    renderChart();
  }
);

const options: Ref = ref({});
const color = ref(d3.scaleOrdinal(d3.schemeSet2));
const chartData: Ref<TangledTreeData[][]> = ref([]);
const multiselectMenu: Ref<{ iri: string; label: string; result: {}; disabled?: boolean }[]> = ref([]);
const twinNode = ref("twin-node-");
const selected: Ref<{ iri: string; label: string; result: {} }[]> = ref([]);
const selectedNode: Ref<TangledTreeData> = ref({} as TangledTreeData);
const nodeMap = reactive(new Map<string, any[]>());
const overlayTop = ref(0);
const displayMenu = ref(true);

const menu = ref();

onMounted(() => {
  chartData.value = props.data;
  renderChart();
  setSelected(props.conceptIri);
});

async function getMultiselectMenu(d: any) {
  let node = d["target"]["__data__"] as any;
  multiselectMenu.value = [] as { iri: string; label: string; result: {}; disabled?: boolean }[];
  let result;
  if (node.type === "group") {
    result = !node.id.startsWith(twinNode) ? await EntityService.getPropertiesDisplay(node.parents[0].id) : [];
  } else {
    result = !node.id.startsWith(twinNode) ? await EntityService.getPropertiesDisplay(node.id) : [];
  }
  if (result.length > 0) {
    result.forEach((r: PropertyDisplay) => {
      if (r.group) {
        if (node.type === "group") {
          if (node.id === r.group["@id"]) {
            multiselectMenu.value.push({
              iri: r.property["@id"],
              label: r.property.name,
              result: r
            });
          }
        } else {
          if (!multiselectMenu.value.some((n: any) => n.iri === r.group["@id"])) {
            multiselectMenu.value.push({
              iri: r.group["@id"],
              label: r.group.name,
              result: r
            });
          }
        }
      } else {
        multiselectMenu.value.push({
          iri: r.property["@id"],
          label: r.property.name,
          result: r
        });
      }
    });
  }
  displayMenu.value = multiselectMenu.value.length !== 0;
}

function addNode(node: any, r: PropertyDisplay, typeId: any) {
  if (r.group && node.type !== "group") {
    if (chartData.value.length < node.level + 1) {
      chartData.value.push([
        {
          id: r.group["@id"],
          parents: [node.id as any],
          name: r.group.name || r.group["@id"],
          type: "group"
        }
      ]);
    } else {
      chartData.value[node.level + 1]?.push({
        id: r.group["@id"],
        parents: [node.id as any],
        name: r.group.name || r.group["@id"],
        type: "group"
      });
    }
  } else {
    if (chartData.value.length < node.level + 2) {
      chartData.value.push([
        {
          id: r.property["@id"],
          parents: [node.id],
          name: r.property.name || r.property["@id"],
          type: "property",
          cardinality: r.cardinality
        }
      ]);
      chartData.value.push([
        {
          id: typeId,
          parents: [r.property["@id"] as any],
          name: r.type.name || r.type["@id"],
          type: "type"
        }
      ]);
    } else {
      if (!chartData.value[node.level + 1].some((d: any) => d.id === r.property["@id"])) {
        chartData.value[node.level + 1].push({
          id: r.property["@id"],
          parents: [node.id],
          name: r.property.name || r.property["@id"],
          type: "property",
          cardinality: r.cardinality
        });
        if (chartData.value[node.level + 2].some((t: any) => t.id === typeId)) {
          const findIndex = chartData.value[node.level + 2].findIndex((t: any) => t.id === typeId);
          if (!chartData.value[node.level + 2][findIndex].parents?.some((p: any) => p.id === r.property["@id"])) {
            chartData.value[node.level + 2][findIndex].parents?.push(r.property["@id"] as any);
          }
        } else {
          chartData.value[node.level + 2].push({
            id: typeId,
            parents: [r.property["@id"] as any],
            name: r.type.name || r.type["@id"],
            type: "type"
          });
        }
      }
    }
  }
  renderChart();
}

function hideAll(node: any) {
  if (chartData.value.length > node.level + 1) {
    const childIdes = chartData.value[node.level + 1]
      .map((n: any, i: any) => {
        if (n.parents.some((p: any) => p.id === node.id)) return chartData.value[node.level + 1][i].id;
      })
      .filter(item => item !== undefined);
    if (childIdes.length > 0) {
      childIdes.forEach((childId: any) => {
        const index = chartData.value[node.level + 1].findIndex((d: any) => d.id === childId);
        hideNode(chartData.value[node.level + 1][index], node.id);
      });
    }
  }
  renderChart();
}

function hideNode(node: any, parentId: any) {
  const nodeIndex = chartData.value[node.level].findIndex((p: any) => p.id === node.id);
  if (chartData.value.length > node.level + 1) {
    const childIdes = chartData.value[node.level + 1]
      .map((n: any, i: any) => {
        if (n.parents.some((p: any) => p.id === node.id)) return chartData.value[node.level + 1][i].id;
      })
      .filter(item => item !== undefined);
    if (childIdes.length > 0) {
      childIdes.forEach((childId: any) => {
        const index = chartData.value[node.level + 1].findIndex((d: any) => d.id === childId);
        hideNode(chartData.value[node.level + 1][index], node.id);
      });
    }
  }
  chartData.value[node.level].splice(nodeIndex, 1);
  renderChart();
}

async function setSelected(iri: any) {
  const result = (await EntityService.getPropertiesDisplay(iri)) || [];
  if (result.length > 0) {
    result.forEach((r: PropertyDisplay) => {
      if (r.group) {
        if (!selected.value.some((n: any) => n.iri === r.group["@id"])) {
          selected.value.push({
            iri: r.group["@id"],
            label: r.group.name,
            result: r
          });
        }
      } else {
        selected.value.push({
          iri: r.property["@id"],
          label: r.property.name,
          result: r
        });
      }
    });
  }
  nodeMap.set(iri, selected.value);
}

function change(event: any) {
  hideAll(selectedNode.value);
  if (event.value.length > 0) {
    event.value.forEach((p: any) => {
      let isExist = false;
      chartData.value.forEach((d: any) => {
        const result = d[0]?.level !== chartData.value.length - 1 && d.some((n: any) => n.id == p.result.type["@id"]);
        if (result) isExist = true;
      });
      if (isExist) {
        addNode(selectedNode.value, p.result, twinNode + p.result.type["@id"]);
      } else {
        addNode(selectedNode.value, p.result, p.result.type["@id"]);
      }
    });
  }

  selected.value.forEach((s: any) => {
    if (nodeMap.has(s.result.type["@id"])) nodeMap.set(s.result.type["@id"], []);
  });
  nodeMap.set(selectedNode.value.id, selected.value);
}

function renderChart() {
  const svgDoc = document.getElementById("data-model-svg");
  if (svgDoc) {
    svgDoc.innerHTML = "";
  }

  chartData.value.forEach((d: any) => {
    if (d[0]?.type === "group") {
      d.sort((a: TangledTreeData, b: TangledTreeData) => a.name.localeCompare(b.name));
    }
  });

  const tangleLayout = constructTangleLayout(chartData.value, options);

  const w = tangleLayout.layout.width ? tangleLayout.layout.width + 300 : 1000;
  const h = tangleLayout.layout.height ? tangleLayout.layout.height + 300 : 1000;

  const svg = d3.select("#data-model-svg").attr("width", w).attr("height", h);

  svg.append("g").attr("class", "labels").selectAll("title").data(tangleLayout.nodes).enter().append("g");

  const link = svg.append("g").attr("fill", "none").attr("stroke-width", 1).selectAll("g").data(tangleLayout.links).join("g");

  link
    .append("path")
    .attr("stroke-width", 2)
    .attr("stroke", (l: any) => color.value(l.bundle.id))
    .attr(
      "d",
      (l: any) => `M${l.xt} ${l.yt}L${l.xb - l.c1} ${l.yt}
                                  A${l.c1} ${l.c1} 90 0 1 ${l.xb} ${l.yt + l.c1}
                                  L${l.xb} ${l.ys - l.c2}
                                  A${l.c2} ${l.c2} 90 0 0 ${l.xb + l.c2} ${l.ys}
                                  L${l.xs} ${l.ys}`
    )
    .join("");

  const node = svg
    .append("g")
    .attr("fill", "currentColor")
    .attr("stroke-linecap", "round")
    .attr("stroke-linejoin", "round")
    .selectAll("g")
    .data(tangleLayout.nodes)
    .join("g");

  node
    .append("path")
    .attr("stroke", "black")
    .attr("stroke-width", 10)
    .attr("d", (n: any) => `M${n.x} ${n.y} L${n.x} ${n.y}`);

  const nodeCircle = node
    .append("path")
    .attr("stroke", "white")
    .attr("stroke-width", 7)
    .attr("d", (n: any) => `M${n.x} ${n.y} L${n.x} ${n.y}`);

  nodeCircle.on("click", e => {
    const node = e["target"]["__data__"];
    e.preventDefault();
    toggleSubProperties(e);
    if (selectedNode.value !== node) {
      selectedNode.value = node;
      selected.value = (nodeMap.get(node.id) as any) || [];
    }
  });

  // nodeCircle.on("mouseover", (d: any) => {
  //   nodeCircle.attr("stroke", "black");
  // });
  // nodeCircle.on("mouseout", (_d: any) => {
  //   nodeCircle.attr("stroke", "white");
  // });

  nodeCircle.on("contextmenu", e => {
    const node = e["target"]["__data__"];
    e.preventDefault();
    getMultiselectMenu(e);
    if (displayMenu.value) {
      menu.value.show(e);
    }

    overlayTop.value = e.clientY;
    if (selectedNode.value !== node) {
      selectedNode.value = node;
      selected.value = (nodeMap.get(node.id) as any) || [];
    }
  });

  const selectedCircle = nodeCircle.filter((n: any) => n.cardinality !== undefined);
  let cardRect: any;
  let cardinality: any;
  selectedCircle
    .on("mouseover", (d: any) => {
      const n = d["target"]["__data__"];
      cardRect = svg
        .append("rect")
        .attr("x", n.x + 30)
        .attr("y", n.y - 40)
        .attr("width", 103)
        .attr("height", 40)
        .attr("fill", "white")
        .attr("stroke", "black");
      cardinality = svg
        .append("text")
        .attr("x", n.x + 40)
        .attr("y", n.y - 15)
        .text("Cardinality: " + n.cardinality)
        .attr("stroke-width", 0.1)
        .style("font-size", 12);
    })
    .on("mouseout", (_d: any) => {
      if (cardRect && cardinality) {
        cardRect.remove();
        cardinality.remove();
      }
    });

  let rect: any;
  let fullName: any;

  node
    .append("text")
    .attr("x", (n: any) => n.x + 4)
    .attr("y", (n: any) => n.y - n.height / 2 - 4)
    .text((d: any) => (d.name?.length < 26 ? d.name : d.name?.slice(0, 25) + "..."))
    .attr("stroke", "black")
    .attr("stroke-width", 0.1)
    .style("font-size", 12)
    .on("mouseover", (d: any) => {
      const n = d["target"]["__data__"];
      if (n.name.length > 26) {
        rect = svg
          .append("rect")
          .attr("x", n.x + 30)
          .attr("y", n.y - 40)
          .attr("width", n.name.length * 6)
          .attr("height", 45)
          .attr("fill", "white")
          .attr("stroke", "black");
        fullName = svg
          .append("text")
          .attr("x", n.x + 40)
          .attr("y", n.y - 15)
          .text(n.name)
          .attr("stroke-width", 0.1)
          .style("font-size", 12);
      }
    })
    .on("mouseout", (_d: any) => {
      if (rect && fullName) {
        rect.remove();
        fullName.remove();
      }
    })
    .on("click", (d: any) => {
      const n = d["target"]["__data__"];
      if (n.id.startsWith(twinNode)) {
        const iri = n.id.slice(15);
        directService.select(iri);
      } else {
        directService.select(n.id);
      }
    });
}

async function toggleSubProperties(data: any) {
  const node = data["target"]["__data__"];
  await getMultiselectMenu(data);
  const allValidSelections = !hasSubPropertiesOpen(node) ? multiselectMenu.value.filter(selection => !selection.disabled) : [];
  change({ value: allValidSelections });
}

function hasSubPropertiesOpen(node: any) {
  if (!isArrayHasLength(chartData.value[node.level + 1])) return false;
  const found = chartData.value[node.level + 1].find(item => item.parents?.find(parent => parent.id === node.id));
  return !!found;
}
</script>

<style scoped>
#data-model-svg-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.p-field {
  margin-top: 2rem;
  margin-left: 10px;
  margin-right: 10px;
}
</style>
