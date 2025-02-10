import { Ref, ref } from "vue";
import { FormGenerator } from "@/interfaces/AutoGen";

import { TTIriRef } from "@/interfaces/AutoGen";
import { EditorMode } from "@/enums";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { IM, RDF, RDFS } from "@/vocabulary";
import { useRoute, useRouter } from "vue-router";
import { PropertyShape } from "@/interfaces/AutoGen";
import editorShapes from "@/constants/editorShapes";

export function setupEditorShape() {
  const router = useRouter();
  const route = useRoute();
  let shape: Ref<FormGenerator | undefined> = ref();
  let targetShape: Ref<TTIriRef | undefined> = ref();
  let groups: Ref<PropertyShape[]> = ref([]);

  function getShapesCombined(types: TTIriRef[], primaryType?: TTIriRef) {
    let shapeCombined: FormGenerator = {} as FormGenerator;
    types = types.filter(item => item["@id"] !== RDFS.CLASS);
    if (primaryType) {
      types.sort(function (x, y) {
        return x["@id"] == primaryType["@id"] ? -1 : y["@id"] == primaryType["@id"] ? 1 : 0;
      });
    }
    for (const type of types) {
      const typeShape = getShape(type["@id"]);
      if (isObjectHasKeys(shapeCombined, ["property"])) addToShape(shapeCombined, typeShape);
      else shapeCombined = typeShape;
    }
    shape.value = { ...shapeCombined };
  }

  function addToShape(shape: FormGenerator, shapeToAdd: FormGenerator) {
    if (shapeToAdd.property && isArrayHasLength(shapeToAdd.property))
      for (const groupToAdd of shapeToAdd.property) {
        if (shape.property && !shape.property.some((group: PropertyShape) => group.path["@id"] === groupToAdd.path["@id"])) {
          groupToAdd.order = shape.property.length + 1;
          shape.property.push(groupToAdd);
        }
      }
  }

  function getShape(type: string): FormGenerator {
    let newShape = {};
    if (type !== RDFS.CLASS) newShape = getShapeFromType(type);
    return newShape;
  }

  function getShapeFromType(type: string) {
    const found = editorShapes.find(shape => shape.targetShape?.["@id"] === type);
    if (found) return found;
    else throw new Error("No editor shape found for type: " + type);
  }

  function processShape(shape: FormGenerator, mode: EditorMode, entity: any) {
    if (shape.property && shape.targetShape) {
      const validMappingSchemes = ["http://endhealth.info/emis#", "http://endhealth.info/tpp#"];
      if (shape.property.findIndex(property => property.path["@id"] === IM.MAPPED_TO) !== -1) {
        if (
          isObjectHasKeys(entity, [RDF.TYPE, IM.HAS_SCHEME]) &&
          entity[RDF.TYPE].findIndex((type: TTIriRef) => type["@id"] === IM.CONCEPT) !== -1 &&
          !validMappingSchemes.includes(entity[IM.HAS_SCHEME][0]["@id"])
        ) {
          shape.property.splice(
            shape.property.findIndex(property => property.path["@id"] === IM.MAPPED_TO),
            1
          );
        }
      }
      targetShape.value = shape.targetShape;
      groups.value = shape.property;
    }
  }

  function removeUrlSubroute(url: string) {
    const splitString = url.split("/");
    if (splitString.length >= 3) return splitString[0] + "/" + splitString[1] + "/" + splitString[2];
    else return url;
  }

  return {
    shape,
    targetShape,
    groups,
    addToShape,
    getShape,
    getShapesCombined,
    processShape
  };
}
