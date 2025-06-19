export default {
  CONCEPT_SHAPE: {
    iri: "http://endhealth.info/im#Editor_ConceptShape",
    status: {
      name: "Active",
      iri: "http://endhealth.info/im#Active"
    },
    label: "Editor - Concept shape",
    comment: "Form editor for a concept",
    targetShape: {
      name: "Concept shape",
      iri: "http://endhealth.info/im#ConceptShape"
    },
    type: [
      {
        name: "Form generator",
        iri: "http://endhealth.info/im#FormGenerator"
      }
    ],
    isContainedIn: [
      {
        name: "Data models for IM itself",
        iri: "http://endhealth.info/im#ModelDataModels"
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
          iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        },
        property: [
          {
            comment: "A property that auto generates the type as  concept type",
            name: "type",
            order: 1,
            minCount: 1,
            componentType: {
              iri: "http://endhealth.info/im#entityComboBox"
            },
            path: {
              name: "type",
              iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
            },
            function: {
              iri: "http://endhealth.info/im#Function_GetAdditionalAllowableTypes"
            },
            argument: [
              {
                parameter: "entityIri",
                valueIri: {
                  name: "Terminology Concept",
                  iri: "http://endhealth.info/im#Concept"
                }
              }
            ],
            isIri: {
              name: "Terminology Concept",
              iri: "http://endhealth.info/im#Concept"
            }
          },
          {
            comment: "A property that auto generates a concept iri from the snomed extension",
            name: "iri",
            order: 2,
            minCount: 1,
            maxCount: 1,
            componentType: {
              iri: "http://endhealth.info/im#textDisplay"
            },
            path: {
              iri: "http://endhealth.info/im#id"
            },
            function: {
              name: "Snomed concept generator",
              iri: "http://endhealth.info/im#Function_SnomedConceptGenerator"
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
              iri: "http://endhealth.info/im#textDisplay"
            },
            path: {
              name: "code",
              iri: "http://endhealth.info/im#code"
            },
            function: {
              name: "Local name retriever",
              iri: "http://endhealth.info/im#Function_LocalNameRetriever"
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
              iri: "http://endhealth.info/im#textInput"
            },
            path: {
              name: "label",
              iri: "http://www.w3.org/2000/01/rdf-schema#label"
            }
          },
          {
            comment: "optional description",
            name: "Concept description",
            order: 5,
            minCount: 1,
            maxCount: 1,
            componentType: {
              iri: "http://endhealth.info/im#htmlInput"
            },
            path: {
              name: "comment",
              iri: "http://www.w3.org/2000/01/rdf-schema#comment"
            },
            datatype: {
              name: "string",
              iri: "http://www.w3.org/2001/XMLSchema#string"
            }
          },
          {
            comment: "selects the status with a default of draft",
            name: "status",
            order: 6,
            minCount: 1,
            maxCount: 1,
            componentType: {
              iri: "http://endhealth.info/im#entityComboBox"
            },
            path: {
              name: "status",
              iri: "http://endhealth.info/im#status"
            },
            select: [
              {
                iri: "http://endhealth.info/im#Query_GetIsas"
              }
            ],
            argument: [
              {
                parameter: "this",
                valueIri: {
                  name: "Activity status",
                  iri: "http://endhealth.info/im#Status"
                }
              }
            ],
            isIri: {
              name: "Draft",
              iri: "http://endhealth.info/im#Draft"
            }
          }
        ],
        componentType: {
          iri: "http://endhealth.info/im#stepsGroup"
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
          iri: "http://www.w3.org/2000/01/rdf-schema#subClassOf"
        },
        componentType: {
          iri: "http://endhealth.info/im#stepsGroup"
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
                  iri: "http://endhealth.info/im#entitySearch"
                },
                path: {
                  name: "Subclass of",
                  iri: "http://www.w3.org/2000/01/rdf-schema#subClassOf"
                },
                select: [
                  {
                    name: "Search for concepts",
                    iri: "http://endhealth.info/im#Query_SearchConcepts"
                  }
                ],
                builderChild: true
              }
            ],
            componentType: {
              iri: "http://endhealth.info/im#arrayBuilder"
            },
            path: {
              name: "Subclass of",
              iri: "http://www.w3.org/2000/01/rdf-schema#subClassOf"
            },
            validation: {
              iri: "http://endhealth.info/im#Validation_hasParent"
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
          iri: "http://endhealth.info/im#isContainedIn"
        },
        componentType: {
          iri: "http://endhealth.info/im#stepsGroup"
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
                  iri: "http://endhealth.info/im#entitySearch"
                },
                path: {
                  name: "Is Contained In",
                  iri: "http://endhealth.info/im#isContainedIn"
                },
                select: [
                  {
                    name: "Search for concepts",
                    iri: "http://endhealth.info/im#Query_SearchConcepts"
                  }
                ],
                builderChild: true
              }
            ],
            componentType: {
              iri: "http://endhealth.info/im#arrayBuilder"
            },
            path: {
              name: "Is Contained In",
              iri: "http://endhealth.info/im#isContainedIn"
            },
            validation: {
              iri: "http://endhealth.info/im#Validation_hasParent"
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
          iri: "http://endhealth.info/im#roleGroup"
        },
        componentType: {
          iri: "http://endhealth.info/im#stepsGroup"
        },
        property: [
          {
            label: "Property Group - Role group array builder",
            name: "Role group",
            order: 1,
            minCount: 0,
            maxCount: 1,
            componentType: {
              iri: "http://endhealth.info/im#arrayBuilder"
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
                      iri: "http://endhealth.info/im#entityAutoComplete"
                    },
                    path: {
                      name: "role group",
                      iri: "http://endhealth.info/im#roleGroup"
                    },
                    select: [
                      {
                        name: "Query -allowable properties for a concept",
                        iri: "http://endhealth.info/im#Query_AllowableProperties"
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
                      iri: "http://endhealth.info/im#entityAutoComplete"
                    },
                    path: {
                      name: "role group",
                      iri: "http://endhealth.info/im#roleGroup"
                    },
                    select: [
                      {
                        name: "Query -allowable ranges for a property",
                        iri: "http://endhealth.info/im#Query_AllowableRanges"
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
                  iri: "http://endhealth.info/im#componentGroup"
                },
                path: {
                  name: "role group",
                  iri: "http://endhealth.info/im#roleGroup"
                }
              }
            ],
            path: {
              name: "role group",
              iri: "http://endhealth.info/im#roleGroup"
            }
          }
        ]
      }
    ],
    scheme: {
      name: "London Discovery Snomed extension code scheme and graph",
      iri: "http://endhealth.info/im#"
    }
  },
  CONCEPT_SET_SHAPE: {
    iri: "http://endhealth.info/im#Editor_ConceptSetShape",
    status: {
      name: "Active",
      iri: "http://endhealth.info/im#Active"
    },
    label: "Editor - Concept set shape",
    comment: "Form editor for a concept set",
    targetShape: {
      name: "Set shape",
      iri: "http://endhealth.info/im#SetShape"
    },
    type: [
      {
        name: "Form generator",
        iri: "http://endhealth.info/im#FormGenerator"
      }
    ],
    isContainedIn: [
      {
        name: "Data models for IM itself",
        iri: "http://endhealth.info/im#ModelDataModels"
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
          iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        },
        property: [
          {
            comment: "A property that auto generates the type as  concept type",
            name: "type",
            order: 1,
            minCount: 1,
            componentType: {
              iri: "http://endhealth.info/im#entityComboBox"
            },
            path: {
              name: "type",
              iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
            },
            function: {
              iri: "http://endhealth.info/im#Function_GetAdditionalAllowableTypes"
            },
            argument: [
              {
                parameter: "entityIri",
                valueIri: {
                  name: "Concept Set",
                  iri: "http://endhealth.info/im#ConceptSet"
                }
              }
            ],
            isIri: {
              name: "Concept Set",
              iri: "http://endhealth.info/im#ConceptSet"
            }
          },
          {
            comment: "A property that auto generates a concept iri from the snomed extension",
            name: "iri",
            order: 2,
            minCount: 1,
            maxCount: 1,
            componentType: {
              iri: "http://endhealth.info/im#textDisplay"
            },
            path: {
              iri: "http://endhealth.info/im#id"
            },
            function: {
              name: "Snomed concept generator",
              iri: "http://endhealth.info/im#Function_SnomedConceptGenerator"
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
              iri: "http://endhealth.info/im#textDisplay"
            },
            path: {
              name: "code",
              iri: "http://endhealth.info/im#code"
            },
            function: {
              name: "Local name retriever",
              iri: "http://endhealth.info/im#Function_LocalNameRetriever"
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
              iri: "http://endhealth.info/im#textInput"
            },
            path: {
              name: "label",
              iri: "http://www.w3.org/2000/01/rdf-schema#label"
            }
          },
          {
            comment: "optional description",
            name: "Concept description",
            order: 5,
            minCount: 1,
            maxCount: 1,
            componentType: {
              iri: "http://endhealth.info/im#htmlInput"
            },
            path: {
              name: "comment",
              iri: "http://www.w3.org/2000/01/rdf-schema#comment"
            },
            datatype: {
              name: "string",
              iri: "http://www.w3.org/2001/XMLSchema#string"
            }
          },
          {
            comment: "selects the status with a default of draft",
            name: "status",
            order: 6,
            minCount: 1,
            maxCount: 1,
            componentType: {
              iri: "http://endhealth.info/im#entityComboBox"
            },
            path: {
              name: "status",
              iri: "http://endhealth.info/im#status"
            },
            select: [
              {
                iri: "http://endhealth.info/im#Query_GetIsas"
              }
            ],
            argument: [
              {
                parameter: "this",
                valueIri: {
                  name: "Activity status",
                  iri: "http://endhealth.info/im#Status"
                }
              }
            ],
            isIri: {
              name: "Draft",
              iri: "http://endhealth.info/im#Draft"
            }
          }
        ],
        componentType: {
          iri: "http://endhealth.info/im#stepsGroup"
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
          iri: "http://www.w3.org/2000/01/rdf-schema#subClassOf"
        },
        componentType: {
          iri: "http://endhealth.info/im#stepsGroup"
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
                  iri: "http://endhealth.info/im#entitySearch"
                },
                path: {
                  name: "Subclass of",
                  iri: "http://www.w3.org/2000/01/rdf-schema#subClassOf"
                },
                select: [
                  {
                    name: "Search for concepts",
                    iri: "http://endhealth.info/im#Query_SearchConcepts"
                  }
                ],
                builderChild: true
              }
            ],
            componentType: {
              iri: "http://endhealth.info/im#arrayBuilder"
            },
            path: {
              name: "Subclass of",
              iri: "http://www.w3.org/2000/01/rdf-schema#subClassOf"
            },
            validation: {
              iri: "http://endhealth.info/im#Validation_hasParent"
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
          iri: "http://endhealth.info/im#isContainedIn"
        },
        componentType: {
          iri: "http://endhealth.info/im#stepsGroup"
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
                  iri: "http://endhealth.info/im#entitySearch"
                },
                path: {
                  name: "is Contained In",
                  iri: "http://endhealth.info/im#isContainedIn"
                },
                select: [
                  {
                    name: "Search for concepts",
                    iri: "http://endhealth.info/im#Query_SearchAll"
                  }
                ],
                builderChild: true
              }
            ],
            componentType: {
              iri: "http://endhealth.info/im#arrayBuilder"
            },
            path: {
              name: "is Contained In",
              iri: "http://endhealth.info/im#isContainedIn"
            },
            validation: {
              iri: "http://endhealth.info/im#Validation_hasParent"
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
          iri: "http://endhealth.info/im#definition"
        },
        componentType: {
          iri: "http://endhealth.info/im#stepsGroup"
        },
        property: [
          {
            label: "Property group - members array builder",
            name: "definition",
            order: 1,
            minCount: 1,
            componentType: {
              iri: "http://endhealth.info/im#arrayBuilder"
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
                      iri: "http://endhealth.info/im#entitySearch"
                    },
                    path: {
                      name: "definition",
                      iri: "http://endhealth.info/im#definition"
                    },
                    select: [
                      {
                        name: "Search for concepts",
                        iri: "http://endhealth.info/im#Query_SearchConcepts"
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
                          iri: "http://endhealth.info/im#entityAutoComplete"
                        },
                        path: {
                          name: "definition",
                          iri: "http://endhealth.info/im#definition"
                        },
                        select: [
                          {
                            name: "Query -allowable properties for a concept",
                            iri: "http://endhealth.info/im#Query_AllowableProperties"
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
                          iri: "http://endhealth.info/im#entityAutoComplete"
                        },
                        path: {
                          name: "role group",
                          iri: "http://endhealth.info/im#roleGroup"
                        },
                        select: [
                          {
                            name: "Query -allowable ranges for a property",
                            iri: "http://endhealth.info/im#Query_AllowableRanges"
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
                      iri: "http://endhealth.info/im#componentGroup"
                    },
                    path: {
                      name: "definition",
                      iri: "http://endhealth.info/im#definition"
                    },
                    builderChild: true
                  }
                ],
                componentType: {
                  iri: "http://endhealth.info/im#arrayBuilderWithDropdown"
                },
                path: {
                  name: "definition",
                  iri: "http://endhealth.info/im#definition"
                },
                validation: {
                  iri: "http://endhealth.info/im#Validation_isDefinition"
                },
                validationErrorMessage: "Not a valid definition",
                function: {
                  iri: "http://endhealth.info/im#Function_GetLogicOptions"
                },
                valueIri: {
                  iri: "shacl:or"
                },
                builderChild: true
              }
            ],
            path: {
              name: "definition",
              iri: "http://endhealth.info/im#definition"
            },
            validation: {
              iri: "http://endhealth.info/im#Validation_hasParent"
            },
            validationErrorMessage: "Entity is missing a parent. Add a parent to 'SubclassOf' or 'isContainedIn'."
          }
        ]
      }
    ],
    scheme: {
      name: "London Discovery Snomed extension code scheme and graph",
      iri: "http://endhealth.info/im#"
    }
  }
};
