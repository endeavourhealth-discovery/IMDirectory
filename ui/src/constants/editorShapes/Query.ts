import { FormGenerator } from "@im-library/interfaces/AutoGen";
import { IM, RDF, RDFS, XSD } from "@im-library/vocabulary";

const QueryShape: FormGenerator = {
  "@id": IM.editor.QUERY_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Query shape",
  comment: "Form editor for a query",
  targetShape: {
    "@id": IM.QUERY
  },
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
          comment: "A property that auto generates the type as  concept type",
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
              valueIri: {
                "@id": IM.QUERY
              },
              parameter: "entityIri"
            }
          ],
          isIri: {
            "@id": IM.QUERY
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
            "@id": IM.component.TEXT_DISPLAY
          },
          valueVariable: "conceptIri",
          function: {
            "@id": IM.function.SNOMED_CONCEPT_GENERATOR
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
          comment: "name or main term of concept",
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
          minCount: 1,
          componentType: {
            "@id": IM.component.HTML_INPUT
          }
        },
        {
          comment: "selects the status with a default of draft",
          order: 6,
          select: [
            {
              "@id": IM.query.GET_ISAS
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
                    "@id": IM.QUERY
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
      label: "Property group - Sub type array builder",
      order: 1,
      path: {
        "@id": RDFS.SUBCLASS_OF
      },
      validation: {
        "@id": IM.validation.HAS_PARENT
      },
      validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
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
                "@id": IM.CONCEPT
              }
            }
          ],
          builderChild: true,
          name: "Entity",
          path: {
            "@id": RDFS.SUBCLASS_OF
          },
          minCount: 1,
          componentType: {
            "@id": IM.component.ENTITY_SEARCH
          }
        }
      ],
      name: "Subclass of",
      showTitle: true,
      minCount: 1,
      componentType: {
        "@id": IM.component.ARRAY_BUILDER
      }
    },

    {
      label: "Property group - contained in array builder",
      name: "isContainedIn",
      showTitle: true,
      order: 1,
      minCount: 1,
      componentType: {
        "@id": IM.component.ARRAY_BUILDER
      },
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
    },
    {
      label: "Property group - query definition builder",
      name: "Query definition",
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
};

export default QueryShape;
