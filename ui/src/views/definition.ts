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
              range: { to: { operator: ">", value: "70", unit: null, relativeTo: null }, from: { operator: ">=", value: "65", unit: null, relativeTo: null } },
              "@id": "http://endhealth.info/im#age"
            }
          ]
        },
        { description: "Diabetic", "@set": "http://example/queries#Q_Diabetics" },
        {
          path: { "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } },
          where: [{ in: [{ "@id": "http://snomed.info/sct#714628002", descendantsOf: true }], "@id": "http://endhealth.info/im#concept" }]
        }
      ]
    },
    {
      path: { "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation", variable: "latestBP" } },
      bool: "and",
      where: [
        {
          description: "Home or office based Systolic",
          name: "concept",
          in: [
            { "@id": "http://snomed.info/sct#271649006", name: "Systolic blood pressure" },
            { "@id": "http://endhealth.info/emis#1994021000006104", name: "Home systolic blood pressure" }
          ],
          valueLabel: "Office or home systolic blood pressure",
          "@id": "http://endhealth.info/im#concept"
        },
        {
          description: "Last 6 months",
          operator: ">=",
          value: "-6",
          unit: "MONTHS",
          relativeTo: { "@id": "http://endhealth.info/im#$referenceDate" },
          valueLabel: "last 6 months",
          "@id": "http://endhealth.info/im#effectiveDate"
        }
      ],
      orderBy: [{ direction: "descending", variable: "latestBP", limit: 1, "@id": "http://endhealth.info/im#effectiveDate" }]
    },
    { where: [{ description: ">150", operator: ">", value: "150", variable: "latestBP", "@id": "http://endhealth.info/im#numericValue" }] },
    {
      exclude: true,
      description: "High BP not followed by screening invite",
      path: { "@id": "http://endhealth.info/im#observation", node: { "@type": "Observation" } },
      bool: "and",
      where: [
        {
          description: "Invited for Screening after BP",
          in: [{ "@set": "http://endhealth.info/im#InvitedForScreening" }],
          "@id": "http://endhealth.info/im#concept"
        },
        {
          description: "after high BP",
          operator: ">=",
          relativeTo: { "@id": "http://endhealth.info/im#effectiveDate", variable: "latestBP" },
          "@id": "http://endhealth.info/im#effectiveDate"
        }
      ]
    },
    { exclude: true, description: "not hypertensive", "@set": "http://endhealth.info/im#Q_Hypertensives", name: "Hypertensives" }
  ]
};
