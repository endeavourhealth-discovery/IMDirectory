<template>
  <Dialog
    v-model:visible="modelShowDialog"
    modal
    maximizable
    header="Search"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh' }"
    class="search-dialog"
  >
    <div class="compare-set-dialog-content">
      <CompareSetSection
        v-model:selectedSet="selectedA"
        :members="membersA"
        :setIri="setIriA"
        header="Exclusive to "
        class="comparison-section"
        :loading="loading"
      />
      <CompareSetSection :members="sharedMembers" header="Shared members " class="comparison-section" :loading="loading" />
      <CompareSetSection
        v-model:selectedSet="selectedB"
        :members="membersB"
        :setIri="selectedB?.iri"
        header="Exclusive to "
        class="comparison-section"
        :loading="loading"
      />
    </div>

    <template #footer class="compare-set-dialog-footer"> <Button label="OK" @click="modelShowDialog = false" /> </template>
  </Dialog>
</template>
<script setup lang="ts">
import { Ref, ref, watch } from "vue";
import CompareSetSection from "./CompareSetSection.vue";
import { Concept, SearchResultSummary } from "@/interfaces/AutoGen";
import { SetService } from "@/services";
interface Props {
  setIriA: string;
}
const props = defineProps<Props>();

const modelShowDialog = defineModel<boolean>("showDialog", { required: true });

const sharedMembers: Ref<Concept[]> = ref([]);
const membersA: Ref<Concept[]> = ref([]);
const membersB: Ref<Concept[]> = ref([]);
const selectedA: Ref<SearchResultSummary | undefined> = ref();
const selectedB: Ref<SearchResultSummary | undefined> = ref();
const loading = ref(false);

watch(selectedA, async () => await getMembers());
watch(selectedB, async () => await getMembers());

async function getMembers() {
  loading.value = true;
  if (selectedA.value?.iri || selectedB.value?.iri) {
    const diffObject = await SetService.getSetComparison(selectedA.value?.iri, selectedB.value?.iri);
    membersA.value = diffObject.membersA;
    sharedMembers.value = diffObject.sharedMembers;
    membersB.value = diffObject.membersB;
  }
  loading.value = false;
}
</script>
<style scoped>
.compare-set-dialog-content {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-flow: row;
  justify-content: center;
}
.compare-set-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
}

.comparison-section {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
}
</style>
<style>
.p-dialog-content {
  flex: 1 1 auto;
  display: flex;
}
</style>
