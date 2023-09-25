import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { SelectedMatch } from "@im-library/interfaces";
import { Match } from "@im-library/interfaces/AutoGen";
import { Ref, ref } from "vue";
import { cloneDeep } from "lodash";
import { v4 } from "uuid";

function setupQueryBuilderActions() {
  const showViewDialog: Ref<boolean> = ref(false);
  const showAddDialog: Ref<boolean> = ref(false);
  const showKeepAsDialog: Ref<boolean> = ref(false);
  const showAddBaseTypeDialog: Ref<boolean> = ref(false);
  const showDirectoryDialog: Ref<boolean> = ref(false);
  const allowDrop: Ref<boolean> = ref(true);
  const dragged: Ref<any> = ref({ match: [] as Match[] } as Match);
  const draggedParent: Ref<any> = ref({ match: [] as Match[] } as Match);
  const addMode: Ref<"editProperty" | "addBefore" | "addAfter"> = ref("addAfter");

  function addOrEdit(match: Match, parentMatchList: Match[] | undefined, index: number, direct: Match[], nested: Match[]) {
    switch (addMode.value) {
      case "editProperty":
        if (!isArrayHasLength(match.property) || !isArrayHasLength(direct)) match.property = [];
        if (isArrayHasLength(parentMatchList))
          for (const newMatch of direct) {
            parentMatchList?.push(newMatch);
          }

        if (!isArrayHasLength(match.match) && isArrayHasLength(nested)) match.match = [];
        for (const newMatch of nested) {
          match.match!.push(newMatch);
        }
        break;

      case "addAfter":
        if (isArrayHasLength(parentMatchList))
          for (const newMatch of direct.concat(nested)) {
            parentMatchList!.splice(index + 1, 0, newMatch);
          }
        break;

      case "addBefore":
        if (isArrayHasLength(parentMatchList))
          for (const newMatch of direct.concat(nested)) {
            parentMatchList!.splice(index, 0, newMatch);
          }
        break;

      default:
        break;
    }
  }

  function updateProperties(match: Match, updatedMatch: Match) {
    const copy = cloneDeep(match.property);
    match.property = [];
    if (isArrayHasLength(updatedMatch.property))
      for (const updatedProperty of updatedMatch.property!) {
        const found = copy?.find(prop => prop["@id"] === updatedProperty["@id"]);
        if (found) match.property.push(found);
        else match.property.push(updatedProperty);
      }

    showAddDialog.value = false;
  }

  function view() {
    showViewDialog.value = true;
  }

  function keepAs() {
    showKeepAsDialog.value = true;
  }

  function moveUp(matchIndex: number, matches: Match[]) {
    if (isArrayHasLength(matches) && matchIndex !== 0) {
      matches.splice(matchIndex - 1, 0, matches[matchIndex]);
      matches.splice(matchIndex + 1, 1);
    }
  }

  function moveDown(matchIndex: number, matches: Match[]) {
    if (isArrayHasLength(matches) && matchIndex !== matches.length - 1) {
      matches.splice(matchIndex + 2, 0, matches[matchIndex]);
      matches.splice(matchIndex, 1);
    }
  }

  function remove(matchIndex: number, matches: Match[], parent: Match) {
    if (isArrayHasLength(matches)) {
      matches.splice(matchIndex, 1);
    } else if (isArrayHasLength(parent.property) && parent.property?.length === 1) {
      parent.property.splice(0, 1);
    }
  }

  function group(selectedMatches: SelectedMatch[], parentMatch: Match[] | undefined, matches: Match[]) {
    let index = selectedMatches[0].index;
    let initialParent = selectedMatches[0].parent;
    const groupedMatch = { "@id": v4(), bool: "and", match: [] } as Match;

    for (const selectedMatch of selectedMatches) {
      if (selectedMatch.parent !== initialParent) {
        return;
      }
      if (selectedMatch.index < index) index = selectedMatch.index;
      groupedMatch.match!.push(selectedMatch.selected);
    }

    if (isArrayHasLength(parentMatch)) {
      groupedMatch.match?.sort((a, b) => parentMatch!.indexOf(a) - parentMatch!.indexOf(b));
      parentMatch!.splice(index, 0, groupedMatch);
    } else {
      groupedMatch.match!.sort((a, b) => matches.indexOf(a) - matches.indexOf(b));
      matches.splice(index, 0, groupedMatch);
    }

    for (const selectedMatch of selectedMatches) {
      if (isArrayHasLength(parentMatch)) {
        parentMatch!.splice(
          parentMatch!.findIndex(match => match["@id"] === selectedMatch.selected["@id"]),
          1
        );
      } else {
        matches.splice(
          matches.findIndex(match => match["@id"] === selectedMatch.selected["@id"]),
          1
        );
      }
    }
  }

  function ungroup(index: number, selectedMatches: SelectedMatch[], parentMatch: Match, matches: Match[]) {
    for (const selectedMatch of selectedMatches) {
      if (isArrayHasLength(selectedMatch.selected.match)) {
        if (index !== -1) matches.splice(index, 1);
        for (const nestedMatch of selectedMatch.selected.match!.reverse()) {
          const unnestedMatch = { "@id": v4(), bool: "and", match: [nestedMatch] } as Match;
          matches.splice(index, 0, unnestedMatch);
        }
      }
    }
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

  async function dragDrop(event: any, parentMatch: Match, parentMatchList: Match[], htmlId: string) {
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
      const foundIndex = list.findIndex(match => JSON.stringify(match) === JSON.stringify(parsedMatchData));
      if (foundIndex !== -1) {
        list.splice(foundIndex, 1);
      }
      draggedParent.value = {};
    }
  }

  function select(event: any, isSelected: boolean, selectedMatches: SelectedMatch[], match: Match, index: number, parentMatch?: Match, parentList?: Match[]) {
    event.stopPropagation();
    const selectedMatch = { index: index, selected: match } as SelectedMatch;
    if (parentMatch) selectedMatch.parent = parentMatch;
    else if (parentList) selectedMatch.parentList = parentList;

    if (event.ctrlKey || event.metaKey) {
      if (!isSelected) {
        selectedMatches.push(selectedMatch);
      } else {
        const foundIndex = selectedMatches.findIndex(selectedMatch => selectedMatch.selected["@id"] === match["@id"]);
        if (foundIndex !== -1) {
          selectedMatches.splice(foundIndex, 1);
        }
      }
    } else {
      selectedMatches.length = 0;
      selectedMatches.push(selectedMatch);
    }
  }

  return {
    addOrEdit,
    updateProperties,
    view,
    keepAs,
    moveUp,
    moveDown,
    remove,
    group,
    ungroup,
    dragStart,
    dragLeave,
    dragEnter,
    dragDrop,
    select,
    showViewDialog,
    showAddDialog,
    showKeepAsDialog,
    showDirectoryDialog,
    showAddBaseTypeDialog,
    addMode
  };
}

export default setupQueryBuilderActions;
