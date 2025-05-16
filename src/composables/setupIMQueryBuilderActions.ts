import { isArrayHasLength, isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { Bool, Match, Query, Where, Node } from "@/interfaces/AutoGen";
import type { MenuItem } from "primevue/menuitem";

function setupIMQueryBuilderActions() {
  function isFlatMatch(match: Match): boolean {
    return !match.and && !match.or && !match.where;
  }

  function toggleMatchBool(object: Match) {
    if (object.and) {
      object.or = object.and;
      delete object.and;
    } else if (object.or) {
      object.and = object.or;
      delete object.or;
    }
  }

  function addWhereToMatch(match: Match, where: Where) {
    if (!match.where) match.where = where;
    else {
      if (match.where.iri) {
        if (match.where.and) match.where.and.push(where);
        else if (match.where.or) match.where.or.push(where);
        else match.where = { and: [where] };
      }
    }
  }

  function toggleWhereBool(object: Match | Where) {
    if (object.and) {
      object.or = object.and;
      delete object.and;
    } else if (object.or) {
      object.and = object.or;
      delete object.or;
    }
  }

  function getMenuItemFromMatch(match: Match): MenuItem {
    return { label: match.typeOf?.name ?? match.description ?? "Feature", key: match.iri, editMatch: match };
  }

  function getTypeOfMatch(query: Query, id: string): string {
    const typeOf: string[] = [];
    searchForTypeOfRecursively(query, id, undefined, typeOf, query);
    return typeOf[0] ?? undefined;
  }

  function searchForTypeOfRecursively(match: Match, id: string, parent: Match | undefined, typeOf: string[], fullQuery: Query) {
    if (match.iri === id) {
      if (match.typeOf && match.typeOf?.iri) typeOf.push(match.typeOf?.iri);
      else if (parent && parent.typeOf && parent.typeOf?.iri) typeOf.push(parent.typeOf?.iri);
      else if (parent && parent.iri) searchForTypeOfRecursively(fullQuery, parent!.iri, undefined, typeOf, fullQuery);
    } else if (match.and) {
      for (const nestedMatch of match.and) {
        searchForTypeOfRecursively(nestedMatch, id, match, typeOf, fullQuery);
      }
    } else if (match.or) {
      for (const nestedMatch of match.or) {
        searchForTypeOfRecursively(nestedMatch, id, match, typeOf, fullQuery);
      }
    }
  }

  function populateVariableMap(map: { [key: string]: any }, query: Query) {
    if (query.and) {
      for (const match of query.and) {
        addVariableRefFromMatch(map, match);
      }
    }
    if (query.or) {
      for (const match of query.or) {
        addVariableRefFromMatch(map, match);
      }
    }
  }

  function addVariableRefFromMatch(map: { [key: string]: any }, match: Match) {
    if (match.variable) map[match.variable] = match;
    if (isArrayHasLength(match.and)) {
      for (const nestedMatch of match.and!) {
        addVariableRefFromMatch(map, nestedMatch);
      }
    }
    if (isArrayHasLength(match.or)) {
      for (const nestedMatch of match.or!) {
        addVariableRefFromMatch(map, nestedMatch);
      }
    }

    if (match.where) addVariableRefFromProperty(map, match.where);
  }

  function addVariableRefFromProperty(map: { [key: string]: any }, property: Where) {
    if (property.variable) map[property.variable] = property;

    if (isArrayHasLength(property.and))
      for (const nestedProperty of property.and!) {
        addVariableRefFromProperty(map, nestedProperty);
      }

    if (isArrayHasLength(property.or))
      for (const nestedProperty of property.or!) {
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

  function getLeafWhereRecursively(whereList: Where, found: Match[], currentMatch: Match) {
    found.push(currentMatch);
  }
  return { toggleWhereBool, toggleMatchBool, getMenuItemFromMatch, isFlatMatch, getTypeOfMatch, populateVariableMap, updateEntailment };
}
export default setupIMQueryBuilderActions;
