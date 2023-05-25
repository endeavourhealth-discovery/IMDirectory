import { ComponentType } from "../enums";
import { Argument, PropertyShape, TTIriRef } from "../interfaces/AutoGen";
import { IM } from "../vocabulary";
import { isArrayHasLength } from "./DataTypeCheckers";

export function processArguments(property: PropertyShape, valueVariableMap?: Map<string, any>): Argument[] {
  const result: Argument[] = [];
  property.argument?.forEach(arg => {
    const argResult: any = {};
    for (const [key, value] of Object.entries(arg)) {
      if (key === "valueVariable") {
        let foundValueVariable: any = null;
        if (!valueVariableMap) throw new Error("missing valueVariableMap while processing arguments with a valueProperty");
        if (property.builderChild && valueVariableMap && valueVariableMap.has(value + property.order)) {
          foundValueVariable = valueVariableMap.get(value + property.order);
        } else if (valueVariableMap && valueVariableMap.has(value)) {
          foundValueVariable = valueVariableMap.get(value);
        }
        argResult[key] = foundValueVariable;
      } else {
        argResult[key] = value;
      }
    }
    result.push(argResult);
  });
  return result;
}

export function getTreeQueryIri(select: TTIriRef[]) {
  if (!isArrayHasLength(select) || select.length < 2) {
    return undefined;
  }
  return select[1]["@id"];
}

export function processComponentType(type: TTIriRef | undefined): any {
  if (!type) throw new Error("Invalid component type: undefined");
  switch (type["@id"]) {
    case IM.component.TEXT_DISPLAY:
      return ComponentType.TEXT_DISPLAY;
    case IM.component.TEXT_INPUT:
      return ComponentType.TEXT_INPUT;
    case IM.component.HTML_INPUT:
      return ComponentType.HTML_INPUT;
    case IM.component.ARRAY_BUILDER:
      return ComponentType.ARRAY_BUILDER;
    case IM.component.ENTITY_SEARCH:
      return ComponentType.ENTITY_SEARCH;
    case IM.component.ENTITY_COMBOBOX:
      return ComponentType.ENTITY_COMBOBOX;
    case IM.component.ENTITY_DROPDOWN:
      return ComponentType.ENTITY_DROPDOWN;
    case IM.component.ENTITY_AUTO_COMPLETE:
      return ComponentType.ENTITY_AUTO_COMPLETE;
    case IM.component.COMPONENT_GROUP:
      return ComponentType.COMPONENT_GROUP;
    case IM.component.MEMBERS_BUILDER:
      return ComponentType.MEMBERS_BUILDER;
    case IM.component.STEPS_GROUP:
      return ComponentType.STEPS_GROUP;
    case IM.component.SET_DEFINITION_BUILDER:
      return ComponentType.SET_DEFINITION_BUILDER;
    case IM.component.QUERY_DEFINITION_BUILDER:
      return ComponentType.QUERY_DEFINITION_BUILDER;
    case IM.component.ARRAY_BUILDER_WITH_DROPDOWN:
      return ComponentType.ARRAY_BUILDER_WITH_DROPDOWN;
    case IM.component.PROPERTY_BUILDER:
      return ComponentType.PROPERTY_BUILDER;
    case IM.component.TOGGLEABLE:
      return ComponentType.TOGGLEABLE_COMPONENT;
    case IM.component.HORIZONTAL_LAYOUT:
      return ComponentType.HORIZONTAL_LAYOUT;
    case IM.component.VERTICAL_LAYOUT:
      return ComponentType.VERTICAL_LAYOUT;
    case IM.component.DROPDOWN_TEXT_INPUT_CONCATENATOR:
      return ComponentType.DROPDOWN_TEXT_INPUT_CONCATENATOR;
    default:
      throw new Error("Invalid component type encountered while processing component types: " + type["@id"]);
  }
}

export default { processArguments, processComponentType, getTreeQueryIri };
