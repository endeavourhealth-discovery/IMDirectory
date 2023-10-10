import { expect, test } from "vitest";
import IMQtoSQL from "@/logic/IMQtoSQL";
import { Query } from "@im-library/interfaces/AutoGen";
import { server } from "../../setupTests";
import EntityService from "@/services/entity.service";
import axios from "axios";
import { IM } from "@im-library/vocabulary";
test("IMQtoSQL", async () => {
  server.close();

  // const svc = new EntityService(axios);
  // const entity = await svc.getPartialEntity("http://endhealth.info/im#Q_TestQuery", [IM.DEFINITION]);
  // const entity = await svc.getPartialEntity("urn:uuid:7d9a0a98-4df8-4748-8940-061a5148293c", [IM.DEFINITION]); // APL Search
  // const entity = await svc.getPartialEntity("urn:uuid:6d517466-813b-46a8-b848-aaf5a4fbdcbf", [IM.DEFINITION]); // SMI Population
  // const entity = await svc.getPartialEntity("urn:uuid:40a4a1f1-b768-4db8-a8a6-6df744935d97", [IM.DEFINITION]); // SMI Priority 1

  // let json = entity.data[IM.DEFINITION];
  // const def: Query = JSON.parse(json);

  const def: any = {
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
                    operator: "<",
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

  console.log(JSON.stringify(def, null, 2));

  console.log("=================================================================================================");

  const sql = IMQtoSQL(def);
  expect(sql).not.toBeNull();
  expect(sql).not.toBeUndefined();
  console.log(sql?.replaceAll("$referenceDate", "now()"));
});
