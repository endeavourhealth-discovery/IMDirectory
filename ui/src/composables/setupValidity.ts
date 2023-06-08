import injectionKeys from "@/injectionKeys/injectionKeys";
import { QueryService } from "@/services";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isPropertyShape } from "@im-library/helpers/TypeGuards";
import { PropertyShape } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import { isArray } from "lodash";
import { Ref, provide, ref } from "vue";

export function setupValidity() {
  const editorValidity: Ref<{ key: string; valid: boolean; message?: string }[]> = ref([]);

  async function updateValidity(
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
      let customValidationResult = await QueryService.checkValidation(componentShape.validation!["@id"], editorEntity.value);
      if (customValidationResult.isValid === false) {
        valid = false;
        message = customValidationResult.message;
      }
    }
    let defaultValidationResult = defaultValidation(componentShape, editorEntity, valueVariableMap, key);
    if (defaultValidationResult.isValid === false) {
      valid = false;
      message = defaultValidationResult.message;
    }
    invalid.value = !valid;
    validationErrorMessage.value = message;
    const index = editorValidity.value.findIndex(item => item.key === key);
    if (index != -1) editorValidity.value[index] = { key: key, valid: valid, message: message };
    else editorValidity.value.push({ key: key, valid: valid, message: message });
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
        message = `A maximum of ${shape.maxCount} is required`;
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

  return { editorValidity, updateValidity, removeValidity, isValidEntity };
}
