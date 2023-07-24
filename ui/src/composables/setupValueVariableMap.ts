import { Ref, ref } from "vue";

export function setupValueVariableMap() {
  const valueVariableMap: Ref<Map<string, any>> = ref(new Map<string, any>());

  function updateValueVariableMap(key: string, value: any) {
    valueVariableMap.value.set(key, value);
  }
  return { valueVariableMap, updateValueVariableMap };
}
