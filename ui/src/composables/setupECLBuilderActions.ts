import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { Ref } from "vue";
import Swal from "sweetalert2";
import { useToast } from "primevue/usetoast";

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

    if (dropzoneItem.ecl === draggedItem.ecl)
      toast.add({
        severity: "warn",
        summary: "Unable to drop",
        detail: "Can not drop item on itself.",
        life: 3000
      });
    else if (dropzoneItem.ecl === draggedItemParent.ecl)
      toast.add({
        severity: "warn",
        summary: "Unable to drop",
        detail: "Item is already part of that group.",
        life: 3000
      });
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
    const conjunction = parent.conjunction === "OR" ? "AND" : "OR";
    const newBoolGroup = { type: "BoolGroup", conjunction: conjunction, items: [] as any[] };
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
