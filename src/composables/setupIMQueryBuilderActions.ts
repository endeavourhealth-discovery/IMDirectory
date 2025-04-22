import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Bool, Match, Query, Where, Node } from "@/interfaces/AutoGen";
import type { MenuItem } from "primevue/menuitem";

function setupIMQueryBuilderActions() {
  function isFlatMatch(match: Match): boolean {
    return !match.match && !match.where;
  }

  function toggleMatchBool(object: Match) {
    if (object.bool === Bool.and) object.bool = Bool.or;
    else if (object.bool === Bool.or) object.bool = Bool.and;
    else object.bool = Bool.or;
  }

  function toggleWhereBool(object: Match | Where) {
    if (object.bool === Bool.and) object.bool = Bool.or;
    else if (object.bool === Bool.or) object.bool = Bool.and;
    else object.bool = Bool.or;
  }

  function getMenuItemFromMatch(match: Match): MenuItem {
    return { label: match.typeOf?.name || match.description || "Feature", key: match["@id"], editMatch: match };
  }

  function getTypeOfMatch(query: Query, id: string): string {
    const typeOf: string[] = [];
    searchForTypeOfRecursively(query, id, undefined, typeOf, query);
    return typeOf[0] ?? undefined;
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
    }
  }

  function populateVariableMap(map: { [key: string]: any }, query: Query) {
    if (query.match)
      for (const match of query.match) {
        addVariableRefFromMatch(map, match);
      }
  }

  function addVariableRefFromMatch(map: { [key: string]: any }, match: Match) {
    if (match.variable) map[match.variable] = match;
    if (isArrayHasLength(match.match))
      for (const nestedMatch of match.match!) {
        addVariableRefFromMatch(map, nestedMatch);
      }

    if (isArrayHasLength(match.where))
      for (const property of match.where!) {
        addVariableRefFromProperty(map, property);
      }
  }

  function addVariableRefFromProperty(map: { [key: string]: any }, property: Where) {
    if (property.variable) map[property.variable] = property;

    if (isArrayHasLength(property.where))
      for (const nestedProperty of property.where!) {
        addVariableRefFromProperty(map, nestedProperty);
      }
  }

  function updateEntailment(node: Node, selectedEntailment: string) {
    delete node.memberOf;
    delete node.ancestorsOf;
    delete node.descendantsOf;
    delete node.descendantsOrSelfOf;

    switch (selectedEntailment) {
      case "memberOf":
        node.memberOf = true;
        break;
      case "ancestorsOf":
        node.ancestorsOf = true;
        break;
      case "descendantsOf":
        node.descendantsOf = true;
        break;
      case "descendantsOrSelfOf":
        node.descendantsOrSelfOf = true;
        break;
      default:
        break;
    }
  }

  function getLeafMatch(match: Match) {
    if (!match.where) return match;
    const found: Match[] = [];
    getLeafWhereRecursively(match.where, found, match);
    if (found.length) return found[0];
    else return match;
  }

  function getLeafWhereRecursively(whereList: Where[], found: Match[], currentMatch: Match) {
    found.push(currentMatch);
  }

  return { toggleWhereBool, toggleMatchBool, getMenuItemFromMatch, isFlatMatch, getTypeOfMatch, populateVariableMap, updateEntailment, getLeafMatch };
}

export default setupIMQueryBuilderActions;
