import { FormGenerator, PropertyShape } from "@/interfaces/AutoGen";
import type { InjectionKey, Ref } from "vue";
const editorValidity = Symbol("editorValidity") as InjectionKey<{
  validity: Ref<{ key: string; valid: boolean }[]>;
  updateValidity: (
    componentShape: PropertyShape,
    editorEntity: Ref<any>,
    valueVariableMap: Ref<Map<string, any>>,
    key: string,
    invalid: Ref<boolean>,
    validationErrorMessage: Ref<string | undefined>
  ) => Promise<void>;
  removeValidity: (data: { key: string; valid: boolean; message?: string }) => void;
  checkValidity: (
    componentShape: PropertyShape,
    editorEntity: Ref<any>,
    valueVariableMap: Ref<Map<string, any>>,
    key: string,
    invalid: Ref<boolean>,
    validationErrorMessage: Ref<string | undefined>
  ) => Promise<void>;
}>;
const editorEntity = Symbol("editorEntity") as InjectionKey<{
  editorEntity: Ref<any>;
  updateEntity: (data: any) => void;
  deleteEntityKey: (data: string) => void;
}>;
const valueVariableMap = Symbol("valueVariableMap") as InjectionKey<{
  valueVariableMap: Ref<Map<string, any>>;
  updateValueVariableMap: (key: string, value: any) => void;
  valueVariableHasChanged: (shape: PropertyShape, newVVMap: Ref<Map<string, any>>, oldVVMap: Ref<Map<string, any>>) => boolean;
}>;
const forceValidation = Symbol("forceValidation") as InjectionKey<{
  forceValidation: Ref<boolean>;
  validationCheckStatus: Ref<{ key: string; deferred: any }[]>;
  updateValidationCheckStatus: (key: string) => void;
  addPropertyToValidationCheckStatus: (property: PropertyShape) => void;
  removeValidationCheckStatus: (shape: PropertyShape) => void;
}>;
const fullShape = Symbol("fullShape") as InjectionKey<Ref<FormGenerator | undefined>>;

export default {
  editorValidity,
  editorEntity,
  valueVariableMap,
  forceValidation,
  fullShape
};
