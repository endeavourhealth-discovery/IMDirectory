<template>
  <div id="role-group-builder">
    <h2 v-if="shape.showTitle" class="title">{{ shape.name }}</h2>
    <div class="role-group-container">
      <ArrayBuilder :shape="arrayShape" :value="roleGroups" :mode="mode" />
    </div>
  </div>
</template>

<script lang="ts">
import ArrayBuilder from "./ArrayBuilder.vue";
import { EntityService } from "@/services";

defineComponent({
  components: { ArrayBuilder }
});
</script>

<script setup lang="ts">
import { EditorMode } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isTTIriRef } from "@im-library/helpers/TypeGuards";
import { PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import { IM, RDFS } from "@im-library/vocabulary";
import { isArray } from "lodash";
import { Ref, defineComponent, onMounted, ref } from "vue";

interface Props {
  shape: PropertyShape;
  mode: EditorMode;
  value?: any;
}

const props = defineProps<Props>();

const roleGroups: Ref<{ key: TTIriRef; value: TTIriRef[] }[]> = ref([]);
const loadingProperty = ref(false);
const loadingPropertyValue = ref(false);
const loading = ref(false);

const arrayShape = {
  label: "Property Group - Role group array builder",
  order: 1,
  maxCount: 1,
  showTitle: true,
  path: {
    "@id": IM.ROLE_GROUP
  },
  property: [
    {
      label: "Property Group - Role group component group",
      name: "Property refinement",
      order: 1,
      minCount: 1,
      componentType: {
        "@id": IM.component.COMPONENT_GROUP
      },
      path: {
        "@id": IM.ROLE_GROUP
      },
      property: [
        {
          comment: "selects a property from allowable range from selected concept",
          order: 1,
          select: [
            {
              "@id": IM.query.ALLOWABLE_PROPERTIES
            }
          ],
          builderChild: true,
          path: {
            "@id": "key"
          },
          argument: [
            {
              parameter: "this",
              valueVariable: "subClassOf"
            }
          ],
          name: "Property",
          showTitle: true,
          minCount: 1,
          componentType: {
            "@id": IM.component.ENTITY_AUTO_COMPLETE
          },
          valueVariable: "propertyIri"
        },
        {
          comment: "Selects a quantifier from allowable range from property",
          order: 1,
          select: [
            {
              "@id": IM.query.ALLOWABLE_RANGES
            }
          ],
          builderChild: true,
          path: {
            "@id": "value"
          },
          argument: [
            {
              parameter: "this",
              valueVariable: "propertyIri"
            }
          ],
          name: "Quantifier",
          showTitle: true,
          minCount: 1,
          componentType: {
            "@id": IM.component.ENTITY_AUTO_COMPLETE
          }
        }
      ]
    }
  ],
  name: "Role group",
  minCount: 0,
  componentType: {
    "@id": IM.component.ARRAY_BUILDER
  }
};

onMounted(async () => {
  await processProps();
});

async function processProps() {
  if (props.value) {
    if (isArrayHasLength(props.value)) {
      for (const role of props.value) {
        if (isObjectHasKeys(role, [IM.GROUP_NUMBER])) {
          for (const [key, value] of Object.entries(role)) {
            if (key !== IM.GROUP_NUMBER && isArray(value) && value.every(item => isTTIriRef(item))) {
              const keyName = await EntityService.getPartialEntity(key, [RDFS.LABEL]);
              roleGroups.value.push({ key: { "@id": key, name: keyName[RDFS.LABEL] ?? "" }, value: value[0] });
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped></style>
