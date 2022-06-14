<template>
  <div :id="id" class="dashcard-container">
    <Card class="dashcard dash-pie">
      <template #title>
        <span v-if="name">{{ name }}</span>
      </template>
      <template #subtitle>
        <span v-if="description">{{ description }}</span>
      </template>
      <template #content>
        <ResizeablePieChart :inputData="inputData" :labelKey="labelKey" :dataKey="dataKey" />
      </template>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import ResizeablePieChart from "@/components/landingPage/pieChartDashCard/ResizeablePieChart.vue";

export default defineComponent({
  name: "ReportPieChart",
  props: {
    name: { type: String, required: false },
    description: { type: String, required: false },
    inputData: { type: Array as PropType<Array<any>>, required: true },
    id: { type: String, required: true },
    labelKey: { type: String, required: true },
    dataKey: { type: String, required: true }
  },
  components: {
    ResizeablePieChart
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener("resize", this.onResize);
    });
    this.onResize();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    onResize() {
      this.setChartSize();
    },

    setChartSize(): void {
      const reportTable = document.getElementsByClassName("report-table")[0] as HTMLElement;
      const container = document.getElementById(this.id) as HTMLElement;
      if (!container) {
        this.$loggerService.error(undefined, `Failed to set chart size for element id: ${this.id}`);
        return;
      }
      const html = document.documentElement;
      const currentFontSize = parseFloat(window.getComputedStyle(html, null).getPropertyValue("font-size"));
      const title = container.getElementsByClassName("p-card-title")[0] as HTMLElement;
      const subTitle = container.getElementsByClassName("p-card-subtitle")[0] as HTMLElement;
      const content = container.getElementsByClassName("p-card-content")[0] as HTMLElement;
      let height = reportTable?.getBoundingClientRect().height;
      if (currentFontSize) {
        height -= currentFontSize * 3;
      }
      if (title) {
        height -= title.getBoundingClientRect().height;
      }
      if (subTitle) {
        height -= subTitle.getBoundingClientRect().height;
      }
      if (content) {
        content.style.height = height + "px";
        content.style.maxHeight = height + "px";
      }
    }
  }
});
</script>

<style scoped>
.dashcard-container {
  width: 50%;
}

.dashcard-container ::v-deep(.p-card-body) {
  width: 100%;
}

.dashcard {
  width: 100%;
  box-shadow: none;
  border-radius: none;
}
</style>
