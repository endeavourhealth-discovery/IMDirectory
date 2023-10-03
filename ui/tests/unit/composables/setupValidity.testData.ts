import ConceptShape from "@/constants/editorShapes/Concept";
import { Argument, FormGenerator, PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import { RDF, IM, XSD, RDFS, SHACL } from "@im-library/vocabulary";

export default {
  testShape: {
    "@id": IM.editor.CONCEPT_SHAPE,
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
        componentType: { "@id": IM.component.HORIZONTAL_LAYOUT },
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
            componentType: { "@id": IM.component.VERTICAL_LAYOUT },
            property: [
              {
                comment: "A property that auto generates the type as  concept type",
                order: 1,
                function: {
                  "@id": IM.function.GET_ADDITIONAL_ALLOWABLE_TYPES
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
                  "@id": IM.component.ENTITY_COMBOBOX
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
                  "@id": IM.component.DROPDOWN_TEXT_INPUT_CONCATENATOR
                },
                valueVariable: "conceptIri",
                function: {
                  "@id": IM.function.GET_SET_EDITOR_IRI_SCHEMES
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
                  "@id": IM.component.TEXT_DISPLAY
                },
                datatype: {
                  "@id": XSD.STRING
                },
                function: {
                  "@id": IM.function.LOCAL_NAME_RETRIEVER
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
                  "@id": IM.component.TEXT_INPUT
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
                  "@id": IM.component.HTML_INPUT
                }
              },
              {
                comment: "selects the status with a default of draft",
                order: 6,
                select: [
                  {
                    "@id": IM.query.GET_DESCENDANTS
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
                  "@id": IM.component.ENTITY_DROPDOWN
                },
                forceIsValue: true
              },
              {
                label: "Contained in array builder",
                name: "isContainedIn",
                showTitle: true,
                order: 1,
                minCount: 0,
                componentType: {
                  "@id": IM.component.ARRAY_BUILDER
                },
                arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
                validation: {
                  "@id": IM.validation.HAS_PARENT
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
                      "@id": IM.component.ENTITY_SEARCH
                    },
                    select: [
                      {
                        "@id": IM.query.SEARCH_FOLDERS
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
                name: "subclassOf",
                showTitle: true,
                order: 1,
                minCount: 0,
                componentType: {
                  "@id": IM.component.ARRAY_BUILDER
                },
                arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
                validation: {
                  "@id": IM.validation.HAS_PARENT
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
                      "@id": IM.component.ENTITY_SEARCH
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
                  "@id": IM.component.TOGGLEABLE
                },
                property: [
                  {
                    comment: "selects an entity based on select query",
                    order: 1,
                    select: [
                      {
                        "@id": IM.query.SEARCH_ENTITIES
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
                      "@id": IM.component.ENTITY_SEARCH
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
            componentType: { "@id": IM.component.VERTICAL_LAYOUT },
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
                  "@id": IM.component.ROLE_GROUP_BUILDER
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
                      "@id": IM.component.ENTITY_SEARCH
                    }
                  }
                ],
                name: "Mapped to",
                minCount: 0,
                componentType: {
                  "@id": IM.component.ARRAY_BUILDER
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
                componentType: { "@id": IM.component.ARRAY_BUILDER },
                arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
                validation: { "@id": IM.validation.IS_TERMCODE },
                property: [
                  {
                    name: "Term code",
                    path: { "@id": IM.HAS_TERM_CODE },
                    builderChild: true,
                    order: 1,
                    minCount: 0,
                    componentType: { "@id": IM.component.TERM_CODE_EDITOR },
                    validation: { "@id": IM.validation.IS_TERMCODE }
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
                componentType: { "@id": IM.component.ARRAY_BUILDER },
                arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
                property: [
                  {
                    name: "Child of",
                    path: { "@id": IM.IS_CHILD_OF },
                    builderChild: true,
                    order: 1,
                    minCount: 0,
                    componentType: { "@id": IM.component.ENTITY_SEARCH }
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
      checkCompleted: false,
      key: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#id"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#code"
    },
    {
      checkCompleted: false,
      key: "http://www.w3.org/2000/01/rdf-schema#label"
    },
    {
      checkCompleted: false,
      key: "http://www.w3.org/2000/01/rdf-schema#comment"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#status"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#isContainedIn"
    },
    {
      checkCompleted: false,
      key: "http://www.w3.org/2000/01/rdf-schema#subClassOf"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#roleGroup"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#matchedTo"
    },
    { checkCompleted: false, key: "http://endhealth.info/im#hasTermCode" },
    { checkCompleted: false, key: "http://endhealth.info/im#isChildOf" }
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
