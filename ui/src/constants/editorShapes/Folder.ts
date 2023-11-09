import { FormGenerator } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS, XSD } from "@im-library/vocabulary";

const FolderShape: FormGenerator = {
  "@id": IM.editor.FOLDER_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - folder shape",
  comment: "Form editor for a folder",
  targetShape: {
    "@id": IM.FOLDER
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
          name: "Summary",
          comment: "Vertical splitter",
          path: { "@id": IM.FOLDER },
          showTitle: true,
          componentType: { "@id": IM.component.VERTICAL_LAYOUT },
          maxCount: 1,
          order: 1,
          property: [
            {
              comment: "A property that auto generates the type as folder type",
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
                    "@id": IM.FOLDER
                  }
                }
              ],
              isIri: {
                "@id": IM.FOLDER
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
                "@id": IM.component.IRI_BUILDER
              },
              valueVariable: "conceptIri",
              function: {
                "@id": IM.function.GET_USER_EDITABLE_SCHEMES
              },
              validation: { "@id": IM.validation.IS_IRI }
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
              name: "Status",
              order: 6,
              path: { "@id": IM.HAS_STATUS },
              componentType: { "@id": IM.component.ARRAY_BUILDER },
              validation: { "@id": IM.validation.IS_STATUS },
              minCount: 1,
              arrayButtons: { up: false, down: false, plus: false, minus: false },
              property: [
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
                    "@id": IM.component.ENTITY_DROPDOWN
                  },
                  forceIsValue: true
                }
              ]
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
              name: "Contained in",
              showTitle: true,
              minCount: 0,
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
            }
          ]
        },
        {
          name: "Content type",
          showTitle: true,
          comment: "Vertical splitter",
          path: { "@id": IM.FOLDER },
          componentType: { "@id": IM.component.VERTICAL_LAYOUT },
          minCount: 1,
          maxCount: 1,
          order: 1,
          property: [
            {
              label: "Property group - Content type array builder",
              order: 1,
              path: {
                "@id": IM.CONTENT_TYPE
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  select: [
                    {
                      "@id": IM.query.SEARCH_CONTAINED_IN
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        "@id": IM.ENTITY_TYPES
                      },
                      parameter: "value"
                    }
                  ],
                  builderChild: true,
                  name: "Entity",
                  path: {
                    "@id": IM.CONTENT_TYPE
                  },
                  minCount: 0,
                  componentType: {
                    "@id": IM.component.ENTITY_SEARCH
                  }
                }
              ],
              name: "Content type",
              minCount: 0,
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
            }
          ]
        }
      ]
    }
  ]
};

export default FolderShape;
