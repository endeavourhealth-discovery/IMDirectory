import injectionKeys from "@/injectionKeys/injectionKeys";
import { QueryService } from "@/services";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { isPropertyShape } from "@im-library/helpers/TypeGuards";
import { PropertyShape } from "@im-library/interfaces/AutoGen";
import { IM } from "@im-library/vocabulary";
import { isArray } from "lodash";
import { Ref, provide, ref } from "vue";

export function setupValidity() {
  const editorValidity: Ref<{ key: string; valid: boolean }[]> = ref([]);

  async function updateValidity(componentShape: PropertyShape, editorEntity: Ref<any>, key: string, invalid: Ref<boolean>) {
    let valid = true;
    if (isPropertyShape(componentShape) && isObjectHasKeys(componentShape, ["validation"]) && editorEntity.value) {
      let customValidationResult = await QueryService.checkValidation(componentShape.validation!["@id"], editorEntity.value);
      if (customValidationResult === false) valid = false;
    }
    let defaultValidationResult = defaultValidation(componentShape, editorEntity, key);
    if (defaultValidationResult === false) valid = false;
    invalid.value = !valid;
    const index = editorValidity.value.findIndex(item => item.key === key);
    if (index != -1) editorValidity.value[index] = { key: key, valid: valid };
    else editorValidity.value.push({ key: key, valid: valid });
  }

  function defaultValidation(shape: PropertyShape, editorEntity: any, key: string): boolean {
    let valid = true;
    if (shape.minCount && shape.minCount > 0) {
      if (!isObjectHasKeys(editorEntity.value, [key])) valid = false;
    }
    if (shape.maxCount && shape.maxCount > 0) {
      if (isObjectHasKeys(editorEntity.value, [key]) && isArray(editorEntity.value[key]) && editorEntity.value[key].length > shape.maxCount) valid = false;
    }
    return valid;
  }

  function removeValidity(data: { key: string; valid: boolean }) {
    const index = editorValidity.value.findIndex(item => (item.key = data.key));
    if (index != -1) editorValidity.value.splice(index, 1);
  }

  function isValidEntity(entity: any): boolean {
    return isObjectHasKeys(entity) && entity[IM.ID] && editorValidity.value.every(validity => validity.valid);
  }

  return { editorValidity, updateValidity, removeValidity, isValidEntity };
}
