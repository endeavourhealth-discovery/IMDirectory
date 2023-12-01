import { IM } from "@/vocabulary";

export default {
  orGroupMinusOrGroup: {
    match: [
      {
        bool: "and",
        match: [
          {
            bool: "or",
            match: [
              {
                instanceOf: {
                  "@id": "http://snomed.info/sct#386725007",
                  descendantsOrSelfOf: true
                }
              },
              {
                instanceOf: {
                  "@id": "http://snomed.info/sct#431314004",
                  descendantsOrSelfOf: true
                }
              }
            ]
          },
          {
            exclude: true,
            bool: "or",
            match: [
              {
                instanceOf: {
                  "@id": "http://snomed.info/sct#838441000000103",
                  descendantsOrSelfOf: true
                }
              },
              {
                instanceOf: {
                  "@id": "http://snomed.info/sct#838451000000100",
                  descendantsOrSelfOf: true
                }
              }
            ]
          }
        ]
      }
    ]
  },
  allergyToPenicillinsOrCephasporinsWithCausativeLactams: {
    match: [
      {
        bool: "or",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#91936005",
              descendantsOrSelfOf: true
            }
          },
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#294532003",
              descendantsOrSelfOf: true
            }
          }
        ],
        property: [
          {
            "@id": "http://snomed.info/sct#246075003",
            is: [
              {
                "@id": "http://snomed.info/sct#771577000",
                descendantsOrSelfOf: true
              }
            ],
            anyRoleGroup: true,
            descendantsOrSelfOf: true
          }
        ]
      }
    ]
  },
  andGroupedWithSubsumptionAttributeValue: {
    match: [
      {
        bool: "and",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#298705000",
              descendantsOrSelfOf: true
            }
          },
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#301366005",
              descendantsOrSelfOf: true
            },
            property: [
              {
                "@id": "http://endhealth.info/im#roleGroup",
                match: {
                  property: [
                    {
                      "@id": "http://snomed.info/sct#363698007",
                      is: [
                        {
                          "@id": "http://snomed.info/sct#51185008",
                          descendantsOrSelfOf: true
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  },
  andNoAttributeGroup: {
    match: [
      {
        bool: "and",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#298705000",
              descendantsOrSelfOf: true
            }
          },
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#301366005",
              descendantsOrSelfOf: true
            }
          }
        ],
        property: [
          {
            "@id": "http://snomed.info/sct#762705008",
            is: [
              {
                "@id": "http://snomed.info/sct#51185008",
                descendantsOrSelfOf: true
              }
            ],
            anyRoleGroup: true,
            descendantsOrSelfOf: true
          }
        ]
      }
    ]
  },
  andWithRefinementOfSecondConcept: {
    match: [
      {
        bool: "and",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#298705000",
              descendantsOrSelfOf: true
            }
          },
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#301366005",
              descendantsOrSelfOf: true
            },
            property: [
              {
                "@id": "http://endhealth.info/im#roleGroup",
                match: {
                  property: [
                    {
                      "@id": "http://snomed.info/sct#363698007",
                      is: [
                        {
                          "@id": "http://snomed.info/sct#51185008"
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  },
  andWithSubsumptionPropertyValue: {
    match: [
      {
        bool: "and",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#298705000",
              descendantsOrSelfOf: true
            }
          },
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#301366005",
              descendantsOrSelfOf: true
            },
            property: [
              {
                "@id": "http://endhealth.info/im#roleGroup",
                match: {
                  property: [
                    {
                      "@id": "http://snomed.info/sct#762705008",
                      is: [
                        {
                          "@id": "http://snomed.info/sct#51185008",
                          descendantsOrSelfOf: true
                        }
                      ],
                      descendantsOrSelfOf: true
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  },
  bracketedAnd: {
    match: [
      {
        bool: "and",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#298705000",
              descendantsOrSelfOf: true
            }
          },
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#301366005",
              descendantsOrSelfOf: true
            }
          }
        ],
        property: [
          {
            "@id": "http://endhealth.info/im#roleGroup",
            match: {
              property: [
                {
                  "@id": "http://snomed.info/sct#762705008",
                  is: [
                    {
                      "@id": "http://snomed.info/sct#51185008",
                      descendantsOrSelfOf: true
                    }
                  ],
                  descendantsOrSelfOf: true
                }
              ]
            }
          }
        ]
      }
    ]
  },
  descendantsAndSelf: {
    match: [
      {
        instanceOf: {
          "@id": "http://snomed.info/sct#29857009",
          descendantsOrSelfOf: true
        }
      }
    ]
  },
  descendantsNotSelf: {
    match: [
      {
        instanceOf: {
          "@id": "http://snomed.info/sct#29857009",
          descendantsOf: true
        }
      }
    ]
  },
  mergedGroupError: {
    match: [
      {
        instanceOf: {
          "@id": "http://snomed.info/sct#225399009",
          descendantsOrSelfOf: true
        },
        property: [
          {
            "@id": "http://endhealth.info/im#roleGroup",

            match: {
              bool: "and",
              property: [
                {
                  "@id": "http://snomed.info/sct#260686004",
                  is: [
                    {
                      "@id": "http://snomed.info/sct#129265001",
                      descendantsOrSelfOf: true
                    }
                  ],
                  descendantsOrSelfOf: true
                },
                {
                  "@id": "http://snomed.info/sct#363702006",
                  is: [
                    {
                      "@id": "http://snomed.info/sct#29857009",
                      descendantsOrSelfOf: true
                    }
                  ],
                  descendantsOrSelfOf: true
                }
              ]
            }
          }
        ]
      }
    ]
  },
  minusAConcept: {
    match: [
      {
        bool: "and",
        match: [
          {
            bool: "and",
            match: [
              {
                instanceOf: {
                  "@id": "http://snomed.info/sct#298705000",
                  descendantsOrSelfOf: true
                }
              },
              {
                instanceOf: {
                  "@id": "http://snomed.info/sct#301366005",
                  descendantsOrSelfOf: true
                }
              }
            ],
            property: [
              {
                "@id": "http://endhealth.info/im#roleGroup",
                match: {
                  property: [
                    {
                      "@id": "http://snomed.info/sct#762705008",
                      is: [
                        {
                          "@id": "http://snomed.info/sct#51185008",
                          descendantsOrSelfOf: true
                        }
                      ],
                      descendantsOrSelfOf: true
                    }
                  ]
                }
              }
            ]
          },
          {
            exclude: true,
            match: [
              {
                instanceOf: {
                  "@id": "http://snomed.info/sct#426396005",
                  descendantsOrSelfOf: true
                }
              }
            ]
          }
        ]
      }
    ]
  },
  minusAWildCardRefined: {
    match: [
      {
        bool: "and",
        match: [
          {
            bool: "and",
            match: [
              {
                instanceOf: {
                  "@id": "http://snomed.info/sct#298705000",
                  descendantsOrSelfOf: true
                }
              },
              {
                instanceOf: {
                  "@id": "http://snomed.info/sct#301366005",
                  descendantsOrSelfOf: true
                }
              }
            ],
            property: [
              {
                "@id": "http://endhealth.info/im#roleGroup",
                match: {
                  property: [
                    {
                      "@id": "http://snomed.info/sct#762705008",
                      is: [
                        {
                          "@id": "http://snomed.info/sct#51185008",
                          descendantsOrSelfOf: true
                        }
                      ],
                      descendantsOrSelfOf: true
                    }
                  ]
                }
              }
            ]
          },
          {
            exclude: true,
            match: [
              {
                property: [
                  {
                    "@id": "http://endhealth.info/im#roleGroup",
                    match: {
                      property: [
                        {
                          "@id": "http://snomed.info/sct#363698007",
                          is: [
                            {
                              "@id": "http://snomed.info/sct#722725008"
                            }
                          ]
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  oralNsaids: {
    match: [
      {
        instanceOf: {
          "@id": "http://snomed.info/sct#763158003",
          descendantsOrSelfOf: true
        },
        property: [
          {
            bool: "and",
            property: [
              {
                "@id": "http://snomed.info/sct#127489000",
                is: [
                  {
                    "@id": "http://snomed.info/sct#372665008",
                    descendantsOrSelfOf: true
                  }
                ],
                anyRoleGroup: true,
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#411116001",
                is: [
                  {
                    "@id": "http://snomed.info/sct#385268001"
                  }
                ],
                anyRoleGroup: true,
                descendantsOrSelfOf: true
              }
            ]
          }
        ]
      }
    ]
  },
  simpleAndDescendants: {
    match: [
      {
        bool: "and",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#298705000",
              descendantsOf: true
            }
          },
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#301366005",
              descendantsOf: true
            }
          }
        ]
      }
    ]
  },
  simpleAndShouldBe0: {
    match: [
      {
        bool: "and",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#298705000"
            }
          },
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#301366005"
            }
          }
        ]
      }
    ]
  },
  singleConcept: {
    match: [
      {
        instanceOf: {
          "@id": "http://snomed.info/sct#29857009"
        }
      }
    ]
  },
  twoAttributeGroups: {
    match: [
      {
        instanceOf: {
          "@id": "http://snomed.info/sct#225399009",
          descendantsOrSelfOf: true
        },
        property: [
          {
            bool: "and",
            property: [
              {
                "@id": "http://endhealth.info/im#roleGroup",
                match: {
                  property: [
                    {
                      "@id": "http://snomed.info/sct#260686004",
                      is: [
                        {
                          "@id": "http://snomed.info/sct#129265001",
                          descendantsOrSelfOf: true
                        }
                      ],
                      descendantsOrSelfOf: true
                    }
                  ]
                }
              },
              {
                "@id": "http://endhealth.info/im#roleGroup",
                match: {
                  property: [
                    {
                      "@id": "http://snomed.info/sct#363702006",
                      is: [
                        {
                          "@id": "http://snomed.info/sct#29857009",
                          descendantsOrSelfOf: true
                        }
                      ],
                      descendantsOrSelfOf: true
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  },
  ungroupedButSeparateGroups: {
    match: [
      {
        instanceOf: {
          "@id": "http://snomed.info/sct#225399009",
          descendantsOrSelfOf: true
        },
        property: [
          {
            bool: "and",
            property: [
              {
                "@id": "http://snomed.info/sct#260686004",
                is: [
                  {
                    "@id": "http://snomed.info/sct#129265001",
                    descendantsOrSelfOf: true
                  }
                ],
                anyRoleGroup: true,
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#363702006",
                is: [
                  {
                    "@id": "http://snomed.info/sct#29857009",
                    descendantsOrSelfOf: true
                  }
                ],
                anyRoleGroup: true,
                descendantsOrSelfOf: true
              }
            ]
          }
        ]
      }
    ]
  },
  unionWithRefinement: {
    match: [
      {
        bool: "or",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#116536008",
              descendantsOrSelfOf: true
            }
          },
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#350312004",
              descendantsOrSelfOf: true
            }
          }
        ],
        property: [
          {
            bool: "and",
            property: [
              {
                "@id": "http://snomed.info/sct#127489000",
                is: [
                  {
                    "@id": "http://snomed.info/sct#372665008",
                    descendantsOrSelfOf: true
                  }
                ],
                anyRoleGroup: true,
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#411116001",
                is: [
                  {
                    "@id": "http://snomed.info/sct#385268001",
                    descendantsOrSelfOf: true
                  }
                ],
                anyRoleGroup: true,
                descendantsOrSelfOf: true
              }
            ]
          }
        ]
      }
    ]
  },
  minusWithGroups: {
    match: [
      {
        bool: "and",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#763158003",
              descendantsOrSelfOf: true
            },
            property: [
              {
                bool: "and",
                property: [
                  {
                    "@id": "http://snomed.info/sct#127489000",
                    anyRoleGroup: true,
                    descendantsOrSelfOf: true,
                    is: [
                      {
                        "@id": "http://snomed.info/sct#372695000",
                        descendantsOrSelfOf: true
                      }
                    ]
                  },
                  {
                    "@id": "http://snomed.info/sct#8940601000001102",
                    anyRoleGroup: true,
                    is: [
                      {
                        "@id": "http://snomed.info/sct#8940901000001109"
                      }
                    ]
                  },
                  {
                    "@id": "http://snomed.info/sct#8940001000001105",
                    anyRoleGroup: true,
                    is: [
                      {
                        "@id": "http://snomed.info/sct#8940201000001104"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            exclude: true,
            match: [
              {
                instanceOf: {
                  "@id": "http://snomed.info/sct#763158003",
                  descendantsOrSelfOf: true
                },
                property: [
                  {
                    "@id": "http://snomed.info/sct#8940601000001102",
                    anyRoleGroup: true,
                    is: [
                      {
                        "@id": "http://snomed.info/sct#8941001000001100"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  orRefinement: {
    match: [
      {
        instanceOf: {
          "@id": "http://snomed.info/sct#763158003",
          descendantsOrSelfOf: true
        },
        property: [
          {
            bool: "or",
            property: [
              {
                anyRoleGroup: true,

                "@id": "http://snomed.info/sct#127489000",
                descendantsOrSelfOf: true,
                is: [
                  {
                    "@id": "http://snomed.info/sct#698090000",
                    descendantsOrSelfOf: true
                  }
                ]
              },
              {
                anyRoleGroup: true,
                "@id": "http://snomed.info/sct#127489000",
                descendantsOrSelfOf: true,
                is: [
                  {
                    "@id": "http://snomed.info/sct#442031002",
                    descendantsOrSelfOf: true
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  multipeOrRefinement: {
    match: [
      {
        instanceOf: {
          "@id": "http://snomed.info/sct#763158003",
          descendantsOrSelfOf: true
        },
        property: [
          {
            bool: "or",
            property: [
              {
                "@id": "http://snomed.info/sct#127489000",
                anyRoleGroup: true,
                descendantsOrSelfOf: true,
                is: [
                  {
                    "@id": "http://snomed.info/sct#698090000",
                    descendantsOrSelfOf: true
                  }
                ]
              },
              {
                "@id": "http://snomed.info/sct#127489000",
                anyRoleGroup: true,
                descendantsOrSelfOf: true,
                is: [
                  {
                    "@id": "http://snomed.info/sct#442031002",
                    descendantsOrSelfOf: true
                  }
                ]
              },
              {
                "@id": "http://snomed.info/sct#127489000",
                anyRoleGroup: true,
                descendantsOrSelfOf: true,
                is: [
                  {
                    "@id": "http://snomed.info/sct#698871007",
                    descendantsOrSelfOf: true
                  }
                ]
              },
              {
                "@id": "http://snomed.info/sct#127489000",
                anyRoleGroup: true,
                descendantsOrSelfOf: true,
                is: [
                  {
                    "@id": "http://snomed.info/sct#712778008",
                    descendantsOrSelfOf: true
                  }
                ]
              },
              {
                "@id": "http://snomed.info/sct#127489000",
                anyRoleGroup: true,
                descendantsOrSelfOf: true,
                is: [
                  {
                    "@id": "http://snomed.info/sct#387260007",
                    descendantsOrSelfOf: true
                  }
                ]
              },
              {
                "@id": "http://snomed.info/sct#127489000",
                anyRoleGroup: true,
                descendantsOrSelfOf: true,
                is: [
                  {
                    "@id": "http://snomed.info/sct#59488002",
                    descendantsOrSelfOf: true
                  }
                ]
              },
              {
                "@id": "http://snomed.info/sct#127489000",
                anyRoleGroup: true,
                descendantsOrSelfOf: true,
                is: [
                  {
                    "@id": "http://snomed.info/sct#372756006",
                    descendantsOrSelfOf: true
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  refinementConjunctionWithGroup: {
    match: [
      {
        instanceOf: {
          "@id": "http://snomed.info/sct#763158003",
          descendantsOrSelfOf: true
        },
        property: [
          {
            bool: "and",
            property: [
              {
                "@id": "http://snomed.info/sct#127489000",
                anyRoleGroup: true,
                descendantsOrSelfOf: true,
                is: [
                  {
                    "@id": "http://snomed.info/sct#387207008",
                    descendantsOrSelfOf: true
                  }
                ]
              },
              {
                bool: "or",
                property: [
                  {
                    "@id": "http://snomed.info/sct#411116001",
                    anyRoleGroup: true,
                    descendantsOrSelfOf: true,
                    is: [
                      {
                        "@id": "http://snomed.info/sct#763820000",
                        descendantsOrSelfOf: true
                      }
                    ]
                  },
                  {
                    "@id": "http://snomed.info/sct#411116001",
                    anyRoleGroup: true,
                    descendantsOrSelfOf: true,
                    is: [
                      {
                        "@id": "http://snomed.info/sct#421701006",
                        descendantsOrSelfOf: true
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  startGroupedConceptWithRefinement: {
    match: [
      {
        instanceOf: {
          "@id": "http://snomed.info/sct#763158003",
          descendantsOrSelfOf: true
        },
        property: [
          {
            "@id": "http://snomed.info/sct#127489000",
            anyRoleGroup: true,
            descendantsOrSelfOf: true,
            is: [
              {
                "@id": "http://snomed.info/sct#387207008",
                descendantsOrSelfOf: true
              }
            ]
          }
        ]
      }
    ]
  },
  groupedAnd: {
    match: [
      {
        bool: "and",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#298705000",
              descendantsOrSelfOf: true
            }
          },
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#298705001",
              descendantsOrSelfOf: true
            }
          }
        ]
      }
    ]
  },
  groupedConceptsWithSharedRefinement: {
    match: [
      {
        bool: "and",
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#298705000",
              descendantsOrSelfOf: true
            }
          },
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#301366005",
              descendantsOrSelfOf: true
            }
          }
        ],
        property: [
          {
            "@id": IM.ROLE_GROUP,
            match: {
              property: [
                {
                  "@id": "http://snomed.info/sct#363698007",
                  is: [{ "@id": "http://snomed.info/sct#51185008", descendantsOrSelfOf: true }]
                }
              ]
            }
          }
        ]
      }
    ]
  },
  chis: {
    match: [
      {
        match: [
          {
            instanceOf: {
              "@id": "http://snomed.info/sct#312871001",
              descendantsOrSelfOf: true
            }
          },
          {
            property: [
              {
                "@id": "http://snomed.info/sct#363589002",
                anyRoleGroup: true,
                descendantsOrSelfOf: true,
                is: [
                  {
                    "@id": "http://snomed.info/sct#117103007",
                    descendantsOrSelfOf: true
                  }
                ]
              }
            ]
          }
        ],
        bool: "or"
      }
    ]
  }
};
