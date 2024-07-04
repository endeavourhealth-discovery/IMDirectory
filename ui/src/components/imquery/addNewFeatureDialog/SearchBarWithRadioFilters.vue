<template>
  <!--TODO: Move the following div to a subcomponent -->
  <!-- <div class="flex justify-content-center align-items-center">
                  <SearchBar
                    v-model:searchTerm="searchTerm"
                    v-model:selected="selectedGeneralConcept"
                    :imQuery="imQuery"
                    :show-filters="false"
                    @to-ecl-search="showEclSearch"
                    @to-query-search="showQuerySearch"
                    @to-search="onSearch"
                  />
                  <div class="type-options flex flex-wrap gap-3">
                    <div v-for="typeOption in typeOptions" :key="typeOption.name" class="flex align-items-center">
                      <RadioButton v-model="selectedType" :inputId="typeOption.name" name="dynamic" :value="typeOption" @change="onTypeSelect" />
                      <label :for="typeOption.name" class="gap-1">{{ typeOption.name }}</label>
                    </div>
                  </div>
                </div> -->
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
interface Props {
  msg?: string;
}
const props = withDefaults(defineProps<Props>(), {
  msg: "hello"
});

onMounted(async () => {});
</script>

<style scoped></style>
