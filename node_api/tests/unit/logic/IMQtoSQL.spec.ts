import { expect, test } from "vitest";
import { IMQtoSQL } from "@/logic/IMQtoSQL";
import { Query } from "@im-library/interfaces/AutoGen";
import { server } from "../../setupTests";
import EntityService from "@/services/entity.service";
import axios from "axios";
import { IM } from "@im-library/vocabulary";
test("IMQtoSQL", async () => {
  server.close();

  /*  const svc = new EntityService(axios);
  const entity = await svc.getPartialEntity("http://endhealth.info/im#Q_TestQuery", [IM.DEFINITION]);
  let json = entity.data[IM.DEFINITION];
  const def: Query = JSON.parse(json);*/

  const def: Query = {
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
  } as Query;

  /*
  const def: Query = {
    match: [
      {
        name: "Registered with GP for GMS services on the reference date",
        inSet: [
          {
            "@id": "http://endhealth.info/im#Q_RegisteredGMS"
          }
        ]
      },
      {
        bool: "and",
        property: [
          {
            "@id": "http://endhealth.info/im#gpCurrentRegistration",
            match: {
              property: [
                {
                  "@id": "http://endhealth.info/im#gpPatientType",
                  is: [
                    {
                      "@id": "http://endhealth.info/im#2751000252106",
                      name: "Regular GMS patient",
                      descendantsOrSelfOf: true
                    }
                  ],
                  valueLabel: "GMSpatient"
                }
              ],
              typeOf: {
                "@id": "http://endhealth.info/im#GPRegistration"
              }
            }
          },
          {
            "@id": "http://endhealth.info/im#age",
            operator: ">=",
            value: "18",
            unit: "YEAR"
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
                  inSet: [
                    {
                      "@id": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11",
                      name: "SMIResolved"
                    },
                    {
                      "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c",
                      name: "SMI"
                    }
                  ],
                  valueLabel: "SMIResolved, SMI"
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
              variable: "match_3"
            }
          }
        ]
      },
      {
        nodeRef: "match_3",
        bool: "and",
        property: [
          {
            "@id": "http://endhealth.info/im#concept",
            inSet: [
              {
                "@id": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c",
                name: "SMI"
              }
            ],
            valueLabel: "SMI"
          }
        ]
      }
    ],
    typeOf: {
      "@id": "http://endhealth.info/im#Patient"
    }
  } as Query;
*/

  /*
  const def: Query = {
    match: [
      {
        name: "Registered with GP for GMS services on the reference date",
        inSet: [
          {
            "@id": "http://endhealth.info/im#Q_RegisteredGMS"
          }
        ]
      },
      {
        bool: "and",
        property: [
          {
            "@id": "http://endhealth.info/im#gpCurrentRegistration",
            match: {
              property: [
                {
                  "@id": "http://endhealth.info/im#gpPatientType",
                  is: [
                    {
                      "@id": "http://endhealth.info/im#2751000252106",
                      name: "Regular GMS patient",
                      descendantsOrSelfOf: true
                    }
                  ]
                }
              ],
              typeOf: {
                "@id": "http://endhealth.info/im#GPRegistration"
              }
            }
          },
          {
            "@id": "http://endhealth.info/im#age",
            operator: ">=",
            value: "18",
            unit: "YEAR"
          },
          {
            "@id": "http://endhealth.info/im#gpCurrentRegistration",
            match: {
              property: [
                {
                  "@id": "http://endhealth.info/im#gpRegisteredStatus",
                  is: [
                    {
                      "@id": "http://snomed.info/sct#307927003",
                      name: "Patient registered (finding)",
                      descendantsOrSelfOf: true
                    }
                  ]
                }
              ],
              typeOf: {
                "@id": "http://endhealth.info/im#GPRegistration"
              }
            }
          },
          {
            "@id": "http://endhealth.info/im#gpCurrentRegistration",
            match: {
              property: [
                {
                  "@id": "http://endhealth.info/im#gpGMSRegistrationDate",
                  operator: "<=",
                  value: "-1",
                  unit: "YEAR",
                  relativeTo: {
                    parameter: "$referenceDate"
                  }
                }
              ],
              typeOf: {
                "@id": "http://endhealth.info/im#GPRegistration"
              }
            }
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
                      "@id": "http://snomed.info/sct#38341003",
                      name: "Hypertensive disorder, systemic arterial (disorder)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#59621000",
                      name: "Essential hypertension (disorder)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#31992008",
                      name: "Secondary hypertension (disorder)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#31992008",
                      name: "Secondary hypertension (disorder)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#843821000000102",
                      name: "Stage 1 hypertension (National Institute for Health and Clinical Excellence 2011) (disorder)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#843841000000109",
                      name: "Severe hypertension (National Institute for Health and Clinical Excellence 2011) (disorder)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#845891000000103",
                      name: "Hypertension resistant to drug therapy (disorder)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#846371000000103",
                      name: "Stage 2 hypertension (National Institute for Health and Clinical Excellence 2011) (disorder)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#38341003",
                      name: "Hypertensive disorder, systemic arterial (disorder)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#38341003",
                      name: "Hypertensive disorder, systemic arterial (disorder)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#38341003",
                      name: "Hypertensive disorder, systemic arterial (disorder)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#162659009",
                      name: "Hypertension resolved (finding)",
                      descendantsOrSelfOf: true
                    },
                    {
                      "@id": "http://snomed.info/sct#162659009",
                      name: "Hypertension resolved (finding)",
                      descendantsOrSelfOf: true
                    }
                  ]
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
              variable: "match_9"
            }
          }
        ]
      },
      {
        nodeRef: "match_9",
        bool: "and",
        property: [
          {
            "@id": "http://endhealth.info/im#concept",
            is: [
              {
                "@id": "http://snomed.info/sct#38341003",
                name: "Hypertensive disorder, systemic arterial (disorder)",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#59621000",
                name: "Essential hypertension (disorder)",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#31992008",
                name: "Secondary hypertension (disorder)",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#31992008",
                name: "Secondary hypertension (disorder)",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#843821000000102",
                name: "Stage 1 hypertension (National Institute for Health and Clinical Excellence 2011) (disorder)",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#843841000000109",
                name: "Severe hypertension (National Institute for Health and Clinical Excellence 2011) (disorder)",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#845891000000103",
                name: "Hypertension resistant to drug therapy (disorder)",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#846371000000103",
                name: "Stage 2 hypertension (National Institute for Health and Clinical Excellence 2011) (disorder)",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#38341003",
                name: "Hypertensive disorder, systemic arterial (disorder)",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#38341003",
                name: "Hypertensive disorder, systemic arterial (disorder)",
                descendantsOrSelfOf: true
              },
              {
                "@id": "http://snomed.info/sct#38341003",
                name: "Hypertensive disorder, systemic arterial (disorder)",
                descendantsOrSelfOf: true
              }
            ]
          }
        ]
      }
    ],
    typeOf: {
      "@id": "http://endhealth.info/im#Patient"
    }
  } as Query;
*/

  console.log(JSON.stringify(def, null, 2));

  console.log("=================================================================================================");

  const qry = new IMQtoSQL();
  const sql = qry.convert(def);
  expect(sql).not.toBeNull();
  expect(sql).not.toBeUndefined();
  console.log(sql?.replaceAll("$referenceDate", "now()"));
});
