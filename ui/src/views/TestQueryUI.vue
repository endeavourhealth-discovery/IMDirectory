<template>
  <TabView ref="tabview1">
    <TabPanel header="Complex feature (Artificial property)">
      <TestPropertyValue :property-value-pairs="simpleProperty" />
      <Panel header=">= 18 YEAR" :toggleable="true">
        <div>
          <div class="formgrid grid">
            <div class="field col">
              <label :for="complexProperty1[0].property">Property</label>
              <InputText
                :id="complexProperty1[0].property"
                type="text"
                v-model="complexProperty1[0].property"
                class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
              />
            </div>
            <div class="field col"></div>
          </div>
          <TestPropertyValue :property-value-pairs="complexProperty2[0].value" />
        </div>
        <Button label="Remove" />
      </Panel>
      <Panel header="Patient registered (finding)" :toggleable="true">
        <div class="formgrid grid">
          <div class="field col">
            <label :for="complexProperty2[0].property">Property</label>
            <InputText
              :id="complexProperty2[0].property"
              type="text"
              v-model="complexProperty2[0].property"
              class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
            />
          </div>
          <div class="field col"></div>
        </div>
        <TestPropertyValue :property-value-pairs="complexProperty2[0].value" />
        <Button label="Add" />
      </Panel>
      <Panel header="Hypertensive disorder, systemic arterial (disorder) (and more)" :toggleable="true">
        <div class="formgrid grid">
          <div class="field col">
            <label :for="complexProperty3[0].property">Property</label>
            <InputText
              :id="complexProperty3[0].property"
              type="text"
              v-model="complexProperty3[0].property"
              class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
            />
          </div>
          <div class="field col"></div>
        </div>
        <TestPropertyValue :property-value-pairs="complexProperty3[0].value" />
        <Button label="Add" />
      </Panel>
      <Button label="Add" />
    </TabPanel>
    <TabPanel header="Complex feature">
      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
        veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
        consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
      </p>
    </TabPanel>
  </TabView>
</template>

<script setup lang="ts">
import TestPropertyValue from "./TestPropertyValue.vue";
import { onMounted, watch, ref } from "vue";
const props = defineProps({
  propValue: { type: String, required: true }
});

const simpleProperty = [{ property: "Patient type", value: "Regular GMS patient" }];
const complexProperty1 = [
  {
    property: "Age",
    value: [
      { property: "comparison", value: ">=" },
      { property: "value", value: "18" },
      { property: "unitOfTime", value: "YEAR" }
    ]
  }
];

const complexProperty2 = [
  {
    property: "gpRegisteredStatus",
    value: [
      { property: "comparison", value: "<=" },
      { property: "value", value: "-1" },
      { property: "unitOfTime", value: "YEAR" },
      { property: "variable", value: "$referenceDate" }
    ]
  }
];

const complexProperty3 = [
  {
    property: "concept",
    value: [
      {
        property: "with",
        value: [
          {
            "@id": "http://snomed.info/sct#38341003",
            name: "Hypertensive disorder, systemic arterial (disorder)"
          },
          {
            "@id": "http://snomed.info/sct#59621000",
            name: "Essential hypertension (disorder)"
          }
        ]
      },
      {
        property: "value",
        value: [
          {
            "@id": "http://snomed.info/sct#38341003",
            name: "Hypertensive disorder, systemic arterial (disorder)"
          },
          {
            "@id": "http://snomed.info/sct#59621000",
            name: "Essential hypertension (disorder)"
          },
          {
            "@id": "http://snomed.info/sct#31992008",
            name: "Secondary hypertension (disorder)"
          },
          {
            "@id": "http://snomed.info/sct#31992008",
            name: "Secondary hypertension (disorder)"
          },
          {
            "@id": "http://snomed.info/sct#843821000000102",
            name: "Stage 1 hypertension (National Institute for Health and Clinical Excellence 2011) (disorder)"
          },
          {
            "@id": "http://snomed.info/sct#843841000000109",
            name: "Severe hypertension (National Institute for Health and Clinical Excellence 2011) (disorder)"
          },
          {
            "@id": "http://snomed.info/sct#845891000000103",
            name: "Hypertension resistant to drug therapy (disorder)"
          },
          {
            "@id": "http://snomed.info/sct#846371000000103",
            name: "Stage 2 hypertension (National Institute for Health and Clinical Excellence 2011) (disorder)"
          },
          {
            "@id": "http://snomed.info/sct#38341003",
            name: "Hypertensive disorder, systemic arterial (disorder)"
          },
          {
            "@id": "http://snomed.info/sct#38341003",
            name: "Hypertensive disorder, systemic arterial (disorder)"
          },
          {
            "@id": "http://snomed.info/sct#38341003",
            name: "Hypertensive disorder, systemic arterial (disorder)"
          }
        ]
      }
    ]
  }
];

watch(
  () => props.propValue,
  async newValue => {}
);

onMounted(async () => {});
</script>

<style scoped></style>
