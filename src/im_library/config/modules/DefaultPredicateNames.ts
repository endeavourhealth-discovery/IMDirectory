const DEFAULT_PREDICATE_NAMES = {
  "http://www.w3.org/2000/01/rdf-schema#subClassOf": "Is subclass of",
  "http://www.w3.org/2000/01/rdf-schema#label": "Name",
  "http://endhealth.info/im#roleGroup": "Where",
  "http://www.w3.org/2002/07/owl#equivalentClass": "Is equivalent to",
  "http://www.w3.org/2002/07/owl#intersectionOf": "Combination of",
  "http://www.w3.org/2002/07/owl#someValuesFrom": "With a value",
  "http://www.w3.org/2002/07/owl#onProperty": "On property",
  "http://www.w3.org/ns/shacl#class": "Type",
  "http://www.w3.org/ns/shacl#path": "Property",
  "http://www.w3.org/ns/shacl#datatype": "Type"
};

export default { ...DEFAULT_PREDICATE_NAMES };
