import { RDF, IM, XSD, RDFS, EDITOR, COMPONENT, VALIDATION, IM_FUNCTION, QUERY } from "@/vocabulary";

export default {
  testShape: {
    "@id": EDITOR.CONCEPT_SHAPE,
    type: [
      {
        "@id": IM.FORM_GENERATOR
      }
    ],
    label: "Editor - Concept shape",
    comment: "Form editor for a concept",
    targetShape: {
      "@id": IM.CONCEPT
    },
    property: [
      {
        comment: "Summary | rolegroup splitter",
        order: 1,
        name: "splitter",
        path: { "@id": IM.CONCEPT },
        minCount: 0,
        maxCount: 1,
        componentType: { "@id": COMPONENT.HORIZONTAL_LAYOUT },
        argument: [{ parameter: "subGroup widths", valueData: "40%,60%" }],
        property: [
          {
            comment: "Summary layout",
            name: "Summary",
            path: { "@id": IM.CONCEPT },
            showTitle: true,
            order: 1,
            maxCount: 1,
            minCount: 1,
            componentType: { "@id": COMPONENT.VERTICAL_LAYOUT },
            property: [
              {
                comment: "A property that auto generates the type as  concept type",
                order: 1,
                function: {
                  "@id": IM_FUNCTION.GET_ADDITIONAL_ALLOWABLE_TYPES
                },
                name: "Type",
                showTitle: true,
                path: {
                  "@id": RDF.TYPE
                },
                argument: [
                  {
                    valueIri: {
                      "@id": IM.CONCEPT
                    },
                    parameter: "entityIri"
                  }
                ],
                isIri: {
                  "@id": IM.CONCEPT
                },
                minCount: 1,
                componentType: {
                  "@id": COMPONENT.ENTITY_COMBOBOX
                }
              },
              {
                comment: "A property that auto generates a concept iri from the snomed extension",
                order: 2,
                name: "Iri",
                showTitle: true,
                maxCount: 1,
                path: {
                  "@id": IM.ID
                },
                minCount: 1,
                componentType: {
                  "@id": COMPONENT.DROPDOWN_TEXT_INPUT_CONCATENATOR
                },
                valueVariable: "conceptIri",
                function: {
                  "@id": IM_FUNCTION.GET_SET_EDITOR_IRI_SCHEMES
                }
              },
              {
                comment: "Property that derives a concept code from the concept iri",
                order: 3,
                name: "Code",
                showTitle: true,
                maxCount: 1,
                path: {
                  "@id": IM.CODE
                },
                argument: [
                  {
                    parameter: "entityIri",
                    valueVariable: "conceptIri"
                  },
                  {
                    parameter: "fieldName",
                    valueData: "code"
                  }
                ],
                minCount: 1,
                componentType: {
                  "@id": COMPONENT.TEXT_DISPLAY
                },
                datatype: {
                  "@id": XSD.STRING
                },
                function: {
                  "@id": IM_FUNCTION.LOCAL_NAME_RETRIEVER
                }
              },
              {
                comment: "name or main term of concept",
                order: 4,
                name: "Concept name",
                showTitle: true,
                maxCount: 1,
                path: {
                  "@id": RDFS.LABEL
                },
                minCount: 1,
                componentType: {
                  "@id": COMPONENT.TEXT_INPUT
                },
                datatype: {
                  "@id": XSD.STRING
                }
              },
              {
                comment: "optional description",
                order: 5,
                datatype: {
                  "@id": XSD.STRING
                },
                name: "Concept description",
                showTitle: true,
                maxCount: 1,
                path: {
                  "@id": RDFS.COMMENT
                },
                minCount: 0,
                componentType: {
                  "@id": COMPONENT.HTML_INPUT
                }
              },
              {
                comment: "selects the status with a default of draft",
                order: 6,
                select: [
                  {
                    "@id": QUERY.GET_SUBCLASSES
                  }
                ],
                name: "Status",
                showTitle: true,
                maxCount: 1,
                path: {
                  "@id": IM.HAS_STATUS
                },
                argument: [
                  {
                    valueIri: {
                      "@id": IM.STATUS
                    },
                    parameter: "this"
                  }
                ],
                isIri: {
                  "@id": IM.DRAFT
                },
                minCount: 1,
                componentType: {
                  "@id": COMPONENT.ENTITY_DROPDOWN
                },
                forceIsValue: true
              },
              {
                label: "Contained in array builder",
                name: "Is contained in",
                showTitle: true,
                order: 1,
                minCount: 0,
                componentType: {
                  "@id": COMPONENT.ARRAY_BUILDER
                },
                arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
                validation: {
                  "@id": VALIDATION.HAS_PARENT
                },
                validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
                path: {
                  "@id": IM.IS_CONTAINED_IN
                },
                property: [
                  {
                    comment: "selects an entity based on select query",
                    name: "Entity",
                    order: 1,
                    minCount: 0,
                    builderChild: true,
                    componentType: {
                      "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                    },
                    select: [
                      {
                        "@id": QUERY.SEARCH_FOLDERS
                      }
                    ],
                    path: {
                      "@id": IM.IS_CONTAINED_IN
                    }
                  }
                ]
              },
              {
                label: "Subclass of array builder",
                name: "Subclass of",
                showTitle: true,
                order: 1,
                minCount: 0,
                componentType: {
                  "@id": COMPONENT.ARRAY_BUILDER
                },
                arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
                validation: {
                  "@id": VALIDATION.HAS_PARENT
                },
                validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
                path: {
                  "@id": RDFS.SUBCLASS_OF
                },
                valueVariable: "subClassOf",
                property: [
                  {
                    comment: "selects an entity based on select query",
                    name: "Entity",
                    order: 1,
                    minCount: 0,
                    builderChild: true,
                    componentType: {
                      "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                    },
                    path: {
                      "@id": RDFS.SUBCLASS_OF
                    }
                  }
                ]
              },
              {
                comment: "Toggle controlling sub components visibility",
                order: 8,
                name: "Replaced by",
                label: "Deactivate | Activate",
                minCount: 1,
                maxCount: 1,
                path: {
                  "@id": "http://snomed.info/sct#370124000"
                },
                componentType: {
                  "@id": COMPONENT.TOGGLEABLE
                },
                property: [
                  {
                    comment: "selects an entity based on select query",
                    order: 1,
                    select: [
                      {
                        "@id": QUERY.SEARCH_ENTITIES
                      }
                    ],
                    argument: [
                      {
                        parameter: "this",
                        valueIri: {
                          "@id": IM.CONCEPT
                        }
                      }
                    ],
                    name: "Replaced by",
                    showTitle: true,
                    path: {
                      "@id": "http://snomed.info/sct#370124000"
                    },
                    minCount: 1,
                    componentType: {
                      "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                    }
                  }
                ]
              }
            ]
          },
          {
            name: "Splitter",
            comment: "Role group | Mapped to splitter",
            path: { "@id": IM.CONCEPT },
            order: 1,
            minCount: 0,
            maxCount: 1,
            componentType: { "@id": COMPONENT.VERTICAL_LAYOUT },
            property: [
              {
                label: "Property Group - Role group builder",
                order: 1,
                maxCount: 1,
                path: {
                  "@id": IM.ROLE_GROUP
                },
                name: "Role group",
                minCount: 0,
                componentType: {
                  "@id": COMPONENT.ROLE_GROUP_BUILDER
                }
              },
              {
                label: "Property Group - Mapped to array builder",
                order: 1,
                maxCount: 1,
                showTitle: true,
                path: {
                  "@id": IM.MATCHED_TO
                },
                property: [
                  {
                    comment: "selects an entity based on select query",
                    order: 1,
                    builderChild: true,
                    name: "Entity",
                    path: {
                      "@id": IM.MATCHED_TO
                    },
                    minCount: 0,
                    componentType: {
                      "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                    }
                  }
                ],
                name: "Mapped to",
                minCount: 0,
                componentType: {
                  "@id": COMPONENT.ARRAY_BUILDER
                },
                arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
              },
              {
                name: "Term code",
                comment: "Term code array builder",
                order: 1,
                path: {
                  "@id": IM.HAS_TERM_CODE
                },
                showTitle: true,
                minCount: 0,
                componentType: { "@id": COMPONENT.ARRAY_BUILDER },
                arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
                validation: { "@id": VALIDATION.IS_TERMCODE },
                property: [
                  {
                    name: "Term code",
                    path: { "@id": IM.HAS_TERM_CODE },
                    builderChild: true,
                    order: 1,
                    minCount: 0,
                    componentType: { "@id": COMPONENT.TERM_CODE_EDITOR },
                    validation: { "@id": VALIDATION.IS_TERMCODE }
                  }
                ]
              },
              {
                name: "Child of",
                comment: "Child of array builder",
                order: 1,
                path: { "@id": IM.IS_CHILD_OF },
                showTitle: true,
                minCount: 0,
                componentType: { "@id": COMPONENT.ARRAY_BUILDER },
                arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
                property: [
                  {
                    name: "Child of",
                    path: { "@id": IM.IS_CHILD_OF },
                    builderChild: true,
                    order: 1,
                    minCount: 0,
                    componentType: { "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  validationCheckStatus: [
    {
      deferred: expect.anything(),
      key: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
    },
    {
      deferred: expect.anything(),
      key: "http://endhealth.info/im#id"
    },
    {
      deferred: expect.anything(),
      key: "http://endhealth.info/im#code"
    },
    {
      deferred: expect.anything(),
      key: "http://www.w3.org/2000/01/rdf-schema#label"
    },
    {
      deferred: expect.anything(),
      key: "http://www.w3.org/2000/01/rdf-schema#comment"
    },
    {
      deferred: expect.anything(),
      key: "http://endhealth.info/im#status"
    },
    {
      deferred: expect.anything(),
      key: "http://endhealth.info/im#isContainedIn"
    },
    {
      deferred: expect.anything(),
      key: "http://www.w3.org/2000/01/rdf-schema#subClassOf"
    },
    {
      deferred: expect.anything(),
      key: "http://endhealth.info/im#roleGroup"
    },
    {
      deferred: expect.anything(),
      key: "http://endhealth.info/im#matchedTo"
    },
    { deferred: expect.anything(), key: "http://endhealth.info/im#hasTermCode" },
    { deferred: expect.anything(), key: "http://endhealth.info/im#isChildOf" }
  ],
  testEntity: {
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{ "@id": "http://endhealth.info/im#Concept", name: "Terminology concept" }],
    "http://www.w3.org/2000/01/rdf-schema#label": "Adverse reaction to Testogel",
    "http://endhealth.info/im#status": { "@id": "http://endhealth.info/im#Draft", name: "Draft" },
    "http://endhealth.info/im#isA": [
      { "@id": "http://endhealth.info/im#24951000252112", name: "Adverse reaction to Testogel" },
      { "@id": "http://snomed.info/sct#281647001", name: "Adverse reaction (disorder)" },
      { "@id": "http://snomed.info/sct#64572001", name: "Disease (disorder)" },
      { "@id": "http://snomed.info/sct#404684003", name: "Clinical finding (finding)" }
    ],
    "http://www.w3.org/2000/01/rdf-schema#subClassOf": [{ "@id": "http://snomed.info/sct#281647001", name: "Adverse reaction (disorder)" }],
    "http://endhealth.info/im#definitionalStatus": [{ "@id": "http://endhealth.info/im#1251000252106", name: "Necessary and sufficient" }],
    "http://endhealth.info/im#code": "24951000252112",
    "http://endhealth.info/im#roleGroup": [
      {
        "http://endhealth.info/im#groupNumber": 1,
        "http://snomed.info/sct#246075003": [{ "@id": "http://snomed.info/sct#9364701000001104", name: "Testogel (product)" }]
      }
    ],
    "http://endhealth.info/im#scheme": [{ "@id": "http://endhealth.info/im#", name: "Endeavour code scheme and graph" }],
    "http://endhealth.info/im#id": "http://endhealth.info/im#24951000252112"
  },
  testValueVariableMap: new Map<string, any>()
    .set("conceptIri", "http://endhealth.info/im#24951000252112")
    .set("subClassOf", [{ "@id": "http://snomed.info/sct#281647001", name: "Adverse reaction (disorder)" }])
    .set("propertyIri1", { "@id": "http://snomed.info/sct#246075003", name: "Causative agent (attribute)" })
};
