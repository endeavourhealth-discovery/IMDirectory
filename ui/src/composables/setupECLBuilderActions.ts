import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Ref, ref } from "vue";
import Swal from "sweetalert2";
// const { onDragEnd, onDragStart, onDrop } = setupECLBuilderActions();

// draggable="true"
// @drop="onDrop"
// @dragstart="onDragStart"
// @dragend="onDragEnd"
// @dragover="$event.preventDefault()"

function setupECLBuilderActions(wasDraggedAndDropped: Ref<boolean>) {
  const allowDrop: Ref<boolean> = ref(true);
  const dragged: Ref<any> = ref({ match: [] as any[] } as any);
  const draggedParent: Ref<any> = ref({ match: [] as any[] } as any);

  function onDragStart(event: any, type: string, draggedItem: any, parent: any) {
    console.log("onDragStart", type, draggedItem);
    event.dataTransfer.setData("draggedItem", JSON.stringify({ draggedItem: draggedItem, draggedItemParent: parent }));
  }

  function onDrop(event: any, type: string, dropzoneItem: any, parent: any) {
    console.log("onDrop", type, dropzoneItem);
    const draggedItemDataString = event.dataTransfer.getData("draggedItem");
    const { draggedItem, draggedItemParent } = JSON.parse(draggedItemDataString);
    console.log(`dropping ${draggedItem.type} to ${dropzoneItem.type}`);

    if (dropzoneItem.ecl === draggedItem.ecl) console.log("Can not drop item on itself.");
    else if ((draggedItem.type === "Concept" && dropzoneItem.type === "Concept") || (draggedItem.type === "Refinement" && dropzoneItem.type === "Refinement")) {
      console.log("dropping concept to concept");
      group(draggedItem, dropzoneItem, parent);
    } else if (
      (draggedItem.type === "Concept" && dropzoneItem.type === "BoolGroup") ||
      (draggedItem.type === "Refinement" && dropzoneItem.type === "BoolGroup") ||
      (draggedItem.type === "Refinement" && dropzoneItem.type === "Concept")
    ) {
      console.log("dropping concept to boolgroup");
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

  function onDragEnd(event: any, type: string, draggedItem: any, parent: any) {
    console.log("onDragEnd", type, draggedItem);
    if (wasDraggedAndDropped.value) {
      parent.items = parent.items.filter((parentItem: any) => parentItem.ecl !== draggedItem.ecl);
      wasDraggedAndDropped.value = false;
    }
  }

  function onDragEnter(event: any, type: string, draggedItem: any, parent: any) {
    event.preventDefault();
    console.log("onDragEnter", event.srcElement);
    const element: Element | null = event.srcElement;
    if (element) element.classList.add("nested-div-hover");
  }

  function onDragLeave(event: any, type: string, draggedItem: any, parent: any) {
    event.preventDefault();
    console.log("onDragLeave", event.srcElement);
    const element: Element | null = event.srcElement;
    if (element) element.classList.remove("nested-div-hover");
  }

  function dragStart(event: any, data: any) {
    dragged.value = data;
    event.dataTransfer.setData("matchData", JSON.stringify(data));
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
  }

  function dragEnter(event: any, data: any, htmlId: string) {
    const element = document.getElementById(htmlId);
    if (element) element.classList.add("over");
    if (dragged.value !== data) {
      draggedParent.value = data;
      allowDrop.value = true;
    } else {
      allowDrop.value = false;
    }
  }

  function dragLeave(htmlId: string) {
    const element = document.getElementById(htmlId);
    if (element) element.classList.remove("over");
  }

  async function dragDrop(event: any, parentMatch: any, parentMatchList: any[], htmlId: string) {
    dragLeave(htmlId);
    const data = event.dataTransfer.getData("matchData");
    if (!allowDrop.value) {
      event.preventDefault();
    } else if (data && draggedParent.value && allowDrop.value) {
      if (draggedParent.value.match === undefined) {
        draggedParent.value.bool = "and";
        draggedParent.value.match = [];
      }
      const parsedMatchData = JSON.parse(data);
      draggedParent.value.match.push(parsedMatchData);
      const list = parentMatch?.match ?? parentMatchList!;
      const foundIndex = list.findIndex((match: any) => JSON.stringify(match) === JSON.stringify(parsedMatchData));
      if (foundIndex !== -1) {
        list.splice(foundIndex, 1);
      }
      draggedParent.value = {};
    }
  }

  return {
    onDrop,
    onDragStart,
    onDragEnd,
    onDragEnter,
    onDragLeave
  };
}

export default setupECLBuilderActions;
