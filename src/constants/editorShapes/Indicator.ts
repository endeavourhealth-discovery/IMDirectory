import { COMPONENT, EDITOR, IM, IM_FUNCTION, QUERY, RDF, RDFS, VALIDATION, XSD } from "@endeavour/vue-library/enums";
import type { FormGenerator } from "@endeavour/vue-library/interfaces";

const IndicatorShape: FormGenerator = {
  iri: EDITOR.INDICATOR_SHAPE,
  type: [
    {
      iri: IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Cohort query shape",
  comment: "Form editor for a cohort query",
  targetShape: {
    iri: IM.INDICATOR
  },
  property: [
    {
      comment: "Splitter , with summary and query definition builder tabs. ",
      order: 1,
      name: "splitter",
      path: { iri: IM.CONCEPT },
      maxCount: 1,
      componentType: { iri: COMPONENT.HORIZONTAL_LAYOUT },
      argument: [
        {
          parameter: "subGroup widths",
          valueData: "40%,60%"
        }
      ],
      property: [
        {
          label: "Property group - Summary details",
          name: "Summary",
          showTitle: false,
          order: 1,
          maxCount: 1,
          path: {
            iri: RDF.TYPE
          },
          componentType: {
            iri: COMPONENT.VERTICAL_LAYOUT
          },

          property: [
            {
              comment: "A property that auto generates an iri ",
              order: 2,
              name: "Iri",
              showTitle: true,
              maxCount: 1,
              path: {
                iri: IM.ID
              },
              minCount: 1,
              componentType: {
                iri: COMPONENT.IRI_BUILDER
              },
              valueVariable: "conceptIri",
              function: {
                iri: IM_FUNCTION.GET_USER_EDITABLE_SCHEMES
              },
              validation: { iri: VALIDATION.IS_IRI }
            },

            {
              comment: "name or main term of concept",
              order: 3,
              name: "Name",
              showTitle: true,
              maxCount: 1,
              path: {
                iri: RDFS.LABEL
              },
              minCount: 1,
              componentType: {
                iri: COMPONENT.TEXT_INPUT
              },
              datatype: {
                iri: XSD.STRING
              }
            },
            {
              comment: "optional preferred name for efficiency during searching",
              order: 4,
              name: "Preferred name",
              showTitle: true,
              maxCount: 1,
              path: { iri: IM.PREFERRED_NAME },
              minCount: 0,
              componentType: { iri: COMPONENT.TEXT_INPUT }
            },
            {
              comment: "optional description",
              order: 5,
              datatype: {
                iri: XSD.STRING
              },
              name: "Description",
              showTitle: true,
              maxCount: 1,
              path: {
                iri: RDFS.COMMENT
              },
              minCount: 1,
              componentType: {
                iri: COMPONENT.HTML_INPUT
              }
            },
            {
              name: "Status",
              order: 6,
              path: { iri: IM.HAS_STATUS },
              componentType: { iri: COMPONENT.ARRAY_BUILDER },
              validation: { iri: VALIDATION.IS_STATUS },
              minCount: 1,
              arrayButtons: { up: false, down: false, plus: false, minus: false },
              property: [
                {
                  comment: "selects the status with a default of draft",
                  order: 6,
                  select: [
                    {
                      iri: QUERY.GET_SUBCLASSES
                    }
                  ],
                  name: "Status",
                  showTitle: true,
                  builderChild: true,
                  maxCount: 1,
                  path: {
                    iri: IM.HAS_STATUS
                  },
                  argument: [
                    {
                      valueIri: {
                        iri: IM.STATUS
                      },
                      parameter: "this"
                    }
                  ],
                  isIri: {
                    iri: IM.DRAFT
                  },
                  minCount: 1,
                  componentType: {
                    iri: COMPONENT.ENTITY_DROPDOWN
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
                iri: COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                iri: VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'isContainedIn'.",
              path: {
                iri: IM.IS_CONTAINED_IN
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  name: "Entity",
                  order: 1,
                  minCount: 0,
                  builderChild: true,
                  componentType: {
                    iri: COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  },
                  select: [
                    {
                      iri: QUERY.SEARCH_ALLOWABLE_CONTAINED_IN
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        iri: IM.QUERY
                      },
                      parameter: "value"
                    }
                  ],
                  path: {
                    iri: IM.IS_CONTAINED_IN
                  }
                }
              ]
            },
            {
              label: "Property group - sub-indicator in array builder",
              name: "Sub-indicator of",
              showTitle: true,
              order: 6,
              minCount: 0,
              componentType: {
                iri: COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                iri: VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent indicator. Add a parent inidicator to 'isSubInidicatorOf'.",
              path: {
                iri: IM.IS_SUBINDICATOR_OF
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  name: "Entity",
                  order: 1,
                  minCount: 0,
                  builderChild: true,
                  componentType: {
                    iri: COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  },
                  select: [
                    {
                      iri: QUERY.SEARCH_ALLOWABLE_SUBCLASS
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        iri: IM.INDICATOR
                      },
                      parameter: "value"
                    }
                  ],
                  path: {
                    iri: IM.IS_SUBINDICATOR_OF
                  }
                }
              ]
            },
            {
              label: "Property group - denominator in array builder",
              name: "Denominator for indicator",
              showTitle: true,
              order: 6,
              minCount: 0,
              maxCount: 1,
              componentType: {
                iri: COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                iri: VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a denominator. Add a parent cohort to 'cohort'.",
              path: {
                iri: IM.DENOMINATOR
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  name: "Entity",
                  order: 1,
                  minCount: 0,
                  builderChild: true,
                  componentType: {
                    iri: COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  },
                  select: [
                    {
                      iri: QUERY.SEARCH_ALLOWABLE_SUBCLASS
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        iri: IM.QUERY
                      },
                      parameter: "value"
                    }
                  ],
                  path: {
                    iri: IM.DENOMINATOR
                  }
                }
              ]
            },
            {
              label: "Property group - Query selector in array builder",
              name: "Numerator of the indicator",
              showTitle: true,
              order: 6,
              minCount: 1,
              maxCount: 1,
              componentType: {
                iri: COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                iri: VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing an enumerator. Add an enumerator to the indicator.",
              path: {
                iri: IM.NUMERATOR
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  name: "Entity",
                  order: 1,
                  minCount: 0,
                  builderChild: true,
                  componentType: {
                    iri: COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  },
                  select: [
                    {
                      iri: QUERY.SEARCH_ALLOWABLE_SUBCLASS
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        iri: IM.QUERY
                      },
                      parameter: "value"
                    }
                  ],
                  path: {
                    iri: IM.NUMERATOR
                  }
                }
              ]
            },
            {
              label: "Property group - Query selector in array builder",
              name: "Data set of the indicator",
              showTitle: true,
              order: 6,
              minCount: 0,
              maxCount: 1,
              componentType: {
                iri: COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                iri: VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing  dataset.",
              path: {
                iri: IM.HAS_DATASET
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  name: "Entity",
                  order: 1,
                  minCount: 0,
                  builderChild: true,
                  componentType: {
                    iri: COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  },
                  select: [
                    {
                      iri: QUERY.SEARCH_ALLOWABLE_SUBCLASS
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        iri: IM.QUERY
                      },
                      parameter: "value"
                    }
                  ],
                  path: {
                    iri: IM.HAS_DATASET
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

export default IndicatorShape;
