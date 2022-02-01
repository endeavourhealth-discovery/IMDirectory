<template>
  <div id="query-search-container">
    <h3 class="title">Expression constraints language search</h3>
    <h5 class="info">ECL expression:</h5>
    <div class="text-copy-container">
      <Textarea
        v-model="queryString"
        id="query-string-container"
        placeholder="Enter expression here or use the ECL builder to generate your search..."
        :class="eclError ? 'p-invalid' : ''"
      />
      <Button
        :disabled="!queryString.length"
        icon="far fa-copy"
        v-tooltip.left="'Copy to clipboard'"
        v-clipboard:copy="copyToClipboard()"
        v-clipboard:success="onCopy"
        v-clipboard:error="onCopyError"
      />
    </div>
    <div class="button-container">
      <Button label="ECL builder" @click="showBuilder" class="p-button-help" />
      <Button label="Search" @click="search" class="p-button-primary" :disabled="!queryString.length" />
    </div>
    <div class="results-container" :style="'height: ' + resultsHeight + ';maxHeight: ' + resultsHeight + ';'">
      <p v-if="searchResults.length > 1000" class="result-summary">{{ totalCount }} results found. Display limited to first 1000.</p>
      <SearchResults :searchResults="searchResults" :loading="loading" />
    </div>
  </div>
  <Builder :showDialog="showDialog" @ECLSubmitted="updateECL" @closeDialog="showDialog = false" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Builder from "@/components/sidebar/expressionConstraintsSearch/Builder.vue";
import SearchResults from "@/components/sidebar/SearchResults.vue";
import EntityService from "@/services/EntityService";
import LoggerService from "@/services/LoggerService";
import { ConceptSummary } from "@/models/search/ConceptSummary";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { getContainerElementOptimalHeight } from "@/helpers/GetContainerElementOptimalHeight";
import { mapState } from "vuex";
import axios from "axios";
import SetService from "@/services/SetService";

export default defineComponent({
  name: "ExpressionConstraintsSearch",
  components: {
    Builder,
    SearchResults
  },
  computed: mapState(["sidebarControlActivePanel"]),
  watch: {
    queryString() {
      this.eclError = false;
    },
    sidebarControlActivePanel(newValue) {
      if (newValue === 3) this.setResultsHeight();
    }
  },
  async mounted() {
    window.addEventListener("resize", this.onResize);
    await this.onResize();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  data() {
    return {
      queryString: "",
      showDialog: false,
      searchResults: [] as ConceptSummary[],
      totalCount: 0,
      eclError: false,
      loading: false,
      resultsHeight: "",
      request: {} as { cancel: any; msg: string }
    };
  },
  methods: {
    async onResize(): Promise<void> {
      await this.$nextTick();
      this.setResultsHeight();
    },

    updateECL(data: string): void {
      this.queryString = data;
      this.showDialog = false;
    },

    showBuilder(): void {
      this.showDialog = true;
    },

    async search(): Promise<void> {
      if (this.queryString) {
        this.loading = true;
        if (isObjectHasKeys(this.request, ["cancel", "msg"])) {
          await this.request.cancel({ status: 499, message: "Search cancelled by user" });
        }
        const axiosSource = axios.CancelToken.source();
        this.request = { cancel: axiosSource.cancel, msg: "Loading..." };
        const result = await SetService.ECLSearch(this.queryString, false, 1000, axiosSource.token);
        if (isObjectHasKeys(result, ["entities", "count", "page"])) {
          this.searchResults = result.entities;
          this.totalCount = result.count;
        } else {
          this.eclError = true;
          this.searchResults = [];
          this.totalCount = 0;
        }
        this.loading = false;
      }
    },

    copyToClipboard(): string {
      return this.queryString;
    },

    onCopy(): void {
      this.$toast.add(LoggerService.success("Value copied to clipboard"));
    },

    onCopyError(): void {
      this.$toast.add(LoggerService.error("Failed to copy value to clipboard"));
    },

    setResultsHeight(): void {
      this.resultsHeight = getContainerElementOptimalHeight(
        "query-search-container",
        ["title", "info", "text-copy-container", "button-container", "p-paginator"],
        false
      );
    }
  }
});
</script>

<style scoped>
#query-search-container {
  height: 100%;
  /* overflow: auto; */
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
}

#query-builder-container {
  width: 100%;
  flex-grow: 100;
  overflow: auto;
}

#query-build {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  margin: 0 0 1rem 0;
}

#next-option-container {
  width: 100%;
  display: flex;
  flex-flow: row;
  justify-content: center;
}

#query-string-container {
  width: 100%;
  height: 10rem;
  overflow: auto;
  flex-grow: 100;
}

.info {
  align-self: flex-start;
  margin: 0 0 0.5rem 0;
}

.button-container {
  display: flex;
  flex-flow: row;
  gap: 1rem;
  margin: 0 0 1rem 0;
}

.results-container {
  width: 100%;
  flex-grow: 10;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  height: 100%;
}

.text-copy-container {
  width: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
  margin: 0 0 1rem 0;
}
</style>
