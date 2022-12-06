import { ComponentType } from "../../enums/index.js";
import { PropertyShape, TTIriRef } from "../../interfaces/index.js";
import { IM } from "../../vocabulary/index.js";
import { isArrayHasLength } from "./DataTypeCheckers.js";

export function processArguments(property: PropertyShape, valueVariableMap?: Map<string, any>) {
  const result = new Map<string, any>();
  property.argument.forEach(arg => {
    let key = "";
    let value: any;
    if (arg.parameter === "this" && !arg.valueIri) key = property.path["@id"];
    else key = arg.parameter;
    if (arg.valueIri) value = arg.valueIri["@id"];
    else if (arg.valueVariable) {
      if (!valueVariableMap) throw new Error("missing valueVariableMap while processing arguments with a valueProperty");
      if (property.builderChild && valueVariableMap && valueVariableMap.has(arg.valueVariable + property.order)) {
        value = valueVariableMap.get(arg.valueVariable + property.order);
      } else {
        value = valueVariableMap.get(arg.valueVariable);
      }
    } else if (arg.valueData) value = arg.valueData;
    result.set(key, value);
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
    default:
      throw new Error("Invalid component type encountered while processing component types" + type["@id"]);
  }
}

export default { processArguments, processComponentType, getTreeQueryIri };
