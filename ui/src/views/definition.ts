export const definition = {
  "@id": "http://endhealth.info/im#Q_TestQuery",
  name: "Test for patients either aged between 18 and 65 or with diabetes with the most recent systolic in the last 6 months >150not followed by a screening invite, excluding hypertensives",
  match: [
    { "@type": "Patient" },
    { description: "Registered for gms", "@set": "http://endhealth.info/im#Q_RegisteredGMS", name: "Registered for GMS services on reference date" },
    {
      boolMatch: "or",
      match: [
        {
          description: "aged between 65 and 70",
          where: [
            {
              "@id": "age",
              range: { to: { operator: ">", value: "70", unit: null, relativeTo: null }, from: { operator: ">=", value: "65", unit: null, relativeTo: null } }
            }
          ]
        },
        { description: "Diabetic", "@set": "http://example.org/qry#Q_Diabetics" },
        {
          path: [{ "@id": "observation" }, { "@type": "Observation" }],
          where: [{ "@id": "concept", in: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }] }]
        }
      ]
    },
    {
      path: [{ "@id": "observation" }, { "@type": "Observation", variable: "latestBP" }],
      bool: "and",
      where: [
        {
          description: "Home or office based Systolic",
          "@id": "concept",
          name: "concept",
          in: [
            { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure" },
            { "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure" }
          ],
          valueLabel: "Office or home systolic blood pressure"
        },
        {
          description: "Last 6 months",
          "@id": "effectiveDate",
          operator: ">=",
          value: "-6",
          unit: "MONTHS",
          relativeTo: { "@id": "$referenceDate" },
          valueLabel: "last 6 months"
        }
      ],
      orderBy: [{ "@id": "effectiveDate", direction: "descending", node: "latestBP", limit: 1 }]
    },
    { where: [{ description: ">150", "@id": "http://endhealth.info/im#numericValue", operator: ">", value: "150", node: "latestBP" }] },
    {
      exclude: true,
      description: "High BP not followed by screening invite",
      path: [{ "@id": "http://endhealth.info/im#observation" }, { "@type": "Observation" }],
      bool: "and",
      where: [
        {
          description: "Invited for Screening after BP",
          "@id": "http://endhealth.info/im#concept",
          in: [{ "@set": "http://endhealth.info/im#InvitedForScreening" }]
        },
        {
          description: "after high BP",
          "@id": "http://endhealth.info/im#effectiveDate",
          operator: ">=",
          relativeTo: { "@id": "effectiveDate", node: "latestBP" }
        }
      ]
    },
    { exclude: true, description: "not hypertensive", "@set": "http://endhealth.info/im#Q_Hypertensives", name: "Hypertensives" }
  ]
};
