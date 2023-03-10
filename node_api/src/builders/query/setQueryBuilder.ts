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
  if (isObjectHasKeys(value?.from, ["@id"]) || isObjectHasKeys(value?.from, ["@type"])) {
    const clause = {
      concept: { name: value.from.name || value.from["@id"] || value.from["@type"] } as TTAlias,
      include: true,
      refinements: []
    } as SetQueryObject;
    if (isObjectHasKeys(value?.from, ["@id"])) clause.concept["@id"] = value.from["@id"];
    else if (isObjectHasKeys(value?.from, ["@type"])) clause.concept["@type"] = value.from["@type"];
    addInclusionProperties(value.from, clause.concept);

    constructedClauses.push(clause);
  }
  if (isObjectHasKeys(value?.from, ["where"])) {
    const where = value.from.where;
    if (isObjectHasKeys(where, ["bool", "where"]) && isArrayHasLength(where.where)) {
      for (const condition of where.where) {
        const property = { "@id": condition["@id"], name: condition.name } as TTAlias;
        const is = { "@id": condition.in[0]["@id"], name: condition.in[0].name } as TTAlias;
        addInclusionProperties(condition, property);
        addInclusionProperties(condition.in[0], is);

        constructedClauses[constructedClauses.length - 1].refinements.push({
          property: property,
          is: is
        });
      }
    } else if (isObjectHasKeys(where, ["@id", "in"])) {
      const property = { "@id": where["@id"], name: where.name } as TTAlias;
      const is = { "@id": where.in[0]["@id"], name: where.in[0].name } as TTAlias;
      addInclusionProperties(where, property);
      addInclusionProperties(where.in[0], is);

      constructedClauses[constructedClauses.length - 1].refinements.push({
        property: property,
        is: is
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
      const from = {} as From;
      if (clause.concept["@id"]) from["@id"] = clause.concept["@id"];
      else if (clause.concept["@type"]) from["@type"] = clause.concept["@type"];
      from.name = clause.concept.name;
      addInclusionProperties(clause.concept, from);
      if (isArrayHasLength(clause.refinements)) addRefinements(clause, from);
      if (clauses.length === 1) {
        newQuery.from = from;
      } else {
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
    const where = {
      "@id": refinement.property["@id"],
      name: refinement.property.name,
      anyRoleGroup: true,
      in: [
        {
          "@id": refinement.is["@id"],
          name: refinement.is.name
        } as TTAlias
      ]
    } as Where;

    addInclusionProperties(refinement.property, where);
    addInclusionProperties(refinement.is, where.in[where.in.length - 1]);

    if (clause.refinements.length === 1) {
      from.where = where;
    } else {
      from.where.bool = clause.include ? "and" : "not";
      from.where.where.push(where);
    }
  }
}

function addInclusionProperties(addFrom: any, addTo: any) {
  const includeProperties = ["descendantsOrSelfOf", "descendants", "ancsestorsOrSelf"];
  for (const property of includeProperties) {
    if (isObjectHasKeys(addFrom, [property])) (addTo as any)[property] = (addFrom as any)[property];
  }
}
