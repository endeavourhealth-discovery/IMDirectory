<template>
  <div class="flex justify-between items-center mb-2">
    <div class="flex gap-2">
      <div class="as-editor font-bold">Return as</div>
      <div class="property-display font-bold">Property / Logic</div>
    </div>
    <div class="flex gap-2">
      <Button icon="fa-solid fa-check" label="Add truth value" size="small" text @click="addTruthValue" />
      <Button icon="fa-solid fa-plus" label="Add column" size="small" @click="addColumn" />
    </div>
  </div>
  <template v-for="(item, index) in returns" :key="index">
    <div class="return-item mb-4 p-2 border rounded">
      <div class="return-column-editor items-center gap-2 mb-2">
        <div class="as-editor">
          <InputText v-model="item.as" class="w-full" placeholder="Column name" />
        </div>
        <div class="property-display flex items-center gap-2">
          <template v-if="!item.case">
            <span v-if="item.nodeRef" class="font-medium">{{ getPathName(match, item.nodeRef) }}</span>
            <IMViewerLink v-else-if="item.iri" :iri="item.iri" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
            <FunctionClauseDisplay v-else-if="item.function" :functionClause="item.function" />
            <span v-else class="text-gray-400 italic">No property selected</span>
            <Button
              :label="item.iri || item.nodeRef ? '' : 'Select property'"
              icon="fa-solid fa-tree"
              size="small"
              text
              @click="emit('showPropertyTree', item)"
            />
          </template>
          <template v-else>
            <span class="font-medium">Case statement</span>
          </template>
        </div>
        <div class="flex gap-2 ml-auto">
          <Button v-if="!item.case" icon="fa-solid fa-code-branch" label="Add case" size="small" text @click="addCase(item)" />
          <Button icon="fa-solid fa-trash" severity="danger" size="small" text @click="removeReturn(index)" />
        </div>
      </div>
      <template v-if="item.return">
        <span>{</span>
        <ReturnEditor v-model:returns="item.return" :match="match" />
        <span>}</span>
      </template>
      <template v-if="item.case">
        <div v-for="(when, whenIndex) in item.case.when" :key="whenIndex" class="pl-4 pt-2">
          <div class="flex flex-col gap-2 border-l-2 pl-2">
            <div class="flex items-center gap-2">
              <span>if</span>
              <span v-if="when.exists" class="pl-2">exists</span>
              <Button v-if="!when.where" icon="fa-solid fa-tree" label="Select property" size="small" text @click="emit('showPropertyTreeForWhen', when)" />
              <Button
                v-if="(item.iri || when.where?.iri) && !when.where"
                label="Test value"
                size="small"
                text
                @click="
                  when.where = when.where || { iri: item.iri, nodeRef: item.nodeRef };
                  delete when.exists;
                "
              />
              <Button
                v-if="when.where"
                label="Test exists"
                size="small"
                text
                @click="
                  when.exists = true;
                  delete when.where;
                "
              />
              <span class="pl-2">then</span>
              <InputText v-model="when.then" class="ml-2" placeholder="Value" style="width: 10rem" />
              <Button icon="fa-solid fa-trash" severity="danger" size="small" text @click="removeWhen(item, whenIndex)" />
            </div>
            <div v-if="when.where" class="pl-4">
              <BooleanWhereEditor
                v-model:where="when.where"
                :baseType="{ iri: match.typeOf?.iri || '' }"
                :index="whenIndex"
                :match="match"
                :parentIndex="0"
                :rootBool="true"
                @addProperty="emit('addProperty', when.where)"
              />
            </div>
          </div>
        </div>
        <div class="pl-4 pt-2 flex items-center gap-2">
          <Button icon="fa-solid fa-plus" label="Add when" size="small" text @click="addWhen(item)" />
        </div>
        <div class="pl-4 pt-2">
          <span class="pl-2">else</span>
          <InputText v-model="item.case.else" class="ml-2" placeholder="Else value" style="width: 10rem" />
        </div>
      </template>
    </div>
  </template>
</template>

<script lang="ts" setup>
import type { Match, Return, Where } from "@endeavour/vue-library/interfaces";

import Button from "primevue/button";
import InputText from "primevue/inputtext";

import BooleanWhereEditor from "@/components/imquery/BooleanWhereEditor.vue";
import FunctionClauseDisplay from "@/components/query/viewer/FunctionClauseDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import { getPathName } from "@/helpers/buildQuery";

interface Props {
  match: Match;
}
const props = defineProps<Props>();
const returns = defineModel<Return[]>("returns", { default: [] });
const emit = defineEmits<{
  navigateTo: [payload: string];
  addProperty: [where: Where];
  showPropertyTree: [item: Return];
  showPropertyTreeForWhen: [when: any];
}>();

function addColumn() {
  returns.value.push({ as: "new_column" } as Return);
}

function addTruthValue() {
  returns.value.push({
    as: "matched",
    case: {
      when: [{ exists: true, then: "1" }],
      else: "0"
    }
  } as Return);
}

function removeReturn(index: number) {
  returns.value.splice(index, 1);
}

function addCase(item: Return) {
  const when = { then: "" } as any;
  if (item.iri) {
    when.where = { iri: item.iri, nodeRef: item.nodeRef };
  } else {
    when.exists = true;
  }
  item.case = {
    when: [when],
    else: ""
  };
}

function addWhen(item: Return) {
  if (item.case) {
    const when = { then: "" } as any;
    if (item.iri) {
      when.where = { iri: item.iri, nodeRef: item.nodeRef };
    } else {
      when.exists = true;
    }
    if (!item.case.when) item.case.when = [];
    item.case.when.push(when);
  }
}

function removeWhen(item: Return, index: number) {
  if (item.case && item.case.when) {
    item.case.when.splice(index, 1);
    if (item.case.when.length === 0) {
      delete item.case;
    }
  }
}
</script>

<style scoped>
.returns-editor {
  max-height: 90%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}
.return-column-editor {
  display: flex;
  width: 100%;
  flex-direction: row;
}
.property-display {
  flex: 1;
}
.as-editor {
  width: 15rem;
}
</style>
