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
              label: "Summary",
              order: 1,
              maxCount: 1,
              path: {
                "@id": IM.CONCEPT
              },
              name: "Summary",
              minCount: 0,
              componentType: {
                "@id": IM.component.CONCEPT_SUMMARY
              },
              showTitle: true,
              validation: { "@id": IM.validation.IS_SUMMARY }
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
