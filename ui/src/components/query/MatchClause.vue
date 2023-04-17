<template>
  <div class="create-clause">
    <BaseClause :baseEntityIri="baseEntityIri" :match="match" @on-match-update="onMatchUpdate($event)" />
    <WhereClause v-if="isObjectHasKeys(match, ['where'])" v-for="where of match.where" :where="where" />
    <SimpleJsonEditor v-if="jsonMode" :json-object="{ data: match }" />
  </div>

  <div class="footer-actions">
    <Button class="action-button" severity="secondary" label="Cancel" @click="emit('onCancel')"></Button>
    <Button class="action-button" label="Save" @click="onSave"></Button>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType, onMounted, Ref } from "vue";
import BaseClause from "./clause/BaseClause.vue";
import WhereClause from "./clause/WhereClause.vue";
import { Match } from "@im-library/interfaces/AutoGen";
import SimpleJsonEditor from "./editTextQuery/SimpleJsonEditor.vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

const emit = defineEmits({ onCancel: () => true, onSave: (payload: any) => payload });

const props = defineProps({
  baseEntityIri: { type: String, required: true },
  match: { type: Object as PropType<Match>, required: true }
});

const jsonMode = ref(true);
const editMatch: Ref<Match> = ref({} as Match);

function onMatchUpdate(event: Match) {
  console.log(event);
  editMatch.value = { ...event };
}

function onSave() {
  emit("onSave", editMatch.value);
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
