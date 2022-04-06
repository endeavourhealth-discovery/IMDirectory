<template>
  <div class="flex flex-row justify-content-center align-items-center loading-container" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else class="chart-container">
    <Chart type="pie" :data="chartConceptTypes" :options="chartOptions" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import palette from "google-palette";
import { ChartOptions } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers, Models } from "im-library";
const {
  ChartRescale: { setTooltips, rescaleData }
} = Helpers;
const { PieChartData } = Models;

export default defineComponent({
  name: "ResizablePieChart",
  props: {
    inputData: { type: Array as PropType<Array<any>>, required: true },
    labelKey: { type: String, required: true },
    dataKey: { type: String, required: true }
  },
  watch: {
    inputData: {
      handler() {
        this.setChartData();
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener("resize", this.onResize);
    });
    this.setChartData();
    this.onResize();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  data() {
    return {
      loading: true,
      chartOptions: {
        plugins: {
          legend: {
            position: "right",
            onHover: function(e: any) {
              e.native.target.style.cursor = "pointer";
            },
            onLeave: function(e: any) {
              e.native.target.style.cursor = "default";
            }
          }
        },
        maintainAspectRatio: true
      } as ChartOptions,
      realData: [] as number[],
      chartConceptTypes: new PieChartData(
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
    };
  },
  methods: {
    onResize() {
      this.setLegendOptions();
    },

    setChartData(): void {
      this.loading = true;
      for (const entry of this.inputData) {
        this.chartConceptTypes.labels.push(entry[this.labelKey]);
        this.chartConceptTypes.datasets[0].data.push(entry[this.dataKey]);
      }
      this.realData = { ...this.chartConceptTypes.datasets[0].data };
      // set tooltip to use real data
      this.chartOptions.plugins.tooltip = setTooltips(this.realData);
      // refactor data to a minimum graph size (1%) if less than min
      this.chartConceptTypes.datasets[0].data = rescaleData(this.chartConceptTypes.datasets[0].data);
      this.setChartColours(this.inputData.length);
      // }
      this.loading = false;
    },

    setChartColours(colourCount: number): void {
      const colours = palette("tol-rainbow", colourCount);
      this.chartConceptTypes.datasets[0].backgroundColor = colours.map((color: string) => "#" + color + "BB");
      this.chartConceptTypes.datasets[0].hoverBackgroundColor = colours.map((color: string) => "#" + color);
    },

    setLegendOptions(): void {
      this.chartOptions.plugins.legend.display = false;
      const width = window.innerWidth;
      if (width > 1750) {
        this.chartOptions.plugins.legend.position = "right";
        this.chartOptions.plugins.legend.labels = { boxWidth: 40, fontSize: 12 };
      } else if (width > 1300) {
        this.chartOptions.plugins.legend.position = "bottom";
        this.chartOptions.plugins.legend.labels = { boxWidth: 20, fontSize: 10 };
      } else if (width >= 1024) {
        this.chartOptions.plugins.legend.position = "bottom";
        this.chartOptions.plugins.legend.labels = { boxWidth: 10, fontSize: 8 };
      } else if (width >= 892) {
        this.chartOptions.plugins.legend.position = "right";
        this.chartOptions.plugins.legend.labels = {
          boxWidth: 40,
          fontSize: 8
        };
      } else if (width >= 557) {
        this.chartOptions.plugins.legend.position = "bottom";
        this.chartOptions.plugins.legend.labels = {
          boxWidth: 20,
          fontSize: 6
        };
      } else if (width >= 0) {
        this.chartOptions.plugins.legend.position = "bottom";
        this.chartOptions.plugins.legend.labels = {
          boxWidth: 10,
          fontSize: 4
        };
      } else {
        this.chartOptions.plugins.legend.display = false;
      }
    }
  }
});
</script>

<style scoped>
.chart-container {
  position:relative;
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
