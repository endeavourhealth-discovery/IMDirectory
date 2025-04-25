import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Ref, toRaw } from "vue";
import Swal from "sweetalert2";
import { useToast } from "primevue/usetoast";
import { cloneDeep } from "lodash-es";

function setupECLBuilderActions(wasDraggedAndDropped: Ref<boolean>) {
  const toast = useToast();

  function onDragStart(event: any, draggedItem: any, parent: any) {
    event.dataTransfer.setData("draggedItem", JSON.stringify({ draggedItem: draggedItem, draggedItemParent: parent }));
    event.dataTransfer.effectAllowed = "move";
  }

  function onDrop(event: any, dropzoneItem: any, parent: any, index?: number) {
    event.preventDefault();
    const draggedItemDataString = event.dataTransfer.getData("draggedItem");
    const { draggedItem, draggedItemParent } = JSON.parse(draggedItemDataString);
    console.log(`dropping ${draggedItem.type} to ${dropzoneItem.type}`);
    const rawDropzoneItem = toRaw(dropzoneItem);
    if (
      rawDropzoneItem.conjunction === draggedItem.conjunction &&
      rawDropzoneItem.conceptSingle?.iri === draggedItem.conceptSingle?.iri &&
      rawDropzoneItem.constraintOperator === draggedItem.constraintOperator
    )
      toast.add({
        severity: "warn",
        summary: "Unable to drop",
        detail: "Can not drop item on itself.",
        life: 3000
      });
    else if (
      rawDropzoneItem.conjunction === draggedItemParent.conjunction &&
      rawDropzoneItem.conceptSingle?.iri === draggedItemParent.conceptSingle?.iri &&
      rawDropzoneItem.constraintOperator === draggedItemParent.constraintOperator
    )
      toast.add({
        severity: "warn",
        summary: "Unable to drop",
        detail: "Item is already part of that group.",
        life: 3000
      });
    else if (
      (draggedItem.type === "ExpressionConstraint" && rawDropzoneItem.type === "ExpressionConstraint") ||
      (draggedItem.type === "Refinement" && rawDropzoneItem.type === "Refinement")
    ) {
      group(draggedItem, cloneDeep(dropzoneItem), parent, index);
    } else if (
      (draggedItem.type === "ExpressionConstraint" && rawDropzoneItem.type === "BoolGroup") ||
      (draggedItem.type === "Refinement" && rawDropzoneItem.type === "BoolGroup") ||
      (draggedItem.type === "Refinement" && rawDropzoneItem.type === "ExpressionConstraint")
    ) {
      insert(draggedItem, rawDropzoneItem);
    } else if (draggedItem.type === "BoolGroup" && rawDropzoneItem.type === "BoolGroup") {
      Swal.fire({
        title: "Do you want to insert or merge?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Insert",
        denyButtonText: "Merge",
        denyButtonColor: "Green"
      }).then(result => {
        if (result.isConfirmed) insert(draggedItem, rawDropzoneItem);
        else if (result.isDenied) merge(draggedItem, dropzoneItem, parent);
        if (isObjectHasKeys(parent, ["items"]) && isArrayHasLength(parent.items))
          parent.items = parent.items.filter(
            (parentItem: any) =>
              draggedItem.conjunction !== toRaw(parentItem.conjunction) ||
              JSON.stringify(draggedItem.conceptSingle) !== JSON.stringify(parentItem.conceptSingle) ||
              draggedItem.constraintOperator !== toRaw(parentItem.constraintOperator)
          );
      });
    } else {
      toast.add({
        severity: "warn",
        summary: "Unable to drop",
        detail: "Invalid dropzone. Valid dropzones are highlighted blocks and and/or buttons",
        life: 3000
      });
    }
  }

  function insert(draggedItem: any, dropzoneItem: any) {
    if (!isArrayHasLength(dropzoneItem.items)) dropzoneItem.items = [];
    dropzoneItem.items.push(draggedItem);
    wasDraggedAndDropped.value = true;
  }

  function merge(draggedItem: any, dropzoneItem: any, parent: any) {
    const newBoolGroup = { type: "BoolGroup", conjunction: "or", items: [] as any[] };
    newBoolGroup.items = draggedItem.items.concat(dropzoneItem.items);
    if (isObjectHasKeys(parent, ["items"]) && isArrayHasLength(parent.items)) {
      parent.items = parent.items.filter(
        (parentItem: any) =>
          dropzoneItem.conjunction !== toRaw(parentItem.conjunction) ||
          JSON.stringify(dropzoneItem.conceptSingle) !== JSON.stringify(parentItem.conceptSingle) ||
          dropzoneItem.constraintOperator !== toRaw(parentItem.constraintOperator)
      );
      parent.items.push(newBoolGroup);
      wasDraggedAndDropped.value = true;
    }
  }

  function group(draggedItem: any, dropzoneItem: any, parent: any, index?: number) {
    const conjunction = parent.conjunction === "or" ? "and" : "or";
    const newBoolGroup = { type: "BoolGroup", conjunction: conjunction, items: [] as any[] };
    newBoolGroup.items.push(draggedItem);
    newBoolGroup.items.push(dropzoneItem);
    if (isObjectHasKeys(parent, ["items"]) && isArrayHasLength(parent.items)) {
      parent.items = parent.items.filter((parentItem: any) => JSON.stringify(dropzoneItem) !== JSON.stringify(parentItem));
      if (index) parent.items.splice(index, 0, newBoolGroup);
      else parent.items.push(newBoolGroup);
      wasDraggedAndDropped.value = true;
    }
  }

  function onDragEnd(draggedItem: any, parent: any) {
    if (wasDraggedAndDropped.value && isObjectHasKeys(parent, ["items"])) {
      parent.items = parent.items.filter((parentItem: any) => JSON.stringify(draggedItem) !== JSON.stringify(parentItem));
    }
    wasDraggedAndDropped.value = false;
  }

  function onDragOver(event: any) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.effectAllowed = "move";
  }

  function onDragLeave(event: any) {
    event.preventDefault();
  }

  return {
    onDrop,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave
  };
}

export default setupECLBuilderActions;
