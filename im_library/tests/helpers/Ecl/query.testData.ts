export default {
  orGroupMinusOrGroup: {
    from: {
      boolFrom: "and",
      from: [
        {
          boolFrom: "or",
          from: [
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
          exclusion: true,
          boolFrom: "or",
          from: [
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
  },
  allergyToPenicillinsOrCephasporinsWithCausativeLactams: {
    from: {
      boolFrom: "or",
      from: [
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
  },
  andGroupedWithSubsumptionAttributeValue: {
    from: {
      boolFrom: "and",
      from: [
        {
          "@id": "http://snomed.info/sct#298705000",
          descendantsOrSelfOf: true
        },
        {
          "@id": "http://snomed.info/sct#301366005",
          descendantsOrSelfOf: true,
          where: [
            {
              "@id": "http://endhealth.info/im#roleGroup",
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
  },
  andNoAttributeGroup: {
    from: {
      boolFrom: "and",
      from: [
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
  },
  andWithRefinementOfSecondConcept: {
    from: {
      boolFrom: "and",
      from: [
        {
          "@id": "http://snomed.info/sct#298705000",
          descendantsOrSelfOf: true
        },
        {
          "@id": "http://snomed.info/sct#301366005",
          descendantsOrSelfOf: true,
          where: [
            {
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
          ]
        }
      ]
    }
  },
  andWithSubsumptionPropertyValue: {
    from: {
      boolFrom: "and",
      from: [
        {
          "@id": "http://snomed.info/sct#298705000",
          descendantsOrSelfOf: true
        },
        {
          "@id": "http://snomed.info/sct#301366005",
          descendantsOrSelfOf: true,
          where: [
            {
              "@id": "http://endhealth.info/im#roleGroup",
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
  },
  bracketedAnd: {
    from: {
      boolFrom: "and",
      from: [
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
          "@id": "http://endhealth.info/im#roleGroup",
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
  },
  descendantsAndSelf: {
    from: {
      "@id": "http://snomed.info/sct#29857009",
      descendantsOrSelfOf: true
    }
  },
  descendantsNotSelf: {
    from: {
      "@id": "http://snomed.info/sct#29857009",
      descendantsOf: true
    }
  },
  mergedGroupError: {
    from: {
      "@id": "http://snomed.info/sct#225399009",
      descendantsOrSelfOf: true,
      where: [
        {
          "@id": "http://endhealth.info/im#roleGroup",
          boolWhere: "and",
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
  },
  minusAConcept: {
    from: {
      boolFrom: "and",
      from: [
        {
          boolFrom: "and",
          from: [
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
              "@id": "http://endhealth.info/im#roleGroup",
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
          exclusion: true,
          from: [
            {
              "@id": "http://snomed.info/sct#426396005",
              descendantsOrSelfOf: true
            }
          ]
        }
      ]
    }
  },
  minusAWildCardRefined: {
    from: {
      boolFrom: "and",
      from: [
        {
          boolFrom: "and",
          from: [
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
              "@id": "http://endhealth.info/im#roleGroup",
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
          exclusion: true,
          from: [
            {
              where: [
                {
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
              ]
            }
          ]
        }
      ]
    }
  },
  oralNsaids: {
    from: {
      "@id": "http://snomed.info/sct#763158003",
      descendantsOrSelfOf: true,
      where: [
        {
          boolWhere: "and",
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
  },
  simpleAndDescendants: {
    from: {
      boolFrom: "and",
      from: [
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
  },
  simpleAndShouldBe0: {
    from: {
      boolFrom: "and",
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
      descendantsOrSelfOf: true,
      where: [
        {
          boolWhere: "and",
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
  },
  ungroupedButSeparateGroups: {
    from: {
      "@id": "http://snomed.info/sct#225399009",
      descendantsOrSelfOf: true,
      where: [
        {
          boolWhere: "and",
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
  },
  unionWithRefinement: {
    from: {
      boolFrom: "or",
      from: [
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
          boolWhere: "and",
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
  },
  minusWithGroups: {
    from: {
      boolFrom: "and",
      from: [
        {
          "@id": "http://snomed.info/sct#763158003",
          descendantsOrSelfOf: true,
          where: [
            {
              boolWhere: "and",
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
          exclusion: true,
          from: [
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
  },
  orRefinement: {
    from: {
      "@id": "http://snomed.info/sct#763158003",
      descendantsOrSelfOf: true,
      where: [
        {
          boolWhere: "or",
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
  },
  multipeOrRefinement: {
    from: {
      "@id": "http://snomed.info/sct#763158003",
      descendantsOrSelfOf: true,
      where: [
        {
          boolWhere: "or",
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
  },
  refinementConjunctionWithGroup: {
    from: {
      "@id": "http://snomed.info/sct#763158003",
      descendantsOrSelfOf: true,
      where: [
        {
          boolWhere: "and",
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
              boolWhere: "or",
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
  },
  startGroupedConceptWithRefinement: {
    from: {
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
  }
};
