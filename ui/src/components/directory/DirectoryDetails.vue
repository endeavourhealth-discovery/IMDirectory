<template>
  <div class="loading-container flex flex-row justify-content-center align-items-center" v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else id="directory-table-container">
    <div class="header-container">
      <ParentHierarchy :entityIri="entity['@id']" />
      <ParentHeader v-if="selectedIri !== 'http://endhealth.info/im#Favourites'" :entity="entity" />
    </div>
    <div class="datatable-container">
      <Viewer :entityIri="entity['@id']" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, watch } from "vue";
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import Viewer from "@/components/directory/Viewer.vue";
import ParentHeader from "@/components/directory/ParentHeader.vue";
import ParentHierarchy from "@/components/directory/ParentHierarchy.vue";

interface Props {
  selectedIri: string;
}
const props = defineProps<Props>();

watch(
  () => props.selectedIri,
  async () => await init()
);

const entity: Ref<any> = ref({});
const loading = ref(true);

onMounted(async () => await init());

async function init() {
  loading.value = true;
  entity.value = await EntityService.getEntityByPredicateExclusions(props.selectedIri, [IM.HAS_MEMBER]);
  loading.value = false;
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
  max-width: 100%;
  display: flex;
  flex-flow: column nowrap;
}

.datatable-container {
  flex: 0 1 auto;
  overflow: auto;
  padding: 0.5rem;
}

.header-container {
  display: flex;
  flex-flow: column nowrap;
}
</style>
