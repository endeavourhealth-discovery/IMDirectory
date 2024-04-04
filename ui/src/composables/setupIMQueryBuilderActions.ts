import { Bool, Match, Where } from "@im-library/interfaces/AutoGen";

function setupIMQueryBuilderActions() {
  function toggleBool(object: Match | Where) {
    if (object.bool === Bool.and) object.bool = Bool.or;
    else if (object.bool === Bool.or) object.bool = Bool.and;
    else object.bool = Bool.or;
  }

  return { toggleBool };
}

export default setupIMQueryBuilderActions;
