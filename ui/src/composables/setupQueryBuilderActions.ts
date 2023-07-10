import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { SelectedMatch } from "@im-library/interfaces";
import { Match } from "@im-library/interfaces/AutoGen";
import { Ref, ref } from "vue";
import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";

function setupQueryBuilderActions() {
  const showViewDialog: Ref<boolean> = ref(false);
  const showAddDialog: Ref<boolean> = ref(false);
  const showKeepAsDialog: Ref<boolean> = ref(false);
  const showAddBaseTypeDialog: Ref<boolean> = ref(false);

  function add(matches: Match[], match: Match, index: number) {
    showAddDialog.value = true;
    if (index !== matches.length) matches.splice(index + 1, 0, match);
    else matches.push(match);
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

  function remove(matchIndex: number, matches: Match[]) {
    if (isArrayHasLength(matches)) matches.splice(matchIndex, 1);
  }

  function group(selectedMatches: SelectedMatch[], parentMatch: Match, matches: Match[]) {
    let index = selectedMatches[0].index;
    const groupedMatch = { boolMatch: "and", match: [] } as Match;

    for (const selectedMatch of selectedMatches) {
      if (selectedMatch.index < index) index = selectedMatch.index;
      groupedMatch.match!.push(selectedMatch.selected);
    }

    if (isObjectHasKeys(parentMatch, ["match"]) && isArrayHasLength(parentMatch.match)) {
      groupedMatch.match!.sort((a, b) => parentMatch.match!.indexOf(a) - parentMatch.match!.indexOf(b));
      parentMatch.match!.splice(index, 0, groupedMatch);
    } else {
      groupedMatch.match!.sort((a, b) => matches.indexOf(a) - matches.indexOf(b));
      matches.splice(index, 0, groupedMatch);
    }

    for (const selectedMatch of selectedMatches) {
      if (isObjectHasKeys(parentMatch, ["match"]) && isArrayHasLength(parentMatch.match)) {
        parentMatch.match!.splice(
          parentMatch.match!.findIndex(match => JSON.stringify(match) === JSON.stringify(selectedMatch.selected)),
          1
        );
      } else {
        matches.splice(
          matches.findIndex(match => JSON.stringify(match) === JSON.stringify(selectedMatch.selected)),
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
          matches.splice(index, 0, nestedMatch);
        }
      }
    }
  }

  function select(event: any, isSelected: boolean, selectedMatches: SelectedMatch[], match: Match, index: number, parentMatch?: Match, memberOfList?: Match[]) {
    const selectedMatch = { index: index, selected: match } as SelectedMatch;
    if (parentMatch) selectedMatch.parent = parentMatch;
    else if (memberOfList) selectedMatch.memberOfList = memberOfList;

    if (event.ctrlKey) {
      if (!isSelected) {
        selectedMatches.push(selectedMatch);
      } else {
        const foundIndex = selectedMatches.findIndex(selectedMatch => JSON.stringify(selectedMatch.selected) === JSON.stringify(match));
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
    add,
    view,
    keepAs,
    moveUp,
    moveDown,
    remove,
    group,
    ungroup,
    select,
    showViewDialog,
    showAddDialog,
    showKeepAsDialog,
    showAddBaseTypeDialog
  };
}

export default setupQueryBuilderActions;
