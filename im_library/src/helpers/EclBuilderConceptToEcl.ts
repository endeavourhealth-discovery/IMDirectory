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
      if (includeTerms && builderConcept.concept.name) ecl += " | " + builderConcept.concept.name + " | ";
    }
  } else if (builderConcept.concept && builderConcept.concept.iri) {
    ecl += builderConcept.concept.iri.split("#")[1];
    if (includeTerms && builderConcept.concept.name) ecl += " | " + builderConcept.concept.name + " | ";
  } else ecl += "[ UNKNOWN CONCEPT ]";

  return ecl;
}

export default { builderConceptToEcl };
