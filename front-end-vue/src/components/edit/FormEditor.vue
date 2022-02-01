<template>
  <div class="loading-container p-d-flex p-flex-row p-jc-center p-ai-center" v-if="loading">
    <ProgressSpinner />
  </div>
  <Card v-if="!loading">
    <template #content>
      <div class="p-fluid editor-grid">
        <div class="p-field float-label-container iri">
          <span class="p-float-label">
            <InputText class="p-inputtext-lg" v-model="conceptDto.iri" type="text" />
            <label for="Iri">Iri</label>
          </span>
        </div>
        <div class="p-field float-label-container name">
          <span class="p-float-label">
            <InputText class="p-inputtext-lg" v-model="conceptDto.name" type="text" />
            <label for="Name">Name</label>
          </span>
        </div>
        <div class="p-field float-label-container code">
          <span class="p-float-label">
            <InputText class="p-inputtext-lg" v-model="conceptDto.code" type="text" />
            <label for="Code">Code</label>
          </span>
        </div>
        <div class="p-field float-label-container description">
          <span class="p-float-label">
            <Textarea class="p-inputtext-lg" v-model="conceptDto.description" rows="4" />
            <label for="address">Description</label>
          </span>
        </div>
        <div class="p-field float-label-container version">
          <span class="p-float-label">
            <InputText class="p-inputtext-lg" v-model="conceptDto.version" type="text" />
            <label for="Version">Version</label>
          </span>
        </div>
        <div class="p-field float-label-container status">
          <span class="p-float-label">
            <Dropdown class="p-inputtext-lg" v-model="conceptDto.status" :options="statusOptions" />
            <label>Status</label>
          </span>
        </div>
        <div class="p-field float-label-container scheme">
          <span class="p-float-label">
            <Dropdown class="p-inputtext-lg" v-model="conceptDto.scheme" optionValue="name" :options="schemeOptions" optionLabel="name" />
            <label>Scheme</label>
          </span>
        </div>
      </div>
    </template>
  </Card>
</template>

<script lang="ts">
import EntityService from "@/services/EntityService";
import { defineComponent } from "@vue/runtime-core";
import Dropdown from "primevue/dropdown";
import Card from "primevue/card";
import { IM } from "@/vocabulary/IM";
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";

export default defineComponent({
  name: "FormEditor",
  components: { Dropdown, Card },
  props: ["iri", "updatedConcept"],
  emits: { "concept-updated": (payload: any) => isObjectHasKeys(payload) },
  watch: {
    conceptDto: {
      handler(newValue) {
        this.$emit("concept-updated", newValue);
      },
      deep: true
    }
  },
  data() {
    return {
      conceptDto: JSON.parse(JSON.stringify(this.updatedConcept)),
      schemeOptions: [] as any[],
      statusOptions: [] as any[],
      loading: false
    };
  },
  async mounted() {
    this.schemeOptions = await EntityService.getNamespaces();

    this.statusOptions = await EntityService.getEntityChildren(IM.STATUS);
  }
});
</script>

<style scoped>
.save-button {
  margin-left: 0.5em;
}

.p-tabview {
  padding-top: 3px;
}

.p-card {
  box-shadow: unset;
  height: 100%;
}

.editor-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: auto;
  grid-template-areas:
    "iri name code"
    "description description description"
    "version status scheme"
    "imlang imlang imlang";
  column-gap: 7px;
  height: 100%;
}

.iri {
  grid-area: iri;
}

.name {
  grid-area: name;
}

.code {
  grid-area: code;
}

.description {
  grid-area: description;
}

.version {
  grid-area: version;
}

.status {
  grid-area: status;
}

.scheme {
  grid-area: scheme;
}

.imlang-container {
  grid-area: imlang;
}

.p-field {
  height: fit-content;
}

.float-label-container {
  margin-top: 1.5rem;
}
</style>
