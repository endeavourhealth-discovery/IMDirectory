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
    unionWithRefinement: "/*union with refinements*/	(<<116536008 or <<350312004):<<127489000 = <<372665008, <<411116001 = <<385268001"
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
    }
  }
};
