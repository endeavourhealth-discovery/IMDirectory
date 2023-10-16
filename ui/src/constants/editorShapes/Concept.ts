import { Argument, FormGenerator, PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import { RDF, IM, XSD, RDFS, SHACL } from "@im-library/vocabulary";

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
      minCount: 0,
      maxCount: 1,
      componentType: { "@id": IM.component.HORIZONTAL_LAYOUT },
      argument: [{ parameter: "subGroup widths", valueData: "40%,60%" }],
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
                "@id": IM.component.DROPDOWN_TEXT_INPUT_CONCATENATOR
              },
              valueVariable: "conceptIri",
              function: {
                "@id": IM.function.GET_SET_EDITOR_IRI_SCHEMES
              }
            },
            {
              name: "Scheme",
              order: 3,
              maxCount: 1,
              minCount: 1,
              path: { "@id": IM.SCHEME },
              arrayButtons: { up: false, down: false, plus: false, minus: false },
              componentType: { "@id": IM.component.ARRAY_BUILDER },
              validation: { "@id": IM.validation.IS_SCHEME },
              property: [
                {
                  comment: "Property that derives a concept scheme from the concept iri",
                  order: 3,
                  name: "Scheme",
                  showTitle: true,
                  builderChild: true,
                  maxCount: 1,
                  path: {
                    "@id": IM.SCHEME
                  },
                  argument: [
                    {
                      parameter: "entityIri",
                      valueVariable: "conceptIri"
                    }
                  ],
                  minCount: 1,
                  componentType: {
                    "@id": IM.component.ENTITY_DISPLAY
                  },
                  function: {
                    "@id": IM.function.SCHEME_FROM_IRI
                  }
                }
              ]
            },
            {
              comment: "Property that derives a concept code from the concept iri",
              order: 4,
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
              order: 5,
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
              comment: "optional im1id",
              order: 7,
              name: "IM1Id",
              showTitle: true,
              maxCount: 1,
              path: {
                "@id": IM.IM_1_ID
              },
              minCount: 0,
              componentType: {
                "@id": IM.component.TEXT_INPUT
              }
            },
            {
              comment: "optional im1scheme",
              order: 8,
              function: {
                "@id": IM.function.IM1SCHEME_OPTIONS
              },
              name: "IM1Scheme",
              showTitle: true,
              maxCount: 1,
              path: {
                "@id": IM.IM_1_SCHEME
              },
              minCount: 0,
              componentType: {
                "@id": IM.component.TEXT_DROPDOWN
              }
            },
            {
              label: "Contained in array builder",
              name: "Is contained in",
              showTitle: true,
              order: 9,
              minCount: 0,
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
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
                  minCount: 0,
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
              label: "Subclass of array builder",
              name: "Subclass of",
              showTitle: true,
              order: 10,
              minCount: 0,
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                "@id": IM.validation.HAS_PARENT
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
                    "@id": IM.component.ENTITY_SEARCH
                  },
                  path: {
                    "@id": RDFS.SUBCLASS_OF
                  }
                }
              ]
            },
            {
              comment: "Toggle controlling sub components visibility",
              order: 11,
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
          minCount: 0,
          maxCount: 1,
          componentType: { "@id": IM.component.VERTICAL_LAYOUT },
          property: [
            {
              label: "Property Group - Role group builder",
              order: 1,
              maxCount: 1,
              path: {
                "@id": IM.ROLE_GROUP
              },
              name: "Role group",
              minCount: 0,
              componentType: {
                "@id": IM.component.ROLE_GROUP_BUILDER
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
                    "@id": IM.component.ENTITY_SEARCH
                  }
                }
              ],
              name: "Mapped to",
              minCount: 0,
              componentType: {
                "@id": IM.component.ARRAY_BUILDER
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
              componentType: { "@id": IM.component.ARRAY_BUILDER },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: { "@id": IM.validation.IS_TERMCODE },
              property: [
                {
                  name: "Term code",
                  path: { "@id": IM.HAS_TERM_CODE },
                  builderChild: true,
                  order: 1,
                  minCount: 0,
                  componentType: { "@id": IM.component.TERM_CODE_EDITOR },
                  validation: { "@id": IM.validation.IS_TERMCODE }
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
              componentType: { "@id": IM.component.ARRAY_BUILDER },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              property: [
                {
                  name: "Child of",
                  path: { "@id": IM.IS_CHILD_OF },
                  builderChild: true,
                  order: 1,
                  minCount: 0,
                  componentType: { "@id": IM.component.ENTITY_SEARCH }
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
