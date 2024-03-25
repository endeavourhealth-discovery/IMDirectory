import { beforeEach, describe, expect, test } from "vitest";
import { server } from "../../setupTests";
import { Bool, Operator, Order, Query } from "@im-library/interfaces/AutoGen";
import QueryService from "@/services/query.service";
import axios from "axios";
import testData from "./IMQtoSQL.json";

describe("IMQtoSQL.ts", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    axios.get = vi
      .fn()
      .mockResolvedValueOnce({ data: testData["Q_RegisteredGMS"] })
      .mockResolvedValueOnce({ data: testData["Q_Diabetics"] })
      .mockResolvedValueOnce({ data: testData["Q_Hypertensives"] });
  });

  test("IMQtoSQL", async () => {
    server.close();

    const queryService = new QueryService(axios);

    // const def: Query = testData["Q_TestQuery"] as Query;
    const def: Query = {
      "@id": "http://endhealth.info/im#Q_TestQuery",
      name: "Test for patients either aged between 65 and 70 or with diabetes with the most recent systolic in the last 12 months either home >130 or office >140,not followed by a screening invite, excluding hypertensives",
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
              where: [
                {
                  "@id": "http://endhealth.info/im#age",
                  range: {
                    from: {
                      operator: Operator.gte,
                      value: "65",
                      unit: "YEARS"
                    },
                    to: {
                      operator: Operator.lt,
                      value: "70",
                      unit: "YEARS"
                    }
                  }
                }
              ]
            },
            {
              is: [
                {
                  "@id": "http://endhealth.info/im#Q_Diabetics"
                }
              ]
            },
            {
              where: [
                {
                  "@id": "http://endhealth.info/im#observation",
                  match: {
                    where: [
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
          where: [
            {
              "@id": "http://endhealth.info/im#observation",
              match: {
                bool: Bool.and,
                where: [
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
                    value: "-12",
                    unit: "MONTHS",
                    relativeTo: {
                      parameter: "$referenceDate"
                    },
                    valueLabel: "last 12 months"
                  }
                ],
                orderBy: {
                  property: {
                    "@id": "http://endhealth.info/im#effectiveDate",
                    direction: Order.descending
                  },
                  limit: 1
                },
                typeOf: {
                  "@id": "http://endhealth.info/im#Observation"
                },
                then: {
                  match: [
                    {
                      bool: Bool.and,
                      where: [
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
                      where: [
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
                }
              }
            }
          ]
        },
        {
          exclude: true,
          where: [
            {
              "@id": "http://endhealth.info/im#observation",
              match: {
                bool: Bool.and,
                where: [
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

    const actual: string = await queryService.generateQuerySQLFromQuery(def, "2db5b8f6146941f298c1d222b3514388");

    console.log(actual);

    expect(actual).not.toBeNull();
    expect(actual).not.toBeUndefined();
    expect(actual).toEqual(testData["SQL"]);
  });
});
