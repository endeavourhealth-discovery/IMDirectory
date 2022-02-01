<template>
  <div class="catalogue-dashboard-container">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <div v-else class="content-container">
      <div class="dash-table">
        <ReportTable
          :name="'Instance overview'"
          :description="'A brief overview of the instances stored in the Catalogue'"
          :id="'catalogue-dashtable-1'"
          :inputData="types"
        />
      </div>
      <div class="dash-chart">
        <PieChartDashCard
          :name="'Catalogue instance types'"
          :description="'A brief overview of the types of instance data stored in the Catalogue'"
          :inputData="types"
          id="catalogue-pie-chart-1"
          labelKey="label"
          dataKey="count"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PropType } from "@vue/runtime-core";
import PieChartDashCard from "@/components/dashboard/PieChartDashCard.vue";
import ReportTable from "@/components/dashboard/ReportTable.vue";
import { SimpleCount } from "@/models/SimpleCount";

export default defineComponent({
  name: "CatalogueDashboard",
  props: {
    types: {
      type: Array as PropType<Array<SimpleCount>>,
      required: true
    },
    loading: { type: Boolean, required: true }
  },
  components: {
    ReportTable,
    PieChartDashCard
  }
});
</script>

<style scoped>
.catalogue-dashboard-container {
  grid-area: content;
  height: 100%;
  overflow-y: auto;
  background-color: #ffffff;
}

.dashboard-card {
  height: 100%;
}

.loading-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}

.content-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: flex-start;
  column-gap: 7px;
  row-gap: 7px;
  overflow-y: auto;
  overflow-x: hidden;
}

.dash-table {
  width: calc(50% - 7px);
  /* height: calc(50% - 7px); */
  height: 100%;
}

.dash-chart {
  width: calc(50%);
  /* height: calc(50% - 7px); */
  height: 100%;
}
</style>
