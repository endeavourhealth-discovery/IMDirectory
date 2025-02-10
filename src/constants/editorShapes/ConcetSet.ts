import { FormGenerator } from "@/interfaces/AutoGen";
import { IM, RDF, RDFS, EDITOR, COMPONENT, IM_FUNCTION, VALIDATION, QUERY, XSD } from "@/vocabulary";

const ConceptSetShape: FormGenerator = {
  "@id": EDITOR.CONCEPT_SET_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Concept set shape",
  comment: "Form editor for a concept set",
  targetShape: {
    "@id": IM.CONCEPT_SET
  },
  property: [
    {
      comment: "Summary and definition splitter",
      order: 1,
      name: "splitter",
      path: {
        "@id": IM.DEFINITION
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
            "@id": RDF.TYPE
          },
          order: 1,
          maxCount: 1,
          componentType: {
            "@id": COMPONENT.VERTICAL_LAYOUT
          },
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
                    "@id": IM.CONCEPT_SET
                  },
                  parameter: "entityIri"
                }
              ],
              isIri: {
                "@id": IM.CONCEPT_SET
              },
              minCount: 1,
              componentType: {
                "@id": COMPONENT.ENTITY_COMBOBOX
              }
            },
            {
              comment: "User generates iri based on scheme and user text input",
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
              argument: [{ parameter: "prefix", valueData: "CSET_" }],
              function: {
                "@id": IM_FUNCTION.GET_USER_EDITABLE_SCHEMES
              },
              validation: { "@id": VALIDATION.IS_IRI },
              valueVariable: "entityIri"
            },
            {
              comment: "name or main term of concept",
              order: 3,
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
              order: 4,
              name: "Preferred name",
              showTitle: true,
              maxCount: 1,
              path: { "@id": IM.PREFERRED_NAME },
              minCount: 0,
              componentType: { "@id": COMPONENT.TEXT_INPUT }
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
                "@id": COMPONENT.HTML_INPUT
              }
            },
            {
              name: "Status",
              order: 6,
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
              label: "Subset of array builder",
              name: "Subset of",
              showTitle: true,
              order: 7,
              minCount: 0,
              componentType: {
                "@id": COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                "@id": VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubsetOf' or 'isContainedIn'.",
              path: {
                "@id": IM.IS_SUBSET_OF
              },
              valueVariable: "subsetOf",
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
                    "@id": IM.IS_SUBSET_OF
                  },
                  select: [
                    {
                      "@id": QUERY.SEARCH_ALLOWABLE_SUBCLASS
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        "@id": IM.CONCEPT_SET
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
              order: 8,
              minCount: 0,
              componentType: {
                "@id": COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true },
              validation: {
                "@id": VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'subsetOf' or 'isContainedIn'.",
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
                        "@id": IM.CONCEPT_SET
                      },
                      parameter: "value"
                    }
                  ],
                  path: {
                    "@id": IM.IS_CONTAINED_IN
                  }
                }
              ]
            }
          ]
        },
        {
          comment: "summary vertical row layout",
          name: "Definition",
          showTitle: true,
          path: {
            "@id": IM.DEFINITION
          },
          order: 1,
          maxCount: 1,
          componentType: {
            "@id": COMPONENT.VERTICAL_LAYOUT
          },
          argument: [
            {
              parameter: "style",
              valueObject: [
                { index: 0, style: { maxHeight: "50%" } },
                { index: 1, style: { flex: "1 1 auto" } }
              ]
            }
          ],
          property: [
            {
              label: "Subset builder",
              name: "Subsets",
              order: 1,
              minCount: 0,
              componentType: { "@id": COMPONENT.SUBSET_BUILDER },
              path: { "@id": IM.HAS_SUBSET },
              argument: [{ parameter: "entityIri", valueVariable: "entityIri" }],
              property: [
                {
                  name: "Inclusions",
                  minCount: 0,
                  builderChild: true,
                  componentType: { "@id": COMPONENT.ARRAY_BUILDER },
                  arrayButtons: { addOnlyIfLast: true, down: false, minus: true, plus: true, up: false },
                  path: { "@id": IM.HAS_SUBSET },
                  property: [
                    {
                      argument: [{ parameter: "this", valueIriList: [{ "@id": IM.CONCEPT_SET }, { "@id": IM.VALUESET }] }],
                      select: [{ "@id": QUERY.SEARCH_ENTITIES }],
                      builderChild: true,
                      componentType: { "@id": COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER },
                      minCount: 0,
                      name: "Inclusion",
                      order: 1,
                      path: { "@id": IM.HAS_SUBSET }
                    }
                  ],
                  order: 1
                }
              ]
            },
            {
              label: "Property group - set definition builder",
              name: "Definition builder",
              order: 2,
              minCount: 0,
              componentType: {
                "@id": COMPONENT.SET_DEFINITION_BUILDER
              },
              validation: {
                "@id": VALIDATION.IS_DEFINITION
              },
              validationErrorMessage: "Set definition is not valid",
              path: {
                "@id": IM.DEFINITION
              }
            }
          ]
        }
      ]
    }
  ]
};

export default ConceptSetShape;
