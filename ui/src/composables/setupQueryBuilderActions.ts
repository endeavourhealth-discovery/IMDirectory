import { isArrayHasLength } from "@im-library/helpers/DataTypeCheckers";
import { Match } from "@im-library/interfaces/AutoGen";
import { Ref, ref } from "vue";

function setupQueryBuilderActions() {
  const showViewDialog: Ref<boolean> = ref(false);
  const showAddDialog: Ref<boolean> = ref(false);
  const showKeepAsDialog: Ref<boolean> = ref(false);

  function add(matches: Match[]): Match {
    showAddDialog.value = true;
    const newMatch = {} as Match;
    matches.push(newMatch);
    return newMatch;
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

  return { add, view, keepAs, moveUp, moveDown, remove, showViewDialog, showAddDialog, showKeepAsDialog };
}

export default setupQueryBuilderActions;
