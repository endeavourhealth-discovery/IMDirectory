import { FormGenerator } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS, SHACL, XSD } from "@im-library/vocabulary";

const DataModelShape: FormGenerator = {
  "@id": IM.editor.DATA_MODEL_SHAPE,
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
        "@id": IM.component.HORIZONTAL_LAYOUT
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
          minCount: 1,
          maxCount: 1,
          componentType: {
            "@id": IM.component.VERTICAL_LAYOUT
          },
          property: [
            {
              comment: "A property that auto generates the type as data model type",
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
                "@id": IM.component.TEXT_DISPLAY
              },
              datatype: {
                "@id": XSD.STRING
              },
              function: {
                "@id": IM.function.LOCAL_NAME_RETRIEVER
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
                "@id": IM.component.TEXT_INPUT
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
              name: "Description",
              showTitle: true,
              maxCount: 1,
              path: {
                "@id": RDFS.COMMENT
              },
              minCount: 0,
              componentType: {
                "@id": IM.component.HTML_INPUT
              }
            },
            {
              comment: "selects the status with a default of draft",
              order: 6,
              select: [
                {
                  "@id": IM.query.GET_DESCENDANTS
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
              label: "Property group - Sub type array builder",
              order: 1,
              path: {
                "@id": RDFS.SUBCLASS_OF
              },
              validation: {
                "@id": IM.validation.HAS_PARENT
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
                    "@id": IM.component.ENTITY_SEARCH
                  }
                }
              ],
              name: "Subclass of",
              showTitle: true,
              minCount: 0,
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
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
                      "@id": IM.query.SEARCH_FOLDERS
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
                  minCount: 0,
                  componentType: {
                    "@id": IM.component.ENTITY_SEARCH
                  }
                }
              ],
              name: "Is contained in",
              showTitle: true,
              minCount: 0,
              validation: {
                "@id": IM.validation.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
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
                        "@id": SHACL.NODESHAPE
                      }
                    }
                  ],
                  name: "Replaced by",
                  showTitle: true,
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
          name: "Splitter",
          comment: "Role group | Mapped to splitter",
          path: { "@id": IM.CONCEPT },
          order: 1,
          minCount: 0,
          maxCount: 1,
          componentType: { "@id": IM.component.VERTICAL_LAYOUT },
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
                "@id": IM.component.PROPERTY_BUILDER
              },
              validation: {
                "@id": IM.validation.IS_PROPERTY
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
