import { ComponentType } from "../enums";
import { TTIriRef } from "../interfaces";
import { Argument, PropertyShape } from "../models/AutoGen";
import { IM } from "../vocabulary";
import { isArrayHasLength } from "./DataTypeCheckers";

export function processArguments(property: PropertyShape, valueVariableMap?: Map<string, any>): Argument[] {
  const result: Argument[] = [];
  property.argument.forEach(arg => {
    const argResult: any = {};
    for (const [key, value] of Object.entries(arg)) {
      if (key === "valueVariable") {
        let foundValueVariable: any = null;
        if (!valueVariableMap) throw new Error("missing valueVariableMap while processing arguments with a valueProperty");
        if (property.builderChild && valueVariableMap && valueVariableMap.has(value + property.order)) {
          foundValueVariable = valueVariableMap.get(value + property.order);
        } else {
          foundValueVariable = valueVariableMap.get(value as any);
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

export function processComponentType(type: TTIriRef): any {
  switch (type["@id"]) {
    case IM.TEXT_DISPLAY_COMPONENT:
      return ComponentType.TEXT_DISPLAY;
    case IM.TEXT_INPUT_COMPONENT:
      return ComponentType.TEXT_INPUT;
    case IM.HTML_INPUT_COMPONENT:
      return ComponentType.HTML_INPUT;
    case IM.ARRAY_BUILDER_COMPONENT:
      return ComponentType.ARRAY_BUILDER;
    case IM.ENTITY_SEARCH_COMPONENT:
      return ComponentType.ENTITY_SEARCH;
    case IM.ENTITY_COMBOBOX_COMPONENT:
      return ComponentType.ENTITY_COMBOBOX;
    case IM.ENTITY_DROPDOWN_COMPONENT:
      return ComponentType.ENTITY_DROPDOWN;
    case IM.ENTITY_AUTO_COMPLETE_COMPONENT:
      return ComponentType.ENTITY_AUTO_COMPLETE;
    case IM.COMPONENT_GROUP:
      return ComponentType.COMPONENT_GROUP;
    case IM.MEMBERS_BUILDER:
      return ComponentType.MEMBERS_BUILDER;
    case IM.STEPS_GROUP_COMPONENT:
      return ComponentType.STEPS_GROUP;
    case IM.SET_DEFINITION_BUILDER:
      return ComponentType.SET_DEFINITION_BUILDER;
    case IM.QUERY_DEFINITION_BUILDER:
      return ComponentType.QUERY_DEFINITION_BUILDER;
    case IM.ARRAY_BUILDER_WITH_DROPDOWN:
      return ComponentType.ARRAY_BUILDER_WITH_DROPDOWN;
    case IM.PROPERTY_BUILDER:
      return ComponentType.PROPERTY_BUILDER;
    case IM.TOGGLEABLE_COMPONENT:
      return ComponentType.TOGGLEABLE_COMPONENT;
    case IM.HORIZONTAL_LAYOUT:
      return ComponentType.HORIZONTAL_LAYOUT;
    case IM.VERTICAL_LAYOUT:
      return ComponentType.VERTICAL_LAYOUT;
    case IM.DROPDOWN_TEXT_INPUT_CONCATENATOR:
      return ComponentType.DROPDOWN_TEXT_INPUT_CONCATENATOR;
    default:
      throw new Error("Invalid component type encountered while processing component types" + type["@id"]);
  }
}

export default { processArguments, processComponentType, getTreeQueryIri };
