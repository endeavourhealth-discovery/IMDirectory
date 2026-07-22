<template>
  <div v-if="loading">
    <ProgressSpinner />
  </div>
  <div v-else-if="isObjectHasKeys(concept, [RDFS.SUBCLASS_OF])" id="expression-container">
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
import { onMounted, ref } from "vue";

import { useCopyToClipboard } from "@endeavour/vue-library/composables";
import { IM, RDFS } from "@endeavour/vue-library/enums";
import { isArrayOf, isObjectHasKeys } from "@endeavour/vue-library/helpers";
import { type TTEntity, TTIriRefSchema, isTTEntity, isTTIriRef } from "@endeavour/vue-library/models";

import { isArray, isString } from "lodash-es";

import { EntityService } from "@/services";

interface Props {
  concept: TTEntity;
}

const props = defineProps<Props>();

const expression = ref("");
const { copyToClipboard, onCopy, onCopyError } = useCopyToClipboard(expression);

const loading = ref(true);
onMounted(async () => await init());

async function init() {
  loading.value = true;
  await generateExpression();
  loading.value = false;
}

async function generateExpression() {
  let result = "";
  if (isArrayOf(props.concept[IM.DEFINITIONAL_STATUS], isTTIriRef)) {
    for (const def of props.concept[IM.DEFINITIONAL_STATUS]) {
      if (def.iri === "http://endhealth.info/im#1251000252106") result += "===\t";
    }
  } else {
    result += "<<<\t";
  }
  if (isArray(props.concept[RDFS.SUBCLASS_OF])) {
    for (let subclass in props.concept[RDFS.SUBCLASS_OF]) {
      if (isTTIriRef(props.concept[RDFS.SUBCLASS_OF][subclass]))
        result += props.concept[RDFS.SUBCLASS_OF][subclass].iri.split("#")[1] + " |" + props.concept[RDFS.SUBCLASS_OF][subclass].name + "|";
      if (parseInt(subclass) < props.concept[RDFS.SUBCLASS_OF].length - 1) result += " +\n\t";
    }
  }

  if (isArrayOf(props.concept[IM.ROLE_GROUP], isTTEntity)) {
    result += " :\n";
    for (let roleGroup of props.concept[IM.ROLE_GROUP]) {
      const newGroup = roleGroup;
      delete newGroup[IM.GROUP_NUMBER];
      let count = 0;
      for (const key of Object.keys(newGroup)) {
        const value = newGroup[key];
        const label = await EntityService.getPartialEntity(key, [RDFS.LABEL]);
        if (count === 0) {
          result += "\t\t{ ";
        } else result += "\n\t\t  ";
        count++;
        if (isArrayOf(value, isTTIriRef) && isString(label[RDFS.LABEL]) && isString(value[0].name)) {
          result += key.split("#")[1] + " |" + label[RDFS.LABEL] + "| = " + value[0].iri.split("#")[1] + " |" + value[0].name + "|";
        }
        if (count < Object.entries(newGroup).length) result += ",";
      }
      count = 0;
      result += " }\n";
    }
  }
  if (result.length) {
    expression.value = result;
  } else {
    expression.value = "Error creating expression.";
  }
}
</script>

<style scoped>
.ecl-text {
  white-space: break-spaces;
  cursor: pointer;
  font-family: "Courier New", monospace;
  font-weight: 700;
  font-size: 13px;
}
</style>
