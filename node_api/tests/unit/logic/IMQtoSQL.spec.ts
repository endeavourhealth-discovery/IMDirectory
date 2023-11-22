import { expect, test } from "vitest";
import { server } from "../../setupTests";
import { Query } from "@im-library/interfaces/AutoGen";
import QueryService from "@/services/query.service";
import EntityService from "@/services/entity.service";
import axios from "axios";
import { IM } from "@im-library/vocabulary";
import { v4 as uuid } from "uuid";

test("IMQtoSQL", async () => {
  server.close();

  const queryService = new QueryService(axios);
  //
  // const svc = new EntityService(axios);
  // const entity = await svc.getPartialEntity("http://endhealth.info/im#Q_TestQuery", [IM.DEFINITION]);
  // let json = entity.data[IM.DEFINITION];
  // const def: Query = JSON.parse(json);

  const def: Query = {
    "@id": "http://endhealth.info/im#Q_TestQuery",
    name: "Test for patients either aged between 18 and 65 or with diabetes with the most recent systolic in the last 6 months >150not followed by a screening invite, excluding hypertensives",
    match: [
      // {
      //   inSet: [
      //     {
      //       "@id": "http://endhealth.info/im#Q_RegisteredGMS",   // This query does not exist!
      //       name: "Registered for GMS services on reference date"
      //     }
      //   ]
      // },
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
                    unit: "YEARS"
                  },
                  to: {
                    operator: "<",
                    value: "70",
                    unit: "YEARS"
                  }
                }
              }
            ]
          },
          // {
          //   inSet: [
          //     {
          //       "@id": "http://endhealth.info/im#M_ActiveDiabetes"   // This query does not exist!
          //     }
          //   ]
          // },
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
                  value: "-8", // NOTE: Synthetic test data getting old!!!!
                  unit: "MONTHS",
                  relativeTo: {
                    parameter: "$referenceDate"
                  },
                  valueLabel: "last 6 months"
                }
              ],
              orderBy: {
                property: [
                  {
                    "@id": "http://endhealth.info/im#effectiveDate",
                    direction: "descending"
                  }
                ],
                limit: 1
              },
              typeOf: {
                "@id": "http://endhealth.info/im#Observation"
              },
              then: {
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
              }
            }
          }
        ]
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
        // },
        // {
        //   exclude: true,
        //   inSet: [
        //     {
        //       "@id": "http://endhealth.info/im#Q_Hypertensives",   // This query does not exist!
        //       name: "Hypertensives"
        //     }
        //   ]
      }
    ],
    typeOf: {
      "@id": "http://endhealth.info/im#Patient"
    }
  };

  console.log(JSON.stringify(def, null, 2));

  console.log("=================================================================================================");

  const actual: string = await queryService.generateQuerySQLFromQuery(def, uuid().replaceAll("-", ""));
  expect(actual).not.toBeNull();
  expect(actual).not.toBeUndefined();
  console.log(actual?.replaceAll("$referenceDate", "now()"));
});
