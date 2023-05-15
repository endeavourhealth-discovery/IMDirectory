import { Ref, ref } from "vue";
import { FormGenerator } from "@im-library/interfaces";

import { TTIriRef } from "@im-library/interfaces/AutoGen";
import { EditorMode } from "@im-library/enums";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM, RDF } from "@im-library/vocabulary";
import { EntityService } from "@/services";
import StepsGroup from "@/components/editor/StepsGroup.vue";
import { useRoute, useRouter } from "vue-router";
import { PropertyShape } from "@im-library/interfaces/AutoGen";

export function setupEditorShape() {
  const router = useRouter();
  const route = useRoute();
  let shape: Ref<FormGenerator | undefined> = ref();
  let targetShape: Ref<TTIriRef | undefined> = ref();
  let groups: Ref<PropertyShape[]> = ref([]);
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
      if (isObjectHasKeys(shapeCombined, ["property"])) addToShape(shapeCombined, typeShape);
      else shapeCombined = typeShape;
    }
    shape.value = { ...shapeCombined };
  }

  function addToShape(shape: FormGenerator, shapeToAdd: FormGenerator) {
    if (isArrayHasLength(shapeToAdd.property))
      for (const groupToAdd of shapeToAdd.property) {
        if (!shape.property.some((group: PropertyShape) => group.path["@id"] === groupToAdd.path["@id"])) {
          groupToAdd.order = shape.property.length + 1;
          shape.property.push(groupToAdd);
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
    if (shape.property && shape.targetShape) {
      const validMappingSchemes = ["http://endhealth.info/emis#", "http://endhealth.info/tpp#"];
      if (shape.property.findIndex(property => property.path["@id"] === IM.MAPPED_TO) !== -1) {
        if (
          isObjectHasKeys(entity, [RDF.TYPE, IM.SCHEME]) &&
          entity[RDF.TYPE].findIndex((type: TTIriRef) => type["@id"] === IM.CONCEPT) !== -1 &&
          !validMappingSchemes.includes(entity[IM.SCHEME][0]["@id"])
        ) {
          shape.property.splice(
            shape.property.findIndex(property => property.path["@id"] === IM.MAPPED_TO),
            1
          );
        }
      }
      targetShape.value = shape.targetShape;
      groups.value = shape.property;
      // if (mode === EditorMode.EDIT) setEditorSteps();
      // if (mode === EditorMode.CREATE) setCreatorSteps();
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
