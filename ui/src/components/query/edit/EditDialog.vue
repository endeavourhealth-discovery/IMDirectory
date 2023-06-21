<template>
  <div class="editor-dialog-container">
    <Splitter class="query-splitter">
      <SplitterPanel :size="30" :minSize="10" style="overflow: auto" class="splitter-left">
        <QueryNavTree
          :base-entity-match="baseEntityMatch"
          :editMatches="editMatch.match!"
          :updated-key="updatedKey"
          @add-property="addProperty"
          @remove-property="removeProperty"
        />
      </SplitterPanel>
      <SplitterPanel :size="70" :minSize="10" style="overflow: auto" class="splitter-right">
        <div v-for="(childMatch, index) in editMatch.match" class="edit-component">
          <Divider v-if="index" align="center">
            <div :class="editBoolMatch" @click="toggleBoolMatch">{{ editBoolMatch.toUpperCase() }}</div>
          </Divider>
          <div @click="childMatch.exclude = !childMatch.exclude" :class="childMatch.exclude ? 'exclude' : 'include'">
            {{ childMatch.exclude ? "exclude" : "include" }}
          </div>
          <EditMatch
            v-if="!isArrayHasLength(childMatch.match)"
            :base-entity-match="baseEntityMatch"
            :edit-match="childMatch"
            @remove-property="removeProperty"
          />
          <RecursiveQueryEditDisplay v-else :selected-matches="[]" :base-entity-match="baseEntityMatch" :index="index" :match="childMatch" />
        </div>
      </SplitterPanel>
    </Splitter>
    <div class="footer">
      <Button label="Discard" severity="secondary" @click="discard" text />
      <Button label="Save" @click="save" text />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Bool, Match } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";
import QueryNavTree from "../QueryNavTree.vue";
import EditMatch from "./EditMatch.vue";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import { buildMatchFromProperty } from "@im-library/helpers/QueryBuilder";
import RecursiveQueryEditDisplay from "./RecursiveQueryEditDisplay.vue";

const emit = defineEmits({ onClose: () => true });

interface Props {
  baseEntityMatch: Match;
  match: Match;
}
const props = defineProps<Props>();
const editMatch: Ref<Match> = ref({ match: [] } as Match);
const editBoolMatch: Ref<Bool> = ref("and");
const updatedKey: Ref<string> = ref("");

onMounted(() => {
  if (isObjectHasKeys(props.match)) {
    if (props.match.variable) editMatch.value.variable = props.match.variable;
    if (isArrayHasLength(props.match.match)) {
      editMatch.value.match = [...props.match.match!];
      if (props.match.boolMatch === "or") editBoolMatch.value = "or";
    } else editMatch.value.match = [{ ...props.match }];
  }
});

function addProperty(treeNode: any) {
  const newMatch = buildMatchFromProperty(treeNode as any);
  editMatch.value.match!.push(newMatch);
}

function removeProperty(treeNode: any, updatedFlag?: boolean) {
  let removeIndex = editMatch.value.match!.findIndex(editMatch => (editMatch as any).key === treeNode.key);
  if (removeIndex !== -1) {
    editMatch.value.match!.splice(removeIndex, 1);
  } else {
    removeIndex = editMatch.value.match!.findIndex(match => match.match?.some(nestedMatch => (nestedMatch as any).key === treeNode.key));
    if (removeIndex !== -1) editMatch.value.match![removeIndex].match!.splice(removeIndex, 1);
  }

  if (updatedFlag) updatedKey.value = treeNode.key;
}

function toggleBoolMatch() {
  if (editBoolMatch.value === "and") editBoolMatch.value = "or";
  else if (editBoolMatch.value === "or") editBoolMatch.value = "and";
}

function save() {
  if (isObjectHasKeys(props.match)) {
    for (const key of Object.keys(props.match)) {
      delete (props.match as any)[key];
    }
  }
  if (editMatch.value.variable) props.match.variable = editMatch.value.variable;
  if (editMatch.value.match!.length === 1) {
    const saveMatch = editMatch.value.match![0];
    describeMatch([saveMatch], "match");
    for (const key of Object.keys(saveMatch)) {
      (props.match as any)[key] = (saveMatch as any)[key];
    }
  } else if (editMatch.value.match!.length > 1) {
    props.match.match = [];
    props.match.boolMatch = editBoolMatch.value;
    for (const saveMatch of editMatch.value.match!) {
      props.match.match.push(saveMatch);
    }
    describeMatch([props.match], "match");
  }

  emit("onClose");
}

function discard() {
  editMatch.value.match = [];
  emit("onClose");
}
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: end;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.editor-dialog-container {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.query-splitter {
  display: flex;
  height: 70vh;
}

.splitter-right {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.splitter-left {
  height: 100%;
}

.and {
  color: orange;
  cursor: pointer;
}

.or {
  color: blue;
  cursor: pointer;
}

.include {
  color: green;
  cursor: pointer;
  margin-bottom: 1rem;
}

.exclude {
  color: red;
  cursor: pointer;
  margin-bottom: 1rem;
}

.edit-component {
  padding: 1rem;
}
</style>
