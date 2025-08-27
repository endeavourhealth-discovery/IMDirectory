import { FormGenerator } from "@/interfaces/AutoGen";
import { IM, RDF, RDFS, XSD, EDITOR, IM_FUNCTION, COMPONENT, QUERY, VALIDATION } from "@/vocabulary";

const PropertyShape: FormGenerator = {
  iri: EDITOR.PROPERTY_SHAPE,
  type: [
    {
      iri: IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Property shape",
  comment: "Form editor for a property",
  targetShape: {
    iri: RDF.PROPERTY
  },
  property: [
    {
      name: "Summary",
      showTitle: true,
      comment: "Vertical splitter",
      path: { iri: RDF.PROPERTY },
      order: 1,
      maxCount: 1,
      componentType: { iri: COMPONENT.VERTICAL_LAYOUT },
      argument: [{ valueData: "60", parameter: "width" }],
      property: [
        {
          comment: "A property that auto generates the type as property type",
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
                iri: RDF.PROPERTY
              },
              parameter: "entityIri"
            }
          ],
          isIri: {
            iri: RDF.PROPERTY
          },
          minCount: 1,
          componentType: {
            iri: COMPONENT.ENTITY_COMBOBOX
          }
        },
        {
          comment: "A property that auto generates an entity iri from the snomed extension",
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
          valueVariable: "propertyIri",
          function: {
            iri: IM_FUNCTION.GET_USER_EDITABLE_SCHEMES
          },
          validation: { iri: VALIDATION.IS_IRI }
        },
        {
          comment: "Property that derives an entity code from the entity iri",
          order: 3,
          name: "Code",
          showTitle: true,
          maxCount: 1,
          path: {
            iri: IM.CODE
          },
          argument: [
            {
              parameter: "entityIri",
              valueVariable: "propertyIri"
            },
            {
              parameter: "fieldName",
              valueData: "code"
            }
          ],
          minCount: 1,
          componentType: {
            iri: COMPONENT.TEXT_DISPLAY
          },
          datatype: {
            iri: XSD.STRING
          },
          function: {
            iri: IM_FUNCTION.LOCAL_NAME_RETRIEVER
          }
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
          order: 5,
          name: "Preferred name",
          showTitle: true,
          maxCount: 1,
          path: { iri: IM.PREFERRED_NAME },
          minCount: 0,
          componentType: { iri: COMPONENT.TEXT_INPUT }
        },
        {
          comment: "optional description",
          order: 6,
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
          order: 7,
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
          order: 8,
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
                    iri: RDF.PROPERTY
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
          order: 9,
          path: {
            iri: IM.IS_CONTAINED_IN
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
                  iri: QUERY.SEARCH_ALLOWABLE_CONTAINED_IN
                }
              ],
              argument: [
                {
                  valueIri: {
                    iri: RDF.PROPERTY
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
    }
  ]
};

export default PropertyShape;
