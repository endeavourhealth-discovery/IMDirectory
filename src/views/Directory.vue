<template>
  <div id="directory-table-container">
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
import EntityService from "@/services/EntityService";

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
      concept: {} as any
    };
  },
  async mounted() {
    this.init();
  },
  methods: {
    async init() {
      this.concept = await EntityService.getPartialEntity(this.conceptIri, []);
    },

    openBar() {
      this.$emit("openBar");
    }
  }
});
</script>
<style scoped>
#directory-table-container {
  height: 100%;
  width: 100%;
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
