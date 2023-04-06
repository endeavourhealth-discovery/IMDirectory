export function builderConceptToEcl(builderConcept: any, includeTerms: boolean) {
  let ecl = "";
  if (builderConcept.exclude) ecl += "MINUS ";
  if (builderConcept.descendants) ecl += builderConcept.descendants + " ";
  if (builderConcept.concept && builderConcept.concept.code) {
    if (builderConcept.concept.code === "any") {
      ecl += "*";
      if (includeTerms) ecl += " | ANY | ";
    } else {
      ecl += builderConcept.concept.code;
      addNameToEcl(ecl, builderConcept, includeTerms);
    }
  } else if (builderConcept.concept && builderConcept.concept.iri) {
    ecl += builderConcept.concept.iri.split("#")[1];
    addNameToEcl(ecl, builderConcept, includeTerms);
  } else ecl += "[ UNKNOWN CONCEPT ]";

  return ecl;
}

function addNameToEcl(ecl: string, builderConcept: any, includeTerms: boolean) {
  if (includeTerms && builderConcept.concept.name) ecl += " | " + builderConcept.concept.name + " | ";
}

export default { builderConceptToEcl };
