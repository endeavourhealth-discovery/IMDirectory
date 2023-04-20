// QueryExample Q_RegisteredGMS SMIPopulation Priority3b Priority3a Aged1664 Query_AllowableProperties

export const QueryExample = {
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

export const SMI = {
  match: [
    {
      "@set": "http://endhealth.info/im#Q_RegisteredGMS",
      name: "Registered with GP for GMS services on the reference date"
    },
    {
      path: {
        "@id": "http://endhealth.info/im#gpCurrentRegistration",
        node: {
          "@id": "http://endhealth.info/im#GPRegistration"
        }
      },
      bool: "and",
      where: [
        {
          in: [
            {
              "@id": "http://endhealth.info/im#2751000252106",
              name: "Regular GMS patient",
              descendantsOrSelfOf: true
            }
          ],
          valueLabel: "GMSpatient",
          "@id": "http://endhealth.info/im#gpPatientType"
        },
        {
          operator: ">=",
          value: "18",
          unit: "YEAR",
          "@id": "http://endhealth.info/im#age"
        }
      ]
    },
    {
      path: {
        "@id": "http://endhealth.info/im#observation",
        node: {
          "@id": "http://endhealth.info/im#Observation",
          variable: "with1"
        }
      },
      where: [
        {
          in: [
            {
              "@set": "urn:uuid:837c474c-f6af-4a05-83ad-7c4ee7557e11",
              name: "SMIResolved"
            },
            {
              "@set": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c",
              name: "SMI"
            }
          ],
          valueLabel: "SMIResolved,SMI",
          "@id": "http://endhealth.info/im#concept"
        }
      ],
      orderBy: [
        {
          direction: "ascending",
          variable: "with1",
          limit: 1,
          "@id": "http://endhealth.info/im#effectiveDate"
        }
      ]
    },
    {
      bool: "and",
      where: [
        {
          in: [
            {
              "@set": "urn:uuid:8ab86afb-94e0-45fc-9875-3d16705cf41c",
              name: "SMI"
            }
          ],
          variable: "with1",
          valueLabel: "SMI",
          "@id": "http://endhealth.info/im#concept"
        }
      ]
    }
  ]
};
