import { FormGenerator } from "@/interfaces/AutoGen";
import { IM, RDF, RDFS, XSD, EDITOR, COMPONENT, VALIDATION, QUERY, IM_FUNCTION } from "@/vocabulary";

const FolderShape: FormGenerator = {
  iri: EDITOR.FOLDER_SHAPE,
  type: [
    {
      iri: IM.FORM_GENERATOR
    }
  ],
  label: "Editor - folder shape",
  comment: "Form editor for a folder",
  targetShape: {
    iri: IM.FOLDER
  },
  property: [
    {
      comment: "Summary and property splitter",
      order: 1,
      name: "splitter",
      path: {
        iri: RDF.PROPERTY
      },
      maxCount: 1,
      componentType: {
        iri: COMPONENT.HORIZONTAL_LAYOUT
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
          path: { iri: IM.FOLDER },
          showTitle: true,
          componentType: { iri: COMPONENT.VERTICAL_LAYOUT },
          maxCount: 1,
          order: 1,
          property: [
            {
              comment: "A property that auto generates the type as folder type",
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
                  parameter: "entityIri",
                  valueIri: {
                    iri: IM.FOLDER
                  }
                }
              ],
              isIri: {
                iri: IM.FOLDER
              },
              minCount: 1,
              componentType: {
                iri: COMPONENT.ENTITY_COMBOBOX
              }
            },
            {
              comment: "A property that auto generates a concept iri from the snomed extension",
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
              comment: "name or main term of entity",
              order: 4,
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
              comment: "optional peferred name for efficiency during searching",
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
              minCount: 0,
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
              label: "Property group - Contained in array builder",
              order: 1,
              path: {
                iri: IM.IS_CONTAINED_IN
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  select: [
                    {
                      iri: QUERY.SEARCH_FOLDERS
                    }
                  ],
                  argument: [
                    {
                      parameter: "this",
                      valueIri: {
                        iri: IM.FOLDER
                      }
                    }
                  ],
                  builderChild: true,
                  name: "Entity",
                  path: {
                    iri: IM.IS_CONTAINED_IN
                  },
                  minCount: 0,
                  componentType: {
                    iri: COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  }
                }
              ],
              name: "Contained in",
              showTitle: true,
              minCount: 0,
              componentType: {
                iri: COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
            }
          ]
        },
        {
          name: "Content type",
          showTitle: true,
          comment: "Vertical splitter",
          path: { iri: IM.FOLDER },
          componentType: { iri: COMPONENT.VERTICAL_LAYOUT },
          minCount: 1,
          maxCount: 1,
          order: 1,
          property: [
            {
              label: "Property group - Content type array builder",
              order: 1,
              path: {
                iri: IM.CONTENT_TYPE
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  select: [
                    {
                      iri: QUERY.SEARCH_CONTAINED_IN
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        iri: IM.ENTITY_TYPES
                      },
                      parameter: "value"
                    }
                  ],
                  builderChild: true,
                  name: "Entity",
                  path: {
                    iri: IM.CONTENT_TYPE
                  },
                  minCount: 0,
                  componentType: {
                    iri: COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  }
                }
              ],
              name: "Content type",
              minCount: 0,
              componentType: {
                iri: COMPONENT.ARRAY_BUILDER
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
