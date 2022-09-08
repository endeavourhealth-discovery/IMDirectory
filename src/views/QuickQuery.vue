<template>
  <div id="main-container">
    <h1>Quick query builder</h1>
    <div class="grid">
      <div class="col-8">
        <Accordion v-if="patientUI">
          <AccordionTab :header="patientUI.name">
            <div class="grid">
              <div class="col-3"><b>Include in output</b></div>
              <div class="col-9"><b>Filter options</b></div>

              <div v-for="(property, index) in patientUI.properties" class="grid col-12">
                <div class="field-checkbox col-3">
                  <Checkbox :value="property.field['@id']" v-model="queryObject['http://endhealth.info/im#Patient'].output"/>
                  <label>{{ property.field.name }}</label>
                </div>
                <div class="col-9">
                  <component :key="index" :is="property.component" :model="'http://endhealth.info/im#Patient'" :value="property"/>
                </div>
              </div>

            </div>
          </AccordionTab>
          <template v-if="!loading">
            <AccordionTab v-for="model in clinicalUIs" :header="model.name">
              <div class="grid">
                <div class="col-3"><b>Include in output</b></div>
                <div class="col-9"><b>Filter options</b></div>

                <div v-for="(property, index) in model.properties" class="grid col-12">
                  <div class="field-checkbox col-3">
                    <Checkbox :value="property.field['@id']" v-model="queryObject[model.iri].output"/>
                    <label>{{ property.field.name }}</label>
                  </div>
                  <div class="col-9">
                    <component :key="index" :is="property.component" :model="model.iri" :value="property"/>
                  </div>
                </div>

              </div>
            </AccordionTab>
          </template>
        </Accordion>
        <Dropdown :options="models" optionLabel="name" placeholder="Add data type" @change="addModel"/>
        <Button @click="runQuery">Run</Button>
        <ProgressSpinner v-if="loading"/>
      </div>
      <div class="col-4">
        <small>
          <pre>{{JSON.stringify(queryObject, null, 2)}}</pre>
        </small>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import NotImplemented from "@/components/quickQuery/NotImplemented.vue";
import StringFilter from "@/components/quickQuery/StringFilter.vue";
import NumberFilter from "@/components/quickQuery/NumberFilter.vue";
import DateTimeFilter from "@/components/quickQuery/DateTimeFilter.vue";
import ConceptFilter from "@/components/quickQuery/ConceptFilter.vue";
import InstanceFilter from "@/components/quickQuery/InstanceFilter.vue";
import {defineComponent} from 'vue';

export default defineComponent({
  components: { NotImplemented, StringFilter, NumberFilter, DateTimeFilter, ConceptFilter, InstanceFilter }
});
</script>

<script setup lang="ts">
import axios from 'axios';
import {Services, Vocabulary} from '../../../IMLibrary';
import {onMounted, provide, Ref, ref} from 'vue';

const { SHACL, RDFS } = Vocabulary;

const { EntityService, QueryService } = Services;

const entityService = new EntityService(axios);
const queryService = new QueryService(axios);

const patientUI: Ref = ref({});
const models: Ref<any[]> = ref([]);
const clinicalUIs: Ref<any[]> = ref([]);
const loading: Ref<boolean> = ref(false);
const queryObject: Ref = ref({
  'http://endhealth.info/im#Patient': { output: [], filters: {}}
});

provide('queryObject', queryObject);

onMounted(async () => {
  loading.value = true;

  patientUI.value = await loadModel('http://endhealth.info/im#Patient');
  models.value = await entityService.getEntityChildren('http://endhealth.info/im#HealthRecordEntry');

  loading.value = false;
});

async function loadModel(iri: string) {
  const model = await entityService.getPartialEntity(iri, [RDFS.LABEL, SHACL.PROPERTY]);
  return simplifyModel(model);
}

function simplifyModel(model: any) {
  const properties = (model['http://www.w3.org/ns/shacl#property']).map((prop: any) => {
    return {
      field: prop['http://www.w3.org/ns/shacl#path'][0],
      prop: prop,
      component: getComponent(prop)
    }
  });

  return {
    iri: model['@id'],
    name: model['http://www.w3.org/2000/01/rdf-schema#label'],
    properties: properties,
  };
}

async function addModel(event: any) {
  loading.value = true;
  const iri : string = event.value['@id'];
  queryObject.value[iri] = { output: [], filters: {}};
  clinicalUIs.value.push(await loadModel(iri));
  models.value = models.value.filter(m => m['@id'] != iri);
  loading.value = false;
}

function getComponent(prop: any) {
  if (prop['http://www.w3.org/ns/shacl#datatype']) {
    const dt = prop['http://www.w3.org/ns/shacl#datatype'][0]['@id'];
    if (dt === 'http://www.w3.org/2001/XMLSchema#string')
      return 'StringFilter';
    else if (dt === 'http://www.w3.org/2001/XMLSchema#integer')
      return 'NumberFilter';
    else if (dt === 'http://endhealth.info/im#DateTime')
      return 'DateTimeFilter';
    else {
      console.log("Unimplemented prop")
      console.log(prop);
      return 'NotImplemented';
    }
  } else if (prop['http://www.w3.org/ns/shacl#class']) {
    return 'ConceptFilter'
  } else if (prop['http://www.w3.org/ns/shacl#node']) {
    return 'InstanceFilter'
  } else {
    console.log("Unimplemented prop")
    console.log(prop);
    return 'NotImplemented';
  }
}

async function runQuery() {
  const response = await queryService.quickQuery(queryObject.value);
  console.log(response);
}

</script>

<style scoped>
#main-container {
  width: 100%;
  height: calc(100% - 3.5rem);
  overflow: auto;
  padding: 0 1rem;
}

.field-checkbox {
  margin-bottom: 0;
}

.col-12 {
  padding: unset;
}
</style>
