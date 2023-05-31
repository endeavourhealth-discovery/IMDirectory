import { FormGenerator } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS, XSD } from "@im-library/vocabulary";

const ConceptSetShape: FormGenerator = {
  "@id": IM.editor.CONCEPT_SET_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Concept set shape",
  comment: "Form editor for a concept set",
  targetShape: {
    "@id": IM.CONCEPT_SET
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
        "@id": IM.component.HORIZONTAL_LAYOUT
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
            "@id": IM.component.VERTICAL_LAYOUT
          },
          property: [
            {
              comment: "A property that auto generates the type as  concept type",
              order: 1,
              function: {
                "@id": IM.function.GET_ADDITIONAL_ALLOWABLE_TYPES
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
                "@id": IM.component.ENTITY_COMBOBOX
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
                "@id": IM.component.DROPDOWN_TEXT_INPUT_CONCATENATOR
              },
              function: {
                "@id": IM.function.GET_SET_EDITOR_IRI_SCHEMES
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
                "@id": IM.component.TEXT_INPUT
              },
              datatype: {
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
                "@id": IM.component.HTML_INPUT
              }
            },
            {
              comment: "selects the status with a default of draft",
              order: 5,
              select: [
                {
                  "@id": IM.query.GET_ISAS
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
                "@id": IM.component.ENTITY_DROPDOWN
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
                    "@id": IM.component.ENTITY_SEARCH
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
            "@id": IM.component.SET_DEFINITION_BUILDER
          },
          validation: {
            "@id": IM.validation.IS_DEFINITION
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
        "@id": IM.component.ARRAY_BUILDER
      },
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
          minCount: 1,
          builderChild: true,
          componentType: {
            "@id": IM.component.ENTITY_SEARCH
          },
          select: [
            {
              "@id": IM.query.SEARCH_MAIN_TYPES
            }
          ],
          path: {
            "@id": IM.IS_CONTAINED_IN
          }
        }
      ]
    }
  ]
};

export default ConceptSetShape;
