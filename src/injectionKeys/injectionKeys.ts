import { FormGenerator } from "@/interfaces/AutoGen";
import type { InjectionKey, Ref } from "vue";
const editorValidity = Symbol("editorValidity") as InjectionKey<{
  validity: Ref<{ key: string; valid: boolean }[]>;
  updateValidity: Function;
  removeValidity: Function;
  checkValidity: Function;
}>;
const editorEntity = Symbol("editorEntity") as InjectionKey<{ editorEntity: Ref<any>; updateEntity: Function; deleteEntityKey: Function }>;
const valueVariableMap = Symbol("valueVariableMap") as InjectionKey<{
  valueVariableMap: Ref<Map<string, any>>;
  updateValueVariableMap: Function;
  valueVariableHasChanged: Function;
}>;
const forceValidation = Symbol("forceValidation") as InjectionKey<{
  forceValidation: Ref<boolean>;
  validationCheckStatus: Ref<{ key: string; deferred: any }[]>;
  updateValidationCheckStatus: Function;
  addPropertyToValidationCheckStatus: Function;
  removeValidationCheckStatus: Function;
}>;
const fullShape = Symbol("fullShape") as InjectionKey<Ref<FormGenerator | undefined>>;

export default {
  editorValidity,
  editorEntity,
  valueVariableMap,
  forceValidation,
  fullShape
};
