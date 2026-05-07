import { Ref, ref } from "vue";

import { isArrayHasLength } from "@endeavour/vue-library/helpers";
import type { PropertyShape } from "@endeavour/vue-library/interfaces";

export function useValueVariableMap() {
  const valueVariableMap: Ref<Map<string, any>> = ref(new Map<string, any>());

  function updateValueVariableMap(key: string, value: any) {
    valueVariableMap.value.set(key, value);
  }

  function valueVariableHasChanged(shape: PropertyShape, newVVMap: Ref<Map<string, any>>, oldVVMap: Ref<Map<string, any>>) {
    const valueVariables = shape.argument?.filter(arg => arg.valueVariable).map(v => v.valueVariable);
    if (valueVariables && isArrayHasLength(valueVariables)) {
      for (const variable of valueVariables as string[]) {
        if (newVVMap.value.has(variable) && newVVMap.value.get(variable)) {
          if ((oldVVMap.value.has(variable) && oldVVMap.value.get(variable) !== newVVMap.value.get(variable)) || !oldVVMap.value.has(variable)) return true;
        }
      }
    }
    return false;
  }
  return { valueVariableMap, updateValueVariableMap, valueVariableHasChanged };
}
