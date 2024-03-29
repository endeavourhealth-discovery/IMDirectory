import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { SelectedMatch } from "@im-library/interfaces";
import { Bool, Match } from "@im-library/interfaces/AutoGen";
import { Ref, ref } from "vue";
import { v4 } from "uuid";

function setupQueryBuilderActions() {
  const showUpdateDialog: Ref<boolean> = ref(false);
  const showViewDialog: Ref<boolean> = ref(false);
  const showBuildFeatureAfterDialog: Ref<boolean> = ref(false);
  const showAddFeatureAfterDialog: Ref<boolean> = ref(false);
  const showAddFeatureBeforeDialog: Ref<boolean> = ref(false);
  const showAddTestFeatureDialog: Ref<boolean> = ref(false);
  const showAddPopulationAfterDirectoryDialog: Ref<boolean> = ref(false);
  const showAddPopulationBeforeDirectoryDialog: Ref<boolean> = ref(false);
  const showSaveFeatureDialog: Ref<boolean> = ref(false);
  const showKeepAsDialog: Ref<boolean> = ref(false);
  const showAddBaseTypeDialog: Ref<boolean> = ref(false);
  const allowDrop: Ref<boolean> = ref(true);
  const dragged: Ref<any> = ref({ match: [] as Match[] } as Match);
  const draggedParent: Ref<any> = ref({ match: [] as Match[] } as Match);

  function addThenMatch(match: Match, newMatches: Match[]) {
    if (isArrayHasLength(newMatches)) {
      if (!isObjectHasKeys(match.then) && newMatches.length === 1) match.then = newMatches[0];
      else if (isObjectHasKeys(match.then)) {
        if (isObjectHasKeys(match.then, ["match"]) && isArrayHasLength(match.then?.match)) {
          match.then!.match = match.then?.match?.concat(newMatches);
        } else {
          const previousThen = { ...match.then };
          match.then = { match: [previousThen], bool: "and" } as Match;
          for (const newThen of newMatches) {
            match.then.match?.push(newThen);
          }
        }
      }
    }
  }

  function addMatchesToList(matchList: Match[], newMatches: Match[], index: number = -1, before?: boolean) {
    if (matchList) {
      if (index === -1) matchList = matchList?.concat(newMatches);
      else {
        const indexToAdd = before ? index : index + 1;
        matchList.splice(indexToAdd, 0, ...newMatches);
      }
    }
  }

  function updateProperties(parentMatch: Match, direct: Match[], nested: Match[]) {
    if (!isArrayHasLength(parentMatch.where) || !isArrayHasLength(direct)) parentMatch.where = [];

    if (isArrayHasLength(direct)) {
      parentMatch.where = direct[0].where;
    }

    if (isArrayHasLength(nested)) {
      if (!isArrayHasLength(parentMatch.match)) {
        parentMatch.bool = Bool.and;
        parentMatch.match = nested;
      } else
        for (const newMatch of nested) {
          parentMatch.match!.push(newMatch);
        }
    }
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
    } else if (isArrayHasLength(parent.where) && parent.where?.length === 1) {
      parent.where.splice(0, 1);
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
    addMatchesToList,
    updateProperties,
    addThenMatch,
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
    showKeepAsDialog,
    showAddBaseTypeDialog,
    showUpdateDialog,
    showBuildFeatureAfterDialog,
    showAddFeatureAfterDialog,
    showAddFeatureBeforeDialog,
    showAddTestFeatureDialog,
    showAddPopulationAfterDirectoryDialog,
    showAddPopulationBeforeDirectoryDialog,
    showSaveFeatureDialog
  };
}

export default setupQueryBuilderActions;
