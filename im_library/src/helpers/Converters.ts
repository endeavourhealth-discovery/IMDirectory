import { isArrayHasLength } from "./DataTypeCheckers";

export function iriToUrl(iri: string) {
  return iri.replace(/\//gi, "%2F").replace(/#/gi, "%23");
}

export function urlToIri(url: string) {
  return url.replace(/%2F/gi, "/").replace(/%23/, "#").replace(/%3A/, ":");
}

export function eclStringToBuilderObject(eclString: string) {
  const builderObject = { type: "BoolGroup", operator: "AND", items: [] } as { type: string; operator: string; items?: any[] };
  if (!eclString) return builderObject;
  eclString = eclString
    .replace("\n", "")
    .replace("\t", "")
    .replace(/\|.*?\|/g, "")
    .replace(/\/\*.*?\*\//g, "")
    .toUpperCase();
  const splitByConcept = splitEclByFocusConcept(eclString, builderObject);
  for (const concept of splitByConcept) {
    if (checkForConcept(concept)) {
      const { extract, remainder } = extractConcept(concept);
      builderObject.items.push(processConcept(extract, remainder, builderObject));
    }
  }
  return builderObject;
}

export function splitEclByFocusConcept(ecl: string, builderParent: any, resultsArray?: string[]): string[] {
  let results: string[] = resultsArray ? resultsArray : [];
  let lastIndex = 0;
  const hasConjunction = ecl.match(/(AND|OR|MINUS)/);
  if (hasConjunction) {
    const currentConjunctionIndex = lowestNonNegativeNumber([
      { id: "AND", number: ecl.indexOf("AND") },
      { id: "OR", number: ecl.indexOf("OR") },
      { id: "MINUS", number: ecl.indexOf("MINUS") }
    ]);
    if (currentConjunctionIndex !== null && checkForFocusConceptConjunction(ecl.slice(currentConjunctionIndex.index, ecl.length))) {
      if (currentConjunctionIndex.id === "AND") builderParent.operator = "AND";
      else if (currentConjunctionIndex.id === "OR") builderParent.operator = "OR";
      else if (currentConjunctionIndex.id === "MINUS") builderParent.operator = "MINUS";
      const currentConjunction = ecl.slice(lastIndex, currentConjunctionIndex.index);
      if (currentConjunction) results.push(currentConjunction.trim());
      const remainder = ecl.slice(currentConjunctionIndex.index + length, ecl.length);
      if (remainder && currentConjunctionIndex.index !== 0 && checkForFocusConceptConjunction(remainder))
        results = splitEclByFocusConcept(remainder, builderParent, results);
      else results.push(remainder.slice(0 + currentConjunctionIndex.id.length, remainder.length).trim());
    }
  }
  return results;
}

function splitEclByRefinement(ecl: string, resultArray?: string[]): string[] {
  return [];
}

function lowestNonNegativeNumber(items: { id: string; number: number }[]): { id: string; index: number } | null {
  const filteredAndSorted = items
    .filter(item => item.number !== -1)
    .sort((a: { id: string; number: number }, b: { id: string; number: number }) => a.number - b.number);
  if (filteredAndSorted.length) return { id: filteredAndSorted[0].id, index: filteredAndSorted[0].number };
  else return null;
}

// function processEcl(concept: string) {
//   const conceptObject = { type: "Concept", descendants: "", operator: "", concept: { iri: "" }, items: [] } as {
//     type: string;
//     descendants: string;
//     operator: string;
//     concept: { iri: string };
//     items?: any[];
//   };
//   if (concept.indexOf(":") !== -1) {
//     const refinementsString = concept.slice(concept.indexOf(":"), concept.length);
//     if (refinementsString.indexOf("{") !== -1) {
//       const groupsString = refinementsString.slice(concept.indexOf("{"), concept.length);
//       if (groupsString.slice(1, groupsString.length).indexOf("{") > 0) {
//         const groups = groupsString.split("}");
//         console.log(groups);
//         groups.forEach(group => {
//           if (group.length) {
//             group = group.trim().slice(1, group.length);
//             conceptObject.items.push(processGroup(group));
//           }
//         });
//         concept = concept.slice(0, concept.indexOf("{") - 1);
//       } else {
//         conceptObject.items.push(processGroup(groupsString));
//         concept = concept.slice(0, concept.indexOf("{") - 1);
//       }
//     } else if (refinementsString.indexOf(",") !== -1) {
//       const refinements = refinementsString.split(",");
//       refinements.forEach(refinement => conceptObject.items.push(processRefinement(refinement)));
//     } else {
//       conceptObject.items.push(processRefinement(refinementsString));
//     }
//     concept = concept.slice(0, concept.indexOf(":") - 1);
//   }
//   if (concept.startsWith("AND")) {
//     conceptObject.operator = "AND";
//     concept = concept.slice(3, concept.length);
//   } else if (concept.startsWith("OR")) {
//     conceptObject.operator = "OR";
//     concept = concept.slice(2, concept.length);
//   } else if (concept.startsWith("MINUS")) {
//     conceptObject.operator = "MINUS";
//     concept = concept.slice(5, concept.length);
//   } else conceptObject.operator = "AND";
//   concept = concept.trim();
//   processConcept(concept, conceptObject);
//   return conceptObject;
// }

function checkForConcept(ecl: string) {
  ecl = ecl = ecl.trim();
  return (
    ecl.startsWith("*") ||
    ecl.startsWith("ANY") ||
    ecl.startsWith("<") ||
    ecl.startsWith("descendantOf") ||
    ecl.startsWith("descendantOrSelfOf") ||
    ecl.startsWith("childOf") ||
    ecl.startsWith("childOrSelfOf") ||
    ecl.startsWith(">") ||
    ecl.startsWith("ancestorOf") ||
    ecl.startsWith("ancestorOrSelfOf") ||
    ecl.startsWith("parentOf") ||
    ecl.startsWith("parentOrSelfOf") ||
    (ecl.length >= 8 && ecl.slice(0, 9).match(/^[0-9]{8,9}$/))
  );
}

function checkForOperator(ecl: string) {
  ecl = ecl.trim();
  return ecl.startsWith("=") || ecl.startsWith("!=") || ecl.startsWith("<") || ecl.startsWith("<=") || ecl.startsWith(">") || ecl.startsWith(">=");
}

export function checkForFocusConceptConjunction(ecl: string): boolean {
  ecl = ecl.trim();
  const matches = ecl.match(/^(AND|OR|MINUS) (<|<<|<!|<<!|>|>>|>!|>>!)? [0-9]{8,9}( :| AND| OR| MINUS|$)/);
  return isArrayHasLength(matches);
}

export function checkForRefinementConjunction(ecl: string): boolean {
  ecl = ecl.trim();
  const matches = ecl.match(/^(AND|OR|MINUS|,) *(\{)? *(<|<<|<!|<<!|>|>>|>!|>>!)? [0-9]{8,9} (=|!=) (<|<<|<!|<<!|>|>>|>!|>>!)? *[0-9]{8,9}/);
  return isArrayHasLength(matches);
}

function checkForReverse(ecl: string) {
  ecl.trim();
  return ecl.startsWith("R") || ecl.startsWith("reverseOf");
}

function checkForDotted(ecl: string) {
  ecl.trim();
  return ecl.includes(" . ");
}

function checkForRefinement(ecl: string) {
  ecl = ecl.trim();
  return ecl.startsWith(":");
}

function checkForGroup(ecl: string) {
  ecl = ecl.trim();
  return ecl.startsWith("{");
}

function extractConcept(ecl: string): { extract: string; remainder: string } {
  if (checkForConcept(ecl)) {
    const result = { extract: "", remainder: "" };
    const spaceIndex = ecl.indexOf(" ");
    if (spaceIndex != -1) {
      result.extract = ecl.slice(0, spaceIndex);
      if (ecl.length > spaceIndex) result.remainder = ecl.slice(spaceIndex + 1, ecl.length);
    } else result.extract = ecl;
    return result;
  } else throw new Error(`ecl string does not start with a concept. String:"${ecl}"`);
}

function extractOperator(ecl: string): { extract: string; remainder: string } {
  if (checkForOperator(ecl)) {
    const result = { extract: "", remainder: "" };
    const spaceIndex = ecl.indexOf(" ");
    if (spaceIndex != -1) {
      result.extract = ecl.slice(0, spaceIndex);
      if (ecl.length > spaceIndex) result.remainder = ecl.slice(spaceIndex + 1, ecl.length);
    }
    return result;
  } else throw new Error(`ecl string does not start with an operator. String:"${ecl}"`);
}

function extractFocusConceptConjunction(ecl: string): { extract: string; remainder: string } {
  if (checkForFocusConceptConjunction(ecl)) {
    const result = { extract: "", remainder: "" };
    const spaceIndex = ecl.indexOf(" ");
    if (spaceIndex != -1) {
      result.extract = ecl.slice(0, spaceIndex);
      if (ecl.length > spaceIndex) result.remainder = ecl.slice(spaceIndex + 1, ecl.length);
    }
    return result;
  } else throw new Error(`ecl string does not start with logic. String:"${ecl}"`);
}

function extractReverse(ecl: string): { extract: string; remainder: string } {
  if (checkForReverse(ecl)) {
    throw new Error("ecl reverse attribute is not currently supported");
  } else throw new Error(`ecl string does not start with a reverse attribute. String:"${ecl}"`);
}

function extractDotted(ecl: string): { extract: string; remainder: string } {
  if (checkForDotted(ecl)) {
    throw new Error("ecl dotted attribute is not currently supported");
  } else throw new Error(`ecl string does not include a dotted attribute. String:"${ecl}"`);
}

function extractRefinement(ecl: string): { extract: string; remainder: string } {
  if (checkForRefinement(ecl)) {
    const result = { extract: "", remainder: "" };
    if (checkForGroup(ecl)) {
      extractGroup(ecl);
    } else {
      const commaIndex = ecl.indexOf(",");
      if (commaIndex != -1) {
        result.extract = ecl.slice(0, commaIndex);
        if (ecl.length > commaIndex) result.remainder = ecl.slice(commaIndex + 1, ecl.length);
      } else {
        result.extract;
      }
    }
    return result;
  } else throw new Error(`ecl string does not start with a refinement. String:"${ecl}"`);
}

function extractGroup(ecl: string) {}

function processConcept(concept: string, remainder: string, eclObject: any) {
  const conceptObject = { type: "Concept", descendants: "", operator: "", concept: { iri: "" }, items: [] } as {
    type: string;
    descendants: string;
    operator: string;
    concept: { iri: string };
    items?: any[];
  };
  if (concept.startsWith("<<")) {
    conceptObject.descendants = "<<";
    concept = concept.slice(2, concept.length);
  } else if (concept.startsWith("<")) {
    conceptObject.descendants = "<";
    concept = concept.slice(1, concept.length);
  } else conceptObject.descendants = "";
  concept = concept.trim();
  if (concept === "*" || concept === "ANY") conceptObject.concept.iri = "*";
  else if (concept.length) conceptObject.concept.iri = `http://snomed.info/sct#${concept}`;
  eclObject.items.push(conceptObject);
  if (remainder) {
    if (checkForRefinement(remainder)) {
      const {} = extractRefinement(remainder);
    }
    conceptObject.items.push();
  }
}

function processRefinement(refinement: string) {
  const refinementObject = {
    type: "RefinementX",
    operator: "",
    property: { descendants: "", concept: { iri: "" } },
    value: { descendants: "", concept: { iri: "" } }
  } as {
    type: string;
    operator: string;
    property: { descendants: string; concept: { iri: string } };
    value: { descendants: string; concept: { iri: string } };
  };
  refinement = refinement.slice(1, refinement.length).trim();
  if (refinement.includes(",")) {
    refinement = refinement.slice(0, refinement.indexOf(","));
  }
  let property = "";
  let value = "";
  if (refinement.includes("!=")) {
    refinementObject.operator = "!=";
    property = refinement.slice(0, refinement.indexOf("!")).trim();
    value = refinement.slice(refinement.indexOf("!") + 2, refinement.length).trim();
  } else if (refinement.includes("=")) {
    refinementObject.operator = "=";
    property = refinement.slice(0, refinement.indexOf("=")).trim();
    value = refinement.slice(refinement.indexOf("=") + 1, refinement.length).trim();
  }
  processConcept(property, "", refinementObject.property);
  processConcept(value, "", refinementObject.value);
  return refinementObject;
}
function processGroup(group: string) {
  console.log(group);
  return true;
}

export default {
  iriToUrl,
  urlToIri,
  eclStringToBuilderObject,
  splitEclByFocusConcept,
  checkForFocusConceptConjunction,
  checkForRefinementConjunction
};
