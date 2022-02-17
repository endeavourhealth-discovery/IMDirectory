<template>
  <div id="landing-page-container">
    <div class="p-d-flex p-flex-row p-jc-center p-ai-center loading-container" v-if="loading">
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
          style="box-shadow:none;"
        />
      </template>
    </div>
    <!-- <Card>
      <template #title>
        Latest activity
      </template>
      <template #content>
        <DataView :value="products" layout="grid">
          <template #grid="slotProps">
            <div style="padding: .5em" class="col-12 md:col-3">
              <Panel :header="slotProps.data.name" style="text-align: center">
                <img :src="'demo/images/car/' + slotProps.data.brand + '.png'" :alt="slotProps.data.brand" />
                <div class="car-detail">{{ slotProps.data.year }} - {{ slotProps.data.color }}</div>
                <Button label="Continue" class="p-button-outlined" icon="pi pi-arrow-circle-right" iconPos="right" />
              </Panel>
            </div>
          </template>
        </DataView>
      </template>
    </Card> -->
    <Card>
      <template #title>
        Suggested
      </template>
      <template #content>
        <DataTable :value="products" responsiveLayout="scroll" v-model:selection="selected" selectionMode="single" dataKey="code" @row-click="onClick">
          <Column field="code" header="Code"></Column>
          <Column field="name" header="Name"></Column>
          <Column field="category" header="Category"></Column>
          <Column field="quantity" header="Quantity"></Column>
        </DataTable>
      </template>
    </Card>
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
  name: "LandingPage",
  components: {
    ReportTable,
    PieChartDashCard
  },
  async mounted() {
    await this.init();
  },
  data() {
    return {
      selected: {} as any,
      loading: false,
      configs: [] as DashboardLayout[],
      cardsData: [] as { name: string; description: string; inputData: IriCount; component: string }[],

      products: [
        {
          id: "1000",
          code: "f230fh0g3",
          name: "Bamboo Watch",
          description: "Product Description",
          image: "bamboo-watch.jpg",
          price: 65,
          category: "Accessories",
          quantity: 24,
          inventoryStatus: "INSTOCK",
          rating: 5
        },
        {
          id: "1002",
          code: "zz21cz3c1",
          name: "Blue Band",
          description: "Product Description",
          image: "blue-band.jpg",
          price: 79,
          category: "Fitness",
          quantity: 2,
          inventoryStatus: "LOWSTOCK",
          rating: 3
        },
        {
          id: "1003",
          code: "244wgerg2",
          name: "Blue T-Shirt",
          description: "Product Description",
          image: "blue-t-shirt.jpg",
          price: 29,
          category: "Clothing",
          quantity: 25,
          inventoryStatus: "INSTOCK",
          rating: 5
        }
      ]
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

    onClick(event: any) {
      console.log(event.data);
    },

    async getCardsData(): Promise<void> {
      const cards = [] as { name: string; description: string; inputData: IriCount; component: string }[];
      for (const config of this.configs) {
        const result = await EntityService.getPartialEntity(config.iri, [RDFS.LABEL, RDFS.COMMENT, IM.STATS_REPORT_ENTRY]);
        if (!isObjectHasKeys(result)) return;
        const cardData = {
          name: result[RDFS.LABEL],
          description: result[RDFS.COMMENT],
          inputData: result[IM.STATS_REPORT_ENTRY],
          component: config.type
        };
        cards.push(cardData);
      }
      // cards.pop();
      // cards.pop();
      this.cardsData = cards;
    }
  }
});
</script>

<style scoped>
#landing-page-container {
  grid-area: content;
  height: calc(100% - 4.1rem);
  width: 100%;
  overflow-y: auto;
  background-color: #ffffff;
}

.p-card {
  box-shadow: none;
}

.dashboard-container {
  padding-top: none;
  grid-area: content;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  height: calc(100vh - 23.5rem);
  overflow-y: auto;
  overflow-x: hidden;
  border: none;
  box-shadow: none;
  border-radius: none;
}

@media screen and (min-width: 1024px) {
  .dashboard-container ::v-deep(.dashcard-container) {
    height: calc(50%);
    width: calc(50%);
  }
}

@media screen and (max-width: 1023px) {
  .dashboard-container ::v-deep(.dashcard-container) {
    height: calc(50%);
    width: calc(100%);
  }
}
</style>
