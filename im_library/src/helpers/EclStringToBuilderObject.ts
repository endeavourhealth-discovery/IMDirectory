import { isArrayHasLength } from "./DataTypeCheckers";

export function eclStringToBuilderObject(eclString: string) {
  const builderObject = { type: "BoolGroup", operator: "AND", items: [] } as { type: string; operator: string; items?: any[] };
  if (!eclString) return builderObject;
  eclString = eclString
    .replace("\n", "")
    .replace("\t", "")
    .replace(/\|.*?\|/g, "")
    .replace(/\/\*.*?\*\//g, "")
    .toUpperCase();
  if (checkForMember(eclString)) throw new Error("'^/memberOf' is not currently supported");
  if (checkForCardinality(eclString)) throw new Error("Cardinality is not currently supported");
  if (checkForNot(eclString)) throw new Error("'NOT' is currently not supported. Please use '!=' notation instead");
  if (checkForReverse(eclString)) throw new Error("'R/reverseOf/.' is not currently supported");
  const splitByConcept = splitEclByFocusConcept(eclString, builderObject);
  for (const concept of splitByConcept) {
    if (isFocusConcept(concept)) {
      const { extract, remainder } = extractConcept(concept);
      processConcept(extract, remainder, builderObject);
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
    if (currentConjunctionIndex !== null && isFocusConceptConjunction(ecl.slice(currentConjunctionIndex.index, ecl.length))) {
      if (currentConjunctionIndex.id === "AND") builderParent.operator = "AND";
      else if (currentConjunctionIndex.id === "OR") builderParent.operator = "OR";
      else if (currentConjunctionIndex.id === "MINUS") builderParent.operator = "MINUS";
      const currentConjunction = ecl.slice(lastIndex, currentConjunctionIndex.index);
      if (currentConjunction) results.push(currentConjunction.trim());
      const remainder = ecl.slice(currentConjunctionIndex.index + length, ecl.length);
      if (remainder && currentConjunctionIndex.index !== 0 && isFocusConceptConjunction(remainder))
        results = splitEclByFocusConcept(remainder, builderParent, results);
      else results.push(remainder.slice(0 + currentConjunctionIndex.id.length, remainder.length).trim());
    }
  } else {
    results.push(ecl);
  }
  return results;
}

export function splitEclByRefinement(ecl: string, builderParent: any, resultsArray?: string[]): string[] {
  let results: string[] = resultsArray ? resultsArray : [];
  let lastIndex = 0;
  const hasConjunction = ecl.match(/(AND|OR|MINUS|,)/);
  if (hasConjunction) {
    let currentConjunctionIndex = null;
    if (ecl.startsWith("{")) {
      currentConjunctionIndex = lowestNonNegativeNumber([
        { id: "} AND", number: ecl.indexOf("} AND") },
        { id: "} OR", number: ecl.indexOf("} OR") },
        { id: "} MINUS", number: ecl.indexOf("} MINUS") },
        { id: "} ,", number: ecl.indexOf("} ,") },
        { id: "},", number: ecl.indexOf("},") }
      ]);
    } else {
      currentConjunctionIndex = lowestNonNegativeNumber([
        { id: "AND", number: ecl.indexOf("AND") },
        { id: "OR", number: ecl.indexOf("OR") },
        { id: "MINUS", number: ecl.indexOf("MINUS") },
        { id: ",", number: ecl.indexOf(",") }
      ]);
    }
    if (currentConjunctionIndex !== null && isRefinementConjunction(ecl)) {
      if (currentConjunctionIndex.id === "AND" || currentConjunctionIndex.id === "} AND") builderParent.operator = "AND";
      else if (currentConjunctionIndex.id === "OR" || currentConjunctionIndex.id === "} OR") builderParent.operator = "OR";
      else if (currentConjunctionIndex.id === "MINUS" || currentConjunctionIndex.id === "} MINUS") builderParent.operator = "MINUS";
      else if (currentConjunctionIndex.id === "," || currentConjunctionIndex.id === "}," || currentConjunctionIndex.id === "} ,")
        builderParent.operator = "AND";
      let currentConjunction = "";
      let remainder = "";
      if (ecl.startsWith("{")) {
        currentConjunction = ecl.slice(lastIndex, currentConjunctionIndex.index + 1);
        remainder = ecl.slice(currentConjunctionIndex.index + 2, ecl.length);
      } else {
        currentConjunction = ecl.slice(lastIndex, currentConjunctionIndex.index);
        remainder = ecl.slice(currentConjunctionIndex.index + 1, ecl.length);
      }
      if (currentConjunction) results.push(currentConjunction.trim());
      if (remainder && currentConjunctionIndex.index !== 0 && isRefinementConjunction(remainder)) {
        splitEclByRefinement(remainder.trim(), builderParent, results);
        // for (const remainderResult of reminderResults) {
        //   if (remainderResult && isRefinement(remainderResult)) results.push(remainderResult);
        //   console.log(remainderResult);
        // }
      } else results.push(remainder.slice(0 + currentConjunctionIndex.id.length, remainder.length).trim());
    } else {
      results.push(ecl);
    }
  } else if (isRefinement(ecl)) {
    results.push(ecl);
  }
  return results;
}

function lowestNonNegativeNumber(items: { id: string; number: number }[]): { id: string; index: number } | null {
  const filteredAndSorted = items
    .filter(item => item.number !== -1)
    .sort((a: { id: string; number: number }, b: { id: string; number: number }) => a.number - b.number);
  if (filteredAndSorted.length) return { id: filteredAndSorted[0].id, index: filteredAndSorted[0].number };
  else return null;
}

export function isFocusConcept(ecl: string) {
  ecl = ecl = ecl.trim();
  const matches = ecl.match(
    /^(<<!|<<|<!|<|DESCENDANTOF|DESCENDANTORSELFOF|CHILDOF|CHILDORSELFOF|>>!|>!|>!|>|ANCESTOROF|ANCESTORORSELFOF|PARENTOF|PARENTORSELFOF)? *(\*|ANY|[0-9]{8,9})/
  );
  return isArrayHasLength(matches);
}

export function isFocusConceptConjunction(ecl: string): boolean {
  ecl = ecl.trim();
  const matches = ecl.match(/^(AND|OR|MINUS)? *(<<!|<<|<!|<|>>!|>>|>!|>)? [0-9]{8,9}( :| AND| OR| MINUS|$)/);
  return isArrayHasLength(matches);
}

export function isRefinementConjunction(ecl: string): boolean {
  ecl = ecl.trim();
  const matches = ecl.match(/^ *:?(AND|OR|MINUS|,)? *(\{)? *(<<!|<<|<!|<|>>!|>>|>!|>)? *[0-9]{8,9} *(=|!=) *(<<!|<<|<!|<|>>!|>>|>!|>)? *[0-9]{8,9} *(\})?/);
  return isArrayHasLength(matches);
}

function checkForReverse(ecl: string) {
  ecl = ecl.trim();
  return isArrayHasLength(ecl.match(/( R |reverseOf|\.)/));
}

function checkForMember(ecl: string) {
  ecl = ecl.trim();
  return isArrayHasLength(ecl.match(/(\^|MEMBEROF)/));
}

function checkForNot(ecl: string) {
  ecl = ecl.trim();
  return isArrayHasLength(ecl.match(/NOT/));
}

function checkForCardinality(ecl: string) {
  ecl = ecl.trim();
  return isArrayHasLength(ecl.match(/\[(0-9).*\]/));
}

export function isRefinement(ecl: string) {
  ecl = ecl.trim();
  const matches = ecl.match(/^ *:?(\{)? *(<<!|<<|<!|<|>>!|>>|>!|>)? *[0-9]{8,9} *(=|!=) *(<<!|<<|<!|<|>>!|>>|>!|>)? *[0-9]{8,9} *(\})?/);
  return isArrayHasLength(matches);
}

export function extractConcept(ecl: string): { extract: string; remainder: string } {
  if (isFocusConcept(ecl)) {
    ecl = ecl.trim();
    const matches = ecl.match(
      /^ *(<<!|<!|<<|<|DESCENDANTOF|DESCENDANTORSELFOF|CHILDOF|CHILDORSELFOF|>>!|>>|>!|>|ANCESTOROF|ANCESTORORSELFOF|PARENTOF|PARENTORSELFOF)? *(\*|ANY|[0-9]{8,9})/
    );
    const extract = isArrayHasLength(matches) ? matches[0] : "";
    const remainder = ecl.slice(extract.length, ecl.length);
    const result = { extract: extract.trim(), remainder: remainder.trim() };
    return result;
  } else throw new Error(`ecl string does not start with a concept. String:"${ecl}"`);
}

export function extractRefinement(ecl: string): { extract: string; remainder: string } {
  ecl = ecl.trim();
  if (isRefinement(ecl)) {
    const matches = ecl.match(/^ *(\{)? *(<<!|<<|<!|<|>>!|>>|>!|>)? *[0-9]{8,9} *(=|!=) *(<<!|<<|<!|<|>>!|>>|>!|>)? *[0-9]{8,9} *(\})?/);
    const extract = isArrayHasLength(matches) ? matches[0] : "";
    const remainder = ecl.slice(extract.length, ecl.length);
    const result = { extract: extract.trim(), remainder: remainder.trim() };
    return result;
  } else throw new Error(`ecl string does not start with a refinement. String:"${ecl}"`);
}

function processConcept(concept: string, conceptRemainder: string, eclObject: any) {
  const conceptObject = { type: "Concept", descendants: "", operator: "AND", concept: { iri: "" }, items: [] } as {
    type: string;
    descendants: string;
    operator: string;
    concept: { iri: string };
    items?: any[];
  };
  processDescendantAndCode(concept, conceptObject);
  if (conceptRemainder) {
    if (conceptRemainder.trim().startsWith(":")) conceptRemainder = conceptRemainder.trim().slice(1, conceptRemainder.length).trim();
    if (isRefinementConjunction(conceptRemainder)) {
      const refinements = splitEclByRefinement(conceptRemainder, conceptObject);
      for (let refinement of refinements) {
        if (refinement.trim().startsWith("{") && refinement.trim().endsWith("}")) {
          const boolGroup = { type: "BoolGroup", operator: "AND", items: [] };
          refinement = refinement.slice(1, refinement.length - 1).trim();
          if (isRefinementConjunction(refinement)) {
            const splitRefinements = splitEclByRefinement(refinement, boolGroup);
            for (let splitRefinement of splitRefinements) {
              const { extract, remainder } = extractRefinement(splitRefinement.trim());
              processRefinement(extract, remainder, boolGroup);
            }
          } else {
            const { extract, remainder } = extractRefinement(refinement.trim());
            processRefinement(extract, remainder, boolGroup);
          }
          if (boolGroup.items.length) conceptObject.items.push(boolGroup);
        } else {
          const { extract, remainder } = extractRefinement(refinement.trim());
          processRefinement(extract, remainder, conceptObject);
        }
      }
    } else if (isFocusConceptConjunction(conceptRemainder)) {
      const { extract, remainder } = extractConcept(concept);
      processConcept(extract, remainder, eclObject);
    }
  }
  eclObject.items.push(conceptObject);
}

function processRefinement(refinement: string, refinementRemainder: string, eclObject: any) {
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
  let propertyEcl = "";
  let valueEcl = "";
  if (refinement.includes("!=")) {
    refinementObject.operator = "!=";
    propertyEcl = refinement.slice(0, refinement.indexOf("!")).trim();
    valueEcl = refinement.slice(refinement.indexOf("!") + 2, refinement.length).trim();
  } else if (refinement.includes("=")) {
    refinementObject.operator = "=";
    propertyEcl = refinement.slice(0, refinement.indexOf("=")).trim();
    valueEcl = refinement.slice(refinement.indexOf("=") + 1, refinement.length).trim();
  }
  processDescendantAndCode(propertyEcl, refinementObject.property);
  processDescendantAndCode(valueEcl, refinementObject.value);
  eclObject.items.push(refinementObject);
  // processConcept(property, "", refinementObject.property);
  // processConcept(value, "", refinementObject.value);
}

export function processDescendantAndCode(ecl: string, parentObject: any) {
  ecl = ecl.trim();
  const matches = ecl.match(
    /^(<<!|<!|<<|<|DESCENDANTOF|DESCENDANTORSELFOF|CHILDOF|CHILDORSELFOF|>>!|>!|>>|>|ANCESTOROF|ANCESTORORSELFOF|PARENTOF|PARENTORSELFOF)/
  );
  let descendant = "";
  let code = "";
  if (isArrayHasLength(matches)) {
    descendant = matches[0];
    code = ecl.slice(descendant.length, ecl.length).trim();
  } else {
    code = ecl;
  }
  if (descendant) {
    switch (descendant) {
      case "<<":
      case "<":
      case "<!":
      case "<<!":
      case ">":
      case ">!":
      case ">>":
      case ">>!":
        parentObject.descendants = descendant;
        break;
      case "DESCENDANTOF":
        parentObject.descendants = "<";
        break;
      case "DESCENDANTORSELFOF":
        parentObject.descendants = "<<";
        break;
      case "CHILDOF":
        parentObject.descendants = "<!";
        break;
      case "CHILDORSELFOF":
        parentObject.descendants = "<<!";
        break;
      case "ANCESTOROF":
        parentObject.descendants = ">";
        break;
      case "ANCESTORORSELFOF":
        parentObject.descendants = ">>";
        break;
      case "PARENTOF":
        parentObject.descendants = ">!";
        break;
      case "PARENTORSELFOF":
        parentObject.descendants = ">>!";
        break;
      default:
        throw new Error(`Invalid descendant found while processing ecl: ${ecl}`);
    }
  }
  if (code === "*" || code === "ANY") parentObject.concept.iri = "*";
  else if (code) parentObject.concept.iri = `http://snomed.info/sct#${code}`;
}

export default {
  eclStringToBuilderObject,
  splitEclByFocusConcept,
  isFocusConceptConjunction,
  isRefinementConjunction,
  isRefinement,
  isFocusConcept,
  splitEclByRefinement,
  processDescendantAndCode,
  extractConcept,
  extractRefinement
};
