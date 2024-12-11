<template>
  <div class="datatype-select">
    <div v-if="!isClassDataType">
      <div v-if="datatype === XSD.STRING" class="property-input-container">
        <Select
          :options="[
            { id: 'is', name: 'is' },
            { id: 'startsWith', name: 'starts with' },
            { id: 'contains', name: 'contains' },
            { id: 'notNull', name: 'is recorded' },
            { id: 'isNull', name: 'is not recorded' }
          ]"
          optionValue="id"
          optionLabel="name"
          v-model:model-value="propertyType"
        />
        <InputText
          v-if="['is', 'startsWith', 'contains'].includes(propertyType)"
          type="text"
          v-model:model-value="property.value"
          data-testid="property-value-input"
        />
      </div>
      <div v-else-if="datatype === XSD.BOOLEAN" class="property-input-container">
        <Select :options="booleanOptions" option-label="name" option-value="value" v-model:model-value="property.value" />
      </div>
      <div
        v-else-if="datatype === XSD.LONG || datatype === XSD.INTEGER || datatype === XSD.NUMBER || datatype === XSD.DECIMAL || datatype === IM.NUMERIC_VALUE"
        class="property-input-container"
      >
        <Select
          :options="[
            { id: 'is', name: 'is' },
            { id: 'between', name: 'between' },
            { id: 'range', name: 'in range' },
            { id: 'notNull', name: 'is recorded' },
            { id: 'isNull', name: 'is not recorded' }
          ]"
          optionValue="id"
          optionLabel="name"
          v-model:model-value="propertyType"
        />
        <div v-if="propertyType === 'is'" class="property-input">
          <Select type="text" placeholder="operator" :options="operatorOptions" v-model="property.operator" data-testid="property-operator-select" />
          <InputText type="text" placeholder="value" v-model="property.value" data-testid="property-value-input" />
          <RelativeToSelect :property="property" :datatype="datatype" :property-iri="property['@id']!" />
        </div>
        <div v-else-if="propertyType === 'between'" class="property-input">
          <div class="property-range" v-if="property?.range?.from">
            <InputText type="text" placeholder="value" v-model="property.range.from.value" />
            <Select type="text" placeholder="unit" :options="intervalOptions" v-model="property.range.from.intervalUnit" />
          </div>
          <div class="property-range" v-if="property?.range?.to">
            <InputText :value="'and'" disabled class="property-input-title" />
            <InputText type="text" placeholder="value" v-model="property.range.to.value" />
            <Select type="text" placeholder="unit" :options="intervalOptions" v-model="property.range.to.intervalUnit" />
          </div>
        </div>
        <div v-else-if="propertyType === 'range'" class="property-input">
          <div class="property-range" v-if="property?.range?.from">
            <InputText :value="'From'" disabled class="property-input-title" />
            <Select type="text" placeholder="operator" :options="operatorOptions.filter(option => option !== '=')" v-model="property.range.from.operator" />
            <InputText type="text" placeholder="value" v-model="property.range.from.value" />
            <Select type="text" placeholder="unit" :options="intervalOptions" v-model="property.range.from.intervalUnit" />
          </div>
          <div class="property-range" v-if="property?.range?.to">
            <InputText :value="'To'" disabled class="property-input-title" />
            <Select type="text" placeholder="operator" :options="operatorOptions.filter(option => option !== '=')" v-model="property.range.to.operator" />
            <InputText type="text" placeholder="value" v-model="property.range.to.value" />
            <Select type="text" placeholder="unit" :options="intervalOptions" v-model="property.range.to.intervalUnit" />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="datatypeEntity">
      <div v-if="datatype === IM.DATE_TIME || datatype === IM.DATE || datatype === IM.TIME" class="property-input-container">
        <DateSelect :property="property" :datatype="datatype" :interval-options="intervalOptions" :comparison-options="comparisonOptions" />
      </div>
      <div v-else class="property-input-container">
        <InputText v-model="property.value" data-testid="property-value-input"/>
        <Select type="text" placeholder="units" :options="intervalOptions" v-model="property.intervalUnit" option-label="name" option-value="value" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import { IM, QUERY, RDF, RDFS, XSD } from "@/vocabulary";
import { Assignable, Range, Where, Operator, TTIriRef, QueryRequest } from "@/interfaces/AutoGen";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import DateSelect from "./DateSelect.vue";
import RelativeToSelect from "./RelativeToSelect.vue";
import ParameterSelect from "./ParameterSelect.vue";
import { EntityService, QueryService } from "@/services";
import { isOfTypes } from "@/helpers/ConceptTypeMethods";
interface Props {
  property: Where;
  datatype: string;
}

export interface Option {
  id: string;
  name: string;
  value: TTIriRef;
  min: number;
  max: number;
  inputValue: string;
}

const props = defineProps<Props>();
const propertyType: Ref<string> = ref("");
const booleanOptions = [
  { name: "true", value: true },
  { name: "false", value: false }
];
const operatorOptions = ["=", ">=", ">", "<=", "<"];
const intervalOptions: Ref<Option[]> = ref([]);
const comparisonOptions: Ref<Option[]> = ref([]);
const datatypeEntity: Ref<any> = ref();
const isClassDataType: Ref<boolean> = ref(false);
watch(
  () => propertyType.value,
  () => {
    switch (propertyType.value) {
      case "range":
        props.property.operator = undefined;
        props.property.isNull = undefined;
        props.property.isNotNull = undefined;
        if (!props.property.range) props.property.range = { from: {} as Assignable, to: {} as Assignable } as Range;
        break;
      case "between":
        props.property.operator = undefined;
        props.property.isNull = undefined;
        props.property.isNotNull = undefined;
        if (!props.property.range) props.property.range = { from: { operator: Operator.gte }, to: { operator: Operator.lte } as Assignable } as Range;
        break;
      case "startsWith":
        delete props.property.range;
        props.property.isNull = undefined;
        props.property.isNotNull = undefined;
        props.property.operator = Operator.start;
        break;
      case "contains":
        delete props.property.range;
        props.property.isNull = undefined;
        props.property.isNotNull = undefined;
        props.property.operator = Operator.contains;
        break;
      case "is":
        delete props.property.range;
        props.property.isNull = undefined;
        props.property.isNotNull = undefined;
        if (!operatorOptions.includes(props.property.operator as string)) props.property.operator = Operator.eq;
        break;
      case "notNull":
        delete props.property.range;
        props.property.operator = undefined;
        props.property.isNull = undefined;
        props.property.isNotNull = true;
        break;
      case "isNull":
        delete props.property.range;
        props.property.operator = undefined;
        props.property.isNull = true;
        props.property.isNotNull = undefined;
        break;
      default:
        break;
    }
  }
);

watch(
  () => props.datatype,
  async () => await getDataTypeInfo()
);

onMounted(async () => {
  await getDataTypeInfo();
  if (isObjectHasKeys(props.property.range)) {
    if (props.property.range?.from.operator === Operator.gte && props.property.range?.to.operator === Operator.lte) propertyType.value = "between";
    else propertyType.value = "range";
  } else if (props.property.operator === "startsWith" || props.property.operator === "contains") propertyType.value = props.property.operator;
  else if (props.property.isNull) propertyType.value = "isNull";
  else if (props.property.isNotNull) propertyType.value = "notNull";
  else if (props.datatype !== IM.DATE_TIME) propertyType.value = "is";
});

async function getDataTypeInfo() {
  if (props.datatype) {
    datatypeEntity.value = await EntityService.getPartialEntity(props.datatype, []);
    if (isArrayHasLength(datatypeEntity.value[RDF.TYPE]) && isOfTypes(datatypeEntity.value[RDF.TYPE], RDFS.CLASS)) isClassDataType.value = true;
    else isClassDataType.value = false;

    if (isArrayHasLength(datatypeEntity.value[IM.INTERVAL_UNIT])) {
      comparisonOptions.value = await getComparisonOptionsFromIri(datatypeEntity.value[IM.INTERVAL_UNIT][0]["@id"]);
      if (isArrayHasLength(datatypeEntity.value[IM.DATATYPE_QUALIFIER]))
        intervalOptions.value = (datatypeEntity.value[IM.DATATYPE_QUALIFIER] as TTIriRef[]).map(ttIriRef => {
          return { id: ttIriRef.name, name: ttIriRef.name, value: ttIriRef } as Option;
        });
      else intervalOptions.value = [...comparisonOptions.value];
    }
  }
}

async function getComparisonOptionsFromIri(iri: string) {
  let options: Option[] = [];

  const qr: QueryRequest = {
    query: { "@id": QUERY.GET_SUBCLASSES },
    argument: [
      {
        parameter: "this",
        valueIri: {
          "@id": iri
        }
      }
    ]
  };
  const response = await QueryService.queryIM(qr);
  if (isArrayHasLength(response.entities)) {
    options = response.entities.map(entity => {
      return { id: entity[IM.CODE], name: entity[RDFS.LABEL], value: { "@id": entity["@id"], name: entity[RDFS.LABEL] } } as Option;
    });
  }

  return options;
}
</script>

<style scoped>
.property-input-container {
  display: flex;
  flex-flow: row;
  align-items: baseline;
}

.property-input {
  display: flex;
  flex-flow: row;
  align-items: baseline;
  flex-wrap: wrap;
}

.property-input-title {
  width: 4rem;
}

.property-range {
  display: flex;
  flex-flow: row;
  align-items: baseline;
}
</style>
