import { Bool, Match, Operator, Order, OrderLimit, Property } from "@/interfaces/AutoGen";
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
} = {
  withType: { typeOf: { "@id": "Patient" } },
  withSet: { is: [{ "@id": "CSET_EmailOnlineEncounter" }] },
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
  withExclude: { exclude: true, is: [{ "@id": "http://endhealth.info/im#Q_Hypertensives" }] },
  withVariable: {},
  withOneDirectPropertyOfRange: {
    property: [
      {
        "@id": "http://endhealth.info/im#age",
        range: {
          from: {
            operator: Operator.gte,
            value: "65",
            unit: "YEARS",
            relativeTo: null
          },
          to: {
            operator: Operator.gt,
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
        is: [
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
            operator: Operator.gte,
            value: "65",
            unit: "YEARS",
            relativeTo: null
          },
          to: {
            operator: Operator.gt,
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
  withNodeRefAndComparison: { "@id": "http://endhealth.info/im#numericValue", operator: Operator.gt, value: "150", nodeRef: "latestBP" },
  withRange: {
    "@id": "http://endhealth.info/im#age",
    range: {
      from: {
        operator: Operator.gte,
        value: "65",
        unit: "YEARS",
        relativeTo: null
      },
      to: {
        operator: Operator.gt,
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
  withComparison: { "@id": "http://endhealth.info/im#numericValue", operator: Operator.gt, value: "150" },
  withNull: {
    isNull: true
  },
  after: {
    "@id": "http://endhealth.info/im#effectiveDate",
    operator: Operator.gte,
    relativeTo: { "@id": "http://endhealth.info/im#effectiveDate", nodeRef: "latestBP" }
  },
  last6Months: {
    "@id": "http://endhealth.info/im#effectiveDate",
    operator: Operator.gte,
    value: "-6",
    unit: "MONTHS",
    relativeTo: { parameter: "$referenceDate" }
  },
  last6MonthsWithValueLabel: {
    "@id": "http://endhealth.info/im#effectiveDate",
    operator: Operator.gte,
    value: "-6",
    unit: "MONTHS",
    relativeTo: { parameter: "$referenceDate" },
    valueLabel: "last 6 months"
  }
};

export const orderBy: {
  getLatest: OrderLimit;
  getEarliest: OrderLimit;
  getLatest3: OrderLimit;
  getLatestFull: OrderLimit;
  getLatest3Full: OrderLimit;
} = {
  getLatest: { property: { direction: Order.descending, "@id": "http://endhealth.info/im#effectiveDate" }, limit: 1 },
  getEarliest: { property: { direction: Order.ascending, "@id": "http://endhealth.info/im#effectiveDate" }, limit: 1 },
  getLatest3: { property: { direction: Order.descending, "@id": "http://endhealth.info/im#effectiveDate" }, limit: 3 },
  getLatestFull: { property: { direction: Order.descending, "@id": "http://endhealth.info/im#endDate" }, limit: 1 },
  getLatest3Full: { property: { direction: Order.descending, "@id": "http://endhealth.info/im#endDate" }, limit: 3 }
};

export const fullTestQueryDefinition: Query = {
  "@id": "http://endhealth.info/im#Q_TestQuery",
  name: "Test for patients either aged between 18 and 65 or with diabetes with the most recent systolic in the last 6 months >150not followed by a screening invite, excluding hypertensives",
  match: [
    {
      is: [
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
                  operator: Operator.gte,
                  value: "65",
                  unit: "YEARS",
                  relativeTo: null,
                  dataType: null
                },
                to: {
                  operator: Operator.gt,
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
          is: [
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
      bool: Bool.or
    },
    {
      property: [
        {
          "@id": "http://endhealth.info/im#observation",
          match: {
            bool: Bool.and,
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
                operator: Operator.gte,
                value: "-6",
                unit: "MONTHS",
                relativeTo: {
                  parameter: "$referenceDate"
                },
                valueLabel: "last 6 months"
              }
            ],
            orderBy: {
              property: {
                direction: Order.descending,
                "@id": "http://endhealth.info/im#effectiveDate"
              },
              limit: 1
            },
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
          bool: Bool.and,
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
              operator: Operator.gt,
              value: "140"
            }
          ]
        },
        {
          bool: Bool.and,
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
              operator: Operator.gt,
              value: "130"
            }
          ]
        }
      ],
      bool: Bool.or,
      variable: "highBPReading"
    },
    {
      exclude: true,
      property: [
        {
          "@id": "http://endhealth.info/im#observation",
          match: {
            bool: Bool.and,
            property: [
              {
                "@id": "http://endhealth.info/im#concept",
                is: [
                  {
                    "@id": "http://endhealth.info/im#InvitedForScreening"
                  }
                ]
              },
              {
                "@id": "http://endhealth.info/im#effectiveDate",
                operator: Operator.gte,
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
      is: [
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
