import { ECLComponentDetails } from "../../interfaces/index.js";
import { ECLComponent } from "../../enums/index.js";

export function generateNewComponent(type: ECLComponent, position: number, data: any, showButtons: { minus: boolean; plus: boolean }) {
  let result;
  switch (type) {
    case ECLComponent.LOGIC:
      result = {
        id: ECLComponent.LOGIC + "_" + position,
        value: data,
        position: position,
        type: ECLComponent.LOGIC,
        queryString: "",
        showButtons: showButtons
      };
      break;
    case ECLComponent.FOCUS_CONCEPT:
      result = {
        id: ECLComponent.FOCUS_CONCEPT + "_" + position,
        value: data,
        position: position,
        type: ECLComponent.FOCUS_CONCEPT,
        queryString: "",
        showButtons: showButtons
      };
      break;
    case ECLComponent.REFINEMENT_GROUP:
      result = {
        id: ECLComponent.REFINEMENT_GROUP + "_" + position,
        value: data,
        position: position,
        type: ECLComponent.REFINEMENT_GROUP,
        queryString: "",
        showButtons: showButtons
      };
      break;
    case ECLComponent.REFINEMENT:
      result = {
        id: ECLComponent.REFINEMENT + "_" + position,
        value: data,
        position: position,
        type: ECLComponent.REFINEMENT,
        queryString: "",
        showButtons: showButtons
      };
      break;
    case ECLComponent.OPERATOR:
      result = {
        id: ECLComponent.OPERATOR + "_" + position,
        value: data,
        position: position,
        type: ECLComponent.OPERATOR,
        queryString: "",
        showButtons: showButtons
      };
      break;
    case ECLComponent.CONSTRAINT:
      result = {
        id: ECLComponent.CONSTRAINT + "_" + position,
        value: data,
        position: position,
        type: ECLComponent.CONSTRAINT,
        queryString: "",
        showButtons: showButtons
      };
      break;
    case ECLComponent.EXPRESSION:
      result = {
        id: ECLComponent.EXPRESSION + "_" + position,
        value: data,
        position: position,
        type: ECLComponent.EXPRESSION,
        queryString: "",
        showButtons: showButtons
      };
      break;
    default:
      throw new Error(`ecl helper function generateNewComponent encountered an unexpected component type: ${type}`);
  }
  return result;
}

export function updatePositions(build: ECLComponentDetails[]) {
  build.forEach((item: ECLComponentDetails, index: number) => {
    item.position = index;
  });
}

export function updateItem(itemToUpdate: ECLComponentDetails, build: ECLComponentDetails[]) {
  const index = build.findIndex(buildItem => buildItem.position === itemToUpdate.position);
  build[index] = itemToUpdate;
}

export function scrollIntoView(component: ECLComponentDetails) {
  const itemToScrollTo = document.getElementById(component.id);
  itemToScrollTo?.scrollIntoView();
}

export function addItem(
  itemToAdd: { selectedType: ECLComponent; position: number; value: any },
  build: ECLComponentDetails[],
  showButtons: { minus: boolean; plus: boolean }
) {
  const newComponent = generateNewComponent(itemToAdd.selectedType, itemToAdd.position, itemToAdd.value, showButtons);
  if (!newComponent) return;
  build.splice(itemToAdd.position, 0, newComponent);
  updatePositions(build);
}

export default {
  generateNewComponent,
  updateItem,
  updatePositions,
  addItem,
  scrollIntoView
};
