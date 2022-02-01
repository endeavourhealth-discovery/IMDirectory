<template>
  <div class="p-d-flex p-flex-row p-jc-center p-ai-center loading -container" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-if="!loading" class="dashboard-container">
    <template v-for="(cardData, index) in cardsData" :key="index">
      <component
        :is="cardData.component"
        :inputData="cardData.inputData"
        :name="cardData.name"
        :description="cardData.description"
        :id="'dashCard-' + index"
        labelKey="http://www.w3.org/2000/01/rdf-schema#label"
        dataKey="http://www.w3.org/2002/07/owl#hasValue"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ReportTable from "@/components/dashboard/ReportTable.vue";
import PieChartDashCard from "@/components/dashboard/PieChartDashCard.vue";
import ConfigService from "@/services/ConfigService";
import { IM } from "@/vocabulary/IM";
import { DashboardLayout } from "@/models/configs/DashboardLayout";
import EntityService from "@/services/EntityService";
import { RDFS } from "@/vocabulary/RDFS";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { IriCount } from "@/models/IriCount";
import { byOrder } from "@/helpers/Sorters";

export default defineComponent({
  name: "Dashboard",
  components: {
    ReportTable,
    PieChartDashCard
  },
  async mounted() {
    await this.init();
  },
  data() {
    return {
      loading: false,
      configs: [] as DashboardLayout[],
      cardsData: [] as { name: string; description: string; inputData: IriCount; component: string }[]
    };
  },
  methods: {
    async init(): Promise<void> {
      this.loading = true;
      await this.getConfigs();
      await this.getCardsData();
      this.loading = false;
    },

    async getConfigs(): Promise<void> {
      this.configs = await ConfigService.getDashboardLayout("conceptDashboard");
      if (isArrayHasLength(this.configs)) {
        this.configs.sort(byOrder);
      }
    },

    async getCardsData(): Promise<void> {
      for (const config of this.configs) {
        const result = await EntityService.getPartialEntity(config.iri, [RDFS.LABEL, RDFS.COMMENT, IM.STATS_REPORT_ENTRY]);
        if (!isObjectHasKeys(result)) return;
        const cardData = {
          name: result[RDFS.LABEL],
          description: result[RDFS.COMMENT],
          inputData: result[IM.STATS_REPORT_ENTRY],
          component: config.type
        };
        this.cardsData.push(cardData);
      }
    }
  }
});
</script>

<style scoped>
.dashboard-container {
  grid-area: content;
  display: flex;
  flex-flow: row wrap;
  column-gap: 7px;
  row-gap: 7px;
  width: 100%;
  height: calc(100vh - 2rem);
  overflow-y: auto;
  overflow-x: hidden;
}

@media screen and (min-width: 1024px) {
  .dashboard-container ::v-deep(.dashcard-container) {
    height: calc(50% - 7px);
    width: calc(50% - 7px);
  }
}

@media screen and (max-width: 1023px) {
  .dashboard-container ::v-deep(.dashcard-container) {
    height: calc(50% - 7px);
    width: calc(100%);
  }
}
</style>
