<template>
  <div id="force-layout-graph">
    <svg id="force-layout-svg">
      <defs id="defs">
        <marker id="arrow" markerUnits="strokeWidth" markerWidth="12" markerHeight="12" viewBox="0 0 12 12" refX="25" refY="6" orient="auto-start-reverse">
          <path d="M2,2 L10,6 L2,10 L6,6 L2,2" style="fill: #781c81;"></path>
        </marker>
      </defs>
    </svg>
  </div>
</template>

<script lang="ts">
import TTGraphData from "../../../models/TTGraphData";
import { toggleNodeByName, hasNodeChildrenByName, translateFromEntityBundle } from "../../../helpers/GraphTranslator";
import { defineComponent, PropType } from "@vue/runtime-core";
import * as d3 from "d3";
import svgPanZoom from "svg-pan-zoom";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import EntityService from "@/services/EntityService";
import { RouteRecordName } from "vue-router";
import LoggerService from "@/services/LoggerService";

export default defineComponent({
  name: "GraphComponent",
  props: {
    data: { type: Object as PropType<TTGraphData>, required: true, default: {} as TTGraphData }
  },
  watch: {
    data(newValue) {
      this.root = d3.hierarchy(newValue);
      this.drawGraph();
    }
  },
  computed: {
    nodeFontSize() {
      return this.radius / 5;
    },
    pathFontSize() {
      return this.radius / 5 + 3;
    },
    maxLength() {
      return this.radius / 2;
    },
    viewBox() {
      return ["" + -this.width / 2, "" + -this.height / 2, "" + this.width, "" + this.height];
    }
  },
  data() {
    return {
      root: {} as any,
      simulation: {} as any,
      svgPan: {} as any,
      height: 400,
      width: 400,
      force: -5000,
      radius: 16,
      colour: {
        activeNode: { fill: "#e3f2fd", stroke: "#AAAAAA" },
        inactiveNode: { fill: "#781c81", stroke: "#AAAAAA" },
        centerNode: {
          fill: "#e39a36",
          stroke: "#ffffff"
        },
        font: {},
        path: { fill: "", stroke: "#AAAAAA" }
      }
    };
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    this.root = d3.hierarchy(this.data);
    this.drawGraph();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    onResize() {
      this.drawGraph();
    },

    drawGraph() {
      this.stopSimulation();
      const links = this.root.links();
      const nodes = this.root.descendants();
      this.simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d: any) => d.id)
            .distance(0)
            .strength(1)
        )
        .force("charge", d3.forceManyBody().strength(this.force))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

      const svg = d3.select("#force-layout-svg").attr("viewBox", this.viewBox as any);

      const pathLink = svg
        .selectAll(null)
        .data(links)
        .enter()
        .append("path")
        .attr("id", (d: any) => `${d.target.x}${d.target.y}${d.source.x}${d.source.y}`)
        .style("fill", this.colour.path.fill)
        .style("stroke", this.colour.path.stroke)
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
        .attr("font-size", () => `${this.pathFontSize}px`)
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
          if (d.depth === 0) return this.colour.centerNode.fill;
          return hasNodeChildrenByName(this.data, d.data.name) ? this.colour.inactiveNode.fill : this.colour.activeNode.fill;
        })
        .attr("stroke", (d: any) => (hasNodeChildrenByName(this.data, d.data.name) ? this.colour.inactiveNode.stroke : this.colour.activeNode.stroke))
        .attr("r", () => this.radius)
        .call(this.drag(this.simulation) as any);

      const div = d3
        .selectAll("#force-layout-graph")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      const nodeTextWrapper = svg
        .append("g")
        .attr("class", "labels")
        .selectAll("title")
        .data(nodes)
        .enter()
        .append("foreignObject")
        .attr("x", (d: any) => this.getFODimensions(d).x)
        .attr("y", (d: any) => this.getFODimensions(d).y)
        .attr("width", (d: any) => this.getFODimensions(d).width)
        .attr("height", (d: any) => this.getFODimensions(d).height)
        .attr("color", (d: any) => (hasNodeChildrenByName(this.data, d.data.name) ? this.colour.activeNode.fill : this.colour.inactiveNode.fill))
        .style("font-size", () => `${this.nodeFontSize}px`)
        .on("dblclick", (d: any) => this.dblclick(d))
        .on("click", (d: any) => this.click(d))
        .on("mouseover", (d: any) => {
          div
            .transition()
            .duration(200)
            .style("opacity", 0.9);
          div
            .html(d.path[0]["__data__"]["data"]["name"] + "<div/> Press ctr+click to navigate")
            .style("left", d.x + "px")
            .style("top", d.y + 10 + "px");
        })
        .on("mouseout", (d: any) => {
          div
            .transition()
            .duration(500)
            .style("opacity", 0);
        });

      const nodeText = nodeTextWrapper.append("xhtml:p").text((d: any) => {
        if (!d.data.name) {
          return "undefined";
        }

        if (d.data.name.length <= 63) {
          return d.data.name;
        }

        return d.data.name.toString().substring(0, 61) + "...";
      });

      this.simulation.on("tick", () => {
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

      this.svgPan = svgPanZoom("#force-layout-svg", {
        zoomEnabled: true,
        controlIconsEnabled: true,
        fit: false,
        center: true,
        dblClickZoomEnabled: false
      });
    },

    getFODimensions(d: any) {
      return { x: -this.radius / 1.1, y: -this.radius / 1.3, height: (2 * this.radius) / 1.3, width: (2 * this.radius) / 1.1 };
    },

    async click(d: any) {
      if (d.metaKey || d.ctrlKey) {
        const node = d.path[0]["__data__"]["data"] as TTGraphData;
        this.navigate(node.iri);
      }
    },

    navigate(iri: string) {
      const currentRoute = this.$route.name as RouteRecordName | undefined;
      if (iri)
        this.$router.push({
          name: currentRoute,
          params: { selectedIri: iri }
        });
    },

    redrawGraph() {
      this.root = d3.hierarchy(this.data);
      this.drawGraph();
    },

    async dblclick(d: any) {
      const node = d.path[0]["__data__"]["data"] as TTGraphData;
      if (isArrayHasLength(node.children) || isArrayHasLength(node._children)) {
        toggleNodeByName(this.data, node.name);
        this.redrawGraph();
      } else {
        if (node.iri) {
          const bundle = await EntityService.getPartialEntityBundle(node.iri, []);
          const data = translateFromEntityBundle(bundle, []);
          if (isArrayHasLength(data.children)) {
            data.children.forEach(child => {
              node._children.push(child);
            });
            toggleNodeByName(this.data, node.name);
            this.redrawGraph();
          }
        } else {
          this.$toast.add(LoggerService.warn("Node can not be expanded."));
        }
      }
    },

    drag(simulation: any) {
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
      }

      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    },

    stopSimulation() {
      if (isObjectHasKeys(this.svgPan, ["destroy"])) {
        this.svgPan.destroy();
      }
      d3.select("#force-layout-graph")
        .selectAll("div")
        .remove();
      d3.selectAll("g").remove();
      if (isObjectHasKeys(this.simulation, ["stop"])) {
        this.simulation.stop();
      }
    }
  }
});
</script>

<style>
#force-layout-svg {
  height: calc(100vh - 16.3rem);
  width: 100%;
}

circle:hover {
  stroke: steelblue;
  stroke-width: 3px;
  cursor: grab;
}

circle:active {
  cursor: grabbing;
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
}
foreignObject p {
  text-align: center;
  position: relative;
  top: 50%;
  -ms-transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
}

foreignObject:hover {
  font-weight: 600;
  cursor: pointer;
}

div.tooltip {
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
