import { FormGenerator } from "@im-library/interfaces/AutoGen";
import { COMPONENT, EDITOR, FUNCTION, IM, QUERY, RDF, RDFS, XSD } from "@im-library/vocabulary";

const PropertyShape: FormGenerator = {
  "@id": EDITOR.PROPERTY_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    }
  ],
  label: "Editor - Property shape",
  comment: "Form editor for a property",
  targetShape: {
    "@id": RDF.PROPERTY
  },
  property: [
    {
      comment: "A property that auto generates the type as property type",
      order: 1,
      function: {
        "@id": FUNCTION.GET_ADDITIONAL_ALLOWABLE_TYPES
      },
      name: "type",
      path: {
        "@id": RDF.TYPE
      },
      argument: [
        {
          valueIri: {
            "@id": RDF.PROPERTY
          },
          parameter: "entityIri"
        }
      ],
      isIri: {
        "@id": RDF.PROPERTY
      },
      minCount: 1,
      componentType: {
        "@id": COMPONENT.ENTITY_COMBOBOX
      }
    },
    {
      comment: "A property that auto generates an entity iri from the snomed extension",
      order: 2,
      name: "iri",
      maxCount: 1,
      path: {
        "@id": IM.ID
      },
      minCount: 1,
      componentType: {
        "@id": COMPONENT.TEXT_DISPLAY
      },
      valueVariable: "propertyIri",
      function: {
        "@id": FUNCTION.SNOMED_CONCEPT_GENERATOR
      }
    },
    {
      comment: "Property that derives an entity code from the entity iri",
      order: 3,
      name: "code",
      maxCount: 1,
      path: {
        "@id": IM.CODE
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
        "@id": COMPONENT.TEXT_DISPLAY
      },
      datatype: {
        "@id": XSD.STRING
      },
      function: {
        "@id": FUNCTION.LOCAL_NAME_RETRIEVER
      }
    },
    {
      comment: "name or main term of entity",
      order: 4,
      name: "Property name",
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
      comment: "optional description",
      order: 5,
      datatype: {
        "@id": XSD.STRING
      },
      name: "Property description",
      maxCount: 1,
      path: {
        "@id": RDFS.COMMENT
      },
      minCount: 1,
      componentType: {
        "@id": COMPONENT.HTML_INPUT
      }
    },
    {
      comment: "selects the status with a default of draft",
      order: 6,
      select: [
        {
          "@id": QUERY.GET_ISAS
        }
      ],
      name: "status",
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
        "@id": COMPONENT.ENTITY_DROPDOWN
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
                "@id": RDF.PROPERTY
              }
            }
          ],
          name: "Replaced by",
          path: {
            "@id": "http://snomed.info/sct#370124000"
          },
          minCount: 1,
          componentType: {
            "@id": COMPONENT.ENTITY_SEARCH
          }
        }
      ]
    }
  ]
};

export default PropertyShape;
