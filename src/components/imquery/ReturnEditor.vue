<template>
  <template v-if="isArrayHasLength(match.return)">
    <div class="returns-editor">
      <div class="return-column-editor">
        <div class="property-display" style="font-weight: bold">Property</div>
        <div class="as-editor">Column name</div>
      </div>
    </div>
    <template v-for="(item, index) in match.return" :key="index">
      <div class="returns-editor">
        <div class="return-column-editor">
          <div class="property-display">
            <span>{{ getPathName(match, item.nodeRef) }}</span>
            <FunctionClauseDisplay v-if="item.function" :functionClause="item.function" />
            <IMViewerLink v-else-if="item.iri" :iri="item.iri" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)" />
          </div>
          <div class="as-editor">
            <InputText v-model="item.as" />
          </div>
        </div>
        <template v-if="item.return">
          <span>{</span>
          <ReturnEditor v-model:returns="item.return" :match="match" />
          <span>}</span>
        </template>
        <template v-if="item.case">
          <div v-for="(when, whenIndex) in item.case.when" :key="whenIndex">
            <span>if</span>
            <RecursiveWhereDisplay
              v-if="when.where"
              :where="when.where"
              :depth="1"
              :index="0"
              :key="0"
              :operator="Bool.and"
              :expandedSet="false"
              :inline="true"
            />
            <span v-if="when.exists" class="pl-2">exists</span>
            <span class="pl-2">then</span>
            <span class="pl-2">{{ when.then }}</span>
          </div>
          <span v-if="item.case.else" class="pl-2">else {{ item.case.else }} </span>
        </template>
      </div>
    </template>
  </template>
</template>

<script setup lang="ts">
import type { Match, Return } from "vue-library/interfaces";
import { Bool } from "vue-library/enums";
import { isArrayHasLength } from "vue-library/helpers";
import RecursiveWhereDisplay from "@/components/query/viewer/RecursiveWhereDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";
import FunctionClauseDisplay from "@/components/query/viewer/FunctionClauseDisplay.vue";
import { getPathName } from "@/helpers/buildQuery";
import { onMounted, computed } from "vue";
interface Props {
  match: Match;
}
const props = defineProps<Props>();
const returns = defineModel<Return[]>("returns", { default: [] });
const emit = defineEmits<{
  navigateTo: [payload: string];
}>();
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
  width: 30rem;
}
.as-editor {
  width: 20rem;
}
</style>
