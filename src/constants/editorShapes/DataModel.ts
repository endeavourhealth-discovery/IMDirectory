import { FormGenerator } from "@/interfaces/AutoGen";
import { IM, RDF, RDFS, SHACL, XSD, EDITOR, COMPONENT, IM_FUNCTION, QUERY, VALIDATION } from "@/vocabulary";

const DataModelShape: FormGenerator = {
  "@id": EDITOR.DATA_MODEL_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - data model shape",
  comment: "Form editor for a data model",
  targetShape: {
    "@id": SHACL.NODESHAPE
  },
  property: [
    {
      comment: "Summary and property splitter",
      order: 1,
      name: "splitter",
      path: {
        "@id": RDF.PROPERTY
      },
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
            "@id": RDF.PROPERTY
          },
          order: 1,
          maxCount: 1,
          componentType: {
            "@id": COMPONENT.VERTICAL_LAYOUT
          },
          property: [
            {
              comment: "A property that auto generates the type as data model type",
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
                  parameter: "entityIri",
                  valueIri: {
                    "@id": SHACL.NODESHAPE
                  }
                }
              ],
              isIri: {
                "@id": SHACL.NODESHAPE
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
                "@id": COMPONENT.IRI_BUILDER
              },
              valueVariable: "conceptIri",
              function: {
                "@id": IM_FUNCTION.GET_USER_EDITABLE_SCHEMES
              },
              validation: { "@id": VALIDATION.IS_IRI }
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
              comment: "name or main term of entity",
              order: 4,
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
              order: 5,
              name: "Preferred name",
              showTitle: true,
              maxCount: 1,
              path: { "@id": IM.PREFERRED_NAME },
              minCount: 0,
              componentType: { "@id": COMPONENT.TEXT_INPUT }
            },
            {
              comment: "optional description",
              order: 6,
              datatype: {
                "@id": XSD.STRING
              },
              name: "Description",
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
              name: "Status",
              order: 7,
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
              label: "Property group - Sub type array builder",
              order: 8,
              path: {
                "@id": RDFS.SUBCLASS_OF
              },
              validation: {
                "@id": VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf'.",
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  builderChild: true,
                  name: "Entity",
                  path: {
                    "@id": RDFS.SUBCLASS_OF
                  },
                  minCount: 0,
                  componentType: {
                    "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  },
                  select: [
                    {
                      "@id": QUERY.SEARCH_ALLOWABLE_SUBCLASS
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        "@id": SHACL.NODESHAPE
                      },
                      parameter: "value"
                    }
                  ]
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
              label: "Property group - Is contained in array builder",
              order: 9,
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
                        "@id": SHACL.NODESHAPE
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
                    "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  }
                }
              ],
              name: "Contained in",
              showTitle: true,
              minCount: 0,
              validation: {
                "@id": VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
              componentType: {
                "@id": COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
            }
          ]
        },
        {
          name: "Properties",
          showTitle: true,
          comment: "Role group | Mapped to splitter",
          path: { "@id": IM.CONCEPT },
          order: 1,
          minCount: 1,
          maxCount: 1,
          componentType: { "@id": COMPONENT.VERTICAL_LAYOUT },
          property: [
            {
              label: "Property group - Property array builder",
              order: 1,
              path: {
                "@id": SHACL.PROPERTY
              },
              name: "Property",
              minCount: 1,
              componentType: {
                "@id": COMPONENT.PROPERTY_BUILDER
              },
              validation: {
                "@id": VALIDATION.IS_PROPERTY
              },
              validationErrorMessage: "Invalid data model properties"
            }
          ]
        }
      ]
    }
  ]
};

export default DataModelShape;
