import { computed, Ref, ref } from "vue";
import { FormGenerator, PropertyGroup, TTIriRef, Namespace } from "@im-library/interfaces";
import { EditorMode } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF, RDFS } from "@im-library/vocabulary";
import { EntityService } from "@/services";
import StepsGroup from "@/components/editor/StepsGroup.vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

export function setupShape() {
  const router = useRouter();
  const route = useRoute();
  let shape: Ref<FormGenerator | undefined> = ref();
  let targetShape: Ref<TTIriRef | undefined> = ref();
  let groups: Ref<PropertyGroup[]> = ref([]);
  let stepsItems: Ref<{ label: string; to: string }[]> = ref([]);

  async function getShapesCombined(types: TTIriRef[], primaryType?: TTIriRef) {
    let shapeCombined: FormGenerator = {} as FormGenerator;
    if (primaryType) {
      types.sort(function (x, y) {
        return x["@id"] == primaryType["@id"] ? -1 : y["@id"] == primaryType["@id"] ? 1 : 0;
      });
    }
    for (const type of types) {
      const typeShape = await getShape(type["@id"]);
      if (isObjectHasKeys(shapeCombined, ["group"])) addToShape(shapeCombined, typeShape);
      else shapeCombined = typeShape;
    }
    shape.value = { ...shapeCombined };
  }

  function addToShape(shape: FormGenerator, shapeToAdd: FormGenerator) {
    if (isArrayHasLength(shapeToAdd.group))
      for (const groupToAdd of shapeToAdd.group) {
        if (!shape.group.some((group: PropertyGroup) => group.path["@id"] === groupToAdd.path["@id"])) {
          groupToAdd.order = shape.group.length + 1;
          shape.group.push(groupToAdd);
        }
      }
  }

  async function getShape(type: string): Promise<any> {
    let newShape = {};
    const shapeIri = await EntityService.getShapeFromType(type);
    if (isObjectHasKeys(shapeIri)) newShape = await EntityService.getShape(shapeIri["@id"]);
    return newShape;
  }

  function processShape(shape: FormGenerator, mode: EditorMode, entity: any) {
    if (shape.group && shape.targetShape) {
      const validMappingSchemes = ["http://endhealth.info/emis#", "http://endhealth.info/tpp#"];
      if (shape.group.findIndex(group => group.path["@id"] === IM.MAPPED_TO) !== -1) {
        if (
          isObjectHasKeys(entity, [RDF.TYPE, IM.SCHEME]) &&
          entity[RDF.TYPE].findIndex((type: TTIriRef) => type["@id"] === IM.CONCEPT) !== -1 &&
          !validMappingSchemes.includes(entity[IM.SCHEME][0]["@id"])
        ) {
          shape.group.splice(
            shape.group.findIndex(group => group.path["@id"] === IM.MAPPED_TO),
            1
          );
        }
      }
      targetShape.value = shape.targetShape;
      groups.value = shape.group;
      if (mode === EditorMode.EDIT) setEditorSteps();
      if (mode === EditorMode.CREATE) setCreatorSteps();
    }
  }

  function setEditorSteps() {
    stepsItems.value = [];
    const editorRoute = router.options.routes.find(r => r.name === "Editor");
    const currentPath = removeUrlSubroute(route.fullPath);
    if (editorRoute) {
      groups.value.forEach(group => {
        const component = processComponentType(group.componentType);
        if (editorRoute.children?.findIndex(route => route.name === group.name) === -1) {
          editorRoute.children?.push({ path: group.name, name: group.name, component: component });
        }
        stepsItems.value.push({ label: group.name, to: currentPath + "/" + group.name });
      });
      router.addRoute(editorRoute);
    }
  }

  function setCreatorSteps() {
    stepsItems.value = [];
    stepsItems.value.push({ label: "Type", to: "/creator/type" });
    const creatorRoute = router.options.routes.find(r => r.name === "Creator");
    if (creatorRoute) {
      groups.value.forEach(group => {
        const component = processComponentType(group.componentType);
        if (creatorRoute.children?.findIndex(route => route.name === group.name) === -1) {
          creatorRoute.children?.push({ path: group.name, name: group.name, component: component });
        }
        stepsItems.value.push({ label: group.name, to: "/creator/" + group.name });
      });
      router.addRoute(creatorRoute);
    }
  }

  function removeUrlSubroute(url: string) {
    const splitString = url.split("/");
    if (splitString.length >= 3) return splitString[0] + "/" + splitString[1] + "/" + splitString[2];
    else return url;
  }

  function processComponentType(type: TTIriRef) {
    switch (type["@id"]) {
      case IM.STEPS_GROUP_COMPONENT:
        return StepsGroup;
      default:
        throw new Error("Invalid component type encountered in shape group" + type["@id"]);
    }
  }

  return {
    shape,
    targetShape,
    groups,
    addToShape,
    getShape,
    getShapesCombined,
    stepsItems,
    processShape,
    setEditorSteps,
    setCreatorSteps,
    processComponentType
  };
}

export function setupEntity() {
  const store = useStore();
  let editorEntityOriginal: Ref<any> = ref({});
  let editorEntity: Ref<any> = ref({});
  let entityName = ref("");

  const editorIri = computed(() => store.state.editorIri).value;
  const editorSavedEntity = computed(() => store.state.editorSavedEntity).value;
  const hasType = computed<boolean>(() => {
    return isObjectHasKeys(editorEntity.value, [RDF.TYPE]) && isArrayHasLength(editorEntity.value[RDF.TYPE]);
  });

  async function fetchEntity(): Promise<void> {
    if (editorIri) {
      if (isObjectHasKeys(editorSavedEntity, ["@id"]) && editorSavedEntity[IM.ID] === editorIri) {
        editorEntity.value = editorSavedEntity;
        return;
      }
      const fullEntity = await EntityService.getFullEntity(editorIri);
      if (isObjectHasKeys(fullEntity)) {
        const processedEntity = processEntity(fullEntity);
        editorEntityOriginal.value = processedEntity;
        editorEntity.value = { ...editorEntityOriginal.value };
        entityName.value = editorEntityOriginal.value[RDFS.LABEL];
      }
    }
  }

  function processEntity(entity: any) {
    const result = { ...entity } as any;
    if (isObjectHasKeys(result, ["@id"])) {
      result[IM.ID] = result["@id"];
      delete result["@id"];
    }
    if (isObjectHasKeys(result, [IM.IM_1_ID])) delete result[IM.IM_1_ID];
    if (isObjectHasKeys(result, [IM.IM_1_SCHEME])) delete result[IM.IM_1_SCHEME];
    return result;
  }

  return { editorEntity, editorEntityOriginal, fetchEntity, processEntity, editorIri, editorSavedEntity, entityName, hasType };
}
