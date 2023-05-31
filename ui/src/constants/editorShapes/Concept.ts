import { Argument, FormGenerator, PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import { RDF, IM, XSD, RDFS } from "@im-library/vocabulary";

const ConceptShape: FormGenerator = {
  "@id": IM.editor.CONCEPT_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Concept shape",
  comment: "Form editor for a concept",
  targetShape: {
    "@id": IM.CONCEPT
  },
  property: [
    {
      comment: "Summary | rolegroup splitter",
      order: 1,
      name: "splitter",
      path: { "@id": IM.CONCEPT },
      minCount: 1,
      maxCount: 1,
      componentType: { "@id": IM.component.HORIZONTAL_LAYOUT },
      argument: [{ parameter: "subGroup widths", valueData: "50%,50%" }],
      property: [
        {
          comment: "Summary layout",
          name: "Summary",
          path: { "@id": IM.CONCEPT },
          showTitle: true,
          order: 1,
          maxCount: 1,
          minCount: 1,
          componentType: { "@id": IM.component.VERTICAL_LAYOUT },
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
                    "@id": IM.CONCEPT
                  },
                  parameter: "entityIri"
                }
              ],
              isIri: {
                "@id": IM.CONCEPT
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
              name: "Concept name",
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
              name: "Concept description",
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
                        "@id": IM.CONCEPT
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
          minCount: 1,
          maxCount: 1,
          componentType: { "@id": IM.component.VERTICAL_LAYOUT },
          property: [
            {
              label: "Property Group - Role group array builder",
              order: 1,
              maxCount: 1,
              showTitle: true,
              path: {
                "@id": IM.ROLE_GROUP
              },
              property: [
                {
                  label: "Property Group - Role group component group",
                  name: "Property refinement",
                  order: 1,
                  minCount: 1,
                  componentType: {
                    "@id": IM.component.COMPONENT_GROUP
                  },
                  path: {
                    "@id": IM.ROLE_GROUP
                  },
                  property: [
                    {
                      comment: "selects a property from allowable range from selected concept",
                      order: 1,
                      select: [
                        {
                          "@id": IM.query.ALLOWABLE_PROPERTIES
                        }
                      ],
                      builderChild: true,
                      path: {
                        "@id": IM.ROLE_GROUP
                      },
                      argument: [
                        {
                          parameter: "entityIri",
                          valueVariable: "conceptIri"
                        }
                      ],
                      name: "Property",
                      showTitle: true,
                      minCount: 1,
                      componentType: {
                        "@id": IM.component.ENTITY_AUTO_COMPLETE
                      },
                      valueVariable: "propertyIri"
                    },
                    {
                      comment: "Selects a quantifier from allowable range from property",
                      order: 2,
                      select: [
                        {
                          "@id": IM.query.ALLOWABLE_RANGES
                        }
                      ],
                      builderChild: true,
                      path: {
                        "@id": IM.ROLE_GROUP
                      },
                      argument: [
                        {
                          parameter: "entityIri",
                          valueVariable: "propertyIri"
                        }
                      ],
                      name: "Quantifier",
                      showTitle: true,
                      minCount: 1,
                      componentType: {
                        "@id": IM.component.ENTITY_AUTO_COMPLETE
                      }
                    }
                  ]
                }
              ],
              name: "Role group",
              minCount: 0,
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
              }
            },
            {
              label: "Property Group - Mapped to array builder",
              order: 1,
              maxCount: 1,
              showTitle: true,
              path: {
                "@id": IM.MAPPED_TO
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  select: [
                    {
                      "@id": IM.query.SEARCH_MAIN_TYPES
                    }
                  ],
                  builderChild: true,
                  name: "Entity",
                  path: {
                    "@id": IM.MAPPED_TO
                  },
                  minCount: 1,
                  componentType: {
                    "@id": IM.component.ENTITY_SEARCH
                  }
                }
              ],
              name: "Mapped to",
              minCount: 0,
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
              }
            }
          ]
        }
      ]
    }
  ]
};

export default ConceptShape;
