import { EntityService } from "@/services";
import { deferred } from "@/helpers/Deferred";
import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { isPropertyShape } from "@/helpers/TypeGuards";
import { FormGenerator, PropertyShape } from "@/interfaces/AutoGen";
import { IM, COMPONENT } from "@/vocabulary";
import { isArray } from "lodash-es";
import { Ref, ref } from "vue";

export function setupValidity(shape?: FormGenerator) {
  const editorValidity: Ref<{ key: string; valid: boolean; message?: string }[]> = ref([]);
  const validationCheckStatus: Ref<{ key: string; deferred: { promise: any; reject: any; resolve: any } }[]> = ref([]);

  constructValidationCheckStatus(shape);
  function constructValidationCheckStatus(shape?: FormGenerator) {
    validationCheckStatus.value = [];
    if (shape && shape.property) {
      for (const property of shape.property) {
        addPropertyToValidationCheckStatus(property);
      }
    }
  }

  function removeValidationCheckStatus(shape: PropertyShape) {
    if (shape && validationCheckStatus.value.findIndex(item => item.key === shape.path.iri) !== -1) {
      validationCheckStatus.value.splice(
        validationCheckStatus.value.findIndex(item => item.key === shape.path.iri),
        1
      );
    }
  }

  function clearValidationCheckStatus() {
    validationCheckStatus.value = [];
  }

  async function validationChecksCompleted(): Promise<boolean> {
    const promises = validationCheckStatus.value.map(v => v.deferred.promise);
    const result = await Promise.allSettled(promises)
      .then(result => {
        return result.every(r => r.status === "fulfilled");
      })
      .catch(err => {
        throw err;
      });
    return result;
  }

  function addPropertyToValidationCheckStatus(property: PropertyShape) {
    if (
      ![COMPONENT.HORIZONTAL_LAYOUT.valueOf(), COMPONENT.VERTICAL_LAYOUT.valueOf(), COMPONENT.TOGGLEABLE.valueOf()].includes(property.componentType.iri) &&
      validationCheckStatus.value.findIndex(check => check.key === property.path.iri) === -1
    ) {
      validationCheckStatus.value.push({
        key: property.path.iri,
        deferred: deferred(60000)
      });
    }
    if (property.componentType.iri !== COMPONENT.TOGGLEABLE)
      if (property.property) {
        for (const subProperty of property.property) {
          addPropertyToValidationCheckStatus(subProperty);
        }
      }
  }

  function updateValidationCheckStatus(key: string) {
    const found = validationCheckStatus.value.find(item => item.key === key);
    if (found) found.deferred.resolve("resolved");
  }

  async function checkValidity(
    componentShape: PropertyShape,
    editorEntity: Ref<any>,
    valueVariableMap: Ref<Map<string, any>>,
    key: string,
    invalid: Ref<boolean>,
    validationErrorMessage: Ref<string | undefined>
  ) {
    let valid = true;
    let message;
    if (isPropertyShape(componentShape) && isObjectHasKeys(componentShape, ["validation"]) && editorEntity.value) {
      const customValidationResult = await EntityService.checkValidation(componentShape.validation!.iri, editorEntity.value);
      if (customValidationResult.valid === false) {
        valid = false;
        message = customValidationResult.message;
      }
    }
    const defaultValidationResult = defaultValidation(componentShape, editorEntity, valueVariableMap, key);
    if (defaultValidationResult.isValid === false) {
      valid = false;
      message = defaultValidationResult.message;
    }
    invalid.value = !valid;
    validationErrorMessage.value = message;
  }

  async function updateValidity(
    componentShape: PropertyShape,
    editorEntity: Ref<any>,
    valueVariableMap: Ref<Map<string, any>>,
    key: string,
    invalid: Ref<boolean>,
    validationErrorMessage: Ref<string | undefined>
  ) {
    await checkValidity(componentShape, editorEntity, valueVariableMap, key, invalid, validationErrorMessage);
    const index = editorValidity.value.findIndex(item => item.key === key);
    if (index != -1) editorValidity.value[index] = { key: key, valid: !invalid.value, message: validationErrorMessage.value };
    else editorValidity.value.push({ key: key, valid: !invalid.value, message: validationErrorMessage.value });
  }

  function defaultValidation(
    shape: PropertyShape,
    editorEntity: any,
    valueVariableMap: Ref<Map<string, any>>,
    key: string
  ): { isValid: boolean; message?: string } {
    let valid = true;
    let message;
    if (shape.minCount && shape.minCount > 0) {
      if (!isObjectHasKeys(editorEntity.value, [key])) {
        valid = false;
        message = `A minimum of ${shape.minCount} is required.`;
      }
    }
    if (shape.maxCount && shape.maxCount > 0) {
      if (isObjectHasKeys(editorEntity.value, [key]) && isArray(editorEntity.value[key]) && editorEntity.value[key].length > shape.maxCount) {
        valid = false;
        message = `A maximum of ${shape.maxCount} is required.`;
      }
    }
    if (isObjectHasKeys(shape, ["argument"]) && isArrayHasLength(shape.argument) && shape.argument![0].valueVariable) {
      if (shape.builderChild) {
        if (!(valueVariableMap.value.has(shape.argument![0].valueVariable + shape.order) || valueVariableMap.value.has(shape.argument![0].valueVariable))) {
          valid = false;
          message = `Missing required related item: ${shape.argument![0].valueVariable}.`;
        }
      } else if (!valueVariableMap.value.has(shape.argument![0].valueVariable)) {
        valid = false;
        message = `Missing required related item: ${shape.argument![0].valueVariable}.`;
      }
    }
    return { isValid: valid, message: message };
  }

  function removeValidity(data: { key: string; valid: boolean; message?: string }) {
    const index = editorValidity.value.findIndex(item => (item.key = data.key));
    if (index != -1) editorValidity.value.splice(index, 1);
  }

  function isValidEntity(entity: any): boolean {
    return isObjectHasKeys(entity) && entity[IM.ID] && editorValidity.value.every(validity => validity.valid);
  }

  return {
    editorValidity,
    updateValidity,
    removeValidity,
    isValidEntity,
    constructValidationCheckStatus,
    validationCheckStatus,
    updateValidationCheckStatus,
    removeValidationCheckStatus,
    clearValidationCheckStatus,
    addPropertyToValidationCheckStatus,
    validationChecksCompleted,
    checkValidity
  };
}
