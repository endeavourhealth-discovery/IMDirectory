export function builderConceptToEcl(builderConcept: any, builderParent: any, includeTerms: boolean) {
  let ecl = "";
  if (builderConcept.exclude) ecl += "MINUS ";
  if (builderConcept.type === "ExpressionConstraint" && builderParent.type === "BoolGroup" && builderParent.items?.length > 1 && builderConcept.items?.length)
    ecl += "( ";
  if (builderConcept.constraintOperator) ecl += builderConcept.constraintOperator + " ";
  if (builderConcept.concept) {
    if (builderConcept.concept && builderConcept.concept.code) {
      if (builderConcept.concept.code === "any") {
        ecl += "*";
        if (includeTerms) ecl += " | ANY | ";
      } else {
        ecl += builderConcept.concept.code;
        ecl = addNameToEcl(ecl, builderConcept, includeTerms);
      }
    } else if (builderConcept.concept && builderConcept.concept.iri) {
      ecl += builderConcept.concept.iri.split("#")[1];
      ecl = addNameToEcl(ecl, builderConcept, includeTerms);
    } else ecl += "[ UNKNOWN CONCEPT ]";
  } else if (builderConcept.conceptSingle && builderConcept.conceptSingle.code) {
    if (builderConcept.conceptSingle.code === "any") {
      ecl += "*";
      if (includeTerms) ecl += " | ANY | ";
    } else {
      ecl += builderConcept.conceptSingle.code;
      ecl = addNameToEcl(ecl, builderConcept, includeTerms);
    }
  } else if (builderConcept.conceptSingle && builderConcept.conceptSingle.iri) {
    ecl += builderConcept.conceptSingle.iri.split("#")[1];
    ecl = addNameToEcl(ecl, builderConcept, includeTerms);
  } else ecl += "[ UNKNOWN CONCEPT ]";

  return ecl;
}

function addNameToEcl(ecl: string, builderConcept: any, includeTerms: boolean): string {
  if (includeTerms && builderConcept.conceptSingle?.name) ecl += " | " + builderConcept.conceptSingle.name + " | ";
  else if (includeTerms && builderConcept.concept?.name) ecl += " | " + builderConcept.concept.name + " | ";
  return ecl;
}

export default { builderConceptToEcl };
