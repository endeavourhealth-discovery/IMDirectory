import { FormGenerator } from "@im-library/interfaces/AutoGen";
import { COMPONENT, EDITOR, FUNCTION, IM, QUERY, RDF, RDFS, SHACL, VALIDATION, XSD } from "@im-library/vocabulary";

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
      minCount: 1,
      maxCount: 1,
      componentType: {
        "@id": COMPONENT.HORIZONTAL_LAYOUT
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
            "@id": RDF.PROPERTY
          },
          order: 1,
          minCount: 1,
          maxCount: 1,
          componentType: {
            "@id": COMPONENT.VERTICAL_LAYOUT
          },
          property: [
            {
              comment: "A property that auto generates the type as data model type",
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
              name: "iri",
              maxCount: 1,
              path: {
                "@id": IM.ID
              },
              minCount: 1,
              componentType: {
                "@id": COMPONENT.TEXT_DISPLAY
              },
              valueVariable: "conceptIri",
              function: {
                "@id": FUNCTION.SNOMED_CONCEPT_GENERATOR
              }
            },
            {
              comment: "Property that derives a concept code from the concept iri",
              order: 3,
              name: "code",
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
                "@id": FUNCTION.LOCAL_NAME_RETRIEVER
              }
            },
            {
              comment: "name or main term of entity",
              order: 4,
              name: "Data model name",
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
              comment: "optional description",
              order: 5,
              datatype: {
                "@id": XSD.STRING
              },
              name: "Data model description",
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
              comment: "selects the status with a default of draft",
              order: 6,
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
                "@id": COMPONENT.ENTITY_DROPDOWN
              },
              forceIsValue: true
            },
            {
              comment: "Toggle controlling sub components visibility",
              order: 7,
              name: "Replaced by",
              label: "Deactivate | Activate",
              minCount: 1,
              maxCount: 1,
              path: {
                "@id": "http://snomed.info/sct#370124000"
              },
              componentType: {
                "@id": COMPONENT.TOGGLEABLE
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
                        "@id": SHACL.NODESHAPE
                      }
                    }
                  ],
                  name: "Replaced by",
                  path: {
                    "@id": "http://snomed.info/sct#370124000"
                  },
                  minCount: 1,
                  componentType: {
                    "@id": COMPONENT.ENTITY_SEARCH
                  }
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
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf'.",
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  select: [
                    {
                      "@id": QUERY.SEARCH_MAIN_TYPES
                    }
                  ],
                  builderChild: true,
                  name: "Entity",
                  path: {
                    "@id": RDFS.SUBCLASS_OF
                  },
                  minCount: 1,
                  componentType: {
                    "@id": COMPONENT.ENTITY_SEARCH
                  }
                }
              ],
              name: "Subclass of",
              minCount: 0,
              componentType: {
                "@id": COMPONENT.ARRAY_BUILDER
              }
            },
            {
              label: "Property group - Is contained in array builder",
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
                      "@id": QUERY.SEARCH_ENTITIES
                    }
                  ],
                  argument: [
                    {
                      parameter: "this",
                      valueIri: {
                        "@id": IM.FOLDER
                      }
                    }
                  ],
                  builderChild: true,
                  name: "Entity",
                  path: {
                    "@id": IM.IS_CONTAINED_IN
                  },
                  minCount: 1,
                  componentType: {
                    "@id": COMPONENT.ENTITY_SEARCH
                  }
                }
              ],
              name: "Is contained in",
              minCount: 0,
              validation: {
                "@id": VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
              componentType: {
                "@id": COMPONENT.ARRAY_BUILDER
              }
            }
          ]
        },
        {
          label: "Property group - Property array builder",
          order: 1,
          path: {
            "@id": SHACL.PROPERTY
          },
          property: [
            {
              comment: "builds a property",
              order: 1,
              builderChild: true,
              path: {
                "@id": SHACL.PROPERTY
              },
              name: "Property",
              componentType: {
                "@id": COMPONENT.PROPERTY_BUILDER
              }
            }
          ],
          name: "Property",
          minCount: 0,
          componentType: {
            "@id": COMPONENT.ARRAY_BUILDER
          }
        }
      ]
    }
  ]
};

export default DataModelShape;
