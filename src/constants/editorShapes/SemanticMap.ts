import { COMPONENT, EDITOR, IM, IM_FUNCTION, QUERY, RDF, RDFS, VALIDATION, XSD } from "@endeavour/vue-library/enums";
import { type FormGenerator, FormGeneratorSchema } from "@endeavour/vue-library/models";

const SemanticMapShape = FormGeneratorSchema.parse({
  iri: EDITOR.SEMANTIC_MAP_SHAPE,
  type: [
    {
      iri: IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Semantic map shape",
  comment: "Form editor for a concept",
  targetShape: {
    iri: IM.SEMANTIC_MAP
  },
  property: [
    {
      comment: "Summary | map entry splitter",
      order: 1,
      name: "splitter",
      path: { iri: IM.CONCEPT },
      maxCount: 1,
      componentType: { iri: COMPONENT.HORIZONTAL_LAYOUT },
      argument: [{ parameter: "subGroup widths", valueData: "40%,60%" }],
      property: [
        {
          comment: "Summary layout",
          name: "Summary",
          path: { iri: IM.SEMANTIC_MAP },
          showTitle: true,
          order: 1,
          maxCount: 1,
          componentType: { iri: COMPONENT.VERTICAL_LAYOUT },
          property: [
            {
              comment: "A property that auto generates the type as  semantic map type",
              order: 1,
              function: {
                iri: IM_FUNCTION.GET_ADDITIONAL_ALLOWABLE_TYPES
              },
              name: "Type",
              showTitle: true,
              path: {
                iri: RDF.TYPE
              },
              argument: [
                {
                  valueIri: {
                    iri: IM.SEMANTIC_MAP
                  },
                  parameter: "entityIri"
                }
              ],
              isIri: {
                iri: IM.SEMANTIC_MAP
              },
              minCount: 1,
              componentType: {
                iri: COMPONENT.ENTITY_COMBOBOX
              }
            },
            {
              comment: "A property that auto generates an iri",
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
              order: 4,
              name: "Map name",
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
              comment: "optional description",
              order: 6,
              datatype: {
                iri: XSD.STRING
              },
              name: "Map description",
              showTitle: true,
              maxCount: 1,
              path: {
                iri: RDFS.COMMENT
              },
              minCount: 0,
              componentType: {
                iri: COMPONENT.HTML_INPUT
              }
            },
            {
              name: "Status",
              order: 7,
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
              label: "Contained in array builder",
              name: "Contained in",
              showTitle: true,
              order: 11,
              minCount: 0,
              componentType: {
                iri: COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                iri: VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing the folder its in",
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
                  isValidEntity: { iri: QUERY.IS_VALID_TYPE },
                  isValidArguments: [
                    {
                      valueIri: { iri: IM.FOLDER },
                      parameter: "type"
                    }
                  ],
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
                        iri: IM.CONCEPT
                      },
                      parameter: "value"
                    }
                  ],
                  path: {
                    iri: IM.IS_CONTAINED_IN
                  }
                }
              ]
            }
          ]
        },
        {
          name: "Map Entry builder",
          comment: "Map entry | Mapped to splitter",
          path: {
            iri: RDF.TYPE
          },
          order: 1,
          minCount: 0,
          maxCount: 1,
          componentType: { iri: COMPONENT.VERTICAL_LAYOUT },
          property: [
            {
              name: "Map type",
              order: 7,
              path: { iri: IM.HAS_MAP_TYPE },
              componentType: { iri: COMPONENT.ARRAY_BUILDER },
              minCount: 1,
              arrayButtons: { up: false, down: false, plus: false, minus: false },
              property: [
                {
                  comment: "selects the map type with a default of direct",
                  order: 6,
                  select: [
                    {
                      iri: QUERY.GET_SUBCLASSES
                    }
                  ],
                  name: "Map type",
                  showTitle: true,
                  builderChild: true,
                  maxCount: 1,
                  path: {
                    iri: IM.HAS_MAP_TYPE
                  },
                  argument: [
                    {
                      valueIri: {
                        iri: IM.MAP_TYPE
                      },
                      parameter: "this"
                    }
                  ],
                  isIri: {
                    iri: IM.DIRECT_MAP
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
              comment: "text of default target text",
              order: 4,
              name: "Default target text",
              showTitle: true,
              maxCount: 1,
              path: {
                iri: IM.DEFAULT_TEXT
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
              comment: "default target value",
              order: 4,
              name: "Default target value",
              showTitle: true,
              maxCount: 1,
              path: {
                iri: IM.DEFAULT_VALUE
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
              label: "Property group - MapEntry  builder",
              name: "Map Entry builder",
              showTitle: false,
              order: 1,
              componentType: {
                iri: COMPONENT.MAP_ENTRY_BUILDER
              },
              validationErrorMessage: "Map entries are not valid",
              path: {
                iri: IM.MAP_ENTRY
              }
            }
          ]
        }
      ]
    }
  ]
});

export default SemanticMapShape;
