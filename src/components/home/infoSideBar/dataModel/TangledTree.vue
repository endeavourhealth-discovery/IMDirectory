<template>
  <div id="data-model-graph">
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
let color = ref(d3.scaleOrdinal(d3.schemeDark2));
let chartData:  Ref<TangledTreeData[][]> = ref([]);

onMounted(() => {
  chartData.value = props.data;
  renderChart();
})

function renderChart(){
  const w = 700;
  const h = 1000;

  const tangleLayout = constructTangleLayout(chartData.value,options);

  const svg = d3.select("#data-model-svg").attr("viewBox", [-5, -5, w, h] as any);

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
      .attr("stroke-width", 10)
      .attr("d", (n:any) => `M${n.x} ${n.y} L${n.x} ${n.y}`);

  node.append("path")
      .attr("stroke", "white")
      .attr("stroke-width", 7)
      .attr("d", (n:any) => `M${n.x} ${n.y} L${n.x} ${n.y}`);

  node
      .append("text")
      .attr("x", (n:any) => n.x + 4)
      .attr("y", (n:any) => n.y - n.height / 2 - 4)
      .text((d: any) => d.name)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .style("font-size", 15);

}
</script>

<style scoped>

</style>