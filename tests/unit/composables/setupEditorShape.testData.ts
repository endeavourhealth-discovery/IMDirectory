export default {
  CONCEPT_SHAPE: {
    "@id": "http://endhealth.info/im#Editor_ConceptShape",
    status: {
      name: "Active",
      "@id": "http://endhealth.info/im#Active"
    },
    label: "Editor - Concept shape",
    comment: "Form editor for a concept",
    targetShape: {
      name: "Concept shape",
      "@id": "http://endhealth.info/im#ConceptShape"
    },
    type: [
      {
        name: "Form generator",
        "@id": "http://endhealth.info/im#FormGenerator"
      }
    ],
    isContainedIn: [
      {
        name: "Data models for IM itself",
        "@id": "http://endhealth.info/im#ModelDataModels"
      }
    ],
    property: [
      {
        label: "Property group - Summary details",
        name: "Summary details",
        order: 1,
        minCount: 1,
        maxCount: 1,
        path: {
          name: "type",
          "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        },
        property: [
          {
            comment: "A property that auto generates the type as  concept type",
            name: "type",
            order: 1,
            minCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#entityComboBox"
            },
            path: {
              name: "type",
              "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
            },
            function: {
              "@id": "http://endhealth.info/im#Function_GetAdditionalAllowableTypes"
            },
            argument: [
              {
                parameter: "entityIri",
                valueIri: {
                  name: "Terminology Concept",
                  "@id": "http://endhealth.info/im#Concept"
                }
              }
            ],
            isIri: {
              name: "Terminology Concept",
              "@id": "http://endhealth.info/im#Concept"
            }
          },
          {
            comment: "A property that auto generates a concept iri from the snomed extension",
            name: "iri",
            order: 2,
            minCount: 1,
            maxCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#textDisplay"
            },
            path: {
              "@id": "http://endhealth.info/im#id"
            },
            function: {
              name: "Snomed concept generator",
              "@id": "http://endhealth.info/im#Function_SnomedConceptGenerator"
            },
            valueVariable: "conceptIri"
          },
          {
            comment: "Property that derives a concept code from the concept iri",
            name: "code",
            order: 3,
            minCount: 1,
            maxCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#textDisplay"
            },
            path: {
              name: "code",
              "@id": "http://endhealth.info/im#code"
            },
            function: {
              name: "Local name retriever",
              "@id": "http://endhealth.info/im#Function_LocalNameRetriever"
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
            ]
          },
          {
            comment: "name or main term of concept",
            name: "Concept name",
            order: 4,
            minCount: 1,
            maxCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#textInput"
            },
            path: {
              name: "label",
              "@id": "http://www.w3.org/2000/01/rdf-schema#label"
            }
          },
          {
            comment: "optional description",
            name: "Concept description",
            order: 5,
            minCount: 1,
            maxCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#htmlInput"
            },
            path: {
              name: "comment",
              "@id": "http://www.w3.org/2000/01/rdf-schema#comment"
            },
            datatype: {
              name: "string",
              "@id": "http://www.w3.org/2001/XMLSchema#string"
            }
          },
          {
            comment: "selects the status with a default of draft",
            name: "status",
            order: 6,
            minCount: 1,
            maxCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#entityComboBox"
            },
            path: {
              name: "status",
              "@id": "http://endhealth.info/im#status"
            },
            select: [
              {
                "@id": "http://endhealth.info/im#Query_GetIsas"
              }
            ],
            argument: [
              {
                parameter: "this",
                valueIri: {
                  name: "Activity status",
                  "@id": "http://endhealth.info/im#Status"
                }
              }
            ],
            isIri: {
              name: "Draft",
              "@id": "http://endhealth.info/im#Draft"
            }
          }
        ],
        componentType: {
          "@id": "http://endhealth.info/im#stepsGroup"
        }
      },
      {
        label: "Property group - Sub class steps",
        name: "Subclass of",
        order: 2,
        minCount: 1,
        maxCount: 1,
        path: {
          name: "Subclass of",
          "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
        },
        componentType: {
          "@id": "http://endhealth.info/im#stepsGroup"
        },
        property: [
          {
            label: "Property group - Sub type array builder",
            name: "Subclass of",
            order: 1,
            minCount: 1,
            property: [
              {
                comment: "selects an entity based on select query",
                name: "Entity",
                order: 1,
                minCount: 1,
                componentType: {
                  "@id": "http://endhealth.info/im#entitySearch"
                },
                path: {
                  name: "Subclass of",
                  "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
                },
                select: [
                  {
                    name: "Search for concepts",
                    "@id": "http://endhealth.info/im#Query_SearchConcepts"
                  }
                ],
                builderChild: true
              }
            ],
            componentType: {
              "@id": "http://endhealth.info/im#arrayBuilder"
            },
            path: {
              name: "Subclass of",
              "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
            },
            validation: {
              "@id": "http://endhealth.info/im#Validation_hasParent"
            },
            validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'."
          }
        ]
      },
      {
        label: "Property group - Is contained in steps",
        name: "Is contained in",
        order: 3,
        minCount: 1,
        maxCount: 1,
        path: {
          name: "Is Contained In",
          "@id": "http://endhealth.info/im#isContainedIn"
        },
        componentType: {
          "@id": "http://endhealth.info/im#stepsGroup"
        },
        property: [
          {
            label: "Property group - Is contained in array builder",
            name: "Is contained in",
            order: 1,
            minCount: 0,
            property: [
              {
                comment: "selects an entity based on select query",
                name: "Entity",
                order: 1,
                minCount: 1,
                componentType: {
                  "@id": "http://endhealth.info/im#entitySearch"
                },
                path: {
                  name: "Is Contained In",
                  "@id": "http://endhealth.info/im#isContainedIn"
                },
                select: [
                  {
                    name: "Search for concepts",
                    "@id": "http://endhealth.info/im#Query_SearchConcepts"
                  }
                ],
                builderChild: true
              }
            ],
            componentType: {
              "@id": "http://endhealth.info/im#arrayBuilder"
            },
            path: {
              name: "Is Contained In",
              "@id": "http://endhealth.info/im#isContainedIn"
            },
            validation: {
              "@id": "http://endhealth.info/im#Validation_hasParent"
            },
            validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'."
          }
        ]
      },
      {
        label: "Property group - Role group steps",
        name: "Role group",
        order: 4,
        minCount: 0,
        path: {
          name: "role group",
          "@id": "http://endhealth.info/im#roleGroup"
        },
        componentType: {
          "@id": "http://endhealth.info/im#stepsGroup"
        },
        property: [
          {
            label: "Property Group - Role group array builder",
            name: "Role group",
            order: 1,
            minCount: 0,
            maxCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#arrayBuilder"
            },
            property: [
              {
                label: "Property Group - Role group component group",
                name: "Property refinement",
                order: 1,
                minCount: 1,
                property: [
                  {
                    comment: "selects a property from allowable range from selected concept",
                    name: "Property",
                    order: 1,
                    minCount: 1,
                    componentType: {
                      "@id": "http://endhealth.info/im#entityAutoComplete"
                    },
                    path: {
                      name: "role group",
                      "@id": "http://endhealth.info/im#roleGroup"
                    },
                    select: [
                      {
                        name: "Query -allowable properties for a concept",
                        "@id": "http://endhealth.info/im#Query_AllowableProperties"
                      }
                    ],
                    argument: [
                      {
                        parameter: "entityIri",
                        valueVariable: "conceptIri"
                      }
                    ],
                    valueVariable: "propertyIri",
                    builderChild: true
                  },
                  {
                    comment: "Selects a quantifier from allowable range from property",
                    name: "Quantifier",
                    order: 2,
                    minCount: 1,
                    componentType: {
                      "@id": "http://endhealth.info/im#entityAutoComplete"
                    },
                    path: {
                      name: "role group",
                      "@id": "http://endhealth.info/im#roleGroup"
                    },
                    select: [
                      {
                        name: "Query -allowable ranges for a property",
                        "@id": "http://endhealth.info/im#Query_AllowableRanges"
                      }
                    ],
                    argument: [
                      {
                        parameter: "entityIri",
                        valueVariable: "propertyIri"
                      }
                    ],
                    builderChild: true
                  }
                ],
                componentType: {
                  "@id": "http://endhealth.info/im#componentGroup"
                },
                path: {
                  name: "role group",
                  "@id": "http://endhealth.info/im#roleGroup"
                }
              }
            ],
            path: {
              name: "role group",
              "@id": "http://endhealth.info/im#roleGroup"
            }
          }
        ]
      }
    ],
    scheme: {
      name: "London Discovery Snomed extension code scheme and graph",
      "@id": "http://endhealth.info/im#"
    },
    iri: "http://endhealth.info/im#Editor_ConceptShape"
  },
  CONCEPT_SET_SHAPE: {
    "@id": "http://endhealth.info/im#Editor_ConceptSetShape",
    status: {
      name: "Active",
      "@id": "http://endhealth.info/im#Active"
    },
    label: "Editor - Concept set shape",
    comment: "Form editor for a concept set",
    targetShape: {
      name: "Set shape",
      "@id": "http://endhealth.info/im#SetShape"
    },
    type: [
      {
        name: "Form generator",
        "@id": "http://endhealth.info/im#FormGenerator"
      }
    ],
    isContainedIn: [
      {
        name: "Data models for IM itself",
        "@id": "http://endhealth.info/im#ModelDataModels"
      }
    ],
    property: [
      {
        label: "Property group - Summary details",
        name: "Summary details",
        order: 1,
        minCount: 1,
        maxCount: 1,
        path: {
          name: "type",
          "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        },
        property: [
          {
            comment: "A property that auto generates the type as  concept type",
            name: "type",
            order: 1,
            minCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#entityComboBox"
            },
            path: {
              name: "type",
              "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
            },
            function: {
              "@id": "http://endhealth.info/im#Function_GetAdditionalAllowableTypes"
            },
            argument: [
              {
                parameter: "entityIri",
                valueIri: {
                  name: "Concept Set",
                  "@id": "http://endhealth.info/im#ConceptSet"
                }
              }
            ],
            isIri: {
              name: "Concept Set",
              "@id": "http://endhealth.info/im#ConceptSet"
            }
          },
          {
            comment: "A property that auto generates a concept iri from the snomed extension",
            name: "iri",
            order: 2,
            minCount: 1,
            maxCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#textDisplay"
            },
            path: {
              "@id": "http://endhealth.info/im#id"
            },
            function: {
              name: "Snomed concept generator",
              "@id": "http://endhealth.info/im#Function_SnomedConceptGenerator"
            },
            valueVariable: "conceptIri"
          },
          {
            comment: "Property that derives a concept code from the concept iri",
            name: "code",
            order: 3,
            minCount: 1,
            maxCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#textDisplay"
            },
            path: {
              name: "code",
              "@id": "http://endhealth.info/im#code"
            },
            function: {
              name: "Local name retriever",
              "@id": "http://endhealth.info/im#Function_LocalNameRetriever"
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
            ]
          },
          {
            comment: "name or main term of concept",
            name: "Concept name",
            order: 4,
            minCount: 1,
            maxCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#textInput"
            },
            path: {
              name: "label",
              "@id": "http://www.w3.org/2000/01/rdf-schema#label"
            }
          },
          {
            comment: "optional description",
            name: "Concept description",
            order: 5,
            minCount: 1,
            maxCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#htmlInput"
            },
            path: {
              name: "comment",
              "@id": "http://www.w3.org/2000/01/rdf-schema#comment"
            },
            datatype: {
              name: "string",
              "@id": "http://www.w3.org/2001/XMLSchema#string"
            }
          },
          {
            comment: "selects the status with a default of draft",
            name: "status",
            order: 6,
            minCount: 1,
            maxCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#entityComboBox"
            },
            path: {
              name: "status",
              "@id": "http://endhealth.info/im#status"
            },
            select: [
              {
                "@id": "http://endhealth.info/im#Query_GetIsas"
              }
            ],
            argument: [
              {
                parameter: "this",
                valueIri: {
                  name: "Activity status",
                  "@id": "http://endhealth.info/im#Status"
                }
              }
            ],
            isIri: {
              name: "Draft",
              "@id": "http://endhealth.info/im#Draft"
            }
          }
        ],
        componentType: {
          "@id": "http://endhealth.info/im#stepsGroup"
        }
      },
      {
        label: "Property group - Sub class steps",
        name: "Subclass of",
        order: 2,
        minCount: 1,
        maxCount: 0,
        path: {
          name: "Subclass of",
          "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
        },
        componentType: {
          "@id": "http://endhealth.info/im#stepsGroup"
        },
        property: [
          {
            label: "Property group - Sub type array builder",
            name: "Subclass of",
            order: 1,
            minCount: 1,
            property: [
              {
                comment: "selects an entity based on select query",
                name: "Entity",
                order: 1,
                minCount: 1,
                componentType: {
                  "@id": "http://endhealth.info/im#entitySearch"
                },
                path: {
                  name: "Subclass of",
                  "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
                },
                select: [
                  {
                    name: "Search for concepts",
                    "@id": "http://endhealth.info/im#Query_SearchConcepts"
                  }
                ],
                builderChild: true
              }
            ],
            componentType: {
              "@id": "http://endhealth.info/im#arrayBuilder"
            },
            path: {
              name: "Subclass of",
              "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf"
            },
            validation: {
              "@id": "http://endhealth.info/im#Validation_hasParent"
            },
            validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'."
          }
        ]
      },
      {
        label: "Property group - Contained in steps",
        name: "Is contained in",
        order: 3,
        minCount: 0,
        maxCount: 1,
        path: {
          name: "is Contained In",
          "@id": "http://endhealth.info/im#isContainedIn"
        },
        componentType: {
          "@id": "http://endhealth.info/im#stepsGroup"
        },
        property: [
          {
            label: "Property group - contained in array builder",
            name: "Is contained in",
            order: 1,
            minCount: 1,
            property: [
              {
                comment: "selects an entity based on select query",
                name: "Entity",
                order: 1,
                minCount: 1,
                componentType: {
                  "@id": "http://endhealth.info/im#entitySearch"
                },
                path: {
                  name: "is Contained In",
                  "@id": "http://endhealth.info/im#isContainedIn"
                },
                select: [
                  {
                    name: "Search for concepts",
                    "@id": "http://endhealth.info/im#Query_SearchAll"
                  }
                ],
                builderChild: true
              }
            ],
            componentType: {
              "@id": "http://endhealth.info/im#arrayBuilder"
            },
            path: {
              name: "is Contained In",
              "@id": "http://endhealth.info/im#isContainedIn"
            },
            validation: {
              "@id": "http://endhealth.info/im#Validation_hasParent"
            },
            validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'."
          }
        ]
      },
      {
        label: "Property group - Members steps",
        name: "Members",
        order: 4,
        minCount: 0,
        maxCount: 1,
        path: {
          name: "definition",
          "@id": "http://endhealth.info/im#definition"
        },
        componentType: {
          "@id": "http://endhealth.info/im#stepsGroup"
        },
        property: [
          {
            label: "Property group - members array builder",
            name: "definition",
            order: 1,
            minCount: 1,
            componentType: {
              "@id": "http://endhealth.info/im#arrayBuilder"
            },
            property: [
              {
                label: "Members builder",
                name: "Members",
                order: 1,
                minCount: 1,
                maxCount: 1,
                property: [
                  {
                    comment: "selects an entity based on select query",
                    name: "Entity",
                    order: 1,
                    minCount: 1,
                    componentType: {
                      "@id": "http://endhealth.info/im#entitySearch"
                    },
                    path: {
                      name: "definition",
                      "@id": "http://endhealth.info/im#definition"
                    },
                    select: [
                      {
                        name: "Search for concepts",
                        "@id": "http://endhealth.info/im#Query_SearchConcepts"
                      }
                    ],
                    valueVariable: "memberIri",
                    builderChild: true
                  },
                  {
                    label: "Property Group - refinement component group",
                    name: "Member refinement",
                    order: 1,
                    minCount: 0,
                    property: [
                      {
                        comment: "selects a property from allowable range from selected concept",
                        name: "Property",
                        order: 1,
                        minCount: 1,
                        componentType: {
                          "@id": "http://endhealth.info/im#entityAutoComplete"
                        },
                        path: {
                          name: "definition",
                          "@id": "http://endhealth.info/im#definition"
                        },
                        select: [
                          {
                            name: "Query -allowable properties for a concept",
                            "@id": "http://endhealth.info/im#Query_AllowableProperties"
                          }
                        ],
                        argument: [
                          {
                            parameter: "entityIri",
                            valueVariable: "memberIri"
                          }
                        ],
                        valueVariable: "propertyIri",
                        builderChild: true
                      },
                      {
                        comment: "Selects a quantifier from allowable range from property",
                        name: "Quantifier",
                        order: 2,
                        minCount: 1,
                        componentType: {
                          "@id": "http://endhealth.info/im#entityAutoComplete"
                        },
                        path: {
                          name: "role group",
                          "@id": "http://endhealth.info/im#roleGroup"
                        },
                        select: [
                          {
                            name: "Query -allowable ranges for a property",
                            "@id": "http://endhealth.info/im#Query_AllowableRanges"
                          }
                        ],
                        argument: [
                          {
                            parameter: "entityIri",
                            valueVariable: "propertyIri"
                          }
                        ],
                        builderChild: true
                      }
                    ],
                    componentType: {
                      "@id": "http://endhealth.info/im#componentGroup"
                    },
                    path: {
                      name: "definition",
                      "@id": "http://endhealth.info/im#definition"
                    },
                    builderChild: true
                  }
                ],
                componentType: {
                  "@id": "http://endhealth.info/im#arrayBuilderWithDropdown"
                },
                path: {
                  name: "definition",
                  "@id": "http://endhealth.info/im#definition"
                },
                validation: {
                  "@id": "http://endhealth.info/im#Validation_isDefinition"
                },
                validationErrorMessage: "Not a valid definition",
                function: {
                  "@id": "http://endhealth.info/im#Function_GetLogicOptions"
                },
                valueIri: {
                  "@id": "shacl:or"
                },
                builderChild: true
              }
            ],
            path: {
              name: "definition",
              "@id": "http://endhealth.info/im#definition"
            },
            validation: {
              "@id": "http://endhealth.info/im#Validation_hasParent"
            },
            validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'."
          }
        ]
      }
    ],
    scheme: {
      name: "London Discovery Snomed extension code scheme and graph",
      "@id": "http://endhealth.info/im#"
    },
    iri: "http://endhealth.info/im#Editor_ConceptSetShape"
  }
};
