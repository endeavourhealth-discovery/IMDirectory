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
