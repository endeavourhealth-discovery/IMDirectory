<template>
  <div class="editor-dialog-container">
    <Splitter class="query-splitter">
      <SplitterPanel :size="30" :minSize="10" style="overflow: auto" class="splitter-left">
        <QueryNavTree
          :base-entity-match="baseEntityMatch"
          :editMatch="editMatch"
          :updated-key="updatedKey"
          @add-property="addProperty"
          @remove-property="removeProperty"
        />
      </SplitterPanel>
      <SplitterPanel :size="70" :minSize="10" style="overflow: auto" class="splitter-right">
        <div>
          <div @click="editMatch.exclude = !editMatch.exclude" :class="editMatch.exclude ? 'exclude' : 'include'">
            {{ editMatch.exclude ? "exclude" : "include" }}
          </div>
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
import { Match } from "@im-library/interfaces/AutoGen";
import { Ref, onMounted, ref } from "vue";
import QueryNavTree from "../QueryNavTree.vue";
import EditMatch from "./EditMatch.vue";
import { describeMatch, describeWhere } from "@im-library/helpers/QueryDescriptor";
import { buildMatchFromProperty, buildWhereFromProperty } from "@im-library/helpers/QueryBuilder";
import _ from "lodash";

const emit = defineEmits({ onClose: () => true });

interface Props {
  baseEntityMatch: Match;
  match: Match;
}
const props = defineProps<Props>();
const editMatch: Ref<Match> = ref({ where: [] } as Match);
const updatedKey: Ref<string> = ref("");

onMounted(() => {
  if (isObjectHasKeys(props.match)) {
    editMatch.value = _.cloneDeep(props.match);
  }
});

function addProperty(treeNode: any) {
  const newWhere = buildWhereFromProperty(treeNode as any);
  editMatch.value.where!.push(newWhere);
}

function removeProperty(treeNode: any, updatedFlag?: boolean) {
  let removeIndex = editMatch.value.where!.findIndex(editWhere => (editWhere as any).key === treeNode.key);
  if (removeIndex !== -1) {
    editMatch.value.where!.splice(removeIndex, 1);
  } else {
    removeIndex = editMatch.value.where!.findIndex(editWhere => JSON.stringify(editWhere) === treeNode.key);
    if (removeIndex !== -1) editMatch.value.where!.splice(removeIndex, 1);
  }

  if (updatedFlag) updatedKey.value = treeNode.key;
}

function save() {
  console.log(JSON.stringify(props.match));
  if (editMatch.value.variable) props.match.variable = editMatch.value.variable;
  if (editMatch.value.bool) props.match.bool = editMatch.value.bool;

  if (isArrayHasLength(editMatch.value.where)) {
    props.match.where = editMatch.value.where;
    describeMatch([props.match], "match");
    describeWhere(editMatch.value.where!, "where");
  }
  console.log(JSON.stringify(props.match));

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
