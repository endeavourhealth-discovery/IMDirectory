<template>
  <div v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else-if="isObjectHasKeys(concept, [RDFS.SUBCLASS_OF, IM.ROLE_GROUP])" id="expression-container">
    <span
      class="ecl-text"
      data-testid="eclString"
      v-tooltip.left="'Copy to clipboard'"
      v-clipboard:copy="copyToClipboard()"
      v-clipboard:success="onCopy"
      v-clipboard:error="onCopyError"
      >{{ expression }}</span
    >
  </div>
  <div v-else class="concept-panel-content">Expression not found.</div>
</template>

<script setup lang="ts">
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import { onMounted, ref } from "vue";
import { IM, RDFS } from "@/vocabulary";

interface Props {
  concept: any;
}

const props = defineProps<Props>();

const expression = ref("");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(expression);

const loading = ref(true);
onMounted(async () => await init());

async function init() {
  loading.value = true;
  generateExpression();
  loading.value = false;
}

function generateExpression() {
  let result = "";
  if (props.concept[IM.DEFINITIONAL_STATUS] && props.concept[IM.DEFINITIONAL_STATUS].length) {
    for (const def of props.concept[IM.DEFINITIONAL_STATUS]) {
      if (def["@id"] === "http://endhealth.info/im#1251000252106") result += "=== ";
    }
  } else {
    result += "<<< ";
  }
  for (let subclass in props.concept[RDFS.SUBCLASS_OF]) {
    result += props.concept[RDFS.SUBCLASS_OF][subclass]["@id"].split("#")[1] + " |" + props.concept[RDFS.SUBCLASS_OF][subclass].name + "|";
    if (parseInt(subclass) < props.concept[RDFS.SUBCLASS_OF].length - 1) result += " +\n\t\t";
  }
  result += " :\n\t\t";

  for (let roleGroup of props.concept[IM.ROLE_GROUP]) {
    const newGroup = roleGroup;
    delete newGroup[IM.GROUP_NUMBER];
    for (let key of newGroup) {
    }
  }

  //console.log(result.length);
  if (result.length) expression.value = result;
  else expression.value = "Error creating expression.";

  /* const instanceArray = [];
  for (let subclass of concept.value[RDFS.SUBCLASS_OF]) {
    const instanceOf = { "@id": subclass["@id"], name: subclass.name, descendantsOrSelfOf: true };
    instanceArray.push(instanceOf);
  }

  let rg = { "@id": IM.ROLE_GROUP, match: { where: [] as Where[] } } as Where;
  let whereRg = [] as Where[];
  for (let roleGroup of concept.value[IM.ROLE_GROUP]) {
    let subWhere = { boolWhere: Bool.and, where: [] as Where[] } as Where;
    const newGroups = roleGroup;
    delete newGroups[IM.GROUP_NUMBER];
    for (let key in newGroups) {
      let roleGroups = await EntityService.getPartialEntity(key, [RDFS.LABEL]);
      if (Object.keys(newGroups).length === 1) {
        rg.match!.where!.push({
          "@id": key,
          name: roleGroups[RDFS.LABEL],
          is: [{ "@id": newGroups[key][0]["@id"], name: newGroups[key][0].name }],
          anyRoleGroup: false
        });
      } else {
        subWhere.where!.push({
          "@id": key,
          name: roleGroups[RDFS.LABEL],
          is: [{ "@id": newGroups[key][0]["@id"], name: newGroups[key][0].name }],
          anyRoleGroup: false
        });
      }
    }
    if (Object.keys(newGroups).length !== 1) {
      rg.match!.boolMatch = Bool.or;
      rg.match!.where!.push(subWhere);
    }
  }
  const roleGroupArray = [];
  roleGroupArray.push(rg);
  test.value = { where: roleGroupArray, instanceOf: instanceArray };
  console.log(JSON.stringify(test.value));
  //concept.value[IM.DEFINITION] = JSON.stringify(test.value);*/
}
</script>

<style scoped>
.ecl-text {
  white-space: break-spaces;
  cursor: pointer;
}

.loading-container {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 20rem;
}
</style>
