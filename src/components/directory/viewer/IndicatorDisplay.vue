<template>
  <div id="query-display" class="flex flex-1 flex-col">
    <div v-if="loading" class="flex flex-row"><ProgressSpinner /></div>
    <div v-else-if="!isObjectHasKeys(indicator)">No indicator definition found.</div>
    <div v-else-if="indicator" class="rec-query-display">
      <span v-if="indicator.name" v-html="indicator.name"> </span>
      <div v-if="indicator.denominator">
        <span class="field">Denominator: </span>
        <IMViewerLink
          v-if="indicator.denominator.iri"
          :iri="indicator.denominator.iri"
          :label="indicator.denominator.name"
          @navigateTo="(iri: string) => emit('navigateTo', iri)"
        />
      </div>
      <div v-if="indicator.isSubIndicatorOf">
        <div v-for="subIndicator of indicator.isSubIndicatorOf">
          <span class="field">is sub-indicator of: </span>
          <IMViewerLink v-if="subIndicator.iri" :iri="subIndicator.iri" :label="subIndicator.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
        </div>
      </div>
      <div v-if="indicator.numerator">
        <span class="field">Numerator: </span>
        <IMViewerLink
          v-if="indicator.numerator.iri"
          :iri="indicator.numerator.iri"
          :label="indicator.numerator.name"
          @navigateTo="(iri: string) => emit('navigateTo', iri)"
        />
      </div>
      <div v-if="indicator.dataset">
        <span class="field"> Results dataset: </span>
        <IMViewerLink
          v-if="indicator.dataset.iri"
          :iri="indicator.dataset.iri"
          :label="indicator.dataset.name"
          @navigateTo="(iri: string) => emit('navigateTo', iri)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "vue-library/helpers";
import { QueryService } from "@/services";
import { Indicator } from "vue-library/interfaces";
import { computed, onMounted, provide, ref, Ref, watch } from "vue";
import { useUserStore } from "vue-library/stores";
import { useConfirm } from "primevue/useconfirm";
import { useRouter } from "vue-router";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";

interface Props {
  entityIri?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();
const userStore = useUserStore();
const confirm = useConfirm();
const router = useRouter();

const isLoggedIn = computed(() => userStore.isLoggedIn);
const indicator: Ref<Indicator | undefined> = ref();
const sql: Ref<string> = ref("");
const loading = ref(true);

watch(
  () => props.entityIri,
  async () => {
    await init();
  }
);

onMounted(async () => {
  await init();
});

async function init() {
  loading.value = true;
  if (props.entityIri) indicator.value = await QueryService.getDisplayFromIndicatorIri(props.entityIri);
  loading.value = false;
}
</script>

<style scoped>
.confirm-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 80%;
}
.query-display-container {
  width: 100%;
  height: 100%;
}

.query-display-content {
  overflow: auto;
}

#query-display {
  display: flex;
  flex: 1 1 auto;
}

.query-display-view {
  overflow: auto;
}

.field {
  padding-right: 1rem;
}

.tree-node-wrapper {
  position: relative;
  padding-left: 0rem;
}

.tree-node-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  width: 0.1rem;
  height: 100%;
  border-left: 0.1rem dotted #999;
}

.rec-query-display {
  padding: 1rem;
}

.button-bar {
  flex: 0 1 auto;
  padding: 1rem 1rem 1rem 0;
  gap: 0.5rem;
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
}
</style>
