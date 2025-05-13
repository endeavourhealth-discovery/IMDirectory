<template>
  <div v-if="data && isArrayObjectWithName" :id="id" :style="{ width: size }">
    <div class="head-container">
      <strong class="label" data-testid="label">{{ label }}: </strong>
      <span data-testid="count">&nbsp;({{ data.length }})</span>
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
      :options="data"
      listStyle="max-height: 12rem;overflow: auto;"
      v-model="selected"
      @change="directService.select(selected.iri)"
      selectionMessage="Selected"
      emptySelectionMessage="None"
      emptyMessage="None"
      :id="'listbox-' + id"
      class="array-listbox hidden"
    >
      <template #option="{ option }: any">
        <div class="data-name" data-testid="row-text">
          {{ option?.name || option?.iri }}
        </div>
      </template>
    </Listbox>
  </div>
</template>

<script setup lang="ts">
import { DirectService } from "@/services";
import { computed, onMounted, ref, Ref } from "vue";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { getLogger } from "@/logger/LogConfig";
import { useDirectoryStore } from "@/stores/directoryStore";

const log = getLogger("components.shared.generics.ArrayObjectNameListboxWithLabel");
interface Props {
  label: string;
  data?: unknown[];
  size?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: "100%",
  data: [] as any,
  id: "array-object-name-listbox-with-label"
});

const directoryStore = useDirectoryStore();
const directService = new DirectService();
const arrayObjectNameListboxWithLabelStartExpanded = computed(() => directoryStore.arrayObjectNameListboxWithLabelStartExpanded);

const selected: Ref = ref({});
const buttonExpanded = ref(false);

const isArrayObjectWithName = computed(() => {
  if (!props.data) return false;
  if (!isArrayHasLength(props.data)) return false;
  if (props.data.every(item => isObjectHasKeys(item, ["name"]))) {
    return true;
  } else {
    log.warn(
      "Data error. Data is not array, array does not contain Object or Object has no property 'name' for use within component ArrayObjectNameListboxWithLabel.vue"
    );
    return false;
  }
});

onMounted(() => {
  expandAtStartup();
});

function setButtonExpanded() {
  buttonExpanded.value = !buttonExpanded.value;
}

function expandAtStartup() {
  if (arrayObjectNameListboxWithLabelStartExpanded.value.includes(props.label)) {
    const button = document.getElementById(`expand-button-${props.id}`) as HTMLElement;
    if (button) button.click();
  }
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
</style>
