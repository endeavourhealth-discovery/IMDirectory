<template>
  <div v-if="show && data && isArrayObjectWithName" :id="id" :style="{ width: size }">
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
      @change="directService.select(selected['@id'], 'Folder')"
      emptyMessage="None"
      :id="'listbox-' + id"
      class="array-listbox hidden"
    >
      <template #option="slotProps">
        <div class="data-name" data-testid="row-text">
          {{ slotProps.option?.name || slotProps.option?.["@id"] }}
        </div>
      </template>
    </Listbox>
  </div>
</template>

<script setup lang="ts">
import { DirectService } from "@/im_library/services";
import { computed, onMounted, PropType, ref, Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { isArrayHasLength, isObjectHasKeys } from "../../../helpers/modules/DataTypeCheckers";
import LoggerService from "../../../services/modules/LoggerService";

const props = defineProps({
  label: { type: String, required: true },
  data: { type: Array as PropType<unknown[]>, required: false, default: [] },
  size: { type: String, default: "100%", required: false },
  id: { type: String, default: "array-object-name-listbox-with-label" },
  show: { type: Boolean, required: true }
});

const route = useRoute();
const router = useRouter();
const store = useStore();
const directService = new DirectService(store, router, route);
const arrayObjectNameListboxWithLabelStartExpanded = computed(() => store.state.arrayObjectNameListboxWithLabelStartExpanded);

const selected: Ref = ref({});
const buttonExpanded = ref(false);

const isArrayObjectWithName = computed(() => {
  if (!props.data) return false;
  if (!isArrayHasLength(props.data)) return false;
  if (props.data.every(item => isObjectHasKeys(item, ["name"]))) {
    return true;
  } else {
    LoggerService.warn(
      undefined,
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
