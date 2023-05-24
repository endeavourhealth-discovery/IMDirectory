import { FormGenerator } from "@im-library/interfaces/AutoGen";
import { FUNCTION, IM, QUERY, RDF, RDFS, VALIDATION, XSD } from "@im-library/vocabulary";

const ConceptSetShape: FormGenerator = {
  "@id": "im:Editor_ConceptSetShape",
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Concept set shape",
  comment: "Form editor for a concept set",
  targetShape: {
    "@id": IM.SET
  },
  property: [
    {
      comment: "Summary and definition splitter",
      order: 1,
      name: "splitter",
      path: {
        "@id": IM.DEFINITION
      },
      minCount: 1,
      maxCount: 1,
      componentType: {
        "@id": IM.HORIZONTAL_LAYOUT
      },
      argument: [
        {
          parameter: "subGroup widths",
          valueData: "50%,50%"
        }
      ],
      property: [
        {
          comment: "summary vertical row layout",
          name: "vertical row",
          path: {
            "@id": RDF.TYPE
          },
          order: 1,
          minCount: 1,
          maxCount: 1,
          componentType: {
            "@id": IM.VERTICAL_LAYOUT
          },
          property: [
            {
              comment: "A property that auto generates the type as  concept type",
              order: 1,
              function: {
                "@id": FUNCTION.GET_ADDITIONAL_ALLOWABLE_TYPES
              },
              name: "type",
              path: {
                "@id": RDF.TYPE
              },
              argument: [
                {
                  valueIri: {
                    "@id": IM.CONCEPT_SET
                  },
                  parameter: "entityIri"
                }
              ],
              isIri: {
                "@id": IM.CONCEPT_SET
              },
              minCount: 1,
              componentType: {
                "@id": IM.ENTITY_COMBOBOX_COMPONENT
              }
            },
            {
              comment: "User generates iri based on scheme and user text input",
              order: 2,
              name: "iri",
              maxCount: 1,
              path: {
                "@id": IM.ID
              },
              minCount: 1,
              componentType: {
                "@id": IM.DROPDOWN_TEXT_INPUT_CONCATENATOR
              },
              class: {
                "@id": IM.CONCEPT
              },
              function: {
                "@id": FUNCTION.GET_SET_EDITOR_IRI_SCHEMES
              }
            },
            {
              comment: "name or main term of concept",
              order: 3,
              name: "Concept name",
              maxCount: 1,
              path: {
                "@id": RDFS.LABEL
              },
              minCount: 1,
              componentType: {
                "@id": IM.TEXT_INPUT_COMPONENT
              },
              dataType: {
                "@id": XSD.STRING
              }
            },
            {
              comment: "optional description",
              order: 4,
              datatype: {
                "@id": XSD.STRING
              },
              name: "Concept description",
              maxCount: 1,
              path: {
                "@id": RDFS.COMMENT
              },
              minCount: 1,
              componentType: {
                "@id": IM.HTML_INPUT_COMPONENT
              }
            },
            {
              comment: "selects the status with a default of draft",
              order: 5,
              select: [
                {
                  "@id": QUERY.GET_ISAS
                }
              ],
              name: "status",
              maxCount: 1,
              path: {
                "@id": IM.STATUS
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
                "@id": IM.ENTITY_DROPDOWN_COMPONENT
              },
              class: {
                "@id": IM.STATUS
              },
              forceIsValue: true
            },
            {
              comment: "Toggle controlling sub components visibility",
              order: 6,
              name: "Replaced by",
              label: "Deactivate | Activate",
              minCount: 1,
              maxCount: 1,
              path: {
                "@id": "http://snomed.info/sct#370124000"
              },
              componentType: {
                "@id": IM.TOGGLEABLE_COMPONENT
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
                        "@id": IM.CONCEPT_SET
                      }
                    }
                  ],
                  name: "Replaced by",
                  path: {
                    "@id": "http://snomed.info/sct#370124000"
                  },
                  minCount: 1,
                  componentType: {
                    "@id": IM.ENTITY_SEARCH_COMPONENT
                  },
                  class: {
                    "@id": IM.CONCEPT
                  }
                }
              ]
            }
          ]
        },
        {
          label: "Property group - set definition builder",
          name: "Definition",
          order: 2,
          minCount: 1,
          componentType: {
            "@id": IM.SET_DEFINITION_BUILDER
          },
          validation: {
            "@id": VALIDATION.IS_DEFINITION
          },
          validationErrorMessage: "Set definition is not valid",
          path: {
            "@id": IM.DEFINITION
          }
        }
      ]
    },
    {
      label: "Property group - contained in array builder",
      name: "isContainedIn",
      order: 1,
      minCount: 1,
      componentType: {
        "@id": IM.ARRAY_BUILDER_COMPONENT
      },
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
          minCount: 1,
          builderChild: true,
          componentType: {
            "@id": IM.ENTITY_SEARCH_COMPONENT
          },
          select: [
            {
              "@id": QUERY.SEARCH_MAIN_TYPES
            }
          ],
          path: {
            "@id": IM.IS_CONTAINED_IN
          },
          class: [
            {
              "@id": IM.FOLDER
            },
            {
              "@id": IM.CONCEPT_SET
            }
          ]
        }
      ]
    }
  ]
};

export default ConceptSetShape;
