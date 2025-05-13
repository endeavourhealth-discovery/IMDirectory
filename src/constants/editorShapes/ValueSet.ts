import { FormGenerator } from "@/interfaces/AutoGen";
import { IM, RDF, RDFS, XSD, EDITOR, COMPONENT, IM_FUNCTION, VALIDATION, QUERY } from "@/vocabulary";

const ValueSetShape: FormGenerator = {
  iri: EDITOR.VALUE_SET_SHAPE,
  type: [
    {
      iri: IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Value set shape",
  comment: "Form editor for a value set",
  targetShape: {
    iri: IM.VALUE_SET
  },
  property: [
    {
      comment: "Summary and definition splitter",
      order: 1,
      name: "splitter",
      path: {
        iri: IM.DEFINITION
      },
      minCount: 1,
      maxCount: 1,
      componentType: {
        iri: COMPONENT.HORIZONTAL_LAYOUT
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
            iri: RDF.TYPE
          },
          order: 1,
          maxCount: 1,
          componentType: {
            iri: COMPONENT.VERTICAL_LAYOUT
          },
          property: [
            {
              comment: "A property that auto generates the type as  concept type",
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
                  valueIri: {
                    iri: IM.VALUE_SET
                  },
                  parameter: "entityIri"
                }
              ],
              isIri: {
                iri: IM.VALUE_SET
              },
              minCount: 1,
              componentType: {
                iri: COMPONENT.ENTITY_COMBOBOX
              }
            },
            {
              comment: "User generates iri based on scheme and user text input",
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
              function: {
                iri: IM_FUNCTION.GET_USER_EDITABLE_SCHEMES
              },
              validation: { iri: VALIDATION.IS_IRI }
            },
            {
              comment: "name or main term of concept",
              order: 3,
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
              maxCount: 0,
              path: {
                iri: RDFS.COMMENT
              },
              minCount: 1,
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
              label: "Property group - Sub type array builder",
              order: 1,
              path: {
                iri: RDFS.SUBCLASS_OF
              },
              validation: {
                iri: VALIDATION.HAS_PARENT
              },
              validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
              property: [
                {
                  comment: "selects an entity based on select query",
                  order: 1,
                  select: [
                    {
                      iri: QUERY.SEARCH_ALLOWABLE_SUBCLASS
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        iri: IM.VALUE_SET
                      },
                      parameter: "value"
                    }
                  ],
                  builderChild: true,
                  name: "Entity",
                  path: {
                    iri: RDFS.SUBCLASS_OF
                  },
                  minCount: 0,
                  componentType: {
                    iri: COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER
                  }
                }
              ],
              name: "Subclass of",
              showTitle: true,
              minCount: 0,
              componentType: {
                iri: COMPONENT.ARRAY_BUILDER
              },
              arrayButtons: { plus: true, minus: true, up: false, down: false, addOnlyIfLast: true }
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
                      iri: QUERY.SEARCH_ALLOWABLE_CONTAINED_IN
                    }
                  ],
                  argument: [
                    {
                      valueIri: {
                        iri: IM.VALUE_SET
                      },
                      parameter: "value"
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
          comment: "summary vertical row layout",
          name: "Definition",
          showTitle: true,
          path: {
            iri: IM.DEFINITION
          },
          order: 1,
          maxCount: 1,
          componentType: {
            iri: COMPONENT.VERTICAL_LAYOUT
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
              componentType: { iri: COMPONENT.SUBSET_BUILDER },
              path: { iri: IM.HAS_SUBSET },
              property: [
                {
                  name: "Inclusions",
                  minCount: 0,
                  builderChild: true,
                  componentType: { iri: COMPONENT.ARRAY_BUILDER },
                  arrayButtons: { addOnlyIfLast: true, down: false, minus: true, plus: true, up: false },
                  path: { iri: IM.HAS_SUBSET },
                  property: [
                    {
                      argument: [{ parameter: "this", valueIriList: [{ iri: IM.CONCEPT_SET }, { iri: IM.VALUESET }] }],
                      select: [{ iri: QUERY.SEARCH_ENTITIES }],
                      builderChild: true,
                      componentType: { iri: COMPONENT.AUTOCOMPLETE_SEARCH_BAR_WRAPPER },
                      minCount: 0,
                      name: "Inclusion",
                      order: 1,
                      path: { iri: IM.HAS_SUBSET }
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
                iri: COMPONENT.SET_DEFINITION_BUILDER
              },
              validation: {
                iri: VALIDATION.IS_DEFINITION
              },
              validationErrorMessage: "Set definition is not valid",
              path: {
                iri: IM.DEFINITION
              }
            }
          ]
        }
      ]
    }
  ]
};

export default ValueSetShape;
