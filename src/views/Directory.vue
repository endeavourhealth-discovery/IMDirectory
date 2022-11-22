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

<script setup lang="ts">
import { computed, defineComponent, onMounted, ref, Ref, watch } from "vue";
import { mapState, useStore } from "vuex";
import DirectoryTable from "@/components/directory/DirectoryTable.vue";
import ParentHeader from "@/components/directory/ParentHeader.vue";
import ParentHierarchy from "@/components/directory/ParentHierarchy.vue";
import { EntityService } from "@/im_library/services";
import { IM } from "@/im_library/vocabulary";

const emit = defineEmits({
  openBar: () => true
});

const store = useStore();
const conceptIri = computed(() => store.state.conceptIri);

watch(
  () => conceptIri.value,
  async () => await init()
);

const concept: Ref<any> = ref({});
const loading = ref(true);

onMounted(async () => await init());

async function init() {
  loading.value = true;
  concept.value = await EntityService.getEntityByPredicateExclusions(conceptIri.value, [IM.HAS_MEMBER]);
  loading.value = false;
}

function openBar() {
  emit("openBar");
}
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
