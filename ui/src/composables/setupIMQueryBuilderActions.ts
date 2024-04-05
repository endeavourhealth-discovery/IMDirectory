import { Bool, Match, Where } from "@im-library/interfaces/AutoGen";

function setupIMQueryBuilderActions() {
  function isPathMatch(match: Match): boolean {
    return (match.typeOf && match.where && !match.match) as boolean;
  }

  function toggleBool(object: Match | Where) {
    if (object.bool === Bool.and) object.bool = Bool.or;
    else if (object.bool === Bool.or) object.bool = Bool.and;
    else object.bool = Bool.or;
  }

  return { toggleBool, isPathMatch };
}

export default setupIMQueryBuilderActions;
