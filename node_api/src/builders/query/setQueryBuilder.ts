import { SetQueryObject } from "@im-library/interfaces";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { IM } from "@im-library/vocabulary";
import { Query } from "@im-library/models/AutoGen";

export function buildSetQueryObjectFromQuery(value: Query) {
  if (!isObjectHasKeys(value)) {
    return [];
  }
  const constructedClauses: SetQueryObject[] = [];
  recursivelyBuildSetQueryObject(value, constructedClauses);
  return constructedClauses;
}

function recursivelyBuildSetQueryObject(value: Query, constructedClauses: SetQueryObject[]) {
  if (isArrayHasLength(value?.where?.from)) {
    for (const from of value.where.from) {
      const clause = {
        concept: from,
        include: true,
        refinements: []
      } as SetQueryObject;
      constructedClauses.push(clause);
    }
  }

  if (isArrayHasLength(value?.from)) {
    for (const from of value.from) {
      const clause = {
        concept: from,
        include: true,
        refinements: []
      } as SetQueryObject;
      constructedClauses.push(clause);
    }
  }

  if (isArrayHasLength(value?.where?.notExist?.from)) {
    for (const from of value.where.notExist.from) {
      const clause = {
        concept: from,
        include: false,
        refinements: []
      } as SetQueryObject;
      constructedClauses.push(clause);
    }
  }

  if (isArrayHasLength(value?.where?.and)) {
    for (const and of value.where.and) {
      if (!isArrayHasLength(constructedClauses)) constructedClauses.push({} as SetQueryObject);
      constructedClauses[0].refinements.push({
        property: and.property,
        is: and.is
      });
    }
  }

  if (isArrayHasLength(value?.where?.or)) {
    for (const or of value.where.or) {
      recursivelyBuildSetQueryObject(or as any, constructedClauses);
    }
  }

  if (isObjectHasKeys(value?.where?.where, ["property", "is"])) {
    if (!isArrayHasLength(constructedClauses)) constructedClauses.push({} as SetQueryObject);
    constructedClauses[0].refinements.push({
      property: value?.where?.where.property,
      is: value?.where?.where.is
    });
  }
}

export function buildQueryFromSetQueryObject(clauses: SetQueryObject[]): any {
  const newQuery = {
    where: {
      from: [] as any[]
    }
  } as any;

  for (const clause of clauses) {
    if (clause.include) {
      if (!isObjectHasKeys(newQuery.where, ["from"])) {
        newQuery.where.from = [] as any;
      }
      newQuery.where.from.push(clause.concept);
    } else if (!clause.include) {
      if (!isObjectHasKeys(newQuery.where, ["notExists"])) {
        newQuery.where.notExist = {
          from: [] as any[]
        };
      }
      newQuery.where.notExist.from.push(clause.concept);
    }

    if (isArrayHasLength(clause.refinements)) {
      newQuery.where.pathTo = IM.ROLE_GROUP;
      newQuery.where.and = [] as any[];
    }

    for (const refinement of clause.refinements) {
      newQuery.where.and.push(refinement);
    }
  }
  return newQuery;
}
