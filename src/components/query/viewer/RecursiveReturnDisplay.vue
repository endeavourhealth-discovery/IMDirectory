<template>
  <span v-if="isArrayHasLength(select.property)" class="pl-8">
    <div v-for="(item, index) in select.property" class="pl-12">
       <IMViewerLink v-if="item['@id']"
                     :iri="item['@id']" :label="item.name" @navigateTo="(iri: string) => emit('navigateTo', iri)"
       />

      <span v-if="item.return">
        <span>{</span>
          <RecursiveReturnDisplay :select="item.return" />
          <span>}</span>
      </span>
      <span v-if="item.case">
        <span v-for="(when) in item.case.when">
          <span>if</span>
          <RecursiveWhereDisplay v-if="when.where"
           :where="when.where"
           :depth="1"
           :index="0"
           :key="0"
           :operator="when.where.boolWhere"
           :expandedSet="false"
          />
          <span v-if="when.exists" class="pl-2">exists</span>
          <span class="pl-2">then</span>
          <span class="pl-2">{{when.then}}</span>
        </span>
        <span v-if="item.case.else" class="pl-2">else {{item.case.else}}
        </span>
      </span>
    </div>
  </span>
</template>

<script setup lang="ts">
import {Return, ReturnProperty,When} from "@/interfaces/AutoGen";
import { isArrayHasLength } from "@/helpers/DataTypeCheckers";
import RecursiveWhereDisplay from "@/components/query/viewer/RecursiveWhereDisplay.vue";
import IMViewerLink from "@/components/shared/IMViewerLink.vue";

interface Props {
  select: Return;

}

const props = defineProps<Props>();


const emit = defineEmits({
  navigateTo: (_payload: string) => true
});

</script>

<style scoped></style>
