import { Argument, FormGenerator, PropertyShape, TTIriRef } from "@im-library/interfaces/AutoGen";
import { EDITOR, FUNCTION, RDF, IM, XSD, RDFS, QUERY } from "@im-library/vocabulary";

const ConceptShape: FormGenerator = {
  "@id": EDITOR.CONCEPT_SHAPE,
  type: [
    {
      "@id": IM.FORM_GENERATOR
    } as TTIriRef
  ],
  label: "Editor - Concept shape",
  comment: "Form editor for a concept",
  targetShape: {
    "@id": IM.CONCEPT
  } as TTIriRef,
  property: [
    {
      comment: "A property that auto generates the type as  concept type",
      order: 1,
      function: {
        "@id": FUNCTION.GET_ADDITIONAL_ALLOWABLE_TYPES
      } as TTIriRef,
      name: "type",
      path: {
        "@id": RDF.TYPE
      } as TTIriRef,
      argument: [
        {
          valueIri: {
            "@id": IM.CONCEPT
          } as TTIriRef,
          parameter: "entityIri"
        } as Argument
      ],
      isIri: {
        "@id": IM.CONCEPT
      } as TTIriRef,
      minCount: 1,
      componentType: {
        "@id": IM.ENTITY_COMBOBOX_COMPONENT
      } as TTIriRef
    } as PropertyShape,
    {
      comment: "A property that auto generates a concept iri from the snomed extension",
      order: 2,
      name: "iri",
      maxCount: 1,
      path: {
        "@id": IM.ID
      } as TTIriRef,
      minCount: 1,
      componentType: {
        "@id": IM.TEXT_DISPLAY_COMPONENT
      } as TTIriRef,
      valueVariable: "conceptIri",
      function: {
        "@id": FUNCTION.SNOMED_CONCEPT_GENERATOR
      } as TTIriRef
    } as PropertyShape,
    {
      comment: "Property that derives a concept code from the concept iri",
      order: 3,
      name: "code",
      maxCount: 1,
      path: {
        "@id": IM.CODE
      } as TTIriRef,
      argument: [
        {
          parameter: "entityIri",
          valueVariable: "conceptIri"
        } as Argument,
        {
          parameter: "fieldName",
          valueData: "code"
        } as Argument
      ],
      minCount: 1,
      componentType: {
        "@id": IM.TEXT_DISPLAY_COMPONENT
      } as TTIriRef,
      datatype: {
        "@id": XSD.STRING
      } as TTIriRef,
      function: {
        "@id": FUNCTION.LOCAL_NAME_RETRIEVER
      } as TTIriRef
    } as PropertyShape,
    {
      comment: "name or main term of concept",
      order: 4,
      name: "Concept name",
      maxCount: 1,
      path: {
        "@id": RDFS.LABEL
      } as TTIriRef,
      minCount: 1,
      componentType: {
        "@id": IM.TEXT_INPUT_COMPONENT
      } as TTIriRef,
      datatype: {
        "@id": XSD.STRING
      } as TTIriRef
    } as PropertyShape,
    {
      comment: "optional description",
      order: 5,
      datatype: {
        "@id": XSD.STRING
      } as TTIriRef,
      name: "Concept description",
      maxCount: 1,
      path: {
        "@id": RDFS.COMMENT
      } as TTIriRef,
      minCount: 1,
      componentType: {
        "@id": IM.HTML_INPUT_COMPONENT
      } as TTIriRef
    } as PropertyShape,
    {
      comment: "selects the status with a default of draft",
      order: 6,
      select: [
        {
          "@id": QUERY.GET_ISAS
        } as TTIriRef
      ],
      name: "status",
      maxCount: 1,
      path: {
        "@id": IM.STATUS
      } as TTIriRef,
      argument: [
        {
          valueIri: {
            "@id": IM.STATUS
          } as TTIriRef,
          parameter: "this"
        } as Argument
      ],
      isIri: {
        "@id": IM.DRAFT
      } as TTIriRef,
      minCount: 1,
      componentType: {
        "@id": IM.ENTITY_DROPDOWN_COMPONENT
      } as TTIriRef,
      forceIsValue: true
    } as PropertyShape,
    {
      comment: "Toggle controlling sub components visibility",
      order: 7,
      name: "Replaced by",
      label: "Deactivate | Activate",
      minCount: 1,
      maxCount: 1,
      path: {
        "@id": "http://snomed.info/sct#370124000"
      } as TTIriRef,
      componentType: {
        "@id": IM.TOGGLEABLE_COMPONENT
      } as TTIriRef,
      property: [
        {
          comment: "selects an entity based on select query",
          order: 1,
          select: [
            {
              "@id": QUERY.SEARCH_ENTITIES
            } as TTIriRef
          ],
          argument: [
            {
              parameter: "this",
              valueIri: {
                "@id": IM.CONCEPT
              } as TTIriRef
            } as Argument
          ],
          name: "Replaced by",
          path: {
            "@id": "http://snomed.info/sct#370124000"
          } as TTIriRef,
          minCount: 1,
          componentType: {
            "@id": IM.ENTITY_SEARCH_COMPONENT
          } as TTIriRef
        } as PropertyShape
      ]
    } as PropertyShape,
    {
      label: "Property Group - Role group array builder",
      order: 1,
      maxCount: 1,
      path: {
        "@id": IM.ROLE_GROUP
      } as TTIriRef,
      property: [
        {
          label: "Property Group - Role group component group",
          name: "Property refinement",
          order: 1,
          minCount: 1,
          componentType: {
            "@id": IM.COMPONENT_GROUP
          } as TTIriRef,
          path: {
            "@id": IM.ROLE_GROUP
          } as TTIriRef,
          property: [
            {
              comment: "selects a property from allowable range from selected concept",
              order: 1,
              select: [
                {
                  "@id": QUERY.ALLOWABLE_PROPERTIES
                } as TTIriRef
              ],
              builderChild: true,
              path: {
                "@id": IM.ROLE_GROUP
              } as TTIriRef,
              argument: [
                {
                  parameter: "this",
                  valueVariable: "concept"
                } as Argument
              ],
              name: "Property",
              minCount: 1,
              componentType: {
                "@id": IM.ENTITY_AUTO_COMPLETE_COMPONENT
              } as TTIriRef,
              valueVariable: "propertyIri"
            } as PropertyShape,
            {
              comment: "Selects a quantifier from allowable range from property",
              order: 2,
              select: [
                {
                  "@id": QUERY.ALLOWABLE_RANGES
                } as TTIriRef
              ],
              builderChild: true,
              path: {
                "@id": IM.ROLE_GROUP
              } as TTIriRef,
              argument: [
                {
                  parameter: "entityIri",
                  valueVariable: "propertyIri"
                } as Argument
              ],
              name: "Quantifier",
              minCount: 1,
              componentType: {
                "@id": IM.ENTITY_AUTO_COMPLETE_COMPONENT
              } as TTIriRef
            } as PropertyShape
          ]
        } as PropertyShape
      ],
      name: "Role group",
      minCount: 0,
      componentType: {
        "@id": IM.ARRAY_BUILDER_COMPONENT
      } as TTIriRef
    } as PropertyShape,
    {
      label: "Property Group - Mapped to array builder",
      order: 1,
      maxCount: 1,
      path: {
        "@id": IM.MAPPED_TO
      } as TTIriRef,
      property: [
        {
          comment: "selects an entity based on select query",
          order: 1,
          select: [
            {
              "@id": QUERY.SEARCH_MAIN_TYPES
            } as TTIriRef
          ],
          builderChild: true,
          name: "Entity",
          path: {
            "@id": IM.MAPPED_TO
          } as TTIriRef,
          minCount: 1,
          componentType: {
            "@id": IM.ENTITY_SEARCH_COMPONENT
          } as TTIriRef
        } as PropertyShape
      ],
      name: "Mapped to",
      minCount: 0,
      componentType: {
        "@id": IM.ARRAY_BUILDER_COMPONENT
      } as TTIriRef
    } as PropertyShape
  ]
} as FormGenerator;

export default ConceptShape;
