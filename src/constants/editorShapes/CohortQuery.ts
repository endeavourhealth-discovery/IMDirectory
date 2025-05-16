import { FormGenerator } from "@/interfaces/AutoGen";
import { IM, RDF, RDFS, EDITOR, COMPONENT, IM_FUNCTION, VALIDATION, QUERY, XSD } from "@/vocabulary";

const CohortQueryShape: FormGenerator = {
  "@id": EDITOR.COHORT_QUERY_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Cohort query shape",
  comment: "Form editor for a cohort query",
  targetShape: {
    "@id": IM.QUERY
  },
  property: [
    {
      comment: "Tab menu , with summary and query definition builder tabs. ",
      order: 1,
      name: "splitter",
      path: { "@id": IM.CONCEPT },
      maxCount: 1,
      componentType: { "@id": COMPONENT.TAB_LAYOUT },
      property: [
        {
          label: "Property group - query definition builder",
          name: "Cohort definition builder",
          showTitle: false,
          order: 1,
          maxCount: 1,
          path: {
            "@id": RDF.TYPE
          },
          componentType: {
            "@id": COMPONENT.VERTICAL_LAYOUT
          },
          property: [
            {
              order: 1,
              minCount: 1,
              componentType: {
                "@id": COMPONENT.QUERY_DEFINITION_BUILDER
              },
              validation: {
                "@id": VALIDATION.IS_DEFINITION
              },
              validationErrorMessage: "Query definition is not valid",
              path: {
                "@id": IM.DEFINITION
              }
            }
          ]
        },
        {
          label: "Property group - data set definition builder",
          name: "Dataset builder",
          showTitle: false,
          order: 1,
          argument: [
            {
              valueData: IM.DATASET_QUERY,
              parameter: "value"
            }
          ],
          maxCount: 1,
          path: {
            "@id": RDF.TYPE
          },
          componentType: {
            "@id": COMPONENT.VERTICAL_LAYOUT
          },
          property: [
            {
              order: 1,
              minCount: 1,
              componentType: {
                "@id": COMPONENT.QUERY_DEFINITION_BUILDER
              },
              validation: {
                "@id": VALIDATION.IS_DEFINITION
              },
              validationErrorMessage: "Query definition is not valid",
              path: {
                "@id": IM.DEFINITION
              }
            }
          ]
        },
        {
          label: "Property group - Summary details",
          name: "Summary",
          showTitle: false,
          order: 1,
          maxCount: 1,
          path: {
            "@id": RDF.TYPE
          },
          componentType: {
            "@id": COMPONENT.VERTICAL_LAYOUT
          },
          property: [
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
                "@id": COMPONENT.IRI_BUILDER
              },
              valueVariable: "conceptIri",
              function: {
                "@id": IM_FUNCTION.GET_USER_EDITABLE_SCHEMES
              },
              validation: { "@id": VALIDATION.IS_IRI }
            },

            {
              comment: "name or main term of concept",
              order: 3,
              name: "Name",
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
              comment: "optional peferred name for efficiency during searching",
              order: 4,
              name: "Preferred name",
              showTitle: true,
              maxCount: 1,
              path: { "@id": IM.PREFERRED_NAME },
              minCount: 0,
              componentType: { "@id": COMPONENT.TEXT_INPUT }
            },
            {
              comment: "optional description",
              order: 5,
              datatype: {
                "@id": XSD.STRING
              },
              name: "Description",
              showTitle: true,
              maxCount: 1,
              path: {
                "@id": RDFS.COMMENT
              },
              minCount: 1,
              componentType: {
                "@id": COMPONENT.HTML_INPUT
              }
            },
            {
              name: "Status",
              order: 6,
              path: { "@id": IM.HAS_STATUS },
              componentType: { "@id": COMPONENT.ARRAY_BUILDER },
              validation: { "@id": VALIDATION.IS_STATUS },
              minCount: 1,
              arrayButtons: { up: false, down: false, plus: false, minus: false },
              property: [
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
                  builderChild: true,
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
                }
              ]
            },
            {
              label: "Property group - contained in array builder",
              name: "Contained in",
              showTitle: true,
              order: 6,
              minCount: 0,
              componentType: {
                "@id": COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                "@id": VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'isContainedIn'.",
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
                      "@id": QUERY.SEARCH_ALLOWABLE_CONTAINED_IN
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        "@id": IM.QUERY
                      },
                      parameter: "value"
                    }
                  ],
                  path: {
                    "@id": IM.IS_CONTAINED_IN
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export default CohortQueryShape;
