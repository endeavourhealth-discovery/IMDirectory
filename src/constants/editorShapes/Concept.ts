import { Argument, FormGenerator, PropertyShape, TTIriRef } from "@/interfaces/AutoGen";
import { RDF, IM, RDFS, SHACL, EDITOR, COMPONENT, IM_FUNCTION, QUERY, VALIDATION, XSD } from "@/vocabulary";

const ConceptShape: FormGenerator = {
  "@id": EDITOR.CONCEPT_SHAPE,
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
      maxCount: 1,
      componentType: { "@id": COMPONENT.HORIZONTAL_LAYOUT },
      argument: [{ parameter: "subGroup widths", valueData: "40%,60%" }],
      property: [
        {
          comment: "Summary layout",
          name: "Summary",
          path: { "@id": IM.CONCEPT },
          showTitle: true,
          order: 1,
          maxCount: 1,
          componentType: { "@id": COMPONENT.VERTICAL_LAYOUT },
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
              name: "Concept description",
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
              comment: "optional im1id",
              order: 8,
              name: "IM1Id",
              showTitle: true,
              maxCount: 1,
              path: {
                "@id": IM.IM_1_ID
              },
              minCount: 0,
              componentType: {
                "@id": COMPONENT.TEXT_DISPLAY
              }
            },
            {
              comment: "optional im1scheme",
              order: 9,
              function: {
                "@id": IM_FUNCTION.IM1_SCHEME_OPTIONS
              },
              name: "IM1Scheme",
              showTitle: true,
              maxCount: 1,
              path: {
                "@id": IM.IM_1_SCHEME
              },
              minCount: 0,
              componentType: {
                "@id": COMPONENT.TEXT_DISPLAY
              }
            },
            {
              label: "Subclass of array builder",
              name: "Subclass of",
              showTitle: true,
              order: 10,
              minCount: 0,
              componentType: {
                "@id": COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                "@id": VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
              path: {
                "@id": RDFS.SUBCLASS_OF
              },
              valueVariable: "subClassOf",
              property: [
                {
                  comment: "selects an entity based on select query",
                  name: "Entity",
                  order: 1,
                  minCount: 0,
                  builderChild: true,
                  componentType: {
                    "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  },
                  path: {
                    "@id": RDFS.SUBCLASS_OF
                  },
                  select: [
                    {
                      "@id": QUERY.SEARCH_ALLOWABLE_SUBCLASS
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        "@id": IM.CONCEPT
                      },
                      parameter: "value"
                    }
                  ]
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
                "@id": COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                "@id": VALIDATION.HAS_PARENT
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
                  minCount: 0,
                  builderChild: true,
                  componentType: {
                    "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  },
                  select: [
                    {
                      "@id": QUERY.SEARCH_ALLOWABLE_CONTAINED_IN
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        "@id": IM.CONCEPT
                      },
                      parameter: "value"
                    }
                  ],
                  path: {
                    "@id": IM.IS_CONTAINED_IN
                  }
                }
              ]
            },
            {
              comment: "Toggle controlling sub components visibility",
              order: 12,
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
                    "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
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
          componentType: { "@id": COMPONENT.VERTICAL_LAYOUT },
          property: [
            {
              label: "Property Group - Role group builder",
              order: 1,
              path: {
                "@id": IM.ROLE_GROUP
              },
              validation: { "@id": VALIDATION.IS_ROLE_GROUP },
              name: "Role group",
              showTitle: true,
              minCount: 0,
              componentType: {
                "@id": COMPONENT.ROLE_GROUP_BUILDER
              }
            },
            {
              label: "Property Group - Mapped to array builder",
              order: 1,
              maxCount: 1,
              showTitle: true,
              path: {
                "@id": IM.MATCHED_TO
              },
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  builderChild: true,
                  name: "Entity",
                  path: {
                    "@id": IM.MATCHED_TO
                  },
                  minCount: 0,
                  componentType: {
                    "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  }
                }
              ],
              name: "Mapped to",
              minCount: 0,
              componentType: {
                "@id": COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
            },
            {
              name: "Term code",
              comment: "Term code array builder",
              order: 1,
              path: {
                "@id": IM.HAS_TERM_CODE
              },
              showTitle: true,
              minCount: 0,
              componentType: { "@id": COMPONENT.ARRAY_BUILDER },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: { "@id": VALIDATION.IS_TERMCODE },
              property: [
                {
                  name: "Term code",
                  path: { "@id": IM.HAS_TERM_CODE },
                  builderChild: true,
                  order: 1,
                  minCount: 0,
                  componentType: { "@id": COMPONENT.TERM_CODE_EDITOR },
                  validation: { "@id": VALIDATION.IS_TERMCODE }
                }
              ]
            },
            {
              name: "Child of",
              comment: "Child of array builder",
              order: 1,
              path: { "@id": IM.IS_CHILD_OF },
              showTitle: true,
              minCount: 0,
              componentType: { "@id": COMPONENT.ARRAY_BUILDER },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              property: [
                {
                  name: "Child of",
                  path: { "@id": IM.IS_CHILD_OF },
                  builderChild: true,
                  order: 1,
                  minCount: 0,
                  componentType: { "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export default ConceptShape;
