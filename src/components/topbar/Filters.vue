<template>
  <div class="quick-filters-container">
    <div class="quick-filter-container">
      <label>Include legacy:</label>
      <InputSwitch v-model="includeLegacy" />
    </div>
  </div>

  <div class="p-field">
    <div class="p-inputgroup">
      <span class="p-float-label">
        <MultiSelect id="status" v-model="selectedStatus" @change="checkForSearch" :options="filterOptions.status" optionLabel="name" display="chip" />
        <label for="status">Select status:</label>
        <Button icon="pi pi-undo" class="p-button-secondary" @click="resetStatus" v-tooltip="'Reset status filters'" />
      </span>
    </div>
  </div>

  <div class="p-field">
    <div class="p-inputgroup">
      <span class="p-float-label">
        <MultiSelect id="scheme" v-model="selectedSchemes" @change="checkForSearch" :options="filterOptions.schemes" optionLabel="name" display="chip" />
        <label for="scheme">Select scheme:</label>
        <Button icon="pi pi-undo" class="p-button-secondary" @click="resetSchemes" v-tooltip="'Reset scheme filters'" />
      </span>
    </div>
  </div>

  <div class="p-field">
    <div class="p-inputgroup">
      <span class="p-float-label">
        <MultiSelect id="conceptType" v-model="selectedTypes" @change="checkForSearch" :options="filterOptions.types" optionLabel="name" display="chip" />
        <label for="conceptType">Select concept type:</label>
        <Button icon="pi pi-undo" class="p-button-secondary" @click="resetTypes" v-tooltip="'Reset type filters'" />
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { Namespace, EntityReferenceNode } from "im-library/dist/types/interfaces/Interfaces";
import { Helpers } from "im-library";
const {
  DataTypeCheckers: { isArrayHasLength }
} = Helpers;

export default defineComponent({
  name: "Filters",
  props: { search: { type: Function, required: true } },
  computed: mapState(["filterOptions", "selectedFilters", "quickFiltersStatus", "filterDefaults"]),
  watch: {
    includeLegacy(newValue) {
      this.setLegacy(newValue);
    },
    selectedStatus() {
      this.updateStoreSelectedFilters();
    },
    selectedSchemes() {
      this.updateStoreSelectedFilters();
    },
    selectedTypes() {
      this.updateStoreSelectedFilters();
    }
  },
  mounted() {
    this.init();
  },
  data() {
    return {
      selectedStatus: [] as EntityReferenceNode[],
      selectedSchemes: [] as Namespace[],
      selectedTypes: [] as EntityReferenceNode[],
      includeLegacy: false
    };
  },
  methods: {
    init() {
      this.setDefaults();
    },
    resetStatus() {
      this.selectedStatus = this.filterOptions.status.filter((item: EntityReferenceNode) => this.filterDefaults.statusOptions.includes(item["@id"]));
      this.checkForSearch();
    },
    resetSchemes() {
      this.selectedSchemes = this.filterOptions.schemes.filter((item: Namespace) => this.filterDefaults.schemeOptions.includes(item.iri));
      this.checkForSearch();
    },
    resetTypes() {
      this.selectedTypes = this.filterOptions.types.filter((item: EntityReferenceNode) => this.filterDefaults.typeOptions.includes(item["@id"]));
      this.checkForSearch();
    },
    checkForSearch(): void {
      this.updateStoreSelectedFilters();
      this.search();
    },

    updateStoreSelectedFilters(): void {
      this.$store.commit("updateSelectedFilters", {
        status: this.selectedStatus,
        schemes: this.selectedSchemes,
        types: this.selectedTypes
      });
    },

    setDefaults(): void {
      if (!isArrayHasLength(this.selectedFilters.status) && !isArrayHasLength(this.selectedFilters.schemes) && !isArrayHasLength(this.selectedFilters.types)) {
        this.selectedStatus = this.filterOptions.status.filter((item: EntityReferenceNode) => this.filterDefaults.statusOptions.includes(item["@id"]));
        this.selectedSchemes = this.filterOptions.schemes.filter((item: Namespace) => this.filterDefaults.schemeOptions.includes(item.iri));
        this.selectedTypes = this.filterOptions.types.filter((item: EntityReferenceNode) => this.filterDefaults.typeOptions.includes(item["@id"]));
        this.updateStoreSelectedFilters();
      } else {
        this.selectedStatus = this.selectedFilters.status;
        this.selectedSchemes = this.selectedFilters.schemes;
        this.selectedTypes = this.selectedFilters.types;
      }

      if (this.quickFiltersStatus.includeLegacy) {
        this.includeLegacy = this.quickFiltersStatus.includeLegacy;
      }
    },

    setLegacy(include: boolean): void {
      const emisScheme = this.selectedSchemes.findIndex(scheme => scheme.iri === "http://endhealth.info/emis#");
      if (include) {
        if (emisScheme === -1) {
          const found = this.filterOptions.schemes.find((scheme: Namespace) => scheme.iri === "http://endhealth.info/emis#");
          if (found) this.selectedSchemes.push(found);
        }
      } else {
        if (emisScheme > -1) {
          this.selectedSchemes.splice(emisScheme, 1);
        }
      }
      this.$store.commit("updateQuickFiltersStatus", {
        key: "includeLegacy",
        value: include
      });
    }
  }
});
</script>

<style scoped>
label {
  font-size: 1rem !important;
}

.p-field {
  margin-top: 2rem;
}

.quick-filters-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1rem;
}

.quick-filter-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
}
</style>
