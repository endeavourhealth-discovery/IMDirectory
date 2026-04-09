<template>
  <div class="match-content-display">
    <div>
      <span>Description</span>
      <InputText v-model="match.description" type="text" class="match-description" />
    </div>
    <div v-if="!then">
      <div>
        <span class="field">With the following conditions:</span>
      </div>
      <div>Select features and properties from left</div>
      <div v-if="match.where">
        <BooleanWhereEditor
          :match="match"
          :base-type="baseType"
          v-model:parent="match"
          v-model:where="match.where"
          :from="from"
          :index="0"
          :parentIndex="0"
          :rootBool="true"
          @updateProperty="onUpdate"
          @deleteWhere="onDeleteWhere"
        />
      </div>
      <div v-if="orderables && orderables.length > 0 && isDefined()">
        <span class="keep-as-reference">Select</span>
        <Select
          class="test-selector"
          :modelValue="orderable"
          :options="orderables"
          scroll-height="50rem"
          option-label="label"
          option-value="value"
          data-testid="order-selector"
          @update:modelValue="updateOrderable"
        >
          <template #value="slotProps">
            <div class="test-selector">
              <div>{{ orderable.label }}</div>
            </div>
          </template>
          <template #dropdownicon>
            <i class="pi pi-chevron-down"></i>
          </template>
          <template #option="slotProps">
            <div class="flex items-center" v-tooltip="slotProps.option.tooltip" style="min-height: 1rem">
              <div>{{ slotProps.option.label }}</div>
            </div>
          </template>
        </Select>
      </div>
      <div v-if="match.then">
        <div>
          <span class="field">Then further test the above</span>
          <Button data-testid="edit-test-button" class="add-button" label="Edit these tests" @click="addTest" />
        </div>
        <WhereContentDisplay :where="match.then" :depth="depth" :parentOperator="whereOperator" :key="0" :index="0" :root="false" />
      </div>
    </div>
    <div v-else-if="match.then && match.where">
      <div>
        <span class="field">With the following conditions:</span>
        <Button data-testid="edit-test-button" class="add-button" label="Edit main criteria" @click="editMain" />
      </div>
      <WhereContentDisplay :where="match.where" :depth="depth" :parentOperator="whereOperator" :key="0" :index="0" :root="false" />
      <div>Then further test the above values after ordering. Add from left</div>
      <BooleanWhereEditor
        :match="match"
        :base-type="baseType"
        v-model:parent="match"
        v-model:where="match.then"
        :from="from"
        :index="0"
        :parentIndex="0"
        :rootBool="true"
        @updateProperty="onUpdate"
        @deleteWhere="onDeleteWhere"
      />
    </div>
    <div>
      <span class="keep-as-reference">Keep as reference</span>
      <InputText v-model="match.node" type="text" />
    </div>
    <div v-if="orderables && orderables.length > 0 && match.where">
      <span v-if="match.orderBy">
        <Button v-if="!match.then" data-testid="add-test-button" class="add-button" label="Add further test on the results" @click="addTest" />
      </span>
      <Button data-testid="add-test-button" class="add-button" label="Add related feature" @click="addLinked" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import { Match, Node, TTIriRef, NodeShape, PropertyShape, Return, Where } from "@/interfaces/AutoGen";
import { computed, inject, onMounted, Ref, ref, watch } from "vue";
import { useCopyToClipboard } from "@/composables/useCopyToClipboard";
import { EntityService } from "@/services";
import { IM } from "@/vocabulary";
import { getOrderables, createNodeVariable, getBooleanOperator } from "@/helpers/buildQuery";
import BooleanWhereEditor from "@/components/imquery/BooleanWhereEditor.vue";
import { cloneDeep, isEqual } from "lodash-es";
import { getOrderOptions, getOrderable } from "@/helpers/QueryEditorMethods";
import Button from "primevue/button";
import WhereContentDisplay from "@/components/imquery/WhereContentDisplay.vue";
interface Props {
  baseType: Node;
  from?: Match;
  depth: number;
  index: number;
  isStep?: boolean;
  nodeShape: NodeShape;
}

const props = defineProps<Props>();
const match = defineModel<Match>("match", { default: {} });
const then = defineModel<Where | undefined>("then");
const showMatchEditor = defineModel<boolean>("showMatchEditor", { default: false });
const emit = defineEmits<{
  (event: "saveChanges", match: Match): void;
  (event: "cancel"): void;
  (event: "deleteMatch"): void;
  (event: "addLinked"): void;
  (event: "addTest"): void;
  (event: "updateMatch"): void;
  (event: "editMain"): void;
}>();
const expandedKeys = ref<Record<string, boolean>>({});
const { onCopy, onCopyError } = useCopyToClipboard(ref(JSON.stringify(match.value)));
const showPropertySelector = ref(false);
const loading = ref(true);
const orderables: Ref<any[] | undefined> = ref();
const orderable: Ref<any> = ref({ label: "Any/latest/earliest", value: "addTest" });
const edited = ref(false);
const initialized = ref(false);
const showLinkedEditor = ref(false);
const keepAs = inject("keepAs") as Ref<Match[]>;
const whereOperator = computed(() => {
  return getBooleanOperator("Where", then.value ? match.value.then : match.value.where);
});

onMounted(async () => {
  await init();
});
watch(match.value, (newVal, oldVal) => {
  if (newVal === oldVal) return;
  updateKeepAs(oldVal, newVal);
});
function onUpdate() {
  edited.value = true;
  setOrderables();
  emit("updateMatch");
}
function onDeleteWhere() {
  delete match.value.where;
  emit("deleteMatch");
}

function updateKeepAs(oldVal: Match, newVal: Match) {
  if (oldVal.node != newVal.node) {
    keepAs.value = keepAs.value.filter(m => m !== match);
    if (newVal.node) keepAs.value.push(newVal);
  }
}

async function init() {
  loading.value = true;
  match.value = cloneDeep(match.value);
  expandedKeys.value["0"] = true;
  await setOrderables();
  loading.value = false;
  initialized.value = true;
}

function isDefined(): boolean {
  return !!(match.value.is || match.value.where);
}

function editMain() {
  emit("editMain");
}

async function setOrderables() {
  if (match.value.typeOf) {
    orderables.value = getOrderOptions(getOrderables(props.nodeShape));
    if (match.value.orderBy) {
      orderable.value = getOrderable(match.value, orderables.value);
    }
  }
}

function updateOrderable(value: any) {
  if (!value.iri) {
    delete match.value.orderBy;
    orderable.value = undefined;
  } else {
    orderable.value = value;
    match.value.orderBy = { property: [{ iri: value.iri, direction: value.direction }] };
    if (!match.value.node) {
      match.value.node = createNodeVariable(match.value, props.index);
    }
  }
}

function addTest() {
  showMatchEditor.value = false;
  if (!match.value.then) {
    match.value.then = {} as Where;
  }
  emit("addTest");
}

function addLinked() {
  showMatchEditor.value = false;
  emit("addLinked");
}

async function onMatchTypeSelected() {
  showPropertySelector.value = false;
}

async function getFunctionTemplates() {
  const iri = match.value?.typeOf?.iri;
  if (iri) {
    const entity = await EntityService.getPartialEntity(iri, [IM.FUNCTION_TEMPLATE]);
    if (isArrayHasLength(entity[IM.FUNCTION_TEMPLATE])) {
      const iris = entity[IM.FUNCTION_TEMPLATE].map((functionTemplate: TTIriRef) => functionTemplate.iri);
      return await EntityService.getPartialEntities(iris, []);
    }
  }
}

function onAddFunctionProperty(args: { property: string; value: any }) {
  if (args.property === "orderBy") {
    match.value!.orderBy = args.value;
  }
}
</script>

<style scoped>
.match-container {
  box-sizing: border-box;
  padding: 0.5rem;
  border: #488bc230 1px solid;
  border-radius: 5px;
  background-color: #fafafa;
  margin: 0.5rem;
  font-size: 1rem;

  /* Important for scrolling */
  height: 100%; /* fill parent height */
  overflow-y: auto; /* enable vertical scrolling */
  min-height: 0; /* allows flex parents to shrink properly */
}
.add-button,
.delete-button {
  color: #444444; /* text */
  background-color: #f0f0f0; /* greyish default */
  border: 1px solid #ccc;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.add-button:hover,
.add-button:focus {
  background-color: #a5d6a7;
}
.delete-button:hover,
.delete-button:focus {
  background-color: red;
}
.keep-as-reference {
  padding-right: 1rem;
}
.match-description {
  width: 70rem;
}
.name-display {
  width: 100%;
}
.description-container {
  display: flex;
  flex-flow: column;
}
.where-container {
  display: flex;
  flex-flow: column;
  gap: 1rem;
}

.edit-match-dialog {
  background-color: var(--p-surface-section);
  min-height: 90vh;
  min-width: 90vh;
}

.test-dropdown {
  color: white;
}
.field {
  padding-right: 1rem;
}
</style>
