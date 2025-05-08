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
import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import setupCopyToClipboard from "@/composables/setupCopyToClipboard";
import { onMounted, ref } from "vue";
import { IM, RDFS } from "@/vocabulary";
import { EntityService } from "@/services";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";

interface Props {
  concept: TTEntity;
}

const props = defineProps<Props>();

const expression = ref("");
const { copyToClipboard, onCopy, onCopyError } = setupCopyToClipboard(expression);

const loading = ref(true);
onMounted(async () => await init());

async function init() {
  loading.value = true;
  await generateExpression();
  loading.value = false;
}

async function generateExpression() {
  let result = "";
  if (props.concept[IM.DEFINITIONAL_STATUS] && props.concept[IM.DEFINITIONAL_STATUS].length) {
    for (const def of props.concept[IM.DEFINITIONAL_STATUS]) {
      if (def["@id"] === "http://endhealth.info/im#1251000252106") result += "===\t";
    }
  } else {
    result += "<<<\t";
  }
  if (props.concept[RDFS.SUBCLASS_OF]) {
    for (let subclass in props.concept[RDFS.SUBCLASS_OF]) {
      result += props.concept[RDFS.SUBCLASS_OF][subclass]["@id"].split("#")[1] + " |" + props.concept[RDFS.SUBCLASS_OF][subclass].name + "|";
      if (parseInt(subclass) < props.concept[RDFS.SUBCLASS_OF].length - 1) result += " +\n\t";
    }
  }

  if (props.concept[IM.ROLE_GROUP] && props.concept[IM.ROLE_GROUP].length) {
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
        result += key.split("#")[1] + " |" + label[RDFS.LABEL] + "| = " + value[0]["@id"].split("#")[1] + " |" + value[0].name + "|";
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
