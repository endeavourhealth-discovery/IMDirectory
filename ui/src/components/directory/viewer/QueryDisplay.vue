<template>
  <div class="query-display-container">
    <Tree :value="nodes" :expanded-keys="expandedKeys">
      <template #default="{ node }">
        <div v-tooltip="node.data">
          {{ node.label }}
        </div>
      </template>
      <template #where="{ node }">
        {{ node.data.description || node.label }}
      </template>
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { EntityService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { buildDisplayQuery } from "@im-library/helpers/DisplayQueryBuilder";
import { summariseQuery } from "@im-library/helpers/QuerySummariser";
import { Query } from "@im-library/models/AutoGen";
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
    init();
  }
);

onMounted(async () => {
  init();
});

async function init() {
  definition.value = await getDefinition(props.conceptIri);
  const summarisedQuery = summariseQuery(definition.value);
  nodes.value = getNodes(summarisedQuery);
  // console.log(JSON.stringify(nodes.value));
  expandAll();
}

async function getDefinition(iri: string) {
  const responseEntity = await EntityService.getPartialEntity(iri, [IM.DEFINITION]);
  if (!isObjectHasKeys(responseEntity, [IM.DEFINITION])) return "";
  return JSON.parse(responseEntity[IM.DEFINITION]);
}

function getNodes(query: Query) {
  return buildDisplayQuery(query);
  // nodes.value = [
  //   {
  //     key: "0",
  //     label: "Patients registered for GMS services on the reference date",
  //     type: "query",
  //     data: {
  //       "@id": "http://endhealth.info/im#Q_RegisteredGMS",
  //       name: "Patients registered for GMS services on the reference date",
  //       description: "For any registration period,a registration start date before the reference date and no end date,or an end date after the reference date."
  //     },
  //     children: [
  //       {
  //         key: "0-0",
  //         label: "Patient",
  //         type: "from",
  //         data: {
  //           "@id": "http://endhealth.info/im#Patient",
  //           name: "Patient",
  //           sourceType: "type"
  //         },
  //         children: [
  //           {
  //             key: "0-0-0",
  //             label: "gpRegistration",
  //             type: "default",
  //             data: { id: "gpRegistration", description: "Points to entries for the registration episodes" },
  //             children: [
  //               {
  //                 key: "0-0-1",
  //                 label: "patientType",
  //                 type: "where",
  //                 data: {
  //                   id: "patientType",
  //                   description: "patientType = Regular GMS patient",
  //                   in: [
  //                     {
  //                       "@id": "http://endhealth.info/im#2751000252106",
  //                       name: "Regular GMS patient"
  //                     }
  //                   ]
  //                 }
  //               },
  //               {
  //                 key: "0-0-2",
  //                 label: "effectiveDate",
  //                 type: "where",
  //                 data: {
  //                   id: "effectiveDate",
  //                   operator: "<=",
  //                   relativeTo: "$referenceDate",
  //                   description: "effectiveDate <= $referenceDate"
  //                 }
  //               },
  //               {
  //                 key: "0-0-3",
  //                 label: "or",
  //                 children: [
  //                   {
  //                     key: "0-0-3-0",
  //                     label: "endDate",
  //                     type: "where",
  //                     data: { notExist: true, id: "endDate", description: "endDate does not exist" }
  //                   },
  //                   {
  //                     key: "0-0-3-1",
  //                     label: "endDate",
  //                     type: "where",
  //                     data: {
  //                       id: "endDate",
  //                       operator: ">",
  //                       relativeTo: "$referenceDate",
  //                       description: "endDate > $referenceDate"
  //                     }
  //                   }
  //                 ]
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     ]
  //   }
  // ];
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
