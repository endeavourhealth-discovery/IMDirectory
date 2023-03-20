<template>
  <Listbox v-model="selected" :options="properties" multiple option-label="name" />
  <div class="button-bar">
    <Button class="button-bar-button" severity="secondary" label="Cancel" @click="cancel" />
    <Button class="button-bar-button" label="OK" @click="add" />
  </div>
</template>

<script setup lang="ts">
import { ClassService } from "@/services";
import { FieldDto } from "@im-library/interfaces";
import { onMounted, watch, Ref, ref } from "vue";
const emit = defineEmits({ onClose: () => true });

const props = defineProps({
  value: { type: Object, required: true },
  objectType: { type: String, required: true }
});
const imq = "org.endeavourhealth.imapi.model.imq.";
const properties: Ref<FieldDto[]> = ref([]);
const selected: Ref<FieldDto[]> = ref([]);

onMounted(async () => {
  const className = props.objectType.charAt(0).toUpperCase() + props.objectType.slice(1);
  const fields = await ClassService.getClassFields(imq + className);
  const presentProperties = Object.keys(props.value);
  properties.value = fields.filter(field => !presentProperties.includes(field.name));
});

function add() {
  for (const field of selected.value) {
    if ("iri" === field.name) {
      props.value["@id"] = "iri";
    } else if (field.secondType === "java.util.List") props.value[field.name] = [];
    else props.value[field.name] = "";
  }

  emit("onClose");
}

function cancel() {
  emit("onClose");
}
</script>

<style scoped>
.button-bar {
  display: flex;
  justify-content: end;
}

.button-bar-button {
  margin: 0.2rem;
}
</style>
