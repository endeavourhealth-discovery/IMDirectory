import { Bool, Match, Where } from "@im-library/interfaces/AutoGen";
import { MenuItem } from "primevue/menuitem";

function setupIMQueryBuilderActions() {
  function isPathMatch(match: Match): boolean {
    return (match.typeOf && match.where && !match.match) as boolean;
  }

  function toggleBool(object: Match | Where) {
    if (object.bool === Bool.and) object.bool = Bool.or;
    else if (object.bool === Bool.or) object.bool = Bool.and;
    else object.bool = Bool.or;
  }

  function getMenuItemFromMatch(match: Match): MenuItem {
    return { label: match.typeOf?.name ?? "Feature", key: match["@id"], editMatch: match };
  }

  return { toggleBool, isPathMatch, getMenuItemFromMatch };
}

export default setupIMQueryBuilderActions;
