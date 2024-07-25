<template>
  <div id="address-file-download">
    <div id="search-results">
      <DataTable :value="searchResults" :loading="loading" selectionMode="single" scrollable scrollHeight="flex" showGridlines>
        <Column header="Date/Time" field="date-time">
          <template #body="{ data }: any">
            <span>{{ data.DT }}</span>
          </template>
        </Column>
        <Column header="Action" field="action">
          <template #body="{ data }: any">
            <span>{{ data.A }}</span>
          </template>
        </Column>
        <Column header="Filename" field="file">
          <template #body="{ data }: any">
            <span>{{ data.F }}</span>
          </template>
        </Column>
        <Column header="Download" field="download">
          <template #body="{ data }: any">
            <Button v-if="data.F" label="download" @click="download(data.F)"></Button>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { ref, computed, onMounted, Ref } from "vue";
import UprnService from "@/services/UprnService";
import { useUserStore } from "@/stores/userStore";

const toast = useToast();
const userStore = useUserStore();
const currentuser = computed(() => userStore.currentUser).value;

const showResults = ref(false);
const searchResults: Ref<any[]> = ref([]);
const loading = ref(true);

onMounted(async () => {
  await getActivity();
});

async function getActivity() {
  if (currentuser) {
    loading.value = true;

    const result = await UprnService.activity(currentuser.id);
    if (result) {
      showResults.value = true;
      searchResults.value = result;
    }

    loading.value = false;
  }
}

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
