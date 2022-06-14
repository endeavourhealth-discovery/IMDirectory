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
        icon="fa-solid fa-copy"
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
    <div class="results-container">
      <p v-if="searchResults.length > 1000" class="result-summary">{{ totalCount }} results found. Display limited to first 1000.</p>
      <SearchResults :searchResults="searchResults" :loading="loading" />
    </div>
  </div>
  <Builder :showDialog="showDialog" @ECLSubmitted="updateECL" @closeDialog="showDialog = false" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Builder from "@/components/eclSearch/Builder.vue";
import SearchResults from "@/components/eclSearch/SearchResults.vue";
import { mapState } from "vuex";
import axios from "axios";
import { Helpers, Models } from "im-library";
const {
  DataTypeCheckers: { isObjectHasKeys }
} = Helpers;

export default defineComponent({
  name: "ExpressionConstraintsSearch",
  components: {
    Builder,
    SearchResults
  },
  computed: mapState(["sidebarControlActivePanel"]),
  emits: ["openBar", "closeBar"],
  watch: {
    queryString() {
      this.eclError = false;
    }
  },
  data() {
    return {
      queryString: "",
      showDialog: false,
      searchResults: [] as Models.Search.ConceptSummary[],
      totalCount: 0,
      eclError: false,
      loading: false,
      request: {} as { cancel: any; msg: string }
    };
  },
  methods: {
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
        const result = await this.$setService.ECLSearch(this.queryString, false, 1000, axiosSource.token);
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
      this.$toast.add(this.$loggerService.success("Value copied to clipboard"));
    },

    onCopyError(): void {
      this.$toast.add(this.$loggerService.error("Failed to copy value to clipboard"));
    }
  }
});
</script>

<style scoped>
#query-search-container {
  height: 100%;
  width: 100%;
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
  flex: 0 1 auto;
  overflow: auto;
}

.text-copy-container {
  width: 100%;
  display: flex;
  flex-flow: row;
  align-items: center;
  margin: 0 0 1rem 0;
}
</style>
