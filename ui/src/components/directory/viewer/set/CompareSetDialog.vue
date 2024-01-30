<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    header="Search"
    :style="{ width: '90vw', height: '90vh', minWidth: '90vw', minHeight: '90vh', backgroundColor: 'var(--surface-section)' }"
    class="search-dialog"
  >
    <div class="compare-set-dialog-content">
      <CompareSetSection v-model:selectedSet="selectedA" :setIri="setIriA" :header="'Exclusive to '" class="comparison-section" />
      <div class="comparison-section">
        <div class="section-header">Shared members</div>
        <Listbox v-model="selectedShared" :options="sharedMembers" optionLabel="name" emptyMessage="No shared members" />
      </div>
      <CompareSetSection v-model:selectedSet="selectedB" :header="'Exclusive to '" class="comparison-section" />
    </div>

    <template #footer class="compare-set-dialog-footer"> <Button label="OK" @click="visible = false" /> </template>
  </Dialog>
</template>
<script setup lang="ts">
import { Ref, ref, watch } from "vue";
import CompareSetSection from "./CompareSetSection.vue";
import { SearchResultSummary } from "@im-library/interfaces/AutoGen";
import { EntityService } from "@/services";
import { intersection } from "lodash";
interface Props {
  showDialog: boolean;
  setIriA: string;
}
const props = defineProps<Props>();

const visible = ref(false);
const selectedShared = ref();
const sharedMembers: Ref<any[]> = ref([]);
const selectedA: Ref<SearchResultSummary> = ref({} as SearchResultSummary);
const selectedB: Ref<SearchResultSummary> = ref({} as SearchResultSummary);

watch(
  () => props.showDialog,
  async newValue => {
    visible.value = newValue;
  }
);
watch(visible, newValue => {
  if (!newValue) {
    emit("update:showDialog", newValue);
  }
});
const emit = defineEmits({ "update:showDialog": payload => typeof payload === "boolean" });

watch(selectedA, async () => await getSharedMembers());
watch(selectedB, async () => await getSharedMembers());

async function getSharedMembers() {
  if (selectedA.value.iri && selectedB.value.iri) {
    const membersA = (await EntityService.getFullyExpandedSetMembers(selectedA.value.iri, false, false)).map(member => member["@id"]);
    const membersB = (await EntityService.getFullyExpandedSetMembers(selectedB.value.iri, false, false)).map(member => member["@id"]);
    const intersected = intersection(membersA, membersB);
    const namedIntersection = await EntityService.getNames(intersected);
    sharedMembers.value = namedIntersection;

    const diff = await EntityService.getSetComparison(selectedA.value.iri, selectedB.value.iri);
    console.log(diff);
  }
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

.p-listbox {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
<style>
.p-dialog-content {
  flex: 1 1 auto;
  display: flex;
}
</style>
