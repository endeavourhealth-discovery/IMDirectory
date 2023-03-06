export default {
  ecl: {
    orGroupMinusOrGroup:
      "/* or group minus or group*/ (<<386725007 | Body temperature (observable entity) |   OR <<431314004 | Peripheral oxygen saturation (observable entity) |) MINUS (<<838441000000103 | Target body mass index (observable entity) |  OR <<838451000000100 | Target body mass index  | ) ",
    allergyToPenicillinsOrCephasporinsWithCausativeLactams:
      "/*allergy to penicillins or cephasporins with causative lactams*/	(<<91936005 | Allergy to Penicillin| or <<294532003):  << 246075003 |Causative agent (attribute)| = <<771577000| lactam (substance)|",
    andGroupedWithSubsumptionAttributeValue:
      "/*and grouped with subsumption attribute value*/	<<298705000 |Finding of region of thorax (finding)| and (<<301366005 |Pain of truncal structure (finding)| :{ 363698007 |Finding site (attribute)| =  <<51185008 |Thoracic structure (body structure)| })",
    andNoAttributeGroup:
      "/*and no attribute group*/	(<<298705000 |Finding of region of thorax (finding)| and <<301366005 |Pain of truncal structure (finding)| ): <<762705008 =  <<51185008 |Thoracic structure (body structure)|",
    andWithRefinementOfSecondConcept:
      "/*and with refinement of second concept*/	<<298705000 |Finding of region of thorax (finding)| and (<<301366005 |Pain of truncal structure (finding)| :{ 363698007 |Finding site (attribute)| = 51185008 |Thoracic structure (body structure)| })",
    andWithSubsumptionPropertyValue:
      "/*and with subsumption property and value*/	<<298705000 |Finding of region of thorax (finding)| and (<<301366005 |Pain of truncal structure (finding)| : { <<762705008 =  <<51185008 |Thoracic structure (body structure)| })",
    bracketedAnd:
      "/*bracketed and*/	(<<298705000 |Finding of region 2of thorax (finding)| and <<301366005 |Pain of truncal structure (finding)| ):{ <<762705008 =  <<51185008 |Thoracic structure (body structure)| }",
    descendantsAndSelf: "/*Descendants and self*/	<<29857009",
    descendantsNotSelf: "/*Descendants not self*/	<29857009",
    mergedGroupError:
      "/*merged group error*/	<<225399009 |Pain assessment (procedure)| :{ <<260686004 |Method (attribute)| =  <<129265001 |Evaluation - action (qualifier value)| ,<<363702006 |Has focus (attribute)| = <<29857009 |Chest pain (finding)| }",
    minusAConcept:
      "/*minus a concept*/	((<<298705000 |Finding of region of thorax (finding)| and <<301366005 |Pain of truncal structure (finding)| ): { <<762705008 =  <<51185008 |Thoracic structure (body structure)| })minus <<426396005 |Cardiac chest pain (finding)|",
    minusAWildCardRefined:
      "/*minus a wild card refined*/	((<<298705000 |Finding of region of thorax (finding)| and <<301366005 |Pain of truncal structure (finding)| ): { <<762705008 =  <<51185008 |Thoracic structure (body structure)| })minus (*: { 363698007 |Finding site (attribute)| = 722725008 |Structure of right sternoclavicular joint (body structure)| })",
    oralNsaids: "/*oral nsaids*/<<763158003:<<127489000= <<372665008,<<411116001= 385268001",
    simpleAndDescendants: "/*simple and descendants*/	<298705000 and <301366005 |Pain of truncal structure (finding)|",
    simpleAndShouldBe0: "/*simple and should be 0*/	298705000 and 301366005 |Pain of truncal structure (finding)|",
    singleConcept: "/*Single concept*/	29857009",
    twoAttributeGroups:
      "/*two attribute groups*/	<<225399009 |Pain assessment (procedure)|:{ <<260686004 |Method (attribute)| =  <<129265001 |Evaluation - action (qualifier value)| },{ <<363702006 |Has focus (attribute)| = <<29857009 |Chest pain (finding)| }",
    ungroupedButSeparateGroups:
      "/*ungrouped but seperate groups*/	<<225399009 |Pain assessment (procedure)|:<<260686004 |Method (attribute)| =  <<129265001 |Evaluation - action (qualifier value)| ,<<363702006 |Has focus (attribute)| = <<29857009 |Chest pain (finding)|",
    unionWithRefinement: "/*union with refinements*/	(<<116536008 or <<350312004):<<127489000 = <<372665008, <<411116001 = <<385268001",
    minusWithGroups:
      "(<<763158003 | Medicinal product (product) | : <<127489000 | Has active ingredient (attribute) | = <<372695000 | Diuretic (substance) |    AND 8940601000001102 = 8940901000001109AND 8940001000001105 = 8940201000001104)    MINUS (<<763158003 | Medicinal product (product) | : 8940601000001102 = 8941001000001100)",
    orRefinement:
      "<<763158003 | Medicinal Product| : <<27489000|has active ingredient| = << 698090000 |Apixaban (substance) | OR <<27489000|has active ingredient| =<<442031002 | Rivaroxaban (product) |",
    multipleOrRefinement:
      "<<763158003 | Medicinal Product |: <<127489000|has active ingredient |= <<698090000 | Apixaban (substance) | OR <<127489000|has active ingredient| = <<442031002 | Rivaroxaban (substance)| OR <<127489000|has active ingredient|= << 698871007| Dabigatran (substance)| OR <<127489000|has active ingredient|= << 712778008| Edoxaban (substance)| OR <<127489000|has active ingredient|= << 387260007| Phenindione (substance) | OR <<127489000|has active ingredient|= << 59488002 | Warfarin sodium (substance) | OR <<127489000|has active ingredient|= << 372756006| Warfarin (substance)|"
  },
  query: {
    orGroupMinusOrGroup: {
      from: {
        bool: "and",
        from: [
          {
            bool: "or",
            from: [
              {
                "@id": "http://snomed.info/sct#386725007",
                includeSubtypes: true,
                excludeSelf: false
              },
              {
                "@id": "http://snomed.info/sct#431314004",
                includeSubtypes: true,
                excludeSelf: false
              }
            ]
          },
          {
            bool: "not",
            from: [
              {
                bool: "or",
                from: [
                  {
                    "@id": "http://snomed.info/sct#838441000000103",
                    includeSubtypes: true,
                    excludeSelf: false
                  },
                  {
                    "@id": "http://snomed.info/sct#838451000000100",
                    includeSubtypes: true,
                    excludeSelf: false
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    allergyToPenicillinsOrCephasporinsWithCausativeLactams: {
      from: {
        bool: "or",
        from: [
          {
            "@id": "http://snomed.info/sct#91936005",
            includeSubtypes: true,
            excludeSelf: false
          },
          {
            "@id": "http://snomed.info/sct#294532003",
            includeSubtypes: true,
            excludeSelf: false
          }
        ],
        where: {
          "@id": "http://snomed.info/sct#246075003",
          in: [
            {
              "@id": "http://snomed.info/sct#771577000",
              includeSubtypes: true,
              excludeSelf: false
            }
          ],
          anyRoleGroup: true,
          includeSubtypes: true
        }
      }
    },
    andGroupedWithSubsumptionAttributeValue: {
      from: {
        bool: "and",
        from: [
          {
            "@id": "http://snomed.info/sct#298705000",
            includeSubtypes: true,
            excludeSelf: false
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            includeSubtypes: true,
            excludeSelf: false,
            where: {
              "@id": "http://endhealth.info/im#roleGroup",
              where: [
                {
                  "@id": "http://snomed.info/sct#363698007",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#51185008",
                      includeSubtypes: true,
                      excludeSelf: false
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    },
    andNoAttributeGroup: {
      from: {
        bool: "and",
        from: [
          {
            "@id": "http://snomed.info/sct#298705000",
            includeSubtypes: true,
            excludeSelf: false
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            includeSubtypes: true,
            excludeSelf: false
          }
        ],
        where: {
          "@id": "http://snomed.info/sct#762705008",
          in: [
            {
              "@id": "http://snomed.info/sct#51185008",
              includeSubtypes: true,
              excludeSelf: false
            }
          ],
          anyRoleGroup: true,
          includeSubtypes: true
        }
      }
    },
    andWithRefinementOfSecondConcept: {
      from: {
        bool: "and",
        from: [
          {
            "@id": "http://snomed.info/sct#298705000",
            includeSubtypes: true,
            excludeSelf: false
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            includeSubtypes: true,
            excludeSelf: false,

            where: {
              "@id": "http://endhealth.info/im#roleGroup",
              where: [
                {
                  "@id": "http://snomed.info/sct#363698007",
                  in: [
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
    },
    andWithSubsumptionPropertyValue: {
      from: {
        bool: "and",
        from: [
          {
            "@id": "http://snomed.info/sct#298705000",
            includeSubtypes: true,
            excludeSelf: false
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            includeSubtypes: true,
            excludeSelf: false,
            where: {
              "@id": "http://endhealth.info/im#roleGroup",
              where: [
                {
                  "@id": "http://snomed.info/sct#762705008",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#51185008",
                      includeSubtypes: true,
                      excludeSelf: false
                    }
                  ],
                  includeSubtypes: true
                }
              ]
            }
          }
        ]
      }
    },
    bracketedAnd: {
      from: {
        bool: "and",
        from: [
          {
            "@id": "http://snomed.info/sct#298705000",
            includeSubtypes: true,
            excludeSelf: false
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            includeSubtypes: true,
            excludeSelf: false
          }
        ],
        where: {
          "@id": "http://endhealth.info/im#roleGroup",
          where: [
            {
              "@id": "http://snomed.info/sct#762705008",
              in: [
                {
                  "@id": "http://snomed.info/sct#51185008",
                  includeSubtypes: true,
                  excludeSelf: false
                }
              ],
              includeSubtypes: true
            }
          ]
        }
      }
    },
    descendantsAndSelf: {
      from: {
        "@id": "http://snomed.info/sct#29857009",
        includeSubtypes: true,
        excludeSelf: false
      }
    },
    descendantsNotSelf: {
      from: {
        "@id": "http://snomed.info/sct#29857009",
        includeSubtypes: true,
        excludeSelf: true
      }
    },
    mergedGroupError: {
      from: {
        "@id": "http://snomed.info/sct#225399009",
        includeSubtypes: true,
        excludeSelf: false,
        where: {
          "@id": "http://endhealth.info/im#roleGroup",
          bool: "and",
          where: [
            {
              "@id": "http://snomed.info/sct#260686004",
              in: [
                {
                  "@id": "http://snomed.info/sct#129265001",
                  includeSubtypes: true,
                  excludeSelf: false
                }
              ],
              includeSubtypes: true
            },
            {
              "@id": "http://snomed.info/sct#363702006",
              in: [
                {
                  "@id": "http://snomed.info/sct#29857009",
                  includeSubtypes: true,
                  excludeSelf: false
                }
              ],
              includeSubtypes: true
            }
          ]
        }
      }
    },
    minusAConcept: {
      from: {
        bool: "and",
        from: [
          {
            bool: "and",
            from: [
              {
                "@id": "http://snomed.info/sct#298705000",
                includeSubtypes: true,
                excludeSelf: false
              },
              {
                "@id": "http://snomed.info/sct#301366005",
                includeSubtypes: true,
                excludeSelf: false
              }
            ],
            where: {
              "@id": "http://endhealth.info/im#roleGroup",
              where: [
                {
                  "@id": "http://snomed.info/sct#762705008",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#51185008",
                      includeSubtypes: true,
                      excludeSelf: false
                    }
                  ],
                  includeSubtypes: true
                }
              ]
            }
          },
          {
            bool: "not",
            from: [
              {
                "@id": "http://snomed.info/sct#426396005",
                includeSubtypes: true,
                excludeSelf: false
              }
            ]
          }
        ]
      }
    },
    minusAWildCardRefined: {
      from: {
        bool: "and",
        from: [
          {
            bool: "and",
            from: [
              {
                "@id": "http://snomed.info/sct#298705000",
                includeSubtypes: true,
                excludeSelf: false
              },
              {
                "@id": "http://snomed.info/sct#301366005",
                includeSubtypes: true,
                excludeSelf: false
              }
            ],
            where: {
              "@id": "http://endhealth.info/im#roleGroup",
              where: [
                {
                  "@id": "http://snomed.info/sct#762705008",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#51185008",
                      includeSubtypes: true,
                      excludeSelf: false
                    }
                  ],
                  includeSubtypes: true
                }
              ]
            }
          },
          {
            bool: "not",
            from: [
              {
                where: {
                  "@id": "http://endhealth.info/im#roleGroup",
                  where: [
                    {
                      "@id": "http://snomed.info/sct#363698007",
                      in: [
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
    },
    oralNsaids: {
      from: {
        "@id": "http://snomed.info/sct#763158003",
        includeSubtypes: true,
        excludeSelf: false,
        where: {
          bool: "and",
          where: [
            {
              "@id": "http://snomed.info/sct#127489000",
              in: [
                {
                  "@id": "http://snomed.info/sct#372665008",
                  includeSubtypes: true,
                  excludeSelf: false
                }
              ],
              anyRoleGroup: true,
              includeSubtypes: true
            },
            {
              "@id": "http://snomed.info/sct#411116001",
              in: [
                {
                  "@id": "http://snomed.info/sct#385268001"
                }
              ],
              anyRoleGroup: true,
              includeSubtypes: true
            }
          ]
        }
      }
    },
    simpleAndDescendants: {
      from: {
        bool: "and",
        from: [
          {
            "@id": "http://snomed.info/sct#298705000",
            includeSubtypes: true,
            excludeSelf: true
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            includeSubtypes: true,
            excludeSelf: true
          }
        ]
      }
    },
    simpleAndShouldBe0: {
      from: {
        bool: "and",
        from: [
          {
            "@id": "http://snomed.info/sct#298705000"
          },
          {
            "@id": "http://snomed.info/sct#301366005"
          }
        ]
      }
    },
    singleConcept: {
      from: {
        "@id": "http://snomed.info/sct#29857009"
      }
    },
    twoAttributeGroups: {
      from: {
        "@id": "http://snomed.info/sct#225399009",
        includeSubtypes: true,
        excludeSelf: false,
        where: {
          bool: "and",
          where: [
            {
              "@id": "http://endhealth.info/im#roleGroup",
              where: [
                {
                  "@id": "http://snomed.info/sct#260686004",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#129265001",
                      includeSubtypes: true,
                      excludeSelf: false
                    }
                  ],
                  includeSubtypes: true
                }
              ]
            },
            {
              "@id": "http://endhealth.info/im#roleGroup",
              where: [
                {
                  "@id": "http://snomed.info/sct#363702006",
                  in: [
                    {
                      "@id": "http://snomed.info/sct#29857009",
                      includeSubtypes: true,
                      excludeSelf: false
                    }
                  ],
                  includeSubtypes: true
                }
              ]
            }
          ]
        }
      }
    },
    ungroupedButSeparateGroups: {
      from: {
        "@id": "http://snomed.info/sct#225399009",
        includeSubtypes: true,
        excludeSelf: false,
        where: {
          bool: "and",
          where: [
            {
              "@id": "http://snomed.info/sct#260686004",
              in: [
                {
                  "@id": "http://snomed.info/sct#129265001",
                  includeSubtypes: true,
                  excludeSelf: false
                }
              ],
              anyRoleGroup: true,
              includeSubtypes: true
            },
            {
              "@id": "http://snomed.info/sct#363702006",
              in: [
                {
                  "@id": "http://snomed.info/sct#29857009",
                  includeSubtypes: true,
                  excludeSelf: false
                }
              ],
              anyRoleGroup: true,
              includeSubtypes: true
            }
          ]
        }
      }
    },
    unionWithRefinement: {
      from: {
        bool: "or",
        from: [
          {
            "@id": "http://snomed.info/sct#116536008",
            includeSubtypes: true,
            excludeSelf: false
          },
          {
            "@id": "http://snomed.info/sct#350312004",
            includeSubtypes: true,
            excludeSelf: false
          }
        ],
        where: {
          bool: "and",
          where: [
            {
              "@id": "http://snomed.info/sct#127489000",
              in: [
                {
                  "@id": "http://snomed.info/sct#372665008",
                  includeSubtypes: true,
                  excludeSelf: false
                }
              ],
              anyRoleGroup: true,
              includeSubtypes: true
            },
            {
              "@id": "http://snomed.info/sct#411116001",
              in: [
                {
                  "@id": "http://snomed.info/sct#385268001",
                  includeSubtypes: true,
                  excludeSelf: false
                }
              ],
              anyRoleGroup: true,
              includeSubtypes: true
            }
          ]
        }
      }
    },
    minusWithGroups: {
      from: {
        bool: "and",
        from: [
          {
            "@id": "http://snomed.info/sct#763158003",
            descendantsOrSelfOf: true,
            where: {
              bool: "and",
              where: [
                {
                  "@id": "http://snomed.info/sct#127489000",
                  anyRoleGroup: true,
                  descendantsOrSelfOf: true,
                  in: [
                    {
                      "@id": "http://snomed.info/sct#372695000",
                      descendantsOrSelfOf: true
                    }
                  ]
                },
                {
                  "@id": "http://snomed.info/sct#8940601000001102",
                  anyRoleGroup: true,
                  in: [
                    {
                      "@id": "http://snomed.info/sct#8940901000001109"
                    }
                  ]
                },
                {
                  "@id": "http://snomed.info/sct#8940001000001105",
                  anyRoleGroup: true,
                  in: [
                    {
                      "@id": "http://snomed.info/sct#8940201000001104"
                    }
                  ]
                }
              ]
            }
          },
          {
            bool: "not",
            from: [
              {
                "@id": "http://snomed.info/sct#763158003",
                descendantsOrSelfOf: true,
                where: {
                  "@id": "http://snomed.info/sct#8940601000001102",
                  anyRoleGroup: true,
                  in: [
                    {
                      "@id": "http://snomed.info/sct#8941001000001100"
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    },
    orRefinement: {
      from: {
        "@id": "http://snomed.info/sct#763158003",
        descendantsOrSelfOf: true,
        where: {
          bool: "or",
          where: [
            {
              anyRoleGroup: true,
              attribute: {
                "@id": "http://snomed.info/sct#27489000",
                descendantsOrSelfOf: true,
                in: [
                  {
                    "@id": "http://snomed.info/sct#698090000",
                    descendantsOrSelfOf: true
                  }
                ]
              }
            },
            {
              anyRoleGroup: true,
              attribute: {
                "@id": "http://snomed.info/sct#27489000",
                descendantsOrSelfOf: true,
                in: [
                  {
                    "@id": "http://snomed.info/sct#442031002",
                    descendantsOrSelfOf: true
                  }
                ]
              }
            }
          ]
        }
      }
    }
  },
  builder: {
    allergyToPenicillinsOrCephasporinsWithCausativeLactams: {
      conjunction: "AND",
      items: [
        {
          conjunction: "OR",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#246075003"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#771577000"
                },
                descendants: "<<"
              }
            }
          ]
        }
      ],
      type: "BoolGroup"
    },
    andGroupedWithSubsumptionAttributeValue: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#298705000"
          },
          descendants: "<<",
          type: "Concept"
        },
        {
          concept: {
            iri: "http://snomed.info/sct#301366005"
          },
          descendants: "<<",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#363698007"
                },
                descendants: ""
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#51185008"
                },
                descendants: "<<"
              }
            }
          ],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    andNoAttributeGroup: {
      conjunction: "AND",
      items: [
        {
          conjunction: "AND",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#762705008"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#51185008"
                },
                descendants: "<<"
              }
            }
          ]
        }
      ],
      type: "BoolGroup"
    },
    andWithRefinementOfSecondConcept: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#298705000"
          },
          descendants: "<<",
          type: "Concept"
        },
        {
          concept: {
            iri: "http://snomed.info/sct#301366005"
          },
          descendants: "<<",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#363698007"
                },
                descendants: ""
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#51185008"
                },
                descendants: ""
              }
            }
          ],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    andWithSubsumptionPropertyValue: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#298705000"
          },
          descendants: "<<",
          type: "Concept"
        },
        {
          concept: {
            iri: "http://snomed.info/sct#301366005"
          },
          descendants: "<<",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#762705008"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#51185008"
                },
                descendants: "<<"
              }
            }
          ],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    bracketedAnd: {
      conjunction: "AND",
      items: [
        {
          conjunction: "AND",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#762705008"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#51185008"
                },
                descendants: "<<"
              }
            }
          ]
        }
      ],
      type: "BoolGroup"
    },
    descendantsAndSelf: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#29857009"
          },
          conjunction: "AND",
          descendants: "<<",
          items: [],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    descendantsNotSelf: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#29857009"
          },
          conjunction: "AND",
          descendants: "<",
          items: [],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    mergedGroupError: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#225399009"
          },
          conjunction: "AND",
          descendants: "<<",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#260686004"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#129265001"
                },
                descendants: "<<"
              }
            },
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#363702006"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#29857009"
                },
                descendants: "<<"
              }
            }
          ],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    minusAConcept: {
      conjunction: "MINUS",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#426396005"
          },
          descendants: "<<",
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    minusAWildCardRefined: {
      conjunction: "MINUS",
      items: [
        {
          concept: {
            iri: "*"
          },
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#363698007"
                },
                descendants: ""
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#722725008"
                },
                descendants: ""
              }
            }
          ],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    orGroupMinusOrGroup: {
      conjunction: "MINUS",
      items: [
        {
          conjunction: "OR",
          items: [
            {
              concept: {
                iri: "http://snomed.info/sct#386725007"
              },
              descendants: "<<",
              type: "Concept"
            },
            {
              concept: {
                iri: "http://snomed.info/sct#431314004"
              },
              descendants: "<<",
              type: "Concept"
            }
          ],
          type: "BoolGroup"
        },
        {
          conjunction: "OR",
          items: [
            {
              concept: {
                iri: "http://snomed.info/sct#838441000000103"
              },
              descendants: "<<",
              type: "Concept"
            },
            {
              concept: {
                iri: "http://snomed.info/sct#838451000000100"
              },
              descendants: "<<",
              type: "Concept"
            }
          ],
          type: "BoolGroup"
        }
      ],
      type: "BoolGroup"
    },
    oralNsaids: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#763158003"
          },
          conjunction: "AND",
          descendants: "<<",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#127489000"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#372665008"
                },
                descendants: "<<"
              }
            },
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#411116001"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#385268001"
                },
                descendants: ""
              }
            }
          ],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    simpleAndDescendants: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#298705000"
          },
          descendants: "<",
          type: "Concept"
        },
        {
          concept: {
            iri: "http://snomed.info/sct#301366005"
          },
          descendants: "<",
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    simpleAndShouldBe0: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#298705000"
          },
          type: "Concept"
        },
        {
          concept: {
            iri: "http://snomed.info/sct#301366005"
          },
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    singleConcept: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#29857009"
          },
          conjunction: "AND",
          descendants: "",
          items: [],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    twoAttributeGroups: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#225399009"
          },
          conjunction: "AND",
          descendants: "<<",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#260686004"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#129265001"
                },
                descendants: "<<"
              }
            },
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#363702006"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#29857009"
                },
                descendants: "<<"
              }
            }
          ],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    ungroupedButSeparateGroups: {
      conjunction: "AND",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#225399009"
          },
          conjunction: "AND",
          descendants: "<<",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#260686004"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#129265001"
                },
                descendants: "<<"
              }
            },
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#363702006"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#29857009"
                },
                descendants: "<<"
              }
            }
          ],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    },
    unionWithRefinement: {
      conjunction: "AND",
      items: [
        {
          conjunction: "AND",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#127489000"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#372665008"
                },
                descendants: "<<"
              }
            },
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#411116001"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#385268001"
                },
                descendants: "<<"
              }
            }
          ]
        }
      ],
      type: "BoolGroup"
    },
    minusWithGroups: {
      conjunction: "MINUS",
      items: [
        {
          concept: {
            iri: "http://snomed.info/sct#763158003"
          },
          conjunction: "AND",
          descendants: "<<",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#127489000"
                },
                descendants: "<<"
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#372695000"
                },
                descendants: "<<"
              }
            },
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#8940601000001102"
                },
                descendants: ""
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#8940901000001109"
                },
                descendants: ""
              }
            },
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#8940001000001105"
                },
                descendants: ""
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#8940201000001104"
                },
                descendants: ""
              }
            }
          ],
          type: "Concept"
        },
        {
          concept: {
            iri: "http://snomed.info/sct#763158003"
          },
          descendants: "<<",
          items: [
            {
              operator: "=",
              property: {
                concept: {
                  iri: "http://snomed.info/sct#8940601000001102"
                },
                descendants: ""
              },
              type: "Refinement",
              value: {
                concept: {
                  iri: "http://snomed.info/sct#8941001000001100"
                },
                descendants: ""
              }
            }
          ],
          type: "Concept"
        }
      ],
      type: "BoolGroup"
    }
  }
};
