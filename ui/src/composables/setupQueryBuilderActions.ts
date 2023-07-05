import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { SelectedMatch } from "@im-library/interfaces";
import { Match } from "@im-library/interfaces/AutoGen";
import { Ref, ref } from "vue";

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

  function group(selectedMatches: Match[], parentMatch: Match) {
    if (parentMatch) {
      const firstSelected = selectedMatches[0];
      const indexOfFirstSelected = parentMatch.match!.findIndex(match => JSON.stringify(match) === JSON.stringify(firstSelected));
      const groupedMatch = { boolMatch: "and", match: [] } as Match;
      for (const selectedMatch of selectedMatches) {
        groupedMatch.match!.push(selectedMatch);
        parentMatch.match!.splice(indexOfFirstSelected, 1);
      }
      // remove();
      // describeMatch([groupedMatch], "match");
      parentMatch.match!.splice(indexOfFirstSelected, 0, groupedMatch);
    }
  }

  function ungroup(index: number, selectedMatches: Match[], parentMatch: Match) {
    if (parentMatch) {
      for (const selectedMatch of selectedMatches) {
        if (isArrayHasLength(selectedMatch.match)) {
          if (index !== -1) parentMatch.match!.splice(index, 1);
          for (const nestedMatch of selectedMatch.match!.reverse()) {
            parentMatch.match!.splice(index, 0, nestedMatch);
          }
        }
      }
    }
  }

  // function group(matchIndex: number) {
  //   const firstSelected = selectedMatches.value[0];
  //   const indexOfFirstSelected = query.value.match!.findIndex(match => JSON.stringify(match) === JSON.stringify(firstSelected));
  //   const groupedMatch = { boolMatch: "and", match: [] } as Match;
  //   for (const selectedMatch of selectedMatches.value) {
  //     const index = query.value.match!.findIndex(match => JSON.stringify(match) === JSON.stringify(selectedMatch));
  //     groupedMatch.match!.splice(index, 0, selectedMatch);
  //     console.log(index);
  //   }
  //   for (const selectedMatch of selectedMatches.value) remove(query.value.match!.findIndex(match => JSON.stringify(match) === JSON.stringify(selectedMatch)));
  //   describeMatch([groupedMatch], "match");
  //   query.value.match!.splice(indexOfFirstSelected, 0, groupedMatch);
  // }

  // function ungroup(matchIndex: number) {
  //   remove(matchIndex);
  //   const tempArray = selectedMatches.value[0].match!.reverse();
  //   for (const ungroupedMatch of tempArray) query.value.match!.splice(matchIndex, 0, ungroupedMatch);
  // }

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
