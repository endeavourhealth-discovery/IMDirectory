<template>
  <div v-if="show && hasData" id="axioms-container" :style="{ width: size }">
    <div class="head-container">
      <strong class="label" data-testid="label">{{ label }}</strong>
      <span v-if="getCount()" data-testid="count">&nbsp;({{ getCount() }})</span>
      <Button
        :icon="buttonExpanded ? 'pi pi-minus' : 'pi pi-plus'"
        class="p-button-rounded p-button-text p-button-primary p-button-sm expand-button"
        :id="'expand-button-' + label"
        @click="setButtonExpanded()"
        v-styleclass="{
          selector: '.tgl-' + label,
          enterClass: 'hidden',
          enterActiveClass: 'my-fadein',
          leaveActiveClass: 'my-fadeout',
          leaveToClass: 'hidden'
        }"
        data-testid="expand-button"
      />
    </div>
    <div v-html="definition" :class="'hidden text-definition tgl-' + label" data-testid="text-definition"></div>
    <div class="loading-container" v-if="loading">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { TTBundle } from "@im-library/interfaces";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { bundleToText } from "@im-library/helpers/Transforms";
import { isTTBundle } from "@im-library/helpers/TypeGuards";
import { TextDefinitionExcludePredicates, DefaultPredicateNames, XmlSchemaDatatypes } from "@im-library/config";
import { IM } from "@im-library/vocabulary";
import _ from "lodash";
import { useSharedStore } from "@/stores/sharedStore";
import { useDirectoryStore } from "@/stores/directoryStore";

const props = defineProps({
  label: { type: String, required: true },
  data: {
    type: Object as () => TTBundle,
    required: true
  },
  size: { type: String, default: "100%" },
  id: { type: String, default: "text-definition" },
  show: { type: Boolean, required: true }
});

const directoryStore = useDirectoryStore();
const sharedStore = useSharedStore();
const textDefinitionStartExpanded = computed(() => directoryStore.textDefinitionStartExpanded);
const conceptIri = computed(() => directoryStore.conceptIri);

const hasData = computed(() => isTTBundle(data.value) && isObjectHasKeys(data.value.entity));
watch(
  () => _.cloneDeep(props.data),
  () => (data.value = props.data)
);

const buttonExpanded = ref(false);
const count = ref(0);
const definition = ref("");
const loading = ref(false);
const data = ref({ ...props.data });

onMounted(() => init());

function init(): void {
  loading.value = true;
  getDefinition();
  loading.value = false;
  startExpanded();
}

function startExpanded() {
  if (!Array.isArray(textDefinitionStartExpanded.value)) throw new Error("TextDefinition missing vuex sharedStore property 'textDefinitionStartExpanded'");
  if (textDefinitionStartExpanded.value.includes(props.label)) {
    const button = document.getElementById(`expand-button-${props.label}`) as HTMLElement;
    if (button) button.click();
  }
}

function setButtonExpanded(): void {
  buttonExpanded.value = !buttonExpanded.value;
}

function getDefinition(): void {
  if (!hasData.value) return;
  for (const value of TextDefinitionExcludePredicates) {
    if (data.value.entity[value]) delete data.value.entity[value];
  }
  if (isObjectHasKeys(data.value.entity, [IM.DEFINITION, IM.HAS_MEMBER])) {
    delete data.value.entity[IM.HAS_MEMBER];
  }
  definition.value = bundleToText("/viewer", data.value, DefaultPredicateNames, 0, true, conceptIri.value, XmlSchemaDatatypes);
}

function getCount(): number {
  let count = 0;
  Object.keys(data.value.entity).forEach(key => {
    if (isArrayHasLength(data.value.entity[key])) {
      count += data.value.entity[key].length;
    } else {
      count++;
    }
  });
  return count;
}
</script>

<style scoped>
.loading-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.text-definition {
  width: 100%;
  border: 1px solid var(--surface-border);
  border-radius: 3px;
  padding: 0.5rem;
  margin: 0.5rem 0 0 0;
  overflow: auto;
  white-space: pre-wrap;
}

.head-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
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
