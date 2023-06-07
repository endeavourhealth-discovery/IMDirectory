import injectionKeys from "@/injectionKeys/injectionKeys";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
import { Ref, provide, ref } from "vue";

export function setupValidity() {
  const editorValidity: Ref<{ key: string; valid: boolean }[]> = ref([]);

  function updateValidity(data: { key: string; valid: boolean }) {
    const index = editorValidity.value.findIndex(item => item.key === data.key);
    if (index != -1) editorValidity.value[index] = data;
    else editorValidity.value.push(data);
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
