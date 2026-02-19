import { Match, Where } from "@/interfaces/AutoGen";

type DraggedItem = {
  clause: Match | Where;
  index: number;
  clauseType: string;
  parent: Match | Where | undefined;
};
let draggedItem: DraggedItem | undefined;

export function onDragStart(item: Match | Where, parent: Match | Where | undefined, index: number, clauseType: string) {
  draggedItem = { clause: item, parent: parent, index: index, clauseType: clauseType } as DraggedItem;
}

export function onDrop(event: any, dropzoneItem: Match | Where, parent: Match | Where | undefined, index: number, clauseType: string) {
  if (!draggedItem) return;
  if (draggedItem.clause.uuid === dropzoneItem.uuid) return;
  if (draggedItem.clauseType != clauseType) return;
  if (!draggedItem.parent || !parent) return;
  const oldParent = draggedItem.parent;
  const oldIndex = draggedItem.index;
  const oldList = oldParent.or || oldParent.and;
  const newList = parent.or || parent.and;
  if (!oldList || !newList) return;
  moveItem(oldList, oldIndex, newList, index);
  draggedItem = undefined;
  event.preventDefault();
}

function moveItem(source: Match[] | Where[], sourceIndex: number, target: Match[] | Where[], targetIndex: number) {
  const [item] = source.splice(sourceIndex, 1);
  target.splice(targetIndex, 0, item);
}

export function onDragEnd() {
  draggedItem = undefined;
}

export function onDragOver(event: any, clauseType: string) {
  if (draggedItem && draggedItem.clauseType !== clauseType) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  event.dataTransfer.effectAllowed = "move";
}

export function onDragLeave(event: any) {
  event.preventDefault();
}
