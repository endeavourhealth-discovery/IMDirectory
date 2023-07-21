<template>
  <div id="address-file-download">
    <div id="search-results">
      <DataTable :value="searchResults" :loading="loading" selectionMode="single" scrollable scrollHeight="flex" showGridlines>
        <Column header="Date/Time" field="date-time">
          <template #body="{ data }">
            <span>{{ data.DT }}</span>
          </template>
        </Column>
        <Column header="Action" field="action">
          <template #body="{ data }">
            <span>{{ data.A }}</span>
          </template>
        </Column>
        <Column header="Filename" field="file">
          <template #body="{ data }">
            <span>{{ data.F }}</span>
          </template>
        </Column>
        <Column header="Download" field="download">
          <template #body="{ data }">
            <Button v-if="data.F" label="download" @click="download(data.F)"></Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import uprnService from "@/services/UprnService";
import { ref, computed, onMounted, Ref } from "vue";
import UprnService from "@/services/UprnService";

const username = import.meta.env.VITE_UPRN_USER;

const showResults = ref(false);
const searchResults: Ref<any[]> = ref([]);
const loading = ref(true);

async function getActivity() {
  loading.value = true;

  const result = await uprnService.activity(username);
  if (result) {
    console.log("Service Result:", JSON.stringify(result));

    showResults.value = true;
    searchResults.value = result;
  }

  loading.value = false;
}

onMounted(async () => {
  await getActivity();
});

async function download(fileUrl: string) {
  const result = await UprnService.download(fileUrl);
  if (result) {
    const url = window.URL.createObjectURL(result);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileUrl;
    link.click();

    toast.add({ severity: "warn", summary: "Good news", detail: "Downloded OK", life: 3000 });
  }
}

const toast = useToast();
</script>

<style scoped>
.buttons-container {
  padding-top: 1rem;
}
#search-results {
  flex: 1 1 auto;
  overflow: auto;
  width: 100%;
}
#address-file-download {
  flex: 1 1 auto;
  overflow: auto;
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  padding: 0.5rem;
}
</style>
