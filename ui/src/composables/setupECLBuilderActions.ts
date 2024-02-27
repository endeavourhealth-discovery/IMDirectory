import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Ref } from "vue";
import Swal from "sweetalert2";

function setupECLBuilderActions(wasDraggedAndDropped: Ref<boolean>) {
  function onDragStart(event: any, draggedItem: any) {
    console.log("onDragStart");
    event.dataTransfer.setData("draggedItem", JSON.stringify(draggedItem));
    event.dataTransfer.effectAllowed = "move";
  }

  function onDrop(event: any, dropzoneItem: any, parent: any, index?: number) {
    console.log("onDrop");
    const draggedItemString = event.dataTransfer.getData("draggedItem");
    const draggedItem = JSON.parse(draggedItemString);
    console.log(`dropping ${draggedItem.type} to ${dropzoneItem.type}`);

    if (dropzoneItem.ecl === draggedItem.ecl) console.log("Can not drop item on itself.");
    else if ((draggedItem.type === "Concept" && dropzoneItem.type === "Concept") || (draggedItem.type === "Refinement" && dropzoneItem.type === "Refinement")) {
      group(draggedItem, dropzoneItem, parent);
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
          parent.items = parent.items.filter((parentItem: any) => parentItem.ecl !== draggedItem.ecl);
          insert(draggedItem, dropzoneItem);
        } else if (result.isDenied) {
          parent.items = parent.items.filter((parentItem: any) => parentItem.ecl !== draggedItem.ecl);
          merge(draggedItem, dropzoneItem, parent);
        }
      });
    }
  }

  function insert(draggedItem: any, dropzoneItem: any) {
    if (!isArrayHasLength(dropzoneItem.items)) dropzoneItem.items = [];
    dropzoneItem.items.push(draggedItem);
    wasDraggedAndDropped.value = true;
  }

  function merge(draggedItem: any, dropzoneItem: any, parent: any) {
    const newBoolGroup = { type: "BoolGroup", conjunction: "OR", items: [] as any[] };
    newBoolGroup.items = draggedItem.items.concat(dropzoneItem.items);
    if (parent) {
      parent.items = parent.items.filter((parentItem: any) => parentItem.ecl !== dropzoneItem.ecl);
      parent.items.push(newBoolGroup);
    }
    wasDraggedAndDropped.value = true;
  }

  function group(draggedItem: any, dropzoneItem: any, parent: any) {
    const newBoolGroup = { type: "BoolGroup", conjunction: "OR", items: [] as any[] };
    newBoolGroup.items.push(draggedItem);
    newBoolGroup.items.push(dropzoneItem);
    if (parent) {
      parent.items = parent.items.filter((parentItem: any) => parentItem.ecl !== dropzoneItem.ecl);
      parent.items.push(newBoolGroup);
    }
    wasDraggedAndDropped.value = true;
  }

  function onDragEnd(draggedItem: any, parent: any) {
    console.log("onDragEnd", draggedItem);
    if (wasDraggedAndDropped.value) {
      parent.items = parent.items.filter((parentItem: any) => parentItem.ecl !== draggedItem.ecl);
      wasDraggedAndDropped.value = false;
    }
  }

  function onDragOver(event: any) {
    console.log("onDragOver");
    event.preventDefault();
    event.dataTransfer!.dropEffect = "move";
    event.dataTransfer!.effectAllowed = "move";
  }

  function onDragLeave(event: any) {
    event.preventDefault();
    console.log("onDragLeave");
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
