import { ComponentType } from "../enums/ComponentType";
import { NextComponentSummary, ComponentDetails } from "../interfaces";
import { EditorMode } from "../enums";
import { PropertyShape } from "../interfaces/AutoGen";

export function generateNewComponent(
  type: ComponentType,
  position: number,
  data: any,
  shape: PropertyShape,
  showButtons: { minus: boolean; plus: boolean; up: boolean; down: boolean },
  mode: EditorMode
): ComponentDetails {
  return {
    id: type + "_" + position,
    value: data,
    position: position,
    type: type,
    json: {},
    showButtons: showButtons,
    shape: shape,
    mode: mode
  };
}

export function genNextOptions(position: number, previous: ComponentType, shape: PropertyShape, mode: EditorMode, group?: ComponentType): ComponentDetails {
  return {
    id: "addNext_" + (position + 1),
    value: {
      previousPosition: position,
      previousComponentType: previous,
      parentGroup: group
    },
    position: position + 1,
    type: ComponentType.ADD_NEXT,
    json: {},
    shape: shape,
    mode: mode
  };
}

export function updatePositions(build: ComponentDetails[]) {
  build.forEach((item: ComponentDetails, index: number) => {
    item.position = index;
  });
}

export function updateItem(itemToUpdate: ComponentDetails, build: ComponentDetails[]) {
  const index = build.findIndex(buildItem => buildItem.position === itemToUpdate.position);
  build[index] = itemToUpdate;
}

export function addNextOptions(previousComponent: NextComponentSummary, build: ComponentDetails[], shape: PropertyShape, mode: EditorMode): ComponentDetails {
  const nextOptionsComponent = genNextOptions(
    previousComponent.previousPosition,
    previousComponent.previousComponentType,
    shape,
    mode,
    previousComponent.parentGroup
  );
  if (previousComponent.previousPosition !== build.length - 1 && build[previousComponent.previousPosition + 1].type === ComponentType.ADD_NEXT) {
    build[previousComponent.previousPosition + 1] = nextOptionsComponent;
  } else {
    build.splice(previousComponent.previousPosition + 1, 0, nextOptionsComponent);
  }
  updatePositions(build);
  return nextOptionsComponent;
}

export function scrollIntoView(component: ComponentDetails) {
  const itemToScrollTo = document.getElementById(component.id);
  itemToScrollTo?.scrollIntoView();
}

export function addItem(
  itemToAdd: { selectedType: ComponentType; position: number; value: any },
  build: ComponentDetails[],
  showButtons: { minus: boolean; plus: boolean; up: boolean; down: boolean },
  shape: PropertyShape,
  mode: EditorMode
) {
  const newComponent = generateNewComponent(itemToAdd.selectedType, itemToAdd.position, itemToAdd.value, shape, showButtons, mode);
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
