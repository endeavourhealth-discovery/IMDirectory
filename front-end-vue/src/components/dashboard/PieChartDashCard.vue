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
import LoggerService from "@/services/LoggerService";
import ResizeablePieChart from "@/components/generics/ResizeablePieChart.vue";

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
      const container = document.getElementById(this.id) as HTMLElement;
      if (!container) {
        LoggerService.error(undefined, `Failed to set chart size for element id: ${this.id}`);
        return;
      }
      const html = document.documentElement;
      const currentFontSize = parseFloat(window.getComputedStyle(html, null).getPropertyValue("font-size"));
      const title = container.getElementsByClassName("p-card-title")[0] as HTMLElement;
      const subTitle = container.getElementsByClassName("p-card-subtitle")[0] as HTMLElement;
      const content = container.getElementsByClassName("p-card-content")[0] as HTMLElement;
      let height = container.getBoundingClientRect().height;
      if (currentFontSize) {
        height -= currentFontSize * 2;
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
  height: 100%;
  width: 100%;
}

.dashcard-container ::v-deep(.p-card-body) {
  height: 100%;
  width: 100%;
}

.dashcard {
  height: 100%;
  width: 100%;
}
</style>
