<template>
  <div class="flex flex-row justify-content-center align-items-center loading-container" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else class="chart-container">
    <Chart type="pie" :data="chartConceptTypes" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, PropType, Ref, ref, watch } from "vue";
import palette from "google-palette";
import _ from "lodash";
import { ChartOptions } from "@im-library/interfaces";
import { ChartRescale } from "@im-library/helpers";
import { PieChartData } from "@im-library/models";
const { setTooltips, rescaleData } = ChartRescale;

const props = defineProps({
  inputData: { type: Array as PropType<any[]>, required: true },
  labelKey: { type: String, required: true },
  dataKey: { type: String, required: true }
});

watch(
  () => _.cloneDeep(props.inputData),
  () => setChartData()
);

const loading = ref(true);
const chartOptions: Ref<ChartOptions> = ref({
  plugins: {
    legend: {
      position: "right",
      onHover: function (e: any) {
        e.native.target.style.cursor = "pointer";
      },
      onLeave: function (e: any) {
        e.native.target.style.cursor = "default";
      }
    }
  },
  maintainAspectRatio: true
});
const realData: Ref<number[]> = ref([]);
const chartConceptTypes: Ref<PieChartData> = ref(
  new PieChartData(
    [
      {
        data: [],
        backgroundColor: [],
        hoverBackgroundColor: [],
        borderRadius: 1
      }
    ],
    []
  )
);

onMounted(async () => {
  await nextTick();
  window.addEventListener("resize", onResize);
  setChartData();
  onResize();
});

onUnmounted(() => window.removeEventListener("resize", onResize));

function onResize() {
  setLegendOptions();
}

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

function setLegendOptions(): void {
  chartOptions.value.plugins.legend.display = false;
  const width = window.innerWidth;
  if (width > 1750) {
    chartOptions.value.plugins.legend.position = "right";
    chartOptions.value.plugins.legend.labels = { boxWidth: 40, fontSize: 12 };
  } else if (width > 1300) {
    chartOptions.value.plugins.legend.position = "bottom";
    chartOptions.value.plugins.legend.labels = { boxWidth: 20, fontSize: 10 };
  } else if (width >= 1024) {
    chartOptions.value.plugins.legend.position = "bottom";
    chartOptions.value.plugins.legend.labels = { boxWidth: 10, fontSize: 8 };
  } else if (width >= 892) {
    chartOptions.value.plugins.legend.position = "right";
    chartOptions.value.plugins.legend.labels = {
      boxWidth: 40,
      fontSize: 8
    };
  } else if (width >= 557) {
    chartOptions.value.plugins.legend.position = "bottom";
    chartOptions.value.plugins.legend.labels = {
      boxWidth: 20,
      fontSize: 6
    };
  } else if (width >= 0) {
    chartOptions.value.plugins.legend.position = "bottom";
    chartOptions.value.plugins.legend.labels = {
      boxWidth: 10,
      fontSize: 4
    };
  } else {
    chartOptions.value.plugins.legend.display = false;
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  margin-left: 20%;
  height: 50%;
  width: 50%;
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
