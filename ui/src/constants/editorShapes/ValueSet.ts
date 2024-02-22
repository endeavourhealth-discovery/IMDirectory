import { FormGenerator } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS, XSD, EDITOR, COMPONENT, IM_FUNCTION, VALIDATION, QUERY } from "@im-library/vocabulary";

const ValueSetShape: FormGenerator = {
  "@id": EDITOR.VALUE_SET_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Value set shape",
  comment: "Form editor for a value set",
  targetShape: {
    "@id": IM.VALUE_SET
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
        "@id": COMPONENT.HORIZONTAL_LAYOUT
      },
      argument: [
        {
          parameter: "subGroup widths",
          valueData: "40%,60%"
        }
      ],
      property: [
        {
          comment: "summary vertical row layout",
          name: "Summary",
          showTitle: true,
          path: {
            "@id": RDF.TYPE
          },
          order: 1,
          maxCount: 1,
          componentType: {
            "@id": COMPONENT.VERTICAL_LAYOUT
          },
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
                    "@id": IM.VALUE_SET
                  },
                  parameter: "entityIri"
                }
              ],
              isIri: {
                "@id": IM.VALUE_SET
              },
              minCount: 1,
              componentType: {
                "@id": COMPONENT.ENTITY_COMBOBOX
              }
            },
            {
              comment: "User generates iri based on scheme and user text input",
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
              maxCount: 0,
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
                      "@id": QUERY.GET_DESCENDANTS
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
              label: "Property group - Sub type array builder",
              order: 1,
              path: {
                "@id": RDFS.SUBCLASS_OF
              },
              validation: {
                "@id": VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  select: [
                    {
                      "@id": QUERY.SEARCH_SUBCLASS
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        "@id": IM.VALUE_SET
                      },
                      parameter: "value"
                    }
                  ],
                  builderChild: true,
                  name: "Entity",
                  path: {
                    "@id": RDFS.SUBCLASS_OF
                  },
                  minCount: 0,
                  componentType: {
                    "@id": COMPONENT.ENTITY_SEARCH
                  }
                }
              ],
              name: "Subclass of",
              showTitle: true,
              minCount: 0,
              componentType: {
                "@id": COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
            },
            {
              label: "Property group - Contained in array builder",
              order: 1,
              path: {
                "@id": IM.IS_CONTAINED_IN
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  select: [
                    {
                      "@id": QUERY.SEARCH_ALLOWABLE_CONTAINED_IN
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        "@id": IM.VALUE_SET
                      },
                      parameter: "value"
                    }
                  ],
                  builderChild: true,
                  name: "Entity",
                  path: {
                    "@id": IM.IS_CONTAINED_IN
                  },
                  minCount: 0,
                  componentType: {
                    "@id": COMPONENT.ENTITY_SEARCH
                  }
                }
              ],
              name: "Contained in",
              showTitle: true,
              minCount: 0,
              componentType: {
                "@id": COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
            }
          ]
        },
        {
          label: "Property group - set definition builder",
          name: "Definition",
          showTitle: true,
          order: 2,
          minCount: 1,
          componentType: {
            "@id": COMPONENT.SET_DEFINITION_BUILDER
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
    }
  ]
};

export default ValueSetShape;
