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

<script setup lang="ts">
import { onMounted, PropType, nextTick, onUnmounted } from "vue";
import ResizeablePieChart from "./pieChartDashCard/ResizeablePieChart.vue";
import { LoggerService } from "@/im_library/services";

const props = defineProps({
  name: { type: String, required: false },
  description: { type: String, required: false },
  inputData: { type: Array as PropType<Array<any>>, required: true },
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
    LoggerService.error(undefined, `Failed to set chart size for element id: ${props.id}`);
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
