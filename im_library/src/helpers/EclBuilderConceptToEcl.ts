export function builderConceptToEcl(builderConcept: any, builderParent: any, includeTerms: boolean) {
  let ecl = "";
  if (builderConcept.exclude) ecl += "MINUS ";
  if (builderConcept.type === "Concept" && builderParent.type === "BoolGroup" && builderParent.items?.length > 1 && builderConcept.items?.length) ecl += "( ";
  if (builderConcept.descendants) ecl += builderConcept.descendants + " ";
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

  return ecl;
}

function addNameToEcl(ecl: string, builderConcept: any, includeTerms: boolean): string {
  if (includeTerms && builderConcept.concept.name) ecl += " | " + builderConcept.concept.name + " | ";
  return ecl;
}

export default { builderConceptToEcl };
