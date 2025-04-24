<template>
  <div v-for="template of functionTemplates">
    <div v-if="template['@id'] === IM.TEMPLATE_NUMERIC_EVENT_ORDER">
      <div v-if="template[IM.FUNCTION_DEFINITION]?.[0]?.['@id'] === IM.ORDER_BY" class="flex gap-1">
        <Button
          v-for="paramTemplate of template[IM.PARAMETER_TEMPLATE]"
          :label="'Get ' + paramTemplate[RDFS.LABEL]"
          severity="info"
          @click="onClick(template[IM.FUNCTION_DEFINITION]?.[0]?.['@id'], paramTemplate[SHACL.ORDER], paramTemplate[IM.VALUE_TEMPLATE])"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Order, OrderLimit } from "@/interfaces/AutoGen";
import { IM, RDFS, SHACL } from "@/vocabulary";
interface Props {
  functionTemplates: any;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  addFunctionProperty: [payload: { property: string; value: any }];
}>();

function onClick(templateFunctionIri: string, limit: number, valueTemplates: any) {
  if (templateFunctionIri === IM.ORDER_BY) {
    const direction = valueTemplates.find((valueTemplate: any) => "direction" === valueTemplate[SHACL.PARAMETER]);
    const property = valueTemplates.find((valueTemplate: any) => "property" === valueTemplate[SHACL.PARAMETER]);
    if (direction && property) {
      const orderBy: OrderLimit = {
        limit: limit,
        property: {
          "@id": property[IM.DEFAULT_VALUE]?.[0]?.["@id"],
          direction: direction[IM.DEFAULT_VALUE] === Order.ascending ? Order.ascending : Order.descending
        }
      };
      emit("addFunctionProperty", { property: "orderBy", value: orderBy });
    }
  }
}
</script>

<style scoped></style>
