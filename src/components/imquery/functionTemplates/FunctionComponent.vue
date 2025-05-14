<template>
  <div v-for="(template, index) of functionTemplates" v-bind:key="index">
    <div v-if="template.iri === IM.TEMPLATE_NUMERIC_EVENT_ORDER">
      <div v-if="template[IM.FUNCTION_DEFINITION]?.[0]?.iri === IM.ORDER_BY" class="flex gap-1">
        <Button
          v-for="(paramTemplate, bIdx) of template[IM.PARAMETER_TEMPLATE]"
          :label="'Get ' + paramTemplate[RDFS.LABEL]"
          severity="info"
          @click="onClick(template[IM.FUNCTION_DEFINITION]?.[0]?.iri, paramTemplate[SHACL.ORDER], paramTemplate[IM.VALUE_TEMPLATE])"
          v-bind:key="bIdx"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Order, OrderLimit } from "@/interfaces/AutoGen";
import { IM, RDFS, SHACL } from "@/vocabulary";

defineProps<{
  functionTemplates: any;
}>();

const emit = defineEmits<{
  addFunctionProperty: [property: string, _value: any];
}>();

function onClick(templateFunctionIri: string, limit: number, valueTemplates: any) {
  if (templateFunctionIri === IM.ORDER_BY) {
    const direction = valueTemplates.find((valueTemplate: any) => "direction" === valueTemplate[SHACL.PARAMETER]);
    const property = valueTemplates.find((valueTemplate: any) => "property" === valueTemplate[SHACL.PARAMETER]);
    if (direction && property) {
      const orderBy: OrderLimit = {
        limit: limit,
        property: [
          {
            "@id": property[IM.DEFAULT_VALUE]?.[0]?.["@id"],
            direction: direction[IM.DEFAULT_VALUE] === Order.ascending ? Order.ascending : Order.descending
          }
        ]
      };
      emit("addFunctionProperty", "orderBy", orderBy);
    }
  }
}
</script>

<style scoped></style>
