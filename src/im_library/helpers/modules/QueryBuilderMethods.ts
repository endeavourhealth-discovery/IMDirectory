import { BuilderType } from "../../enums";
import { QueryComponentType } from "../../enums";
import { QueryComponentDetails, QueryNextComponentSummary } from "../../interfaces";

export function generateNewComponent(
  type: QueryComponentType,
  position: number,
  data: any,
  builderType: BuilderType,
  showButtons: { minus: boolean; plus: boolean }
) {
  let result;
  switch (type) {
    case QueryComponentType.LOGIC:
      result = {
        id: QueryComponentType.LOGIC + "_" + position,
        value: data,
        position: position,
        type: QueryComponentType.LOGIC,
        json: {},
        builderType: builderType,
        showButtons: showButtons
      };
      break;
    case QueryComponentType.MATCH:
      result = {
        id: QueryComponentType.MATCH + "_" + position,
        value: data,
        position: position,
        type: QueryComponentType.MATCH,
        json: {},
        builderType: builderType,
        showButtons: showButtons
      };
      break;
    case QueryComponentType.PROPERTY:
      result = {
        id: QueryComponentType.PROPERTY + "_" + position,
        value: data,
        position: position,
        type: QueryComponentType.PROPERTY,
        json: {},
        builderType: builderType,
        showButtons: showButtons
      };
      break;
    case QueryComponentType.ENTITY_TYPE:
      result = {
        id: QueryComponentType.ENTITY_TYPE + "_" + position,
        value: data,
        position: position,
        type: QueryComponentType.ENTITY_TYPE,
        json: {},
        builderType: builderType,
        showButtons: showButtons
      };
      break;
    case QueryComponentType.PROPERTY_GROUP:
      result = {
        id: QueryComponentType.PROPERTY_GROUP + "_" + position,
        value: data,
        position: position,
        type: QueryComponentType.PROPERTY_GROUP,
        json: {},
        builderType: builderType,
        showButtons: showButtons
      };
      break;
    case QueryComponentType.ENTITY:
      result = {
        id: QueryComponentType.ENTITY + "_" + position,
        value: data,
        position: position,
        type: QueryComponentType.ENTITY,
        json: {},
        builderType: builderType,
        showButtons: showButtons
      };
      break;
    default:
      throw new Error(`helper function generateNewComponent encountered an unexpected component type: ${type}`);
  }
  return result;
}

export function genNextOptions(position: number, previous: QueryComponentType, builderType: BuilderType, group?: QueryComponentType): QueryComponentDetails {
  return {
    id: "addNext_" + (position + 1),
    value: {
      previousPosition: position,
      previousComponentType: previous,
      parentGroup: group
    },
    position: position + 1,
    type: QueryComponentType.ADD_NEXT,
    json: {},
    builderType: builderType
  };
}

export function updatePositions(build: QueryComponentDetails[]) {
  build.forEach((item: QueryComponentDetails, index: number) => {
    item.position = index;
  });
}

export function updateItem(itemToUpdate: QueryComponentDetails, build: QueryComponentDetails[]) {
  const index = build.findIndex(buildItem => buildItem.position === itemToUpdate.position);
  build[index] = itemToUpdate;
}

export function addNextOptions(previousComponent: QueryNextComponentSummary, build: QueryComponentDetails[], builderType: BuilderType): QueryComponentDetails {
  const nextOptionsComponent = genNextOptions(
    previousComponent.previousPosition,
    previousComponent.previousComponentType,
    builderType,
    previousComponent.parentGroup
  );
  if (previousComponent.previousPosition !== build.length - 1 && build[previousComponent.previousPosition + 1].type === QueryComponentType.ADD_NEXT) {
    build[previousComponent.previousPosition + 1] = nextOptionsComponent;
  } else {
    build.splice(previousComponent.previousPosition + 1, 0, nextOptionsComponent);
  }
  updatePositions(build);
  return nextOptionsComponent;
}

export function scrollIntoView(component: QueryComponentDetails) {
  const itemToScrollTo = document.getElementById(component.id);
  itemToScrollTo?.scrollIntoView();
}

export function addItem(
  itemToAdd: { selectedType: QueryComponentType; position: number; value: any },
  build: QueryComponentDetails[],
  builderType: BuilderType,
  showButtons: { minus: boolean; plus: boolean }
) {
  const newComponent = generateNewComponent(itemToAdd.selectedType, itemToAdd.position, itemToAdd.value, builderType, showButtons);
  if (!newComponent) return;
  build.splice(itemToAdd.position, 0, newComponent);
  updatePositions(build);
}

export default {
  genNextOptions,
  generateNewComponent,
  updateItem,
  updatePositions,
  addItem,
  addNextOptions,
  scrollIntoView
};
