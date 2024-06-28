import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Ref } from "vue";
import Swal from "sweetalert2";
import { useToast } from "primevue/usetoast";
import _ from "lodash-es";

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
    if (
      dropzoneItem.conjunction === draggedItem.conjunction &&
      dropzoneItem.conceptSingle?.iri === draggedItem.conceptSingle?.iri &&
      dropzoneItem.constraintOperator === draggedItem.constraintOperator
    )
      toast.add({
        severity: "warn",
        summary: "Unable to drop",
        detail: "Can not drop item on itself.",
        life: 3000
      });
    else if (
      dropzoneItem.conjunction === draggedItemParent.conjunction &&
      dropzoneItem.conceptSingle?.iri === draggedItemParent.conceptSingle?.iri &&
      dropzoneItem.constraintOperator === draggedItemParent.constraintOperator
    )
      toast.add({
        severity: "warn",
        summary: "Unable to drop",
        detail: "Item is already part of that group.",
        life: 3000
      });
    else if (
      (draggedItem.type === "ExpressionConstraint" && dropzoneItem.type === "ExpressionConstraint") ||
      (draggedItem.type === "Refinement" && dropzoneItem.type === "Refinement")
    ) {
      group(draggedItem, _.cloneDeep(dropzoneItem), parent, index);
    } else if (
      (draggedItem.type === "ExpressionConstraint" && dropzoneItem.type === "BoolGroup") ||
      (draggedItem.type === "Refinement" && dropzoneItem.type === "BoolGroup") ||
      (draggedItem.type === "Refinement" && dropzoneItem.type === "ExpressionConstraint")
    ) {
      insert(draggedItem, dropzoneItem);
    } else if (draggedItem.type === "BoolGroup" && dropzoneItem.type === "BoolGroup") {
      Swal.fire({
        title: "Do you want to insert or merge?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Insert",
        denyButtonText: "Merge",
        denyButtonColor: "Green"
      }).then(result => {
        if (result.isConfirmed) {
          insert(draggedItem, dropzoneItem);
          if (isObjectHasKeys(parent, ["items"]) && isArrayHasLength(parent.items))
            parent.items = parent.items.filter(
              (parentItem: any) =>
                draggedItem.conjunction !== parentItem.conjunction ||
                draggedItem.conceptSingle !== parentItem.conceptSingle ||
                draggedItem.constraintOperator !== parentItem.constraintOperator
            );
        } else if (result.isDenied) {
          merge(draggedItem, dropzoneItem, parent);
          if (isObjectHasKeys(parent, ["items"]) && isArrayHasLength(parent.items))
            parent.items = parent.items.filter(
              (parentItem: any) =>
                draggedItem.conjunction !== parentItem.conjunction ||
                draggedItem.conceptSingle !== parentItem.conceptSingle ||
                draggedItem.constraintOperator !== parentItem.constraintOperator
            );
        }
      });
    } else {
      toast.add({
        severity: "warn",
        summary: "Unable to drop",
        detail: "Invalid dropzone. Valid dropzones are highlighted blocks and AND/OR buttons",
        life: 3000
      });
    }
  }

  function insert(draggedItem: any, dropzoneItem: any) {
    console.log("insert");
    if (!isArrayHasLength(dropzoneItem.items)) dropzoneItem.items = [];
    dropzoneItem.items.push(draggedItem);
    wasDraggedAndDropped.value = true;
  }

  function merge(draggedItem: any, dropzoneItem: any, parent: any, index?: number) {
    console.log("merge");
    const newBoolGroup = { type: "BoolGroup", conjunction: "OR", items: [] as any[] };
    newBoolGroup.items = draggedItem.items.concat(dropzoneItem.items);
    if (isObjectHasKeys(parent, ["items"]) && isArrayHasLength(parent.items)) {
      parent.items = parent.items.filter(
        (parentItem: any) =>
          dropzoneItem.conjunction !== parentItem.conjunction ||
          dropzoneItem.conceptSingle !== parentItem.conceptSingle ||
          dropzoneItem.constraintOperator !== parentItem.constraintOperator
      );
      parent.items.push(newBoolGroup);
      wasDraggedAndDropped.value = true;
    }
  }

  function group(draggedItem: any, dropzoneItem: any, parent: any, index?: number) {
    console.log("group");
    const conjunction = parent.conjunction === "OR" ? "AND" : "OR";
    const newBoolGroup = { type: "BoolGroup", conjunction: conjunction, items: [] as any[] };
    newBoolGroup.items.push(draggedItem);
    newBoolGroup.items.push(dropzoneItem);
    if (isObjectHasKeys(parent, ["items"]) && isArrayHasLength(parent.items)) {
      parent.items = parent.items.filter(
        (parentItem: any) =>
          dropzoneItem.conjunction !== parentItem.conjunction ||
          dropzoneItem.conceptSingle !== parentItem.conceptSingle ||
          dropzoneItem.constraintOperator !== parentItem.constraintOperator
      );
      if (index) parent.items.splice(index, 0, newBoolGroup);
      else parent.items.push(newBoolGroup);
      wasDraggedAndDropped.value = true;
    }
  }

  function onDragEnd(draggedItem: any, parent: any) {
    if (wasDraggedAndDropped.value && isObjectHasKeys(parent, ["items"])) {
      console.log(parent.items);
      parent.items = parent.items.filter(
        (parentItem: any) =>
          draggedItem.conjunction !== parentItem.conjunction &&
          draggedItem.conceptSingle !== parentItem.conceptSingle &&
          draggedItem.constraintOperator !== parentItem.constraintOperator
      );
    }
    console.log(parent.items);
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
