import { Bool, Match, Where } from "@im-library/interfaces/AutoGen";
import { MenuItem } from "primevue/menuitem";

function setupIMQueryBuilderActions() {
  function isPathMatch(match: Match): boolean {
    return (match.typeOf && match.where && !match.match) as boolean;
  }

  function isFlatMatch(match: Match): boolean {
    const nestedWhereHasMatch = match.where ? match.where.some(nestedWhere => nestedWhere.match) : false;
    return (!nestedWhereHasMatch && !match.match && !match.then && !match.where) as boolean;
  }

  function toggleBool(object: Match | Where) {
    if (object.bool === Bool.and) object.bool = Bool.or;
    else if (object.bool === Bool.or) object.bool = Bool.and;
    else object.bool = Bool.or;
  }

  function getMenuItemFromMatch(match: Match): MenuItem {
    return { label: match.typeOf?.name || match.description || "Feature", key: match["@id"], editMatch: match };
  }

  return { toggleBool, isPathMatch, getMenuItemFromMatch, isFlatMatch };
}

export default setupIMQueryBuilderActions;
