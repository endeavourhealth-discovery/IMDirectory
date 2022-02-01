<template>
  <div class="query-item-container" :id="id">
    <div class="label-container">
      <span class="float-text">Expression</span>
      <InputText
        ref="miniSearchInput"
        type="text"
        v-model="searchTerm"
        @input="search"
        @keyup.enter="search"
        @focus="showOverlay"
        @blur="hideOverlay"
        @change="showOverlay"
        placeholder="Search"
        class="p-inputtext search-input"
        autoWidth="true"
      />
    </div>
  </div>
  <OverlayPanel class="search-op" ref="miniSearchOP">
    <SearchMiniOverlay :searchTerm="searchTerm" :searchResults="searchResults" :loading="loading" @searchResultSelected="updateSelectedResult" />
  </OverlayPanel>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import SearchMiniOverlay from "@/components/sidebar/expressionConstraintsSearch/SearchMiniOverlay.vue";
import { ECLType } from "@/models/expressionConstraintsLanguage/ECLType";
import { ECLComponent } from "@/models/expressionConstraintsLanguage/ECLComponent";
import { ConceptSummary } from "@/models/search/ConceptSummary";
import { SearchRequest } from "@/models/search/SearchRequest";
import { SortBy } from "@/models/search/SortBy";
import axios from "axios";
import EntityService from "@/services/EntityService";
import { IM } from "@/vocabulary/IM";
import { TTIriRef } from "@/models/TripleTree";
import { mapState } from "vuex";
import { ComponentDetails } from "@/models/ecl/ComponentDetails";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Namespace } from "@/models/Namespace";
import { EntityReferenceNode } from "@/models/EntityReferenceNode";

export default defineComponent({
  name: "Expression",
  props: {
    id: { type: String, required: true },
    position: { type: Number, required: true },
    value: { type: Object as PropType<ConceptSummary>, required: false }
  },
  emits: { updateClicked: (payload: ComponentDetails) => true },
  components: { SearchMiniOverlay },
  computed: mapState(["filterOptions", "selectedFilters"]),
  mounted() {
    if (this.value && isObjectHasKeys(this.value, ["name", "iri"])) {
      this.updateSelectedResult(this.value);
    } else {
      this.updateSelectedResult({ ...this.anyModel });
    }
  },
  data() {
    return {
      loading: false,
      debounce: 0,
      request: {} as { cancel: any; msg: string },
      selectedResult: {} as ConceptSummary,
      anyModel: {
        code: "",
        name: "ANY",
        iri: "",
        isDescendentOf: [],
        weighting: 0,
        scheme: {} as TTIriRef,
        status: {} as TTIriRef,
        match: "ANY",
        entityType: [{ "@id": IM.CONCEPT, name: "Concept" }]
      } as ConceptSummary,
      searchTerm: "ANY",
      searchResults: [] as ConceptSummary[]
    };
  },
  methods: {
    // debounceForSearch(): void {
    //   clearTimeout(this.debounce);
    //   this.debounce = window.setTimeout(() => {
    //     this.search();
    //   }, 600);
    // },

    // checkKey(event: any) {
    //   if (event.code === "Enter") {
    //     this.search();
    //   }
    // },

    async search(): Promise<void> {
      if (this.searchTerm.toUpperCase() === "ANY" || this.searchTerm === "*") {
        this.searchResults = [{ ...this.anyModel }];
        return;
      }
      if (this.searchTerm.length > 0) {
        this.searchResults = [];
        this.loading = true;
        const searchRequest = new SearchRequest();
        searchRequest.termFilter = this.searchTerm;
        searchRequest.sortBy = SortBy.Usage;
        searchRequest.page = 1;
        searchRequest.size = 100;
        searchRequest.schemeFilter = this.selectedFilters.schemes.map((scheme: Namespace) => scheme.iri);

        searchRequest.statusFilter = [];
        this.selectedFilters.status.forEach((status: EntityReferenceNode) => {
          searchRequest.statusFilter.push(status["@id"]);
        });

        searchRequest.typeFilter = [];
        this.selectedFilters.types.forEach((type: TTIriRef) => {
          searchRequest.typeFilter.push(type["@id"]);
        });
        if (isObjectHasKeys(this.request, ["cancel", "msg"])) {
          await this.request.cancel({ status: 499, message: "Search cancelled by user" });
        }
        const axiosSource = axios.CancelToken.source();
        this.request = { cancel: axiosSource.cancel, msg: "Loading..." };
        await this.fetchSearchResults(searchRequest, axiosSource.token);
        this.loading = false;
      }
    },

    async fetchSearchResults(searchRequest: SearchRequest, cancelToken: any) {
      const result = await EntityService.advancedSearch(searchRequest, cancelToken);
      if (result && isArrayHasLength(result)) {
        this.searchResults = result;
      } else {
        this.searchResults = [];
      }
    },

    hideOverlay(): void {
      const x = this.$refs.miniSearchOP as any;
      x.hide();
    },

    showOverlay(event: any): void {
      const x = this.$refs.miniSearchOP as any;
      x.show(event, event.target);
    },

    updateSelectedResult(data: ConceptSummary) {
      this.selectedResult = data;
      this.searchTerm = data.name;
      this.$emit("updateClicked", this.createExpression());
      this.hideOverlay();
    },

    editClicked(event: any) {
      this.showOverlay(event);
    },

    createExpression(): ComponentDetails {
      let label;
      if (this.selectedResult.name === "ANY") {
        label = "*";
      } else {
        label = this.selectedResult.code + " |" + this.selectedResult.name + "|";
      }
      return {
        value: this.selectedResult,
        id: this.id,
        position: this.position,
        type: ECLType.EXPRESSION,
        label: label,
        component: ECLComponent.EXPRESSION
      };
    }
  }
});
</script>

<style scoped>
.query-item-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.label-container {
  margin: 0 1rem 0 0;
  padding: 1rem;
  border: 1px solid #ffc952;
  border-radius: 3px;
  position: relative;
  min-width: 15rem;
}

.label {
  cursor: pointer;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  background-color: #ffffff;
  padding: 0.25rem;
}

.float-text {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 0.75rem;
  color: #6c757d;
}

.search-input {
  width: 15rem;
}
</style>
