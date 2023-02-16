import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { ref } from "vue";

function setupDebounce() {
  const debounce = ref(0);

  function debounceFunction(functionToDebounce: Function, timeOut: number, functionParams?: any[]) {
    clearTimeout(debounce.value);
    if (functionParams) {
      if (isArrayHasLength(functionParams))
        debounce.value = window.setTimeout(() => {
          functionToDebounce.apply(null, functionParams);
        }, timeOut);
      else throw new Error(`Function params is not an array`);
    } else
      debounce.value = window.setTimeout(() => {
        functionToDebounce();
      }, timeOut);
  }

  return { debounceFunction };
}
export default setupDebounce;
