<template>
  <div :id="id" class="dashcard-container">
    <div class="dashcard">
      <span v-if="name" class="title">{{ name }}</span>
      <span v-if="description" class="description">{{ description }}</span>
      <div class="content">
        <ResizeablePieChart :inputData="inputData" :labelKey="labelKey" :dataKey="dataKey" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, PropType, nextTick, onUnmounted } from "vue";
import ResizeablePieChart from "./pieChartDashCard/ResizeablePieChart.vue";
import { getLogger } from "@im-library/logger/LogConfig";

const log = getLogger("components.PieChartDashCam");

const props = defineProps({
  name: { type: String, required: false },
  description: { type: String, required: false },
  inputData: { type: Array as PropType<any[]>, required: true },
  id: { type: String, required: true },
  labelKey: { type: String, required: true },
  dataKey: { type: String, required: true }
});

onMounted(async () => {
  await nextTick();
  window.addEventListener("resize", onResize);
  onResize();
});

onUnmounted(() => window.removeEventListener("resize", onResize));

function onResize() {
  setChartSize();
}

function setChartSize(): void {
  const reportTable = document.getElementsByClassName("report-table")[0] as HTMLElement;
  const container = document.getElementById(props.id) as HTMLElement;
  if (!container) {
    log.error(() => `Failed to set chart size for element id: ${props.id}`);
  } else {
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
</script>

<style scoped>
.dashcard-container {
  height: 100%;
  width: calc(50% - 0.5rem);
}

.dash-pie {
  width: 100%;
  height: 100%;
}

.dashcard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  box-shadow: none;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.description {
  font-weight: 400;
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.content {
  flex: 1 1 auto;
  overflow: hidden;
}
</style>
