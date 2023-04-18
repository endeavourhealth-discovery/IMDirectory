<template>
  <Button :label="include ? 'Include' : 'Exclude'" :severity="include ? 'info' : 'danger'" text @click="include = !include" />
  <div class="create-clause">
    <BaseClause
      :baseEntityIri="baseEntityIri"
      :clauseType="baseClause.clauseType"
      :typeValue="baseClause.typeValue"
      :entailmentOptions="baseClause.entailmentOptions"
    />
    <WhereClause v-if="baseClause.clauseType.name === 'Property' && baseClause.typeValue" :property="baseClause.typeValue" :entailment-options="[]" />
  </div>
  <SimpleJsonEditor v-if="jsonMode" :json-object="{ data: match }" />
  <div class="footer-actions">
    <Button class="action-button" severity="secondary" label="Cancel" @click="emit('onCancel')"></Button>
    <Button class="action-button" label="Save" @click="onSave"></Button>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType, Ref, onMounted } from "vue";
import BaseClause from "./clause/BaseClause.vue";
import WhereClause from "./clause/WhereClause.vue";
import { Match } from "@im-library/interfaces/AutoGen";
import SimpleJsonEditor from "./editTextQuery/SimpleJsonEditor.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { ConceptSummary } from "@im-library/interfaces";
import { getNameFromRef, resolveIri } from "@im-library/helpers/TTTransform";

const emit = defineEmits({ onCancel: () => true, onSave: (payload: any) => payload });

const props = defineProps({
  baseEntityIri: { type: String, required: true },
  match: { type: Object as PropType<Match>, required: true }
});

const jsonMode = ref(true);
const include = ref(true);
const baseClause: Ref<any> = ref({
  clauseType: {} as { name: string; prop: string },
  typeValue: {} as ConceptSummary,
  entailmentOptions: [] as string[]
});
const whereClause: Ref<any> = ref({});

onMounted(() => {
  setSelectedType();
  setSelectedTypeValue();
  setAncestorDescendants();
  if (isObjectHasKeys(props.match, ["exclude"])) include.value = !props.match.exclude;
});

function setSelectedType() {
  if (isObjectHasKeys(props.match, ["@type"])) baseClause.value.clauseType = { name: "Type", prop: "@type" };
  else if (isObjectHasKeys(props.match, ["@set"])) baseClause.value.clauseType = { name: "Set", prop: "@set" };
  else if (isObjectHasKeys(props.match, ["where", "path"])) baseClause.value.clauseType = { name: "Property", prop: "@id" };
  else baseClause.value.clauseType = { name: "Entity", prop: "@id" };
}

function setSelectedTypeValue() {
  const iri = props.match["@type"] || props.match["@set"] || props.match["@id"] || props.match.where[0]["@id"];
  baseClause.value.typeValue = {
    iri: resolveIri(iri),
    name: props.match.name || getNameFromRef({ "@id": iri })
  } as ConceptSummary;
}

function setAncestorDescendants() {
  if (isObjectHasKeys(props.match, ["ancestorsOf"])) baseClause.value.entailmentOptions.push("ancestorsOf");
  else if (isObjectHasKeys(props.match, ["descendantsOf"])) baseClause.value.entailmentOptions.push("descendantsOf");
  else if (isObjectHasKeys(props.match, ["descendantsOrSelfOf"])) baseClause.value.entailmentOptions.push("descendantsOrSelfOf");
}

function onSave() {
  emit("onSave", {});
}
</script>

<style scoped>
.create-clause {
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;
}

.json-action {
  display: flex;
  justify-content: center;
}

.footer-actions {
  display: flex;
  justify-content: end;
}

.action-button {
  margin-right: 0.1rem;
}
.json-button {
  margin: 0.1rem;
}
</style>
