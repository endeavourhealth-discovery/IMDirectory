import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Ref } from "vue";
import Swal from "sweetalert2";

function setupECLBuilderActions(wasDraggedAndDropped: Ref<boolean>) {
  function onDragStart(event: any, draggedItem: any) {
    event.dataTransfer.setData("draggedItem", JSON.stringify(draggedItem));
    event.dataTransfer.effectAllowed = "move";
  }

  function onDrop(event: any, dropzoneItem: any, parent: any, index?: number) {
    event.preventDefault();
    const draggedItemString = event.dataTransfer.getData("draggedItem");
    const draggedItem = JSON.parse(draggedItemString);
    console.log(`dropping ${draggedItem.type} to ${dropzoneItem.type}`);

    if (dropzoneItem.ecl === draggedItem.ecl) console.warn("Can not drop item on itself.");
    else if ((draggedItem.type === "Concept" && dropzoneItem.type === "Concept") || (draggedItem.type === "Refinement" && dropzoneItem.type === "Refinement")) {
      group(draggedItem, dropzoneItem, parent, index);
    } else if (
      (draggedItem.type === "Concept" && dropzoneItem.type === "BoolGroup") ||
      (draggedItem.type === "Refinement" && dropzoneItem.type === "BoolGroup") ||
      (draggedItem.type === "Refinement" && dropzoneItem.type === "Concept")
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
            parent.items = parent.items.filter((parentItem: any) => parentItem.ecl !== draggedItem.ecl);
        } else if (result.isDenied) {
          merge(draggedItem, dropzoneItem, parent);
          if (isObjectHasKeys(parent, ["items"]) && isArrayHasLength(parent.items))
            parent.items = parent.items.filter((parentItem: any) => parentItem.ecl !== draggedItem.ecl);
        }
      });
    }
  }

  function insert(draggedItem: any, dropzoneItem: any) {
    if (!isArrayHasLength(dropzoneItem.items)) dropzoneItem.items = [];
    dropzoneItem.items.push(draggedItem);
    wasDraggedAndDropped.value = true;
  }

  function merge(draggedItem: any, dropzoneItem: any, parent: any, index?: number) {
    const newBoolGroup = { type: "BoolGroup", conjunction: "OR", items: [] as any[] };
    newBoolGroup.items = draggedItem.items.concat(dropzoneItem.items);
    if (isObjectHasKeys(parent, ["items"]) && isArrayHasLength(parent.items)) {
      parent.items = parent.items.filter((parentItem: any) => parentItem.ecl !== dropzoneItem.ecl);
      parent.items.push(newBoolGroup);
      wasDraggedAndDropped.value = true;
    }
  }

  function group(draggedItem: any, dropzoneItem: any, parent: any, index?: number) {
    const newBoolGroup = { type: "BoolGroup", conjunction: "OR", items: [] as any[] };
    newBoolGroup.items.push(draggedItem);
    newBoolGroup.items.push(dropzoneItem);
    if (isObjectHasKeys(parent, ["items"]) && isArrayHasLength(parent.items)) {
      parent.items = parent.items.filter((parentItem: any) => parentItem.ecl !== dropzoneItem.ecl);
      if (index) parent.items.splice(index, 0, newBoolGroup);
      else parent.items.push(newBoolGroup);
      wasDraggedAndDropped.value = true;
    }
  }

  function onDragEnd(draggedItem: any, parent: any) {
    if (wasDraggedAndDropped.value && isObjectHasKeys(parent, ["items"])) {
      parent.items = parent.items.filter((parentItem: any) => parentItem.ecl !== draggedItem.ecl);
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
