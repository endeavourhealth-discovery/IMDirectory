export default {
  testShape: {
    "@id": "http://endhealth.info/im#Editor_ConceptShape",
    type: [{ "@id": "http://endhealth.info/im#FormGenerator" }],
    label: "Editor - Concept shape",
    comment: "Form editor for a concept",
    targetShape: { "@id": "http://endhealth.info/im#Concept" },
    property: [
      {
        comment: "Summary | rolegroup splitter",
        order: 1,
        name: "splitter",
        path: { "@id": "http://endhealth.info/im#Concept" },
        minCount: 1,
        maxCount: 1,
        componentType: { "@id": "http://endhealth.info/im#Component_HorizontalLayout" },
        argument: [{ parameter: "subGroup widths", valueData: "50%,50%" }],
        property: [
          {
            comment: "Summary layout",
            name: "Summary",
            path: { "@id": "http://endhealth.info/im#Concept" },
            showTitle: true,
            order: 1,
            maxCount: 1,
            minCount: 1,
            componentType: { "@id": "http://endhealth.info/im#Component_VerticalLayout" },
            property: [
              {
                comment: "A property that auto generates the type as  concept type",
                order: 1,
                function: { "@id": "http://endhealth.info/im#Function_GetAdditionalAllowableTypes" },
                name: "Type",
                showTitle: true,
                path: { "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
                argument: [{ valueIri: { "@id": "http://endhealth.info/im#Concept" }, parameter: "entityIri" }],
                isIri: { "@id": "http://endhealth.info/im#Concept" },
                minCount: 1,
                componentType: { "@id": "http://endhealth.info/im#Component_entityComboBox" }
              },
              {
                comment: "A property that auto generates a concept iri from the snomed extension",
                order: 2,
                name: "Iri",
                showTitle: true,
                maxCount: 1,
                path: { "@id": "http://endhealth.info/im#id" },
                minCount: 1,
                componentType: { "@id": "http://endhealth.info/im#Component_textDisplay" },
                valueVariable: "conceptIri",
                function: { "@id": "http://endhealth.info/im#Function_SnomedConceptGenerator" }
              },
              {
                comment: "Property that derives a concept code from the concept iri",
                order: 3,
                name: "Code",
                showTitle: true,
                maxCount: 1,
                path: { "@id": "http://endhealth.info/im#code" },
                argument: [
                  { parameter: "entityIri", valueVariable: "conceptIri" },
                  { parameter: "fieldName", valueData: "code" }
                ],
                minCount: 1,
                componentType: { "@id": "http://endhealth.info/im#Component_textDisplay" },
                datatype: { "@id": "http://www.w3.org/2001/XMLSchema#string" },
                function: { "@id": "http://endhealth.info/im#Function_LocalNameRetriever" }
              },
              {
                comment: "name or main term of concept",
                order: 4,
                name: "Concept name",
                showTitle: true,
                maxCount: 1,
                path: { "@id": "http://www.w3.org/2000/01/rdf-schema#label" },
                minCount: 1,
                componentType: { "@id": "http://endhealth.info/im#Component_textInput" },
                datatype: { "@id": "http://www.w3.org/2001/XMLSchema#string" }
              },
              {
                comment: "optional description",
                order: 5,
                datatype: { "@id": "http://www.w3.org/2001/XMLSchema#string" },
                name: "Concept description",
                showTitle: true,
                maxCount: 1,
                path: { "@id": "http://www.w3.org/2000/01/rdf-schema#comment" },
                minCount: 0,
                componentType: { "@id": "http://endhealth.info/im#Component_htmlInput" }
              },
              {
                comment: "selects the status with a default of draft",
                order: 6,
                select: [{ "@id": "http://endhealth.info/im#Query_GetIsas" }],
                name: "Status",
                showTitle: true,
                maxCount: 1,
                path: { "@id": "http://endhealth.info/im#status" },
                argument: [{ valueIri: { "@id": "http://endhealth.info/im#Status" }, parameter: "this" }],
                isIri: { "@id": "http://endhealth.info/im#Draft" },
                minCount: 1,
                componentType: { "@id": "http://endhealth.info/im#Component_entityDropdown" },
                forceIsValue: true
              },
              {
                label: "Contained in array builder",
                name: "isContainedIn",
                showTitle: true,
                order: 1,
                minCount: 0,
                componentType: { "@id": "http://endhealth.info/im#Component_arrayBuilder" },
                validation: { "@id": "http://endhealth.info/im#Validation_hasParent" },
                validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
                path: { "@id": "http://endhealth.info/im#isContainedIn" },
                property: [
                  {
                    comment: "selects an entity based on select query",
                    name: "Entity",
                    order: 1,
                    minCount: 0,
                    builderChild: true,
                    componentType: { "@id": "http://endhealth.info/im#Component_entitySearch" },
                    select: [{ "@id": "http://endhealth.info/im#Query_SearchmainTypes" }],
                    path: { "@id": "http://endhealth.info/im#isContainedIn" }
                  }
                ]
              },
              {
                label: "Subclass of array builder",
                name: "subclassOf",
                showTitle: true,
                order: 1,
                minCount: 0,
                componentType: { "@id": "http://endhealth.info/im#Component_arrayBuilder" },
                validation: { "@id": "http://endhealth.info/im#Validation_hasParent" },
                validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'.",
                path: { "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf" },
                valueVariable: "subClassOf",
                property: [
                  {
                    comment: "selects an entity based on select query",
                    name: "Entity",
                    order: 1,
                    minCount: 0,
                    builderChild: true,
                    componentType: { "@id": "http://endhealth.info/im#Component_entitySearch" },
                    select: [{ "@id": "http://endhealth.info/im#Query_SearchmainTypes" }],
                    path: { "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf" }
                  }
                ]
              },
              {
                comment: "Toggle controlling sub components visibility",
                order: 8,
                name: "Replaced by",
                label: "Deactivate | Activate",
                minCount: 1,
                maxCount: 1,
                path: { "@id": "http://snomed.info/sct#370124000" },
                componentType: { "@id": "http://endhealth.info/im#Component_ToggleableComponent" },
                property: [
                  {
                    comment: "selects an entity based on select query",
                    order: 1,
                    select: [{ "@id": "http://endhealth.info/im#Query_SearchEntities" }],
                    argument: [{ parameter: "this", valueIri: { "@id": "http://endhealth.info/im#Concept" } }],
                    name: "Replaced by",
                    showTitle: true,
                    path: { "@id": "http://snomed.info/sct#370124000" },
                    minCount: 1,
                    componentType: { "@id": "http://endhealth.info/im#Component_entitySearch" }
                  }
                ]
              }
            ]
          },
          {
            name: "Splitter",
            comment: "Role group | Mapped to splitter",
            path: { "@id": "http://endhealth.info/im#Concept" },
            order: 1,
            minCount: 1,
            maxCount: 1,
            componentType: { "@id": "http://endhealth.info/im#Component_VerticalLayout" },
            property: [
              {
                label: "Property Group - Role group builder",
                order: 1,
                maxCount: 1,
                path: { "@id": "http://endhealth.info/im#roleGroup" },
                name: "Role group",
                minCount: 0,
                componentType: { "@id": "http://endhealth.info/im#Component_roleGroupBuilder" }
              },
              {
                label: "Property Group - Mapped to array builder",
                order: 1,
                maxCount: 1,
                showTitle: true,
                path: { "@id": "http://endhealth.info/im#mappedTo" },
                property: [
                  {
                    comment: "selects an entity based on select query",
                    order: 1,
                    select: [{ "@id": "http://endhealth.info/im#Query_SearchmainTypes" }],
                    builderChild: true,
                    name: "Entity",
                    path: { "@id": "http://endhealth.info/im#mappedTo" },
                    minCount: 1,
                    componentType: { "@id": "http://endhealth.info/im#Component_entitySearch" }
                  }
                ],
                name: "Mapped to",
                minCount: 0,
                componentType: { "@id": "http://endhealth.info/im#Component_arrayBuilder" }
              }
            ]
          }
        ]
      }
    ]
  },
  validationCheckStatus: [
    {
      checkCompleted: false,
      key: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#id"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#code"
    },
    {
      checkCompleted: false,
      key: "http://www.w3.org/2000/01/rdf-schema#label"
    },
    {
      checkCompleted: false,
      key: "http://www.w3.org/2000/01/rdf-schema#comment"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#status"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#isContainedIn"
    },
    {
      checkCompleted: false,
      key: "http://www.w3.org/2000/01/rdf-schema#subClassOf"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#roleGroup"
    },
    {
      checkCompleted: false,
      key: "http://endhealth.info/im#mappedTo"
    }
  ]
};
