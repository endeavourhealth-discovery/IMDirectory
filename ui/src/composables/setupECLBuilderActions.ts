import { Ref, ref } from "vue";

// const { onDragEnd, onDragStart, onDrop } = setupECLBuilderActions();

// draggable="true"
// @drop="onDrop"
// @dragstart="onDragStart"
// @dragend="onDragEnd"
// @dragover="$event.preventDefault()"

function setupECLBuilderActions() {
  const allowDrop: Ref<boolean> = ref(true);
  const dragged: Ref<any> = ref({ match: [] as any[] } as any);
  const draggedParent: Ref<any> = ref({ match: [] as any[] } as any);

  function onDrop(type: string) {
    // console.log("onDrop");
    // const dataString = event.dataTransfer.getData("itemData");
    // const data = JSON.parse(dataString);
    // console.log(data);
    // console.log(item);
    // if (data.type === "Concept" && item.type === "Concept") {
    //   const newBoolGroup = { type: "BoolGroup", operator: "OR", items: [] as any[] };
    //   newBoolGroup.items.push(data);
    //   newBoolGroup.items.push(item);
    //   console.log(props.value.items);
    //   props.value.items = props.value.items.filter((parentItem: any) => parentItem.ecl !== data.ecl && parentItem.ecl !== item.ecl);
    //   props.value.items.push(newBoolGroup);
    // }
    console.log("onDrop", type);
  }

  function onDragStart(type: string) {
    // event.dataTransfer.setData("itemData", JSON.stringify(item));
    // console.log(item);
    console.log("onDragStart", type);
  }

  function onDragEnd(type: string) {
    console.log("onDragEnd", type);
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
    onDragEnd
  };
}

export default setupECLBuilderActions;
