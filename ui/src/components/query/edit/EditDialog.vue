<template>
  <div class="editor-dialog-container">
    <Splitter class="query-splitter">
      <SplitterPanel :size="30" :minSize="10" style="overflow: auto" class="splitter-left">
        <QueryNavTree :base-entity-iri="baseEntityIri" @add-property="addProperty" @remove-property="removeProperty" />
      </SplitterPanel>
      <SplitterPanel :size="70" :minSize="10" style="overflow: auto" class="splitter-right">
        <div v-for="(editMatch, index) in editMatches">
          <Divider v-if="index" align="center">
            <div :class="editBoolMatch" @click="toggleBoolMatch">{{ editBoolMatch }}</div>
          </Divider>
          <EditMatch :base-entity-iri="baseEntityIri" :edit-match="editMatch" />
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
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Bool, Match } from "@im-library/interfaces/AutoGen";
import { TreeNode } from "primevue/tree";
import { Ref, onMounted, ref } from "vue";
import QueryNavTree from "../QueryNavTree.vue";
import EditMatch from "./EditMatch.vue";
import { describeMatch } from "@im-library/helpers/QueryDescriptor";
import { buildMatchFromProperty } from "@im-library/helpers/QueryBuilder";
interface Props {
  baseEntityIri: string;
  match: Match;
}
const props = defineProps<Props>();
const editMatches: Ref<Match[]> = ref([]);
const editBoolMatch: Ref<Bool> = ref("and");

const emit = defineEmits({ onClose: () => true });

onMounted(() => {
  if (isObjectHasKeys(props.match)) editMatches.value = [{ ...props.match }];
});

function toggleBoolMatch() {
  if (editBoolMatch.value === "and") editBoolMatch.value = "or";
  else if (editBoolMatch.value === "or") editBoolMatch.value = "and";
}

function addProperty(treeNode: TreeNode) {
  const newMatch = buildMatchFromProperty(treeNode as any);
  editMatches.value.push(newMatch);
}

function removeProperty(treeNode: TreeNode) {
  const removeIndex = editMatches.value.findIndex(editMatch => (editMatch as any).key === treeNode.key);
  if (removeIndex != -1) editMatches.value.splice(removeIndex, 1);
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
  } else {
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
</style>
