<template>
  <div class="loading-container flex flex-row justify-content-center align-items-center" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else id="directory-table-container">
    <div class="header-container">
      <ParentHierarchy :conceptIri="concept['@id']" />
      <ParentHeader v-if="conceptIri !== 'http://endhealth.info/im#Favourites'" @openBar="openBar" :concept="concept" />
    </div>
    <div class="datatable-container">
      <DirectoryTable @openBar="openBar" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import DirectoryTable from "@/components/directory/DirectoryTable.vue";
import ParentHeader from "@/components/directory/ParentHeader.vue";
import ParentHierarchy from "@/components/directory/ParentHierarchy.vue";

export default defineComponent({
  name: "Directory",
  components: {
    DirectoryTable,
    ParentHeader,
    ParentHierarchy
  },
  emits: ["openBar"],
  computed: {
    ...mapState(["conceptIri"])
  },
  watch: {
    async conceptIri() {
      await this.init();
    }
  },

  data() {
    return {
      concept: {} as any,
      loading: true
    };
  },
  async mounted() {
    this.init();
  },
  methods: {
    async init() {
      this.loading = true;
      this.concept = await this.$entityService.getPartialEntity(this.conceptIri, []);
      this.loading = false;
    },

    openBar() {
      this.$emit("openBar");
    }
  }
});
</script>
<style scoped>
.loading-container {
  height: 100%;
  flex: 1 1 auto;
}

#directory-table-container {
  flex: 1 1 auto;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.datatable-container {
  flex: 0 2 auto;
  overflow: auto;
  padding: 0.5rem;
}

.header-container {
  display: flex;
  flex-flow: column nowrap;
}
</style>
