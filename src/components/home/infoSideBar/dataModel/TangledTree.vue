<template>
  <div id="data-model-svg-container" >
    <svg id="data-model-svg"></svg>
  </div>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import { Helpers } from "im-library";
import {onMounted, PropType, ref, Ref, watch} from "vue";
import {TangledTreeData} from "im-library/dist/types/interfaces/Interfaces";
import _ from "lodash";

const {
  TangledTreeLayout: { constructTangleLayout }
} = Helpers;

const props = defineProps({
  data: { type: Array as PropType<Array<TangledTreeData[]>>, required: true }
});

watch(
    () => _.cloneDeep(props.data),
    newValue => {
      chartData.value = newValue;
      renderChart();
    }
);

let options: Ref = ref({});
let color = ref(d3.scaleOrdinal(d3.schemeSet2));
let chartData:  Ref<TangledTreeData[][]> = ref([]);

onMounted(() => {
  chartData.value = props.data;
  renderChart();
})

function renderChart(){
  const svgDoc = document.getElementById("data-model-svg");
  if (svgDoc != null) {
    svgDoc.innerHTML = "";
  }

  const tangleLayout = constructTangleLayout(chartData.value,options);
  const w = 750;
  const h = 1000;

  const svg = d3.select("#data-model-svg").attr("viewBox", [0, 0, w, h] as any);

  svg
      .append("g")
      .attr("class", "labels")
      .selectAll("title")
      .data(tangleLayout.nodes)
      .enter()
      .append("foreignObject")
      .attr("width",tangleLayout.layout.width )
      .attr("height", tangleLayout.layout.height);

  const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1)
      .selectAll("g")
      .data(tangleLayout.links)
      .join("g");

  link.append("path")
      .attr("stroke-width", 2)
      .attr("stroke", (l:any) => color.value(l.bundle.id))
      .attr("d", (l:any) =>`M${l.xt} ${l.yt}L${l.xb - l.c1} ${l.yt}
                                  A${l.c1} ${l.c1} 90 0 1 ${l.xb} ${l.yt + l.c1}
                                  L${l.xb} ${l.ys - l.c2}
                                  A${l.c2} ${l.c2} 90 0 0 ${l.xb + l.c2} ${l.ys}
                                  L${l.xs} ${l.ys}`)
      .join("");

  const node = svg
      .append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(tangleLayout.nodes)
      .join("g");

  node.append("path")
      .attr("stroke", "black")
      .attr("stroke-width", 13)
      .attr("d", (n:any) => `M${n.x} ${n.y} L${n.x} ${n.y}`);

  const nodeCircle = node.append("path")
      .attr("stroke", "white")
      .attr("stroke-width", 10)
      .attr("d", (n:any) => `M${n.x} ${n.y} L${n.x} ${n.y}`);

  const selectedCircle = nodeCircle.filter((n:any) => n.cardinality !== undefined)
  let cardRect:any;
  let cardinality:any;
  selectedCircle
      .on("mouseover", (d:any) =>{
        const n = d.path[0]["__data__"];
        cardRect = svg.append("rect")
            .attr("x",n.x + 30)
            .attr("y",  n.y - 40)
            .attr("width", 145)
            .attr("height", 40)
            .attr("fill", "white")
            .attr("stroke","black");
        cardinality = svg.append("text")
            .attr("x",n.x + 40 )
            .attr("y",  n.y - 15)
            .text("Cardinality: " + n.cardinality)
            .attr("stroke-width", 0.1)
            .style("font-size", 18);
      })
      .on("mouseout", (_d: any) => {
        if(cardRect && cardinality) {
          cardRect.remove();
          cardinality.remove();
        }
      });

  let rect:any;
  let fullName:any;

  node
      .append("text")
      .attr("x", (n:any) => n.x + 4)
      .attr("y", (n:any) => n.y - n.height / 2 - 4)
      .text((d: any) => d.name.length < 26 ? d.name : d.name.slice(0,25) + "...")
      .attr("stroke", "black")
      .attr("stroke-width", 0.1)
      .style("font-size", 20)
      .on("mouseover", (d:any) =>{
        const n = d.path[0]["__data__"];
        if(n.name.length > 26) {
          rect = svg.append("rect")
              .attr("x",n.x + 30)
              .attr("y",  n.y - 40)
              .attr("width", n.name.length * 9)
              .attr("height", 40)
              .attr("fill", "white")
              .attr("stroke","black");
          fullName = svg.append("text")
              .attr("x",n.x + 40 )
              .attr("y",  n.y - 15)
              .text(n.name)
              .attr("stroke-width", 0.1)
              .style("font-size", 18);
        }
      })
      .on("mouseout", (_d: any) => {
        if(rect && fullName) {
          rect.remove();
          fullName.remove();
        }
      });
}
</script>

<style scoped>
#data-model-svg-container {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
}

</style>