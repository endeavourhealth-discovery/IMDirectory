import { ComponentType } from "../enums";
import { TTIriRef } from "../interfaces";
import { Argument, PropertyShape } from "../interfaces/AutoGen";
import { COMPONENT, IM } from "../vocabulary";
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

export function processComponentType(type: TTIriRef): any {
  switch (type["@id"]) {
    case COMPONENT.TEXT_DISPLAY:
      return ComponentType.TEXT_DISPLAY;
    case COMPONENT.TEXT_INPUT:
      return ComponentType.TEXT_INPUT;
    case COMPONENT.HTML_INPUT:
      return ComponentType.HTML_INPUT;
    case COMPONENT.ARRAY_BUILDER:
      return ComponentType.ARRAY_BUILDER;
    case COMPONENT.ENTITY_SEARCH:
      return ComponentType.ENTITY_SEARCH;
    case COMPONENT.ENTITY_COMBOBOX:
      return ComponentType.ENTITY_COMBOBOX;
    case COMPONENT.ENTITY_DROPDOWN:
      return ComponentType.ENTITY_DROPDOWN;
    case COMPONENT.ENTITY_AUTO_COMPLETE:
      return ComponentType.ENTITY_AUTO_COMPLETE;
    case COMPONENT.COMPONENT_GROUP:
      return ComponentType.COMPONENT_GROUP;
    case COMPONENT.MEMBERS_BUILDER:
      return ComponentType.MEMBERS_BUILDER;
    case COMPONENT.STEPS_GROUP:
      return ComponentType.STEPS_GROUP;
    case COMPONENT.SET_DEFINITION_BUILDER:
      return ComponentType.SET_DEFINITION_BUILDER;
    case COMPONENT.QUERY_DEFINITION_BUILDER:
      return ComponentType.QUERY_DEFINITION_BUILDER;
    case COMPONENT.ARRAY_BUILDER_WITH_DROPDOWN:
      return ComponentType.ARRAY_BUILDER_WITH_DROPDOWN;
    case COMPONENT.PROPERTY_BUILDER:
      return ComponentType.PROPERTY_BUILDER;
    case COMPONENT.TOGGLEABLE:
      return ComponentType.TOGGLEABLE_COMPONENT;
    case COMPONENT.HORIZONTAL_LAYOUT:
      return ComponentType.HORIZONTAL_LAYOUT;
    case COMPONENT.VERTICAL_LAYOUT:
      return ComponentType.VERTICAL_LAYOUT;
    case COMPONENT.DROPDOWN_TEXT_INPUT_CONCATENATOR:
      return ComponentType.DROPDOWN_TEXT_INPUT_CONCATENATOR;
    default:
      throw new Error("Invalid component type encountered while processing component types: " + type["@id"]);
  }
}

export default { processArguments, processComponentType, getTreeQueryIri };
