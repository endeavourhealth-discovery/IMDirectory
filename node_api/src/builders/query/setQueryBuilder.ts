import { SetQueryObject } from "@im-library/interfaces";
import { isArrayHasLength, isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { From, Query, TTAlias, Where } from "@im-library/models/AutoGen";

export function buildSetQueryObjectFromQuery(value: Query) {
  if (!isObjectHasKeys(value)) {
    return [];
  }
  const constructedClauses: SetQueryObject[] = [];
  recursivelyBuildSetQueryObject(value, constructedClauses);
  return constructedClauses;
}

function recursivelyBuildSetQueryObject(value: Query, constructedClauses: SetQueryObject[]) {
  if (isObjectHasKeys(value?.from, ["@id", "name"])) {
    const clause = {
      concept: { "@id": value.from["@id"], name: value.from.name, includeSubtypes: value.from.includeSubtypes } as TTAlias,
      include: true,
      refinements: []
    } as SetQueryObject;

    constructedClauses.push(clause);
  } else if (isObjectHasKeys(value?.from, ["type"])) {
    const clause = {
      concept: { "@id": value.from.type["@id"], name: value.from.type.name, includeSubtypes: false } as TTAlias,
      isType: true,
      include: true,
      refinements: []
    } as SetQueryObject;

    constructedClauses.push(clause);
  }

  if (isObjectHasKeys(value?.from, ["where"])) {
    const where = value.from.where;
    if (isObjectHasKeys(where, ["bool", "where"]) && isArrayHasLength(where.where)) {
      for (const condition of where.where) {
        constructedClauses[constructedClauses.length - 1].refinements.push({
          property: { "@id": condition["@id"], name: condition.name, includeSubtypes: condition.includeSubtypes } as TTAlias,
          is: { "@id": condition.in[0]["@id"], name: condition.in[0].name, includeSubtypes: condition.in[0].includeSubtypes } as TTAlias
        });
      }
    } else if (isObjectHasKeys(where, ["@id", "in"])) {
      constructedClauses[constructedClauses.length - 1].refinements.push({
        property: { "@id": where["@id"], name: where.name, includeSubtypes: where.includeSubtypes } as TTAlias,
        is: { "@id": where.in[0]["@id"], name: where.in[0].name, includeSubtypes: where.in[0].includeSubtypes } as TTAlias
      });
    }
  }

  if (isObjectHasKeys(value.from, ["bool", "from"]) && isArrayHasLength(value.from.from)) {
    for (const from of value.from.from) {
      recursivelyBuildSetQueryObject({ from: from } as any, constructedClauses);
    }
  }
}

export function buildQueryFromSetQueryObject(clauses: SetQueryObject[]): any {
  const newQuery = {
    from: {
      bool: "or",
      from: [] as From[]
    } as From
  } as Query;

  for (const clause of clauses) {
    if (clause.include) {
      if (clauses.length === 1) {
        const from = !clause?.isType
          ? ({
              "@id": clause.concept["@id"],
              name: clause.concept.name,
              includeSubtypes: clause.concept.includeSubtypes
            } as From)
          : ({
              type: { "@id": clause.concept["@id"], name: clause.concept.name }
            } as From);
        if (isArrayHasLength(clause.refinements)) addRefinements(clause, from);
        newQuery.from = from;
      } else {
        const from = !clause?.isType
          ? ({
              "@id": clause.concept["@id"],
              name: clause.concept.name,
              includeSubtypes: clause.concept.includeSubtypes
            } as From)
          : ({
              type: { "@id": clause.concept["@id"], name: clause.concept.name }
            } as From);
        if (isArrayHasLength(clause.refinements)) addRefinements(clause, from);
        newQuery.from.from.push(from);
      }
    }
  }
  return newQuery;
}

function addRefinements(clause: SetQueryObject, from: From) {
  from.where = {
    bool: "and",
    where: [] as Where[]
  } as Where;

  for (const refinement of clause.refinements) {
    if (clause.refinements.length === 1) {
      from.where = {
        "@id": refinement.property["@id"],
        name: refinement.property.name,
        includeSubtypes: refinement.property.includeSubtypes,
        anyRoleGroup: true,
        in: [
          {
            "@id": refinement.is["@id"],
            name: refinement.is.name,
            includeSubtypes: refinement.is.includeSubtypes
          } as From
        ]
      } as Where;
    } else {
      const where = {
        "@id": refinement.property["@id"],
        name: refinement.property.name,
        includeSubtypes: refinement.property.includeSubtypes,
        anyRoleGroup: true,
        in: [
          {
            "@id": refinement.is["@id"],
            name: refinement.is.name,
            includeSubtypes: refinement.is.includeSubtypes
          } as From
        ]
      } as Where;
      from.where.where.push(where);
    }
  }
}
