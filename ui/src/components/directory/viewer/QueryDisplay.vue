<template>
  <div class="card">
    <OrganizationChart :value="APLCVDStatinsv1_0SearchPID" :collapsible="true" class="company" selectionMode="single">
      <template #query="{ node }">
        <div class="node-header ui-corner-top">{{ node.data.name }}</div>
        <div class="node-content">
          <div>{{ node.data.description }}</div>
        </div>
      </template>
      <template #operatorWhere="{ node }">
        <div class="node-content">
          <div v-if="node.data.description">{{ node.data.description }}</div>
          <div v-else>{{ node.data.id }} {{ node.data.operator }} {{ node.data.relativeTo }}</div>
        </div>
      </template>
      <template #notExistWhere="{ node }">
        <div class="node-content">
          <div v-if="node.data.description">{{ node.data.description }}</div>
          <div v-else>{{ node.data.id }} not exists</div>
        </div>
      </template>
      <template #in="{ node }">
        <div class="node-content">
          <div v-if="node.data.description">
            {{ node.data.description }}
            <div v-if="node.data.in.length > 1">see more...</div>
          </div>
          <div v-else>
            <div v-for="inItem in node.data.in">{{ inItem.name }}</div>
          </div>
        </div>
      </template>
      <template #default="{ node }">
        <div class="node-header ui-corner-top">{{ node.data.name }}</div>
        <div class="node-content">
          <div>{{ node.data.description }}</div>
        </div>
      </template>
    </OrganizationChart>
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { onMounted, watch, Ref, ref } from "vue";
const props = defineProps({
  conceptIri: { type: String, required: true }
});

const definition: Ref<any> = ref();
const Q_RegisteredGMS: Ref<any> = ref({
  key: "0",
  type: "query",
  data: {
    name: "Patients registered for GMS services on the reference date",
    description: "For any registration period,a registration start date before the reference date and no end date,or an end date after the reference date"
  },
  children: [
    {
      key: "0_0",
      type: "from",
      data: { name: "Patient" },
      children: [
        {
          key: "0_0_0",
          type: "where",
          data: { name: "gpRegistration" },
          children: [
            {
              key: "0_0_0_0",
              type: "where",
              data: { name: "patientType" },
              children: [
                {
                  key: "0_0_0_0_0",
                  type: "in",
                  data: { in: [{ name: "Regular GMS patient" }] }
                }
              ]
            }
          ]
        },
        {
          key: "0_0_1",
          type: "operatorWhere",
          data: { id: "effectiveDate", operator: "<=", relativeTo: "$referenceDate" }
        },
        {
          key: "0_0_2",
          type: "or",
          data: { name: "or" },
          children: [
            {
              key: "0_0_2_0",
              type: "notExistWhere",
              data: { notExist: true, id: "endDate" }
            },
            {
              key: "0_0_2_1",
              type: "operatorWhere",
              data: { id: "endDate", operator: ">", relativeTo: "$referenceDate" }
            }
          ]
        }
      ]
    }
  ]
});

const APLCVDStatinsv1_0SearchPID: Ref<any> = ref({
  key: "0",
  type: "from",
  data: {
    name: "Patients registered for GMS services on the reference date",
    description: "For any registration period,a registration start date before the reference date and no end date,or an end date after the reference date"
  },
  children: [
    {
      key: "0_0",
      type: "where",
      data: { name: "gpCurrentRegistration" },
      children: [
        {
          key: "0_0_0",
          type: "where",
          data: { name: "gpPatientType" },
          children: [
            {
              key: "0_0_0_0_0",
              type: "in",
              data: { in: [{ name: "Regular GMS patient" }] }
            }
          ]
        },
        {
          key: "0_0_1",
          type: "operatorWhere",
          data: {
            id: "age",
            description: "age >= 18 YEAR",
            operator: ">=",
            value: "18",
            unit: "YEAR"
          }
        },
        {
          key: "0_0_2",
          type: "where",
          data: { name: "gpCurrentRegistration" },
          children: [
            {
              key: "0_0_2_0",
              type: "where",
              data: { name: "gpRegisteredStatus" },
              children: [
                {
                  key: "0_0_2_0_0",
                  type: "in",
                  data: { in: [{ name: "Patient registered (finding)" }] }
                }
              ]
            }
          ]
        },
        {
          key: "0_0_2",
          type: "where",
          data: { name: "gpCurrentRegistration" },
          children: [
            {
              key: "0_0_2_0",
              type: "where",
              data: { description: "gpGMSRegistrationDate <= -1 YEAR" }
            }
          ]
        },
        {
          key: "0_0_2",
          type: "where",
          data: { name: "observation" },
          children: [
            {
              key: "0_0_2_0",
              type: "where",
              data: { name: "concept" },
              children: [
                {
                  key: "0_0_2_0_0",
                  type: "in",
                  data: {
                    description: "Ischaemic heart disease",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#414545008",
                        name: "Ischemic heart disease (disorder)"
                      },
                      {
                        "@id": "http://snomed.info/sct#57054005",
                        name: "Acute myocardial infarction (disorder)"
                      },
                      {
                        "@id": "http://snomed.info/sct#414545008",
                        name: "Ischemic heart disease (disorder)"
                      },
                      {
                        "@id": "http://snomed.info/sct#20059004",
                        name: "Occlusion of cerebral artery (disorder)"
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});

watch(
  () => props.conceptIri,
  async newValue => {
    await getDefinition(props.conceptIri);
  }
);

onMounted(async () => {
  await getDefinition(props.conceptIri);
});

async function getDefinition(iri: string) {
  const responseEntity = await EntityService.getPartialEntity(iri, [IM.DEFINITION]);
  definition.value = responseEntity[IM.DEFINITION];
}
</script>

<style scoped></style>
