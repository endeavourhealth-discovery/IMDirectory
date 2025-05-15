<template>
  <div id="data-model-svg-container">
    <svg id="data-model-svg"></svg>
    <Popover id="overlay-context-menu" ref="menu" v-if="displayMenu" :style="{ width: '300px', top: overlayTop + 'px' }">
      <div class="p-field">
        <div class="p-inputgroup">
          <FloatLabel>
            <MultiSelect id="properties" v-model="selected" :options="multiselectMenu" optionLabel="label" display="chip" @change="change($event)" />
            <label for="properties">Select Properties</label>
          </FloatLabel>
        </div>
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import { onMounted, reactive, ref, Ref, watch } from "vue";
import { PropertyDisplay, TangledTreeData } from "@/interfaces";
import { cloneDeep } from "lodash-es";
import { DataModelService } from "@/services";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { TTIriRef } from "@/interfaces/AutoGen";

const props = defineProps<{
  data: Array<TangledTreeData[]>;
  entityIri: string;
}>();

const emit = defineEmits<{
  navigateTo: [payload: string];
}>();

watch(
  () => cloneDeep(props.data),
  newValue => {
    chartData.value = newValue;
    renderChart();
  }
);

const options: Ref = ref({});
const color = ref(d3.scaleOrdinal(d3.schemeSet2));
const chartData: Ref<TangledTreeData[][]> = ref([]);
const multiselectMenu: Ref<{ iri: string; label: string; result: any; disabled?: boolean }[]> = ref([]);
const twinNode = ref("twin-node-");
const selected: Ref<{ iri: string; label: string; result: any }[]> = ref([]);
const selectedNode = ref({} as TangledTreeData);
const nodeMap = reactive(new Map<string, any[]>());
const overlayTop = ref(0);
const displayMenu = ref(true);
const tangleLayout2: any = ref();

const menu = ref();

onMounted(() => {
  chartData.value = props.data;
  renderChart();
  setSelected(props.entityIri);
});

async function getMultiselectMenu(d: any) {
  let node = d["target"]["__data__"];
  multiselectMenu.value = [] as { iri: string; label: string; result: any; disabled?: boolean }[];
  let result = [] as PropertyDisplay[];
  if (node.type === "group") {
    result = !node.id.startsWith(twinNode) ? await DataModelService.getPropertiesDisplay(node.parents[0].id) : [];
  } else if (node.type === "property") {
    const ranges = (Array.from(new Set(node.range?.map(JSON.stringify))) as any).map(JSON.parse);
    ranges?.forEach((range: any) => {
      result.push({
        property: [{ "@id": range["@id"], name: range.name ? range.name : range["@id"] }],
        isType: true
      } as PropertyDisplay);
    });
  } else {
    result = !node.id.startsWith(twinNode) ? await DataModelService.getPropertiesDisplay(node.id) : [];
  }
  if (result && result.length > 0) {
    result.forEach((r: PropertyDisplay) => {
      processPropertyDisplay(r, node);
    });
  }
  displayMenu.value = multiselectMenu.value.length !== 0;
}

function processPropertyDisplay(r: PropertyDisplay, node: any) {
  let propId = "";
  let propLabel = "";
  r.property.forEach(p => {
    propId = `${propId}${propId !== "" ? "OR" : ""}${p["@id"]}`;
    propLabel = `${propLabel} ${propLabel !== "" ? "OR" : ""} ${p.name as string}`;
  });
  if (r.group) {
    if (node.type === "group") {
      if (node.id === r.group?.["@id"]) {
        multiselectMenu.value.push({
          iri: propId,
          label: propLabel,
          result: r
        });
      }
    } else {
      multiselectMenu.value.push({
        iri: propId,
        label: propLabel,
        result: r
      });
    }
  } else {
    multiselectMenu.value.push({
      iri: propId,
      label: propLabel,
      result: r
    });
  }
}

function addNode(node: any, r: PropertyDisplay) {
  let propId = "";
  let propLabel = "";
  const range: TTIriRef[] = [];
  r.type?.forEach(t => {
    range.push(t);
  });
  r.property.forEach(p => {
    propId = `${propId}${propId !== "" ? "OR" : ""}${p["@id"]}`;
    propLabel = `${propLabel} ${propLabel !== "" ? "OR" : ""} ${p.name as string}`;
  });
  if (r.group && node.type !== "group") {
    if (chartData.value.length < node.level + 1) {
      chartData.value.push([
        {
          id: r.group["@id"],
          parents: [node.id],
          name: r.group.name ?? r.group["@id"],
          type: "group"
        }
      ]);
    } else {
      chartData.value[node.level + 1]?.push({
        id: r.group["@id"],
        parents: [node.id],
        name: r.group.name ?? r.group["@id"],
        type: "group"
      });
    }
  } else if (r.isType) {
    if (chartData.value.length < node.level + 2) {
      chartData.value.push([
        {
          id: propId,
          parents: [node.id],
          name: propLabel,
          type: "type",
          cardinality: r.cardinality,
          isOr: r.isOr
        }
      ]);
    } else {
      chartData.value[node.level + 1].push({
        id: propId,
        parents: [node.id],
        name: propLabel,
        type: "type",
        cardinality: r.cardinality,
        isOr: r.isOr
      });
    }
  } else {
    if (chartData.value.length < node.level + 2) {
      chartData.value.push([
        {
          id: propId,
          parents: [node.id],
          name: propLabel,
          type: "property",
          cardinality: r.cardinality,
          isOr: r.isOr,
          range: range
        }
      ]);
    } else {
      chartData.value[node.level + 1].push({
        id: propId,
        parents: [node.id],
        name: propLabel,
        type: "property",
        cardinality: r.cardinality,
        isOr: r.isOr,
        range: range
      });
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
        hideNode(chartData.value[node.level + 1][index]);
      });
    }
  }
  renderChart();
}

function hideNode(node: any) {
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
        hideNode(chartData.value[node.level + 1][index]);
      });
    }
  }
  chartData.value[node.level].splice(nodeIndex, 1);
  renderChart();
}

async function setSelected(iri: any) {
  const result = await DataModelService.getPropertiesDisplay(iri);
  if (result.length > 0) {
    result.forEach((r: PropertyDisplay) => {
      if (r.group) {
        if (!selected.value.some((n: any) => n.iri === r.group?.["@id"])) {
          selected.value.push({
            iri: r.group["@id"],
            label: r.group.name as string,
            result: r
          });
        }
      } else {
        let propId = "";
        let propLabel = "";
        r.property.forEach(p => {
          propId = `${propId}${propId !== "" ? "OR" : ""}  ${p["@id"]}`;
          propLabel = `${propLabel} ${propLabel !== "" ? "OR" : ""} ${p.name as string}`;
        });
        selected.value.push({
          iri: propId,
          label: propLabel,
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
      addNode(selectedNode.value, p.result);
    });
  }

  selected.value.forEach((s: any) => {
    if (nodeMap.has(s.result.type["@id"])) nodeMap.set(s.result.type?.["@id"], []);
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

  const tangleLayout = constructTangleLayout(chartData.value, options.value);
  tangleLayout2.value = tangleLayout;

  const w = tangleLayout.layout.width ? tangleLayout.layout.width + 300 : 1000;
  const h = tangleLayout.layout.height ? tangleLayout.layout.height + 300 : 1000;

  const svg = d3.select("#data-model-svg").attr("width", w).attr("height", h);

  svg.append("g").attr("class", "labels").selectAll("title").data(tangleLayout.nodes).enter().append("g");

  createLink(svg, tangleLayout);
  const node = createNode(svg, tangleLayout);
  const nodeCircle = createNodeCircle(node);
  createSelectedCircle(nodeCircle, svg);

  const div = d3.selectAll("#data-model-svg-container").append("div").attr("class", "tooltip").style("opacity", 0);

  node
    .append("text")
    .attr("x", (n: any) => n.x + 4)
    .attr("y", (n: any) => n.y - n.height / 2 - 4)
    .text((d: any) => d.name)
    .attr("stroke", "black")
    .attr("stroke-width", 0.1)
    .style("font-size", 12)
    .on("mouseover", (d: any) => {
      d3.select(d.srcElement).style("cursor", "pointer");
      const n = d["target"]["__data__"];
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(n.name + "<div/> Press ctr+click to navigate")
        .style("left", d.layerX + "px")
        .style("top", d.layerY + 10 + "px");
    })
    .on("mouseout", () => {
      div.transition().duration(500).style("opacity", 0);
    })
    .on("click", (d: any) => {
      div.transition().duration(500).style("opacity", 0);
      const node = d["target"]["__data__"];
      if (!node.isOr) {
        if (d.metaKey || d.ctrlKey) {
          if (node.id.startsWith(twinNode)) {
            const iri = node.id.slice(15);
            emit("navigateTo", iri);
          } else {
            emit("navigateTo", node.id);
          }
        } else {
          d.preventDefault();
          toggleSubProperties(d);
          if (selectedNode.value !== node) {
            selectedNode.value = node;
            selected.value = (nodeMap.get(node.id) as any) || [];
          }
        }
      }
    });
}

function createLink(svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, tangleLayout: TangleLayout): void {
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
}

function createNode(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  tangleLayout: TangleLayout
): d3.Selection<d3.BaseType | SVGGElement, unknown, SVGGElement, unknown> {
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

  return node;
}

function createSelectedCircle(
  nodeCircle: d3.Selection<SVGPathElement, unknown, SVGGElement, unknown>,
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>
) {
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
    .on("mouseout", () => {
      if (cardRect && cardinality) {
        cardRect.remove();
        cardinality.remove();
      }
    });
}

function createNodeCircle(
  node: d3.Selection<d3.BaseType | SVGGElement, unknown, SVGGElement, unknown>
): d3.Selection<SVGPathElement, unknown, SVGGElement, unknown> {
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

  nodeCircle
    .on("mouseover", (d: any) => {
      d3.select(d.srcElement).style("cursor", "pointer").attr("stroke-width", 14).attr("stroke", "grey");
    })
    .on("mouseout", (d: any) => {
      d3.select(d.srcElement).attr("stroke-width", 7).attr("stroke", "white");
    });

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
  return nodeCircle;
}

interface TangleLayout {
  levels: any;
  nodes: any;
  nodes_index: any;
  links: any[];
  bundles: any;
  layout: {
    width: string;
    height: string;
    node_height: number;
    node_width: number;
    bundle_width: number;
    level_y_padding: number;
  };
}

function precomputeLevelDepth(levels: any) {
  levels.forEach((l: any, i: any) => l.forEach((n: any) => (n.level = i)));

  let nodes = levels.reduce((a: any, x: any) => a.concat(x), []);
  let nodes_index = {} as any;
  nodes.forEach((d: any) => (nodes_index[d.id] = d));
  nodes.forEach((d: any) => {
    d.parents = (d.parents === undefined ? [] : d.parents).map((p: any) => {
      if (typeof p === "string") return nodes_index[p];
      else return p;
    });
  });
  return { nodes, nodes_index };
}

function precomputeBundles(levels: any, nodes: any) {
  levels.forEach((l: any, i: any) => {
    let index = {} as any;
    l.forEach((n: any) => {
      if (n.parents.length == 0) {
        return;
      }

      let id = n.parents
        .map((d: any) => d.id)
        .sort()
        .join("-X-");
      if (id in index) {
        index[id].parents = index[id].parents.concat(n.parents);
      } else {
        index[id] = { id: id, parents: n.parents.slice(), level: i, span: i - d3.min(n.parents, (p: any) => p.level as number)! };
      }
      n.bundle = index[id];
    });
    l.bundles = Object.keys(index).map((k: any) => index[k]);
    l.bundles.forEach((b: any, i: any) => (b.i = i));
  });

  let links = [] as any[];
  nodes.forEach((d: any) => {
    d.parents.forEach((p: any) => links.push({ source: d, bundle: d.bundle, target: p }));
  });
  const bundles = levels.reduce((a: any, x: any) => a.concat(x.bundles), []);

  return { bundles, links };
}

function reversePointers(bundles: any, nodes: any, links: any) {
  bundles.forEach((b: any) =>
    b.parents.forEach((p: any) => {
      if (p.bundles_index === undefined) {
        p.bundles_index = {};
      }
      if (!(b.id in p.bundles_index)) {
        p.bundles_index[b.id] = [];
      }
      p.bundles_index[b.id].push(b);
    })
  );
  nodes.forEach((n: any) => {
    if (n.bundles_index !== undefined) {
      n.bundles = Object.keys(n.bundles_index).map(k => n.bundles_index[k]);
    } else {
      n.bundles_index = {};
      n.bundles = [];
    }
    n.bundles.sort((a: any, b: any) =>
      d3.descending(
        d3.max(a, (d: any) => d.span),
        d3.max(b, (d: any) => d.span)
      )
    );
    n.bundles.forEach((b: any, i: any) => (b.i = i));
  });

  links.forEach((l: any) => {
    if (l.bundle.links === undefined) {
      l.bundle.links = [];
    }
    l.bundle.links.push(l);
  });
}

function constructTangleLayout(levels: TangledTreeData[][], options: any): TangleLayout {
  const { nodes, nodes_index } = precomputeLevelDepth(levels);
  const { bundles, links } = precomputeBundles(levels, nodes);
  reversePointers(bundles, nodes, links);

  // layout
  const padding = 8;
  const node_height = 25;
  const node_width = 170;
  const bundle_width = 14;
  const level_y_padding = 16;

  options.c ||= 16;
  const c = options.c;
  options.bigc ||= node_width + c;

  nodes.forEach((n: any) => (n.height = Math.max(1, n.bundles.length) - 1));

  let x_offset = padding;
  let y_offset = padding;
  levels.forEach((l: any) => {
    x_offset += l.bundles.length * bundle_width;
    y_offset += level_y_padding;

    l.forEach((n: any) => {
      n.x = n.level * node_width + x_offset;
      n.y = node_height + y_offset + n.height / 2;
      n.xz = 0;
      n.yz = 0;

      y_offset += node_height + n.height;
    });
  });

  let i = 0;
  levels.forEach((l: any) => {
    l.bundles.forEach((b: any) => {
      b.x = d3.max(b.parents, (d: any) => d.x)! + node_width + (l.bundles.length - 1 - b.i) * bundle_width;
      b.y = i * node_height;
    });
    i += l.length;
  });

  links.forEach((l: any) => {
    l.xt = l.target.x;
    l.yt = l.target.y;
    l.xb = l.bundle.x;
    l.yb = l.bundle.y;
    l.xs = l.source.x;
    l.ys = l.source.y;
  });

  let color = 16;
  links.forEach((l: any) => {
    l.yt = l.target.y;
    l.ys = l.source.y;
    l.c1 = l.source.level - l.target.level > 1 ? Math.min(options.bigc, l.xb - l.xt, l.yb - l.yt) - c : c;
    l.c2 = c;
    l.color = color;
    color += 20;
  });

  let layout = {
    width: d3.max(nodes, (n: any) => n.x)! + node_width + 2 * padding,
    height: d3.max(nodes, (n: any) => n.y)! + node_height / 2 + 2 * padding,
    node_height,
    node_width,
    bundle_width,
    level_y_padding
  };
  return { levels, nodes, nodes_index, links, bundles, layout };
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
  overflow: auto;
}

.p-field {
  margin-top: 2rem;
  margin-left: 10px;
  margin-right: 10px;
}

#data-model-svg-container:deep(.tooltip) {
  position: absolute;
  text-align: center;
  width: 120px;
  padding: 2px;
  font: 12px sans-serif;
  background-color: var(--p-surface-b);
  color: var(--p-text-color);
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}
</style>
