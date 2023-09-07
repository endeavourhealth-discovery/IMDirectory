import { FormGenerator } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS, XSD } from "@im-library/vocabulary";

const CohortQueryShape: FormGenerator = {
  "@id": IM.editor.COHORT_QUERY_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Cohort query shape",
  comment: "Form editor for a cohort query",
  targetShape: {
    "@id": IM.COHORT_QUERY
  },
  property: [
    {
      comment: "Summary | rolegroup splitter",
      order: 1,
      name: "splitter",
      path: { "@id": IM.CONCEPT },
      minCount: 1,
      maxCount: 1,
      componentType: { "@id": IM.component.HORIZONTAL_LAYOUT },
      argument: [{ parameter: "subGroup widths", valueData: "40%,60%" }],
      property: [
        {
          label: "Property group - Summary details",
          name: "Summary",
          showTitle: true,
          order: 1,
          minCount: 1,
          maxCount: 1,
          path: {
            "@id": RDF.TYPE
          },
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
              name: "Type",
              showTitle: true,
              path: {
                "@id": RDF.TYPE
              },
              argument: [
                {
                  valueIri: {
                    "@id": IM.COHORT_QUERY
                  },
                  parameter: "entityIri"
                }
              ],
              isIri: {
                "@id": IM.COHORT_QUERY
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
              name: "Description",
              showTitle: true,
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
              label: "Property group - contained in array builder",
              name: "isContainedIn",
              showTitle: true,
              order: 6,
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
                      "@id": IM.query.SEARCH_FOLDERS
                    }
                  ],
                  path: {
                    "@id": IM.IS_CONTAINED_IN
                  }
                }
              ]
            }
          ]
        },
        {
          label: "Property group - query definition builder",
          name: "Query definition builder",
          showTitle: true,
          order: 1,
          minCount: 1,
          maxCount: 1,
          path: {
            "@id": RDF.TYPE
          },
          componentType: {
            "@id": IM.component.VERTICAL_LAYOUT
          },
          property: [
            {
              order: 1,
              minCount: 1,
              componentType: {
                "@id": IM.component.QUERY_DEFINITION_BUILDER
              },
              validation: {
                "@id": IM.validation.IS_DEFINITION
              },
              validationErrorMessage: "Query definition is not valid",
              path: {
                "@id": IM.DEFINITION
              }
            }
          ]
        }
      ]
    }
  ]
};

export default CohortQueryShape;
