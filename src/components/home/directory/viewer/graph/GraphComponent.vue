<template>
  <div class="graph-controls-container">
    <div id="force-layout-graph">
      <svg id="force-layout-svg">
        <defs id="defs">
          <marker id="arrow" markerUnits="strokeWidth" markerWidth="12" markerHeight="12" viewBox="0 0 12 12" refX="25" refY="6" orient="auto-start-reverse">
            <path d="M2,2 L10,6 L2,10 L6,6 L2,2" style="fill: #781c81"></path>
          </marker>
        </defs>
      </svg>
    </div>
    <div class="custom-control-buttons">
      <Button class="svg-pan-zoom-control p-button-secondary" icon="pi pi-plus" @click="zoomIn" />
      <Button class="svg-pan-zoom-control p-button-secondary" label="RESET" @click="resetZoom" />
      <Button class="svg-pan-zoom-control p-button-secondary" icon="pi pi-minus" @click="zoomOut" />
    </div>
  </div>
  <ContextMenu ref="menu" :model="contextMenu" />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, PropType, ref, Ref, watch } from "vue";
import * as d3 from "d3";
import svgPanZoom from "svg-pan-zoom";
import { RouteRecordName, useRoute, useRouter } from "vue-router";
import _ from "lodash";
import { TTGraphData } from "@/im_library/interfaces";
import { GraphExcludePredicates } from "@/im_library/config";
import { GraphTranslator, DataTypeCheckers } from "@/im_library/helpers";
import { EntityService, LoggerService } from "@/im_library/services";
import { IM } from "@/im_library/vocabulary";
import ContextMenu from "primevue/contextmenu";
import axios from "axios";
import { useStore } from "vuex";
import { useToast } from "primevue/usetoast";
const { translateFromEntityBundle, toggleNodeByName, hasNodeChildrenByName, addNodes } = GraphTranslator;
const { isArrayHasLength, isObjectHasKeys } = DataTypeCheckers;

const props = defineProps({
  data: { type: Object as PropType<TTGraphData>, required: true, default: {} as TTGraphData }
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useStore();
const splitterRightSize = computed(() => store.state.splitterRightSize);

watch(
  () => _.cloneDeep(props.data),
  newValue => {
    root.value = d3.hierarchy(newValue);
    drawGraph();
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
  activeNode: { fill: "#e3f2fd", stroke: "#AAAAAA" },
  inactiveNode: { fill: "#781c81", stroke: "#AAAAAA" },
  centerNode: {
    fill: "#e39a36",
    stroke: "#ffffff"
  },
  font: {},
  path: { fill: "", stroke: "#AAAAAA" }
});
const contextMenu: Ref<{ iri: string; label: string; command: (d: any) => void; disabled?: boolean }[]> = ref([]);

const graphExcludePredicates = GraphExcludePredicates;

const nodeFontSize = computed(() => radius.value / 5);
const pathFontSize = computed(() => radius.value / 5 + 3);
const maxLength = computed(() => radius.value / 2);
const viewBox = computed(() => ["" + -width.value / 2, "" + -height.value / 2, "" + width.value, "" + height.value]);

const menu = ref();

onMounted(() => {
  window.addEventListener("resize", onResize);
  root.value = d3.hierarchy(props.data);
  drawGraph();
});

onUnmounted(() => window.removeEventListener("resize", onResize));

function onResize() {
  drawGraph();
}

async function getContextMenu(d: any) {
  let node = d.path[0]["__data__"]["data"] as TTGraphData;
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
      .filter(value => !graphExcludePredicates.includes(value))
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
  const parent = d.path[0]["__data__"]["parent"];
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
    .text((d: any) => d.target.data.relToParent);

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
      return hasNodeChildrenByName(props.data, d.data.name) ? colour.value.inactiveNode.fill : colour.value.activeNode.fill;
    })
    .attr("stroke", (d: any) => (hasNodeChildrenByName(props.data, d.data.name) ? colour.value.inactiveNode.stroke : colour.value.activeNode.stroke))
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
    .attr("color", (d: any) => (hasNodeChildrenByName(props.data, d.data.name) ? colour.value.activeNode.fill : colour.value.inactiveNode.fill))
    .style("font-size", () => `${nodeFontSize.value}px`)
    .on("dblclick", (d: any) => dblclick(d))
    .on("click", (d: any) => click(d))
    .on("mouseover", (d: any) => {
      const name = d.path[0]["__data__"]["data"]["name"];
      if (name !== undefined && typeof name === "string" && !name.startsWith("middle-node")) {
        div.transition().duration(200).style("opacity", 0.9);
        div
          .html(name + "<div/> Press ctr+click to navigate")
          .style("left", d.layerX + "px")
          .style("top", d.layerY + 10 + "px");
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
  return { x: -radius.value / 1.1, y: -radius.value / 1.3, height: (2 * radius.value) / 1.3, width: (2 * radius.value) / 1.1 };
}

async function click(d: any) {
  if (d.metaKey || d.ctrlKey) {
    const node = d.path[0]["__data__"]["data"] as TTGraphData;
    navigate(node.iri);
  }
}

function navigate(iri: string) {
  const currentRoute = route.name as RouteRecordName | undefined;
  if (iri === "seeMore") {
    store.commit("updateConceptActivePanel", 2);
  } else if (iri) {
    router.push({
      name: currentRoute,
      params: { selectedIri: iri }
    });
  }
}

function redrawGraph() {
  root.value = d3.hierarchy(props.data);
  drawGraph();
}

async function dblclick(d: any) {
  const node = d.path[0]["__data__"]["data"] as TTGraphData;
  if (isArrayHasLength(node.children) || isArrayHasLength(node._children)) {
    toggleNodeByName(props.data, node.name);
    redrawGraph();
  } else {
    if (node.iri) {
      const bundle = await EntityService.getPartialEntityBundle(node.iri, []);
      const data = translateFromEntityBundle(bundle, []);
      if (isArrayHasLength(data.children)) {
        data.children.forEach((child: any) => {
          node._children.push(child);
        });
        toggleNodeByName(props.data, node.name);
        redrawGraph();
      }
    } else {
      toast.add(LoggerService.warn("Node can not be expanded."));
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
  d3.selectAll("g").remove();
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
  background-color: black !important;
}

.svg-pan-zoom-control:hover {
  opacity: 100%;
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
  text-align: center;
  position: relative;
  top: 50%;
  -ms-transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
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
  background-color: black;
  color: #fff;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}
</style>
