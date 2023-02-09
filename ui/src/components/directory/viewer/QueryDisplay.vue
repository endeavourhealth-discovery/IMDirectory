<template>
  <div class="query-display-container">
    <Tree :value="nodes" :expanded-keys="expandedKeys">
      <template #default="{ node }">
        <div v-if="node.data?.description">
          <div v-tooltip="node.data.description">
            {{ node.label }}
          </div>
        </div>
        <div v-else>{{ node.label }}</div>
      </template>
      <template #query="{ node }">
        <div v-tooltip="node.data.description">
          <b>{{ node.label }}</b>
        </div>
      </template>
      <template #from="{ node }">
        <div v-tooltip="node.data.sourceType">
          {{ node.label }}
        </div>
      </template>
      <template #where="{ node }">
        <div v-if="node.data.in?.length > 1">{{ node.data.description }} see more...</div>
        <div v-else>{{ node.data.description }}</div>
      </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { IM } from "@im-library/vocabulary";
import { onMounted, watch, Ref, ref } from "vue";
const props = defineProps({
  conceptIri: { type: String, required: true }
});
const expandedKeys: Ref<any> = ref({});
const definition: Ref<any> = ref();
const nodes: Ref<any[]> = ref([]);

watch(
  () => props.conceptIri,
  async newValue => {
    await getDefinition(props.conceptIri);
  }
);

onMounted(async () => {
  await getDefinition(props.conceptIri);
  getNodes();
  expandAll();
});

async function getDefinition(iri: string) {
  const responseEntity = await EntityService.getPartialEntity(iri, [IM.DEFINITION]);
  definition.value = responseEntity[IM.DEFINITION];
}

function getNodes() {
  nodes.value = [
    {
      key: "0",
      label: "Patients registered for GMS services on the reference date",
      type: "query",
      data: {
        "@id": "http://endhealth.info/im#Q_RegisteredGMS",
        name: "Patients registered for GMS services on the reference date",
        description: "For any registration period,a registration start date before the reference date and no end date,or an end date after the reference date."
      },
      children: [
        {
          key: "0-0",
          label: "Patient",
          type: "from",
          data: {
            "@id": "http://endhealth.info/im#Patient",
            name: "Patient",
            sourceType: "type"
          },
          children: [
            {
              key: "0-0-0",
              label: "gpRegistration",
              type: "default",
              data: { id: "gpRegistration", description: "Points to entries for the registration episodes" },
              children: [
                {
                  key: "0-0-1",
                  label: "patientType",
                  type: "where",
                  data: {
                    id: "patientType",
                    description: "patientType = Regular GMS patient",
                    in: [
                      {
                        "@id": "http://endhealth.info/im#2751000252106",
                        name: "Regular GMS patient"
                      }
                    ]
                  }
                },
                {
                  key: "0-0-2",
                  label: "effectiveDate",
                  type: "where",
                  data: {
                    id: "effectiveDate",
                    operator: "<=",
                    relativeTo: "$referenceDate",
                    description: "effectiveDate <= $referenceDate"
                  }
                },
                {
                  key: "0-0-3",
                  label: "or",
                  children: [
                    {
                      key: "0-0-3-0",
                      label: "endDate",
                      type: "where",
                      data: { notExist: true, id: "endDate", description: "endDate does not exist" }
                    },
                    {
                      key: "0-0-3-1",
                      label: "endDate",
                      type: "where",
                      data: {
                        id: "endDate",
                        operator: ">",
                        relativeTo: "$referenceDate",
                        description: "endDate > $referenceDate"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];
}

function expandAll() {
  for (let node of nodes.value) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
}

function collapseAll() {
  expandedKeys.value = {};
}

function expandNode(node: any) {
  if (node.children && node.children.length) {
    expandedKeys.value[node.key] = true;

    for (let child of node.children) {
      expandNode(child);
    }
  }
}
</script>

<style scoped>
.query-display-container {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
}
</style>
