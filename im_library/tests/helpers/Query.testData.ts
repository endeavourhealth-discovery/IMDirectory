import { Match, OrderLimit, Property } from "@/interfaces/AutoGen";
import { IM } from "@/vocabulary";
import { Query } from "@/interfaces/AutoGen";

export const match: {
  withType: Match;
  withSet: Match;
  withInstance: Match;
  withName: Match;
  withDescendantsOrSelfOf: Property;
  withDescendantsOf: Property;
  withAncestorsOf: Property;
  withExclude: Match;
  withVariable: Match;
  withOneDirectPropertyOfRange: Match;
  withOneDirectPropertyOfIs: Match;
  withMultipleDirectProperties: Match;
  withOneNestedPropertyOfIs: Match;
  withOneNestedPropertyOfInSet: Match;
} = {
  withType: { typeOf: { "@id": "Patient" } },
  withSet: { inSet: [{ "@id": "CSET_EmailOnlineEncounter" }] },
  withInstance: { instanceOf: { "@id": "http://snomed.info/sct#325841000000109" } },
  withName: {
    name: "Text message consultation",
    "@id": "http://endhealth.info/im#1681000252102"
  },
  withDescendantsOrSelfOf: {
    name: "Text message consultation",
    descendantsOrSelfOf: true,
    "@id": "http://endhealth.info/im#1681000252102"
  },
  withDescendantsOf: {
    name: "Text message consultation",
    descendantsOf: true,
    "@id": "http://endhealth.info/im#1681000252102"
  },
  withAncestorsOf: {
    name: "Text message consultation",
    ancestorsOf: true,
    "@id": "http://endhealth.info/im#1681000252102"
  },
  withExclude: { exclude: true, inSet: [{ "@id": "http://endhealth.info/im#Q_Hypertensives" }] },
  withVariable: {},
  withOneDirectPropertyOfRange: {
    property: [
      {
        "@id": "http://endhealth.info/im#age",
        range: {
          from: {
            operator: ">=",
            value: "65",
            unit: "YEARS",
            relativeTo: null
          },
          to: {
            operator: ">",
            value: "70",
            unit: "YEARS",
            relativeTo: null
          }
        }
      }
    ]
  },
  withOneDirectPropertyOfIs: {
    property: [
      {
        "@id": "http://endhealth.info/im#statedGender",
        inSet: [
          {
            "@id": "http://endhealth.info/im#905041000252107",
            name: "Female (stated gender)",
            descendantsOf: true
          }
        ]
      }
    ]
  },
  withMultipleDirectProperties: {
    property: [
      {
        "@id": "http://endhealth.info/im#age",
        range: {
          from: {
            operator: ">=",
            value: "65",
            unit: "YEARS",
            relativeTo: null
          },
          to: {
            operator: ">",
            value: "70",
            unit: "YEARS",
            relativeTo: null
          }
        }
      },
      {
        "@id": "http://endhealth.info/im#statedGender",
        is: [
          {
            "@id": "http://endhealth.info/im#905041000252107",
            name: "Female (stated gender)"
          }
        ]
      }
    ]
  },
  withOneNestedPropertyOfIs: {
    property: [
      {
        "@id": "http://endhealth.info/im#observation",
        match: {
          typeOf: { "@id": "Observation" },
          property: [
            {
              "@id": "http://endhealth.info/im#concept",
              is: [
                {
                  "@id": "http://snomed.info/sct#714628002",
                  descendantsOf: true
                }
              ],
              valueLabel: "Prediabetes"
            }
          ]
        }
      }
    ]
  },
  withOneNestedPropertyOfInSet: {
    property: [
      {
        "@id": "http://endhealth.info/im#observation",
        match: {
          typeOf: { "@id": "Observation" },
          property: [
            {
              "@id": "http://endhealth.info/im#concept",
              inSet: [
                {
                  "@id": "http://snomed.info/sct#714628002"
                }
              ],
              valueLabel: "Prediabetes"
            }
          ]
        }
      }
    ]
  }
};

export const where: {
  withNodeRefAndComparison: Property;
  withRange: Property;
  withIs: Property;
  withIsAndValueLabel: Property;
  withNotIsAndName: Property;
  withValueLabelIs: Property;
  withComparison: Property;
  withNull: Property;
  after: Property;
  last6Months: Property;
  last6MonthsWithValueLabel: Property;
} = {
  withNodeRefAndComparison: { "@id": "http://endhealth.info/im#numericValue", operator: ">", value: "150", nodeRef: "latestBP" },
  withRange: {
    "@id": "http://endhealth.info/im#age",
    range: {
      from: {
        operator: ">=",
        value: "65",
        unit: "YEARS",
        relativeTo: null
      },
      to: {
        operator: ">",
        value: "70",
        unit: "YEARS",
        relativeTo: null
      }
    }
  },
  withIs: { "@id": "http://endhealth.info/im#concept", is: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }] },
  withIsAndValueLabel: {
    "@id": "http://endhealth.info/im#concept",
    name: "concept",
    is: [
      {
        "@id": "http://snomed.info/sct#271649006",
        name: "Systolic blood pressure"
      },
      {
        "@id": "http://endhealth.info/emis#1994021000006104",
        name: "Home systolic blood pressure"
      }
    ],
    valueLabel: "Office or home systolic blood pressure"
  },
  withNotIsAndName: {
    "@id": "http://endhealth.info/im#concept",
    isNot: [{ "@id": "http://snomed.info/sct#714628002", name: "Prediabetes (finding)", descendantsOf: true }]
  },
  withValueLabelIs: {
    "@id": "http://endhealth.info/im#concept",
    is: [{ "@id": "http://snomed.info/sct#271649006" }, { "@id": "http://endhealth.info/emis#1994021000006104" }],
    valueLabel: "Office or home systolic blood pressure"
  },
  withComparison: { "@id": "http://endhealth.info/im#numericValue", operator: ">", value: "150" },
  withNull: {
    isNull: true
  },
  after: {
    "@id": "http://endhealth.info/im#effectiveDate",
    operator: ">=",
    relativeTo: { "@id": "http://endhealth.info/im#effectiveDate", nodeRef: "latestBP" }
  },
  last6Months: {
    "@id": "http://endhealth.info/im#effectiveDate",
    operator: ">=",
    value: "-6",
    unit: "MONTHS",
    relativeTo: { parameter: "$referenceDate" }
  },
  last6MonthsWithValueLabel: {
    "@id": "http://endhealth.info/im#effectiveDate",
    operator: ">=",
    value: "-6",
    unit: "MONTHS",
    relativeTo: { parameter: "$referenceDate" },
    valueLabel: "last 6 months"
  }
};

export const orderBy: {
  getLatest: OrderLimit;
  getEarliest: OrderLimit;
} = {
  getLatest: { direction: "descending", limit: 1, "@id": "http://endhealth.info/im#effectiveDate" },
  getEarliest: { direction: "ascending", limit: 1, "@id": "http://endhealth.info/im#effectiveDate" }
};

export const fullTestQueryDefinition: Query = {
  "@id": "http://endhealth.info/im#Q_TestQuery",
  name: "Test for patients either aged between 18 and 65 or with diabetes with the most recent systolic in the last 6 months >150not followed by a screening invite, excluding hypertensives",
  match: [
    {
      inSet: [
        {
          "@id": "http://endhealth.info/im#Q_RegisteredGMS",
          name: "Registered for GMS services on reference date"
        }
      ]
    },
    {
      match: [
        {
          property: [
            {
              "@id": "http://endhealth.info/im#age",
              range: {
                from: {
                  operator: ">=",
                  value: "65",
                  unit: "YEARS",
                  relativeTo: null,
                  dataType: null
                },
                to: {
                  operator: ">",
                  value: "70",
                  unit: "YEARS",
                  relativeTo: null,
                  dataType: null
                }
              }
            }
          ]
        },
        {
          inSet: [
            {
              "@id": "http://example/queries#Q_Diabetics"
            }
          ]
        },
        {
          property: [
            {
              "@id": "http://endhealth.info/im#observation",
              match: {
                property: [
                  {
                    "@id": "http://endhealth.info/im#concept",
                    is: [
                      {
                        "@id": "http://snomed.info/sct#714628002",
                        descendantsOf: true
                      }
                    ],
                    valueLabel: "Prediabetes"
                  }
                ],
                typeOf: {
                  "@id": "http://endhealth.info/im#Observation"
                }
              }
            }
          ]
        }
      ],
      bool: "or"
    },
    {
      property: [
        {
          "@id": "http://endhealth.info/im#observation",
          match: {
            bool: "and",
            property: [
              {
                "@id": "http://endhealth.info/im#concept",
                name: "concept",
                is: [
                  {
                    "@id": "http://snomed.info/sct#271649006",
                    name: "Systolic blood pressure",
                    descendantsOrSelfOf: true
                  },
                  {
                    "@id": "http://endhealth.info/emis#1994021000006104",
                    name: "Home systolic blood pressure",
                    descendantsOrSelfOf: true
                  }
                ],
                valueLabel: "Office or home systolic blood pressure"
              },
              {
                "@id": "http://endhealth.info/im#effectiveDate",
                operator: ">=",
                value: "-6",
                unit: "MONTHS",
                relativeTo: {
                  parameter: "$referenceDate"
                },
                valueLabel: "last 6 months"
              }
            ],
            orderBy: [
              {
                direction: "descending",
                limit: 1,
                "@id": "http://endhealth.info/im#effectiveDate"
              }
            ],
            typeOf: {
              "@id": "http://endhealth.info/im#Observation"
            },
            variable: "latestBP"
          }
        }
      ]
    },
    {
      nodeRef: "latestBP",
      match: [
        {
          bool: "and",
          property: [
            {
              "@id": "http://endhealth.info/im#concept",
              is: [
                {
                  "@id": "http://snomed.info/sct#271649006",
                  name: "Systolic blood pressure",
                  descendantsOrSelfOf: true
                }
              ],
              valueLabel: "Office blood pressure"
            },
            {
              "@id": "http://endhealth.info/im#numericValue",
              operator: ">",
              value: "140"
            }
          ]
        },
        {
          bool: "and",
          property: [
            {
              "@id": "http://endhealth.info/im#concept",
              is: [
                {
                  "@id": "http://endhealth.info/emis#1994021000006104",
                  name: "Home systolic blood pressure",
                  descendantsOrSelfOf: true
                }
              ],
              valueLabel: "Home blood pressure"
            },
            {
              "@id": "http://endhealth.info/im#numericValue",
              operator: ">",
              value: "130"
            }
          ]
        }
      ],
      bool: "or",
      variable: "highBPReading"
    },
    {
      exclude: true,
      property: [
        {
          "@id": "http://endhealth.info/im#observation",
          match: {
            bool: "and",
            property: [
              {
                "@id": "http://endhealth.info/im#concept",
                inSet: [
                  {
                    "@id": "http://endhealth.info/im#InvitedForScreening"
                  }
                ]
              },
              {
                "@id": "http://endhealth.info/im#effectiveDate",
                operator: ">=",
                relativeTo: {
                  "@id": "http://endhealth.info/im#effectiveDate",
                  nodeRef: "highBPReading"
                }
              }
            ],
            typeOf: {
              "@id": "http://endhealth.info/im#Observation"
            }
          }
        }
      ]
    },
    {
      exclude: true,
      inSet: [
        {
          "@id": "http://endhealth.info/im#Q_Hypertensives",
          name: "Hypertensives"
        }
      ]
    }
  ],
  typeOf: {
    "@id": "http://endhealth.info/im#Patient"
  }
};
