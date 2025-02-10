<template>
  <div v-if="data && isArrayObjectWithName" :id="id" :style="{ width: size }">
    <div class="head-container">
      <strong class="label" data-testid="label">{{ label }}: </strong>
      <span v-if="totalCount" data-testid="total-count">&nbsp;({{ totalCount }})</span>
      <span v-else data-testid="count">&nbsp;({{ listboxData.length }})</span>
      <Button
        :icon="buttonExpanded ? 'pi pi-minus' : 'pi pi-plus'"
        class="p-button-rounded p-button-text p-button-primary p-button-sm expand-button"
        :id="'expand-button-' + id"
        @click="setButtonExpanded"
        v-styleclass="{
          selector: '#listbox-' + id,
          enterClass: 'hidden',
          enterActiveClass: 'my-fadein',
          leaveActiveClass: 'my-fadeout',
          leaveToClass: 'hidden'
        }"
        data-testid="expand-button"
      />
    </div>
    <Listbox
      :options="listboxData"
      listStyle="max-height: 40rem;overflow: auto;"
      v-model="selected"
      @change="directService.select(selected['@id'])"
      emptySelectionMessage="None"
      emptyMessage="None"
      selectionMessage="Selected"
      :id="'listbox-' + id"
      class="array-listbox hidden"
    >
      <template #option="{ option }: any">
        <div class="data-name" data-testid="row-text">
          {{ option?.name || option?.["@id"] }}
        </div>
      </template>
      <template #footer>
        <Button
          v-if="loadMoreButtonVisible"
          :loading="loading"
          label="Load more..."
          class="p-button-text p-button-plain"
          @click="loadMore"
          data-testid="load-more-button"
        />
      </template>
    </Listbox>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, Ref, watch } from "vue";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { cloneDeep } from "lodash-es";
import { DirectService } from "@/services";
import { getLogger } from "@/logger/LogConfig";
import { useDirectoryStore } from "@/stores/directoryStore";
import { useSharedStore } from "@/stores/sharedStore";

const log = getLogger("components.shared.generics.ArrayObjectNameListboxWithLabelAndLoadMore");

interface Props {
  label: string;
  data: { children: any[]; totalCount: any; loadMore: Function };
  size?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "100%",
  id: "array-object-name-listbox-with-label-and-load-more"
});

const directoryStore = useDirectoryStore();
const sharedStore = useSharedStore();
const directService = new DirectService();
const arrayObjectNameListboxWithLabelStartExpanded = computed(() => directoryStore.arrayObjectNameListboxWithLabelStartExpanded);
const conceptIri = computed(() => directoryStore.conceptIri);

const selected: Ref = ref({});
const buttonExpanded = ref(false);
const loadMoreButtonVisible = ref(false);
const pageSize = ref(10);
const nextPage = ref(2);
const totalCount = ref(0);
const listboxData: Ref<any[]> = ref([]);
const loading = ref(false);

const isArrayObjectWithName = computed(() => {
  if (!props.data) return false;
  if (!isArrayHasLength(props.data.children)) return false;
  if (props.data.children.every(item => isObjectHasKeys(item, ["name"]))) {
    return true;
  } else {
    log.warn(
      "Data error. Data is not array, array does not contain Object or Object has no property 'name' for use within component ArrayObjectNameListboxWithLabelAndLoadMore.vue"
    );
    return false;
  }
});

watch(
  () => cloneDeep(props.data),
  () => init()
);

onMounted(() => init());

function init() {
  expandAtStartup();
  totalCount.value = props.data.totalCount;
  if (totalCount.value >= pageSize.value) {
    loadMoreButtonVisible.value = true;
  }
  listboxData.value = props.data.children;
}

function setButtonExpanded() {
  buttonExpanded.value = !buttonExpanded.value;
}

function expandAtStartup() {
  if (arrayObjectNameListboxWithLabelStartExpanded.value.includes(props.label)) {
    const button = document.getElementById(`expand-button-${props.id}`) as HTMLElement;
    if (button) button.click();
  }
}

async function loadMore() {
  loading.value = true;
  const result = await props.data.loadMore(listboxData.value, totalCount.value, nextPage.value, pageSize.value, loadMoreButtonVisible.value, conceptIri.value);
  listboxData.value = result.children;
  nextPage.value = result.nextPage;
  pageSize.value = result.pageSize;
  loadMoreButtonVisible.value = result.loadButton;
  loading.value = false;
}
</script>

<style lang="scss" scoped>
.head-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.array-listbox {
  margin: 0.5rem 0 0 0;
}

@keyframes my-fadein {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes my-fadeout {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.my-fadein {
  animation: my-fadein 150ms linear;
}

.my-fadeout {
  animation: my-fadeout 150ms linear;
}
</style>
