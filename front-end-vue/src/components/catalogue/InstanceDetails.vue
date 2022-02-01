<template>
  <div id="instance-details-container">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>
    <Panel>
      <template #header>
        <span>{{ instanceName ? instanceName : instanceIri }}</span>
      </template>
      <template #icons>
        <div class="icons-container">
          <Button class="p-panel-header-icon p-link p-mr-2" @click="showDashboard" label="Dashboard" v-tooltip="'Show dashboard'">
            <i class="fas fa-chart-line" aria-hidden="true" />
          </Button>
        </div>
      </template>
      <Tree :value="instanceData">
        <template #default="slotProps"> {{ slotProps.node.label }} {{ slotProps.node.data }} </template>
        <template #address="slotProps">
          <span>{{ slotProps.node.label }}</span>
          <a href="javascript:void(0)" @click="navigate(slotProps.node.data['@id'])">{{ slotProps.node.data["@id"] }}</a>
        </template>
      </Tree>
    </Panel>
  </div>
</template>

<script lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { TTBundle, TTIriRef } from "@/models/TripleTree";
import { IM } from "@/vocabulary/IM";
import { RDFS } from "@/vocabulary/RDFS";
import { defineComponent, PropType } from "@vue/runtime-core";
import { InstanceTreeItem } from "@/models/catalogue/InstanceTreeItem";

export default defineComponent({
  name: "InstanceDetails",
  props: {
    instance: { type: Object as PropType<TTBundle>, required: true },
    instanceIri: { type: String, required: true },
    loading: { type: Boolean, required: true }
  },
  watch: {
    instance(): void {
      this.processInstance();
    }
  },
  mounted() {
    this.processInstance();
  },
  data() {
    return {
      instanceName: "",
      instanceData: [] as InstanceTreeItem[]
    };
  },
  methods: {
    processInstance(): void {
      if (!isObjectHasKeys(this.instance, ["entity"])) return;
      this.instanceData = [];
      let level = 0;
      this.instanceName = this.instance.entity[RDFS.LABEL];
      Object.keys(this.instance.entity).forEach((predicate: any) => {
        if (predicate === "@id") {
          this.instanceData.push({
            key: level,
            label: this.instance.entity[predicate],
            children: []
          });
        } else if (predicate === IM.ADDRESS) {
          this.instanceData.push({
            key: level,
            label: this.getPredicateName(predicate) + " : ",
            data: this.instance.entity[predicate],
            type: "address",
            children: []
          });
        } else {
          if (Array.isArray(this.instance.entity[predicate])) {
            this.instanceData.push({
              key: level,
              label: this.getPredicateName(predicate) + " : ",
              children: this.getChildren(predicate)
            });
          } else if (typeof this.instance.entity[predicate] === "object") {
            this.instanceData.push({
              key: level,
              label: this.getPredicateName(predicate) + " : ",
              data: this.instance.entity[predicate].name ? this.instance.entity[predicate].name : this.instance.entity[predicate]["@id"],
              children: []
            });
          } else {
            this.instanceData.push({
              key: level,
              label: this.getPredicateName(predicate) + " : ",
              data: this.instance.entity[predicate],
              children: []
            });
          }
        }
        level = level + 1;
      });
    },

    navigate(iri: string): void {
      this.$router.push({
        name: "Individual",
        params: { selectedIri: iri }
      });
    },

    getPredicateName(iri: string): string {
      let name = "";
      this.instance.predicates.forEach((pre: TTIriRef) => {
        if (pre["@id"] === iri) {
          name = pre.name ? pre.name : pre["@id"];
        }
      });
      return name;
    },

    getChildren(predicate: string): InstanceTreeItem[] {
      console.log("?");
      return [] as InstanceTreeItem[];
    },

    showDashboard(): void {
      this.$store.commit("updateInstanceIri", "");
    }
  }
});
</script>

<style scoped>
#instance-details-container {
  grid-area: content;
  height: calc(100vh - 2rem);
  width: 100%;
  overflow-y: auto;
  background-color: #ffffff;
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
</style>
