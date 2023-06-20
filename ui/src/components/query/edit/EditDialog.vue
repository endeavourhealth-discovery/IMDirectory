<template>
  <div class="editor-dialog-container">
    <Splitter class="query-splitter">
      <SplitterPanel :size="30" :minSize="10" style="overflow: auto" class="splitter-left">
        <QueryNavTree
          :base-entity-match="baseEntityMatch"
          :editMatches="editMatches"
          :updated-key="updatedKey"
          @add-property="addProperty"
          @remove-property="removeProperty"
        />
      </SplitterPanel>
      <SplitterPanel :size="70" :minSize="10" style="overflow: auto" class="splitter-right">
        <div v-for="(editMatch, index) in editMatches" class="edit-component" :key="editMatch.key">
          <Divider v-if="index" align="center">
            <div :class="editBoolMatch" @click="toggleBoolMatch">{{ editBoolMatch }}</div>
          </Divider>
          <EditMatch :base-entity-match="baseEntityMatch" :edit-match="editMatch" @remove-property="removeProperty" />
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
interface Props {
  baseEntityMatch: Match;
  match: Match;
}
const props = defineProps<Props>();
const editMatches: Ref<Match[]> = ref([]);
const editBoolMatch: Ref<Bool> = ref("and");
const updatedKey: Ref<string> = ref("");
const emit = defineEmits({ onClose: () => true });

onMounted(() => {
  if (isObjectHasKeys(props.match)) {
    if (isArrayHasLength(props.match.match)) {
      editMatches.value = [...props.match.match!];
      if (props.match.boolMatch === "or") editBoolMatch.value = "or";
    } else editMatches.value = [{ ...props.match }];
  }
});

function addProperty(treeNode: any) {
  const newMatch = buildMatchFromProperty(treeNode as any);
  editMatches.value.push(newMatch);
}

function removeProperty(treeNode: any, updatedFlag?: boolean) {
  let removeIndex = editMatches.value.findIndex(editMatch => (editMatch as any).key === treeNode.key);
  if (removeIndex !== -1) {
    editMatches.value.splice(removeIndex, 1);
  } else {
    removeIndex = editMatches.value.findIndex(match => match.match?.some(nestedMatch => (nestedMatch as any).key === treeNode.key));
    if (removeIndex !== -1) editMatches.value[removeIndex].match!.splice(removeIndex, 1);
  }

  if (updatedFlag) updatedKey.value = treeNode.key;
}

function toggleBoolMatch() {
  if (editBoolMatch.value === "and") editBoolMatch.value = "or";
  else if (editBoolMatch.value === "or") editBoolMatch.value = "and";
}

function save() {
  if (isObjectHasKeys(props.match)) {
    for (const key of Object.keys(props.match!)) {
      delete (props.match as any)[key];
    }
  }
  if (editMatches.value.length === 1) {
    const editMatch = editMatches.value[0];
    describeMatch([editMatch], "match");
    for (const key of Object.keys(editMatch)) {
      (props.match as any)[key] = (editMatch as any)[key];
    }
  } else if (editMatches.value.length > 1) {
    props.match.match = [];
    props.match.boolMatch = editBoolMatch.value;
    for (const editMatch of editMatches.value) {
      props.match.match.push(editMatch);
    }
    describeMatch([props.match], "match");
  }

  emit("onClose");
}

function discard() {
  editMatches.value = [];
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

.edit-component {
  padding: 1rem;
}
</style>
