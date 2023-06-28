export default {
  orGroupMinusOrGroup: {
    match: [
      {
        boolMatch: "and",
        match: [
          {
            boolMatch: "or",
            match: [
              {
                "@id": "http://snomed.info/sct#386725007",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#431314004",
                descendantsOrSelfOf: true
              }
            ]
          },
          {
            exclude: true,
            boolMatch: "or",
            match: [
              {
                "@id": "http://snomed.info/sct#838441000000103",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#838451000000100",
                descendantsOrSelfOf: true
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
        boolMatch: "or",
        match: [
          {
            "@id": "http://snomed.info/sct#91936005",
            descendantsOrSelfOf: true
          },
          {
            "@id": "http://snomed.info/sct#294532003",
            descendantsOrSelfOf: true
          }
        ],
        where: [
          {
            "@id": "http://snomed.info/sct#246075003",
            in: [
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
        boolMatch: "and",
        match: [
          {
            "@id": "http://snomed.info/sct#298705000",
            descendantsOrSelfOf: true
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            descendantsOrSelfOf: true,
            path: { "@id": "http://endhealth.info/im#roleGroup" },
            where: [
              {
                where: [
                  {
                    "@id": "http://snomed.info/sct#363698007",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#51185008",
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
  andNoAttributeGroup: {
    match: [
      {
        boolMatch: "and",
        match: [
          {
            "@id": "http://snomed.info/sct#298705000",
            descendantsOrSelfOf: true
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            descendantsOrSelfOf: true
          }
        ],
        where: [
          {
            "@id": "http://snomed.info/sct#762705008",
            in: [
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
        boolMatch: "and",
        match: [
          {
            "@id": "http://snomed.info/sct#298705000",
            descendantsOrSelfOf: true
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            descendantsOrSelfOf: true,
            path: { "@id": "http://endhealth.info/im#roleGroup" },
            where: [
              {
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
            ]
          }
        ]
      }
    ]
  },
  andWithSubsumptionPropertyValue: {
    match: [
      {
        boolMatch: "and",
        match: [
          {
            "@id": "http://snomed.info/sct#298705000",
            descendantsOrSelfOf: true
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            descendantsOrSelfOf: true,
            path: { "@id": "http://endhealth.info/im#roleGroup" },
            where: [
              {
                where: [
                  {
                    "@id": "http://snomed.info/sct#762705008",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#51185008",
                        descendantsOrSelfOf: true
                      }
                    ],
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
  bracketedAnd: {
    match: [
      {
        boolMatch: "and",
        match: [
          {
            "@id": "http://snomed.info/sct#298705000",
            descendantsOrSelfOf: true
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            descendantsOrSelfOf: true
          }
        ],
        path: { "@id": "http://endhealth.info/im#roleGroup" },
        where: [
          {
            where: [
              {
                "@id": "http://snomed.info/sct#762705008",
                in: [
                  {
                    "@id": "http://snomed.info/sct#51185008",
                    descendantsOrSelfOf: true
                  }
                ],
                descendantsOrSelfOf: true
              }
            ]
          }
        ]
      }
    ]
  },
  descendantsAndSelf: {
    match: [
      {
        "@id": "http://snomed.info/sct#29857009",
        descendantsOrSelfOf: true
      }
    ]
  },
  descendantsNotSelf: {
    match: [
      {
        "@id": "http://snomed.info/sct#29857009",
        descendantsOf: true
      }
    ]
  },
  mergedGroupError: {
    match: [
      {
        "@id": "http://snomed.info/sct#225399009",
        descendantsOrSelfOf: true,
        path: { "@id": "http://endhealth.info/im#roleGroup" },
        where: [
          {
            bool: "and",
            where: [
              {
                "@id": "http://snomed.info/sct#260686004",
                in: [
                  {
                    "@id": "http://snomed.info/sct#129265001",
                    descendantsOrSelfOf: true
                  }
                ],
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#363702006",
                in: [
                  {
                    "@id": "http://snomed.info/sct#29857009",
                    descendantsOrSelfOf: true
                  }
                ],
                descendantsOrSelfOf: true
              }
            ]
          }
        ]
      }
    ]
  },
  minusAConcept: {
    match: [
      {
        boolMatch: "and",
        match: [
          {
            boolMatch: "and",
            match: [
              {
                "@id": "http://snomed.info/sct#298705000",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#301366005",
                descendantsOrSelfOf: true
              }
            ],
            path: { "@id": "http://endhealth.info/im#roleGroup" },
            where: [
              {
                where: [
                  {
                    "@id": "http://snomed.info/sct#762705008",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#51185008",
                        descendantsOrSelfOf: true
                      }
                    ],
                    descendantsOrSelfOf: true
                  }
                ]
              }
            ]
          },
          {
            exclude: true,
            match: [
              {
                "@id": "http://snomed.info/sct#426396005",
                descendantsOrSelfOf: true
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
        boolMatch: "and",
        match: [
          {
            boolMatch: "and",
            match: [
              {
                "@id": "http://snomed.info/sct#298705000",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#301366005",
                descendantsOrSelfOf: true
              }
            ],
            path: { "@id": "http://endhealth.info/im#roleGroup" },
            where: [
              {
                where: [
                  {
                    "@id": "http://snomed.info/sct#762705008",
                    in: [
                      {
                        "@id": "http://snomed.info/sct#51185008",
                        descendantsOrSelfOf: true
                      }
                    ],
                    descendantsOrSelfOf: true
                  }
                ]
              }
            ]
          },
          {
            exclude: true,
            match: [
              {
                path: { "@id": "http://endhealth.info/im#roleGroup" },
                where: [
                  {
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
        "@id": "http://snomed.info/sct#763158003",
        descendantsOrSelfOf: true,
        where: [
          {
            bool: "and",
            where: [
              {
                "@id": "http://snomed.info/sct#127489000",
                in: [
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
                in: [
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
        boolMatch: "and",
        match: [
          {
            "@id": "http://snomed.info/sct#298705000",
            descendantsOf: true
          },
          {
            "@id": "http://snomed.info/sct#301366005",
            descendantsOf: true
          }
        ]
      }
    ]
  },
  simpleAndShouldBe0: {
    match: [
      {
        boolMatch: "and",
        match: [
          {
            "@id": "http://snomed.info/sct#298705000"
          },
          {
            "@id": "http://snomed.info/sct#301366005"
          }
        ]
      }
    ]
  },
  singleConcept: {
    match: [
      {
        "@id": "http://snomed.info/sct#29857009"
      }
    ]
  },
  twoAttributeGroups: {
    match: [
      {
        "@id": "http://snomed.info/sct#225399009",
        descendantsOrSelfOf: true,
        where: [
          {
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
                        descendantsOrSelfOf: true
                      }
                    ],
                    descendantsOrSelfOf: true
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
                        descendantsOrSelfOf: true
                      }
                    ],
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
  ungroupedButSeparateGroups: {
    match: [
      {
        "@id": "http://snomed.info/sct#225399009",
        descendantsOrSelfOf: true,
        where: [
          {
            bool: "and",
            where: [
              {
                "@id": "http://snomed.info/sct#260686004",
                in: [
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
                in: [
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
        boolMatch: "or",
        match: [
          {
            "@id": "http://snomed.info/sct#116536008",
            descendantsOrSelfOf: true
          },
          {
            "@id": "http://snomed.info/sct#350312004",
            descendantsOrSelfOf: true
          }
        ],
        where: [
          {
            bool: "and",
            where: [
              {
                "@id": "http://snomed.info/sct#127489000",
                in: [
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
                in: [
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
        boolMatch: "and",
        match: [
          {
            "@id": "http://snomed.info/sct#763158003",
            descendantsOrSelfOf: true,
            where: [
              {
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
            ]
          },
          {
            exclude: true,
            match: [
              {
                "@id": "http://snomed.info/sct#763158003",
                descendantsOrSelfOf: true,
                where: [
                  {
                    "@id": "http://snomed.info/sct#8940601000001102",
                    anyRoleGroup: true,
                    in: [
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
        "@id": "http://snomed.info/sct#763158003",
        descendantsOrSelfOf: true,
        where: [
          {
            bool: "or",
            where: [
              {
                anyRoleGroup: true,

                "@id": "http://snomed.info/sct#127489000",
                descendantsOrSelfOf: true,
                in: [
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
                in: [
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
        "@id": "http://snomed.info/sct#763158003",
        descendantsOrSelfOf: true,
        where: [
          {
            bool: "or",
            where: [
              {
                "@id": "http://snomed.info/sct#127489000",
                anyRoleGroup: true,
                descendantsOrSelfOf: true,
                in: [
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
                in: [
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
                in: [
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
                in: [
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
                in: [
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
                in: [
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
                in: [
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
        "@id": "http://snomed.info/sct#763158003",
        descendantsOrSelfOf: true,
        where: [
          {
            bool: "and",
            where: [
              {
                "@id": "http://snomed.info/sct#127489000",
                anyRoleGroup: true,
                descendantsOrSelfOf: true,
                in: [
                  {
                    "@id": "http://snomed.info/sct#387207008",
                    descendantsOrSelfOf: true
                  }
                ]
              },
              {
                bool: "or",
                where: [
                  {
                    "@id": "http://snomed.info/sct#411116001",
                    anyRoleGroup: true,
                    descendantsOrSelfOf: true,
                    in: [
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
                    in: [
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
        "@id": "http://snomed.info/sct#763158003",
        descendantsOrSelfOf: true,
        where: [
          {
            "@id": "http://snomed.info/sct#127489000",
            anyRoleGroup: true,
            descendantsOrSelfOf: true,
            in: [
              {
                "@id": "http://snomed.info/sct#387207008",
                descendantsOrSelfOf: true
              }
            ]
          }
        ]
      }
    ]
  }
};
