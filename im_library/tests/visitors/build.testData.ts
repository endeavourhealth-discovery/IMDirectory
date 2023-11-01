export default {
  allergyToPenicillinsOrCephasporinsWithCausativeLactams: {
    conjunction: "AND",
    items: [
      {
        concept: {
          conjunction: "OR",
          items: [
            { concept: { iri: "http://snomed.info/sct#91936005" }, descendants: "<<", type: "Concept" },
            { concept: { iri: "http://snomed.info/sct#294532003" }, descendants: "<<", type: "Concept" }
          ],
          type: "BoolGroup"
        },
        conjunction: "AND",
        descendants: "",
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
        ],
        type: "Concept"
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
        conjunction: "AND",
        items: [
          {
            concept: {
              iri: "http://snomed.info/sct#301366005"
            },
            descendants: "<<",
            items: [
              {
                conjunction: "AND",
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
                type: "BoolGroup"
              }
            ],
            type: "Concept"
          }
        ],
        type: "BoolGroup"
      }
    ],
    type: "BoolGroup"
  },
  andNoAttributeGroup: {
    conjunction: "AND",
    items: [
      {
        concept: {
          conjunction: "AND",
          items: [
            {
              concept: { iri: "http://snomed.info/sct#298705000" },
              descendants: "<<",
              type: "Concept"
            },
            {
              concept: { iri: "http://snomed.info/sct#301366005" },
              descendants: "<<",
              type: "Concept"
            }
          ],
          type: "BoolGroup"
        },
        conjunction: "AND",
        descendants: "",
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
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            concept: {
              iri: "http://snomed.info/sct#301366005"
            },
            descendants: "<<",
            items: [
              {
                type: "BoolGroup",
                conjunction: "AND",
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
                ]
              }
            ],
            type: "Concept"
          }
        ]
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
        type: "BoolGroup",
        conjunction: "AND",
        items: [
          {
            concept: {
              iri: "http://snomed.info/sct#301366005"
            },
            descendants: "<<",
            items: [
              {
                type: "BoolGroup",
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
            type: "Concept"
          }
        ]
      }
    ],
    type: "BoolGroup"
  },
  bracketedAnd: {
    conjunction: "AND",
    items: [
      {
        conjunction: "AND",
        descendants: "",
        concept: {
          type: "BoolGroup",
          conjunction: "AND",
          items: [
            { type: "Concept", descendants: "<<", concept: { iri: "http://snomed.info/sct#298705000" } },
            { type: "Concept", descendants: "<<", concept: { iri: "http://snomed.info/sct#301366005" } }
          ]
        },
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
            ],
            type: "BoolGroup"
          }
        ],
        type: "Concept"
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
            conjunction: "AND",
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
            type: "BoolGroup"
          }
        ],
        type: "Concept"
      }
    ],
    type: "BoolGroup"
  },
  minusAConcept: {
    conjunction: "AND",
    items: [
      {
        conjunction: "AND",
        items: [
          {
            concept: {
              conjunction: "AND",
              items: [
                {
                  concept: { iri: "http://snomed.info/sct#298705000" },
                  descendants: "<<",
                  type: "Concept"
                },
                {
                  concept: { iri: "http://snomed.info/sct#301366005" },
                  descendants: "<<",
                  type: "Concept"
                }
              ],
              type: "BoolGroup"
            },
            conjunction: "AND",
            descendants: "",
            items: [
              {
                conjunction: "AND",
                items: [
                  {
                    operator: "=",
                    property: { concept: { iri: "http://snomed.info/sct#762705008" }, descendants: "<<" },
                    value: { concept: { iri: "http://snomed.info/sct#51185008" }, descendants: "<<" },
                    type: "Refinement"
                  }
                ],
                type: "BoolGroup"
              }
            ],
            type: "Concept"
          }
        ],
        type: "BoolGroup"
      },
      {
        concept: {
          iri: "http://snomed.info/sct#426396005"
        },
        descendants: "<<",
        type: "Concept",
        exclude: true
      }
    ],
    type: "BoolGroup"
  },
  minusAWildCardRefined: {
    type: "BoolGroup",
    items: [
      {
        type: "BoolGroup",
        items: [
          {
            concept: {
              type: "BoolGroup",
              items: [
                {
                  type: "Concept",
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#298705000"
                  }
                },
                {
                  type: "Concept",
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#301366005"
                  }
                }
              ],
              conjunction: "AND"
            },
            descendants: "",
            conjunction: "AND",
            type: "Concept",
            items: [
              {
                type: "BoolGroup",
                items: [
                  {
                    type: "Refinement",
                    property: {
                      descendants: "<<",
                      concept: {
                        iri: "http://snomed.info/sct#762705008"
                      }
                    },
                    value: {
                      descendants: "<<",
                      concept: {
                        iri: "http://snomed.info/sct#51185008"
                      }
                    },
                    operator: "="
                  }
                ],
                conjunction: "AND"
              }
            ]
          }
        ],
        conjunction: "AND"
      },
      {
        type: "BoolGroup",
        exclude: true,
        items: [
          {
            type: "Concept",
            concept: {
              iri: "*"
            },
            items: [
              {
                type: "BoolGroup",
                items: [
                  {
                    type: "Refinement",
                    property: {
                      descendants: "",
                      concept: {
                        iri: "http://snomed.info/sct#363698007"
                      }
                    },
                    value: {
                      descendants: "",
                      concept: {
                        iri: "http://snomed.info/sct#722725008"
                      }
                    },
                    operator: "="
                  }
                ],
                conjunction: "AND"
              }
            ]
          }
        ],
        conjunction: "AND"
      }
    ],
    conjunction: "AND"
  },
  orGroupMinusOrGroup: {
    conjunction: "AND",
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
        exclude: true,
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
    type: "BoolGroup",
    conjunction: "AND",
    items: [
      {
        type: "Concept",
        descendants: "<<",
        concept: {
          iri: "http://snomed.info/sct#225399009"
        },
        conjunction: "AND",
        items: [
          {
            type: "BoolGroup",
            items: [
              {
                type: "Refinement",
                property: {
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#260686004"
                  }
                },
                value: {
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#129265001"
                  }
                },
                operator: "="
              }
            ],
            conjunction: "AND"
          },
          {
            type: "BoolGroup",
            items: [
              {
                type: "Refinement",
                property: {
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#363702006"
                  }
                },
                value: {
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#29857009"
                  }
                },
                operator: "="
              }
            ],
            conjunction: "AND"
          }
        ]
      }
    ]
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
    type: "BoolGroup",
    conjunction: "AND",
    items: [
      {
        concept: {
          type: "BoolGroup",
          items: [
            { type: "Concept", descendants: "<<", concept: { iri: "http://snomed.info/sct#116536008" } },
            { type: "Concept", descendants: "<<", concept: { iri: "http://snomed.info/sct#350312004" } }
          ],
          conjunction: "OR"
        },
        descendants: "",
        conjunction: "AND",
        type: "Concept",
        items: [
          {
            type: "Refinement",
            property: { descendants: "<<", concept: { iri: "http://snomed.info/sct#127489000" } },
            value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#372665008" } },
            operator: "="
          },
          {
            type: "Refinement",
            property: { descendants: "<<", concept: { iri: "http://snomed.info/sct#411116001" } },
            value: { descendants: "<<", concept: { iri: "http://snomed.info/sct#385268001" } },
            operator: "="
          }
        ]
      }
    ]
  },
  minusWithGroups: {
    type: "BoolGroup",
    items: [
      {
        type: "BoolGroup",
        items: [
          {
            type: "Concept",
            descendants: "<<",
            concept: {
              iri: "http://snomed.info/sct#763158003"
            },
            conjunction: "AND",
            items: [
              {
                type: "Refinement",
                property: {
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#127489000"
                  }
                },
                value: {
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#372695000"
                  }
                },
                operator: "="
              },
              {
                type: "Refinement",
                property: {
                  descendants: "",
                  concept: {
                    iri: "http://snomed.info/sct#8940601000001102"
                  }
                },
                value: {
                  descendants: "",
                  concept: {
                    iri: "http://snomed.info/sct#8940901000001109"
                  }
                },
                operator: "="
              },
              {
                type: "Refinement",
                property: {
                  descendants: "",
                  concept: {
                    iri: "http://snomed.info/sct#8940001000001105"
                  }
                },
                value: {
                  descendants: "",
                  concept: {
                    iri: "http://snomed.info/sct#8940201000001104"
                  }
                },
                operator: "="
              }
            ]
          }
        ],
        conjunction: "AND"
      },
      {
        type: "BoolGroup",
        exclude: true,
        items: [
          {
            type: "Concept",
            descendants: "<<",
            concept: {
              iri: "http://snomed.info/sct#763158003"
            },
            items: [
              {
                type: "Refinement",
                property: {
                  descendants: "",
                  concept: {
                    iri: "http://snomed.info/sct#8940601000001102"
                  }
                },
                value: {
                  descendants: "",
                  concept: {
                    iri: "http://snomed.info/sct#8941001000001100"
                  }
                },
                operator: "="
              }
            ]
          }
        ],
        conjunction: "AND"
      }
    ],
    conjunction: "AND"
  },
  orRefinement: {
    conjunction: "AND",
    items: [
      {
        concept: {
          iri: "http://snomed.info/sct#763158003"
        },
        conjunction: "OR",
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
                iri: "http://snomed.info/sct#698090000"
              },
              descendants: "<<"
            }
          },
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
                iri: "http://snomed.info/sct#442031002"
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
  multipleOrRefinement: {
    conjunction: "AND",
    items: [
      {
        concept: {
          iri: "http://snomed.info/sct#763158003"
        },
        conjunction: "OR",
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
                iri: "http://snomed.info/sct#698090000"
              },
              descendants: "<<"
            }
          },
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
                iri: "http://snomed.info/sct#442031002"
              },
              descendants: "<<"
            }
          },
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
                iri: "http://snomed.info/sct#698871007"
              },
              descendants: "<<"
            }
          },
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
                iri: "http://snomed.info/sct#712778008"
              },
              descendants: "<<"
            }
          },
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
                iri: "http://snomed.info/sct#387260007"
              },
              descendants: "<<"
            }
          },
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
                iri: "http://snomed.info/sct#59488002"
              },
              descendants: "<<"
            }
          },
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
                iri: "http://snomed.info/sct#372756006"
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
  groupedAnd: {
    conjunction: "AND",
    items: [
      { concept: { iri: "http://snomed.info/sct#298705000" }, descendants: "<<", type: "Concept" },
      { concept: { iri: "http://snomed.info/sct#298705001" }, descendants: "<<", type: "Concept" }
    ],
    type: "BoolGroup"
  },
  chis: {
    type: "BoolGroup",
    items: [
      {
        type: "Concept",
        descendants: "<<",
        concept: {
          iri: "http://snomed.info/sct#312871001"
        }
      },
      {
        type: "BoolGroup",
        items: [
          {
            type: "Concept",
            concept: {
              iri: "*"
            },
            items: [
              {
                type: "Refinement",
                property: {
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#363589002"
                  }
                },
                value: {
                  descendants: "<<",
                  concept: {
                    iri: "http://snomed.info/sct#117103007"
                  }
                },
                operator: "="
              }
            ]
          }
        ],
        conjunction: "AND"
      }
    ],
    conjunction: "OR"
  }
};
