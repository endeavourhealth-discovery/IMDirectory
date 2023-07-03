import { Match } from "@im-library/interfaces/AutoGen";
import { Ref, ref } from "vue";

function setupQueryBuilderActions() {
  const showViewDialog: Ref<boolean> = ref(false);
  const showAddDialog: Ref<boolean> = ref(false);

  function add(matches: Match[]): Match {
    showAddDialog.value = true;
    const newMatch = {} as Match;
    matches.push(newMatch);
    return newMatch;
  }

  function view() {
    showViewDialog.value = true;
  }

  return { add, view, showViewDialog, showAddDialog };
}

export default setupQueryBuilderActions;
