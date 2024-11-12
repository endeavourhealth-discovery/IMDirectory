<template>
  <div class="graph-controls-container">
    <div id="force-layout-graph">
      <svg id="force-layout-svg">
        <defs id="defs">
          <marker id="arrow" markerHeight="12" markerUnits="strokeWidth" markerWidth="12" orient="auto-start-reverse" refX="25" refY="6" viewBox="0 0 12 12">
            <path d="M2,2 L10,6 L2,10 L6,6 L2,2" style="fill: var(--p-surface-500)"></path>
          </marker>
        </defs>
      </svg>
    </div>
    <div class="custom-control-buttons">
      <Button class="svg-pan-zoom-control" icon="fa-solid fa-plus" severity="secondary" @click="zoomIn" />
      <Button class="svg-pan-zoom-control" label="RESET" severity="secondary" @click="resetZoom" />
      <Button class="svg-pan-zoom-control" icon="fa-solid fa-minus" severity="secondary" @click="zoomOut" />
    </div>
  </div>
  <ContextMenu ref="menu" :model="contextMenu" />
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, Ref, watch } from "vue";
import * as d3 from "d3";
import svgPanZoom from "svg-pan-zoom";
import { cloneDeep } from "lodash-es";
import { TTGraphData } from "@/interfaces";
import { DataTypeCheckers, GraphTranslator } from "@/helpers";
import { EntityService } from "@/services";
import { IM } from "@/vocabulary";
import ContextMenu from "primevue/contextmenu";
import { useToast } from "primevue/usetoast";
import { ToastOptions } from "@/models";
import { ToastSeverity } from "@/enums";
import { useDirectoryStore } from "@/stores/directoryStore";

const { translateFromEntityBundle, toggleNodeByName, hasNodeChildrenByName, addNodes } = GraphTranslator;
const { isArrayHasLength, isObjectHasKeys } = DataTypeCheckers;

interface Props {
  data: TTGraphData;
}

const props = withDefaults(defineProps<Props>(), {
  data: {} as any
});

const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

const toast = useToast();
const directoryStore = useDirectoryStore();
const graphData = ref();
const splitterRightSize = computed(() => directoryStore.splitterRightSize);

watch(
  () => cloneDeep(props.data),
  newValue => {
    graphData.value = newValue;
    setRoot();
  }
);

watch(
  () => splitterRightSize.value,
  () => drawGraph()
);

const root: Ref = ref({});
const simulation: Ref = ref({});
const svgPan: Ref = ref({});
const height = ref(400);
const width = ref(400);
const force = ref(-5000);
const radius = ref(16);
const colour = ref({
  activeNode: { fill: "var(--p-surface-100)", stroke: "var(--p-surface-500)" },
  inactiveNode: { fill: "var(--p-primary-200)", stroke: "var(--p-surface-500)" },
  centerNode: { fill: "var(--p-primary-color)", stroke: "var(--p-text-color)" },
  font: {},
  path: { fill: "", stroke: "var(--p-surface-500)" }
});
const contextMenu: Ref<{ iri: string; label: string; command: (d: any) => void; disabled?: boolean }[]> = ref([]);

const graphExcludePredicates: Ref<string[]> = ref([]);

const nodeFontSize = computed(() => radius.value / 5);
const pathFontSize = computed(() => radius.value / 5 + 3);
const maxLength = computed(() => radius.value / 2);
const viewBox = computed(() => ["" + -width.value / 2, "" + -height.value / 2, "" + width.value, "" + height.value]);

const menu = ref();

onMounted(async () => {
  const result = await EntityService.getEntityChildren(IM.GRAPH_EXCLUDE_PREDICATES);
  if (result) graphExcludePredicates.value = result.map(r => r["@id"]);
  window.addEventListener("resize", onResize);
  graphData.value = props.data;
  setRoot();
});

watch(
  () => cloneDeep(graphData),
  newValue => {
    root.value = d3.hierarchy(newValue);
    drawGraph();
  }
);

onUnmounted(() => window.removeEventListener("resize", onResize));

function onResize() {
  drawGraph();
}

function setRoot() {
  root.value = d3.hierarchy(props.data);
  drawGraph();
}

async function getContextMenu(d: any) {
  let node = d["target"]["__data__"]["data"] as TTGraphData;
  contextMenu.value = [] as { iri: string; label: string; command: (d: any) => void; disabled?: boolean }[];
  if (node.iri && !node.name.startsWith("middle-node")) {
    const bundle = await EntityService.getBundleByPredicateExclusions(node.iri, [IM.HAS_MEMBER]);
    const hasMember = await EntityService.getPartialAndTotalCount(node.iri, IM.HAS_MEMBER, 1, 10);
    if (isObjectHasKeys(hasMember, ["totalCount"]) && hasMember.totalCount !== 0) {
      bundle.entity[IM.HAS_MEMBER] = hasMember.result;
      bundle.predicates[IM.HAS_MEMBER] = "has member";
    }
    if (hasMember.totalCount >= 10) {
      bundle.entity[IM.HAS_MEMBER] = bundle.entity[IM.HAS_MEMBER].concat({ "@id": "seeMore", name: "see more..." });
    }
    Object.keys(bundle.entity)
      .filter(value => value !== "@id")
      .filter(value => !graphExcludePredicates.value.find(gep => gep === value))
      .forEach((key: string) => {
        contextMenu.value.push({
          iri: key,
          label: bundle.predicates[key],
          command: () => {
            addNodes(bundle.entity, [key], node, bundle.predicates);
            redrawGraph();
          }
        });
      });
  }
  const parent = d["target"]["__data__"]["parent"];
  if (parent) {
    contextMenu.value.push({
      iri: "hide",
      label: "hide",
      command: () => {
        const index = parent.data.children.findIndex((c: any) => (c.iri && node.iri ? c.iri === node.iri : c.name === node.name));
        parent.data.children.splice(index, 1);
        if (!parent.data.relToParent.startsWith("Group Number") && parent.data.name.startsWith("middle-node") && parent.data.children.length === 1) {
          const cnode = parent.data.children[0];
          cnode.relToParent = parent.data.relToParent;
          const gparent = parent.parent;
          const index = gparent.data.children.findIndex((c: any) => c.name === parent.data.name);
          gparent.data.children.splice(index, 1);
          gparent.data.children.push(cnode);
        }
        redrawGraph();
      }
    });
  }
}

function drawGraph() {
  stopSimulation();
  const links = root.value.links();
  const nodes = root.value.descendants();
  simulation.value = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d: any) => d.id)
        .distance(0)
        .strength(1)
    )
    .force("charge", d3.forceManyBody().strength(force.value))
    .force("x", d3.forceX())
    .force("y", d3.forceY());

  const svg = d3.select("#force-layout-svg").attr("viewBox", viewBox.value as any);

  const pathLink = svg
    .selectAll(null)
    .data(links)
    .enter()
    .append("path")
    .attr("id", (d: any) => `${d.target.x}${d.target.y}${d.source.x}${d.source.y}`)
    .style("fill", colour.value.path.fill)
    .style("stroke", colour.value.path.stroke)
    .attr("marker-end", (d: any) => {
      return d.target.x < d.source.x ? "url(#arrow)" : "";
    })
    .attr("marker-start", (d: any) => {
      return d.target.x > d.source.x ? "url(#reverse)" : "";
    });

  svg
    .selectAll(null)
    .data(links)
    .enter()
    .append("text")
    .append("textPath")
    .attr("xlink:href", (d: any) => `#${d.target.x}${d.target.y}${d.source.x}${d.source.y}`)
    .style("text-anchor", "middle")
    .attr("startOffset", "50%")
    .attr("font-size", () => `${pathFontSize.value}px`)
    .text((d: any) => d.target.data.relToParent)
    .style("fill", "var(--p-text-color)");

  const node = svg
    .append("g")
    .attr("fill", "#fff")
    .attr("stroke", "#000")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("fill", (d: any) => {
      if (d.depth === 0) return colour.value.centerNode.fill;
      return hasNodeChildrenByName(graphData.value, d.data.name) ? colour.value.inactiveNode.fill : colour.value.activeNode.fill;
    })
    .attr("stroke", (d: any) => (hasNodeChildrenByName(graphData.value, d.data.name) ? colour.value.inactiveNode.stroke : colour.value.activeNode.stroke))
    .attr("r", (d: any) => {
      if (d.data.name !== undefined && typeof d.data.name === "string" && d.data.name.startsWith("middle-node")) {
        return 3;
      }
      return radius.value;
    })
    .call(drag(simulation.value) as any);

  const div = d3.selectAll("#force-layout-graph").append("div").attr("class", "tooltip").style("opacity", 0);

  const nodeTextWrapper = svg
    .append("g")
    .attr("class", "labels")
    .selectAll("title")
    .data(nodes)
    .enter()
    .append("foreignObject")
    .attr("x", (d: any) => getFODimensions(d).x)
    .attr("y", (d: any) => getFODimensions(d).y)
    .attr("width", (d: any) => getFODimensions(d).width)
    .attr("height", (d: any) => getFODimensions(d).height)
    .attr("color", (d: any) => {
      if (d.depth === 0) return colour.value.activeNode.fill;
      return hasNodeChildrenByName(graphData.value, d.data.name) ? colour.value.activeNode.fill : colour.value.centerNode.fill;
    })
    .style("font-size", () => `${nodeFontSize.value}px`)
    .style("line-height", nodeFontSize.value * 0.5)
    .on("dblclick", async (d: any): Promise<void> => await dblclick(d))
    .on("click", (d: any) => click(d))
    .on("mouseover", (d: any) => {
      const graphContainer = d3.select("#force-layout-graph").node() as Element;
      const name = d["target"]["__data__"]["data"]["name"];
      if (name !== undefined && typeof name === "string" && !name.startsWith("middle-node")) {
        div.transition().duration(200).style("opacity", 0.9);
        div
          .html(name + "<div/> Press ctr+click to navigate")
          .style(
            "left",
            (d.target.getBoundingClientRect().left + d.target.getBoundingClientRect().right) / 2 - graphContainer.getBoundingClientRect().x + 10 + "px"
          )
          .style("top", (d.target.getBoundingClientRect().top + d.target.getBoundingClientRect().bottom) / 2 - graphContainer.getBoundingClientRect().y + "px");
      }
    })
    .on("mouseout", (_d: any) => {
      div.transition().duration(500).style("opacity", 0);
    })
    .on("contextmenu", e => {
      getContextMenu(e);
      menu.value.show(e);
    });

  const nodeText = nodeTextWrapper.append("xhtml:p").text((d: any) => {
    if (d.data.name !== undefined && typeof d.data.name === "string" && d.data.name.startsWith("middle-node")) {
      return "";
    }

    if (!d.data.name) {
      return "undefined";
    }

    if (d.data.name.length <= 63) {
      return d.data.name;
    }

    return d.data.name.toString().substring(0, 61) + "...";
  });

  simulation.value.on("tick", () => {
    pathLink
      .attr("d", (d: any) => {
        return d.source.x < d.target.x
          ? `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`
          : `M${d.target.x},${d.target.y} L${d.source.x},${d.source.y}`;
      })
      .attr("marker-end", (d: any) => {
        return d.target.x > d.source.x ? "url(#arrow)" : "";
      })
      .attr("marker-start", (d: any) => {
        return d.target.x < d.source.x ? "url(#arrow)" : "";
      });

    nodeTextWrapper.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    nodeText.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
  });

  svgPan.value = svgPanZoom("#force-layout-svg", {
    zoomEnabled: true,
    controlIconsEnabled: false,
    fit: false,
    center: true,
    dblClickZoomEnabled: false
  });
}

function getFODimensions(_d: any) {
  return {
    x: -radius.value / 1.1,
    y: -radius.value / 1.3,
    height: (2 * radius.value) / 1.3,
    width: (2 * radius.value) / 1.1
  };
}

function click(d: any) {
  if (d.metaKey || d.ctrlKey) {
    const node = d["target"]["__data__"]["data"] as TTGraphData;
    navigate(node.iri);
  }
}

function navigate(iri: string) {
  if (iri === "seeMore") {
    directoryStore.updateSidebarControlActivePanel(2);
  } else if (iri) {
    emit("navigateTo", iri);
  }
}

function redrawGraph() {
  root.value = d3.hierarchy(graphData.value);
  drawGraph();
}

async function dblclick(d: any) {
  const node = d["target"]["__data__"]["data"] as TTGraphData;
  if (isArrayHasLength(node.children) || isArrayHasLength(node._children)) {
    toggleNodeByName(graphData.value, node.name);
    redrawGraph();
  } else {
    if (node.iri) {
      const bundle = await EntityService.getPartialEntityBundle(node.iri, []);
      const data = translateFromEntityBundle(bundle, []);
      if (isArrayHasLength(data.children)) {
        data.children.forEach((child: any) => {
          node._children.push(child);
        });
        toggleNodeByName(graphData.value, node.name);
        redrawGraph();
      }
    } else {
      toast.add(new ToastOptions(ToastSeverity.WARN, "Node cannot be expanded"));
    }
  }
}

function drag(simulation: any) {
  function dragstarted(event: any, _d: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
  }

  function dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event: any, _d: any) {
    if (!event.active) simulation.alphaTarget(0);
  }

  return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
}

function stopSimulation() {
  if (isObjectHasKeys(svgPan.value, ["destroy"])) {
    svgPan.value.destroy();
  }
  d3.select("#force-layout-graph").selectAll("div").remove();
  d3.select("#force-layout-graph").selectAll("g").remove();
  if (isObjectHasKeys(simulation.value, ["stop"])) {
    simulation.value.stop();
  }
}

function zoomIn() {
  svgPan.value.zoomIn();
}

function resetZoom() {
  svgPan.value.resetZoom();
}

function zoomOut() {
  svgPan.value.zoomOut();
}
</script>

<style scoped>
.graph-controls-container {
  flex: 1 1 auto;
  width: 100%;
  position: relative;
  overflow: hidden;
}

#force-layout-graph {
  height: 1000px;
  width: 100%;
}

.custom-control-buttons {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: 0.25rem;
}

.svg-pan-zoom-control {
  opacity: 33%;
  padding: 0.25rem !important;
  width: auto !important;
  background-color: var(--p-content-background) !important;
  color: var(--p-text-color);
}

.svg-pan-zoom-control:hover {
  opacity: 100%;
  color: var(--p-text-color) !important;
}

#force-layout-svg {
  height: 100%;
  width: 100%;
}

#force-layout-graph:deep(circle):hover {
  stroke: steelblue;
  stroke-width: 3px;
  cursor: grab;
}

#force-layout-graph:deep(circle):active {
  cursor: grabbing;
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
}

#force-layout-graph:deep(p) {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: inherit;
  text-align: center;
}

#force-layout-graph:deep(foreignObject):hover {
  font-weight: 600;
  cursor: pointer;
}

#force-layout-graph:deep(.tooltip) {
  position: absolute;
  text-align: center;
  width: 120px;
  padding: 2px;
  font: 12px sans-serif;
  background-color: var(--p-dialog-background);
  color: var(--p-text-color);
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}
</style>
