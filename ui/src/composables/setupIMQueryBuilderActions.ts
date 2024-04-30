import { Bool, Match, Query, Where } from "@im-library/interfaces/AutoGen";
import { MenuItem } from "primevue/menuitem";

function setupIMQueryBuilderActions() {
  function isPathMatch(match: Match): boolean {
    return (match.typeOf && match.where && !match.match) as boolean;
  }

  function isFlatMatch(match: Match): boolean {
    const nestedWhereHasMatch = match.where ? match.where.some(nestedWhere => nestedWhere.match) : false;
    return (!nestedWhereHasMatch && !match.match && !match.then && !match.where) as boolean;
  }

  function toggleMatchBool(object: Match) {
    if (object.boolMatch === Bool.and) object.boolMatch = Bool.or;
    else if (object.boolMatch === Bool.or) object.boolMatch = Bool.and;
    else object.boolMatch = Bool.or;
  }

  function toggleWhereBool(object: Match | Where) {
    if (object.boolWhere === Bool.and) object.boolWhere = Bool.or;
    else if (object.boolWhere === Bool.or) object.boolWhere = Bool.and;
    else object.boolWhere = Bool.or;
  }

  function getMenuItemFromMatch(match: Match): MenuItem {
    return { label: match.typeOf?.name || match.description || "Feature", key: match["@id"], editMatch: match };
  }

  function getTypeOfMatch(query: Query, id: string): string {
    const typeOf: string[] = [];
    searchForTypeOfRecursively(query, id, undefined, typeOf, query);
    return typeOf[0] ?? "";
  }

  function searchForTypeOfRecursively(match: Match, id: string, parent: Match | undefined, typeOf: string[], fullQuery: Query) {
    if (match["@id"] === id) {
      if (match.typeOf && match.typeOf?.["@id"]) typeOf.push(match.typeOf?.["@id"]);
      else if (parent && parent.typeOf && parent.typeOf?.["@id"]) typeOf.push(parent.typeOf?.["@id"]);
      else if (parent && parent["@id"]) searchForTypeOfRecursively(fullQuery, parent!["@id"], undefined, typeOf, fullQuery);
    } else if (match.match) {
      for (const nestedMatch of match.match) {
        searchForTypeOfRecursively(nestedMatch, id, match, typeOf, fullQuery);
      }
    } else if (match.then) {
      searchForTypeOfRecursively(match.then, id, match, typeOf, fullQuery);
    }
  }

  return { toggleWhereBool, toggleMatchBool, isPathMatch, getMenuItemFromMatch, isFlatMatch, getTypeOfMatch };
}

export default setupIMQueryBuilderActions;
