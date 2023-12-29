<template>
  <div class="flex flex-row justify-content-center align-items-center loading-container" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else class="chart-container">
    <Chart type="pie" :data="chartConceptTypes" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, Ref, ref, watch } from "vue";
import palette from "google-palette";
import _ from "lodash";
import { ChartOptions, PieChartData } from "@im-library/interfaces";
import { setTooltips, rescaleData } from "@im-library/helpers/ChartRescale";

interface Props {
  inputData: any[];
  labelKey: string;
  dataKey: string;
}
const props = defineProps<Props>();

watch(
  () => _.cloneDeep(props.inputData),
  () => setChartData()
);

const loading = ref(true);
const chartOptions: Ref<ChartOptions> = ref({
  plugins: {
    legend: {
      display: false
    }
  },
  maintainAspectRatio: true
});
const realData: Ref<number[]> = ref([]);
const chartConceptTypes: Ref<PieChartData> = ref({
  datasets: [
    {
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: [],
      borderRadius: 1
    }
  ],
  labels: []
} as PieChartData);

onMounted(async () => {
  await nextTick();
  setChartData();
});

function setChartData(): void {
  loading.value = true;
  for (const entry of props.inputData) {
    chartConceptTypes.value.labels.push(entry[props.labelKey]);
    chartConceptTypes.value.datasets[0].data.push(entry[props.dataKey]);
  }
  realData.value = { ...chartConceptTypes.value.datasets[0].data };
  // set tooltip to use real data
  chartOptions.value.plugins.tooltip = setTooltips(realData.value);
  // refactor data to a minimum graph size (1%) if less than min
  chartConceptTypes.value.datasets[0].data = rescaleData(chartConceptTypes.value.datasets[0].data);
  setChartColours(props.inputData.length);
  // }
  loading.value = false;
}

function setChartColours(colourCount: number): void {
  const colours = palette("tol-rainbow", colourCount);
  chartConceptTypes.value.datasets[0].backgroundColor = colours.map((color: string) => "#" + color + "BB");
  chartConceptTypes.value.datasets[0].hoverBackgroundColor = colours.map((color: string) => "#" + color);
}
</script>

<style scoped>
.chart-container {
  height: 100%;
  width: 100%;
}

.p-chart {
  height: 100%;
  width: 100%;
}

.loading-container {
  width: 100%;
  height: 100%;
}
</style>
