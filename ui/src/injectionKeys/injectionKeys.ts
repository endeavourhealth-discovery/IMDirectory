import type { InjectionKey, Ref } from "vue";
const editorValidity = Symbol("editorValidity") as InjectionKey<{
  validity: Ref<{ key: string; valid: boolean }[]>;
  updateValidity: Function;
  removeValidity: Function;
  checkValidity: Function;
}>;
const editorEntity = Symbol("editorEntity") as InjectionKey<{ editorEntity: Ref<any>; updateEntity: Function; deleteEntityKey: Function }>;
const valueVariableMap = Symbol("valueVariableMap") as InjectionKey<{ valueVariableMap: Ref<Map<string, any>>; updateValueVariableMap: Function }>;
const forceValidation = Symbol("forceValidation") as InjectionKey<{
  forceValidation: Ref<boolean>;
  validationCheckStatus: Ref<{ key: string; checkCompleted: boolean }[]>;
  updateValidationCheckStatus: Function;
  addPropertyToValidationCheckStatus: Function;
  removeValidationCheckStatus: Function;
}>;

export default {
  editorValidity,
  editorEntity,
  valueVariableMap,
  forceValidation
};
