import { FormGenerator, PropertyShape } from "@/interfaces/AutoGen";
import { TTEntity } from "@/interfaces/ExtendedAutoGen";
import { GenericObject } from "@/interfaces/GenericObject";
import type { InjectionKey, Ref } from "vue";
const editorValidity = Symbol("editorValidity") as InjectionKey<{
  validity: Ref<{ key: string; valid: boolean }[]>;
  updateValidity: (
    componentShape: PropertyShape,
    editorEntity: Ref<TTEntity>,
    valueVariableMap: Ref<Map<string, GenericObject>>,
    key: string,
    invalid: Ref<boolean>,
    validationErrorMessage: Ref<string | undefined>
  ) => Promise<void>;
  removeValidity: (data: { key: string; valid: boolean; message?: string }) => void;
  checkValidity: (
    componentShape: PropertyShape,
    editorEntity: Ref<TTEntity>,
    valueVariableMap: Ref<Map<string, GenericObject>>,
    key: string,
    invalid: Ref<boolean>,
    validationErrorMessage: Ref<string | undefined>
  ) => Promise<void>;
}>;
const editorEntity = Symbol("editorEntity") as InjectionKey<{
  editorEntity: Ref<TTEntity>;
  updateEntity: (data: TTEntity) => void;
  deleteEntityKey: (data: string) => void;
}>;
const valueVariableMap = Symbol("valueVariableMap") as InjectionKey<{
  valueVariableMap: Ref<Map<string, any>>;
  updateValueVariableMap: (key: string, value: any) => void;
  valueVariableHasChanged: (shape: PropertyShape, newVVMap: Ref<Map<string, GenericObject>>, oldVVMap: Ref<Map<string, GenericObject>>) => boolean;
}>;
const forceValidation = Symbol("forceValidation") as InjectionKey<{
  forceValidation: Ref<boolean>;
  validationCheckStatus: Ref<{ key: string; deferred: GenericObject }[]>;
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
