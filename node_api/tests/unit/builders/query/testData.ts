export const CSET_EncFaceToFaceOnPrem = { from: { "@id": "http://endhealth.info/im#1691000252104", name: "Consultation on premise", includeSubtypes: true } };

export const CSET_EncFaceToFaceOnPremQueryDisplay = {
  children: [
    {
      key: 17403215587697707000,
      label: "must be a",
      children: [
        {
          key: 4939536282289977000,
          label: "Consultation on premise",
          type: "from",
          value: { "@id": "http://endhealth.info/im#1691000252104", name: "Consultation on premise", includeSubtypes: true },
          children: [],
          selectable: false
        }
      ]
    }
  ]
};

export const CSET_NELChis2021 = {
  from: {
    bool: "or",
    from: [
      { "@id": "http://snomed.info/sct#312871001", name: "Administration of vaccine product containing bacteria antigen (procedure)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#713404003", name: "Vaccination given (situation)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#49083007", name: "Administration of vaccine product containing virus antigen (procedure)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#271498007", name: "Anti-rabies immunoglobulin injection (procedure)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#170461002", name: "Requires a course of gamma globulin (finding)", includeSubtypes: true },
      {
        "@id": "http://snomed.info/sct#1037211000000101",
        name: "First hepatitis B vaccination given by other healthcare provider (finding)",
        includeSubtypes: true
      },
      { "@id": "http://snomed.info/sct#591000119102", name: "Vaccine refused by patient (situation)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#384702009", name: "Anti-tetanus immunoglobulin injection (procedure)", includeSubtypes: true },
      {
        type: { "@id": "http://endhealth.info/im#Concept" },
        where: {
          "@id": "http://snomed.info/sct#363589002",
          in: [{ "@id": "http://snomed.info/sct#117103007", includeSubtypes: true }],
          anyRoleGroup: true,
          includeSubtypes: true
        }
      },
      { "@id": "http://snomed.info/sct#868671000000100", name: "Rotavirus vaccination given by other health care provider (finding)", includeSubtypes: true },
      {
        "@id": "http://snomed.info/sct#413104004",
        name: "Did not attend diphtheria, tetanus and acellular pertussis, polio and measles, mumps and rubella vaccine booster (finding)",
        includeSubtypes: true
      },
      { "@id": "http://snomed.info/sct#709562004", name: "Gamma globulin given (situation)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#1411000119106", name: "Influenza vaccine needed (situation)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#170533005", name: "Notification of mumps (procedure)", includeSubtypes: true },
      {
        "@id": "http://snomed.info/sct#884901000000107",
        name: "First intranasal pandemic influenza vaccination given by other healthcare provider (finding)",
        includeSubtypes: true
      },
      {
        "@id": "http://snomed.info/sct#1037271000000106",
        name: "Second measles mumps and rubella vaccination given by other healthcare provider (finding)",
        includeSubtypes: true
      },
      { "@id": "http://snomed.info/sct#117103007", name: "Administration of human immune globulin product (procedure)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#271500008", name: "Intravenous injection of anticytomegalovirus immunoglobulin (procedure)", includeSubtypes: true },
      {
        "@id": "http://snomed.info/sct#882761000000103",
        name: "Booster meningitis C vaccination given by other healthcare provider (finding)",
        includeSubtypes: true
      },
      { "@id": "http://snomed.info/sct#908671000000105", name: "Pertussis vaccination given by other healthcare provider (finding)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#1066171000000108", name: "Seasonal influenza vaccination given by midwife (situation)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#268503002", name: "Normal immunoglobulin given (situation)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#170459006", name: "Anti-D immunoglobulin given (situation)", includeSubtypes: true },
      { "@id": "http://snomed.info/sct#275844006", name: "Gamma globulin administration (procedure)", includeSubtypes: true },
      {
        "@id": "http://snomed.info/sct#1037251000000102",
        name: "First measles mumps and rubella vaccination given by other healthcare provider (finding)",
        includeSubtypes: true
      }
    ]
  }
};

export const CSET_NELChis2021QueryDisplay = {
  children: [
    {
      key: 1286742580876998400,
      label: "any of",
      children: [
        {
          key: 7683056060645220000,
          label: "Administration of vaccine product containing bacteria antigen (procedure)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#312871001",
            name: "Administration of vaccine product containing bacteria antigen (procedure)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 15367917395899527000,
          label: "Vaccination given (situation)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#713404003", name: "Vaccination given (situation)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 3458852037698969000,
          label: "Administration of vaccine product containing virus antigen (procedure)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#49083007",
            name: "Administration of vaccine product containing virus antigen (procedure)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 17502940738073434000,
          label: "Anti-rabies immunoglobulin injection (procedure)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#271498007", name: "Anti-rabies immunoglobulin injection (procedure)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 4568785683195841000,
          label: "Requires a course of gamma globulin (finding)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#170461002", name: "Requires a course of gamma globulin (finding)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 10140939985113416000,
          label: "First hepatitis B vaccination given by other healthcare provider (finding)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#1037211000000101",
            name: "First hepatitis B vaccination given by other healthcare provider (finding)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 12306039563177470000,
          label: "Vaccine refused by patient (situation)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#591000119102", name: "Vaccine refused by patient (situation)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 7515656645875271000,
          label: "Anti-tetanus immunoglobulin injection (procedure)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#384702009", name: "Anti-tetanus immunoglobulin injection (procedure)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 13706924740464896000,
          label: "http://endhealth.info/im#Concept",
          type: "from",
          value: { "@id": "http://endhealth.info/im#Concept" },
          children: [
            {
              key: 16763417851228312000,
              label: "http://snomed.info/sct#363589002",
              type: "propertyIs",
              value: {
                property: { "@id": "http://snomed.info/sct#363589002", name: "http://snomed.info/sct#363589002", includeSubtypes: true },
                is: { "@id": "http://snomed.info/sct#117103007", name: "http://snomed.info/sct#117103007", includeSubtypes: true }
              },
              children: [],
              selectable: false
            }
          ],
          selectable: false
        },
        {
          key: 8175284094099503000,
          label: "Rotavirus vaccination given by other health care provider (finding)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#868671000000100",
            name: "Rotavirus vaccination given by other health care provider (finding)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 6786652999491988000,
          label: "Did not attend diphtheria, tetanus and acellular pertussis, polio and measles, mumps and rubella vaccine booster (finding)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#413104004",
            name: "Did not attend diphtheria, tetanus and acellular pertussis, polio and measles, mumps and rubella vaccine booster (finding)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 11751261648427006000,
          label: "Gamma globulin given (situation)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#709562004", name: "Gamma globulin given (situation)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 15693354922151375000,
          label: "Influenza vaccine needed (situation)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#1411000119106", name: "Influenza vaccine needed (situation)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 6971167955828198000,
          label: "Notification of mumps (procedure)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#170533005", name: "Notification of mumps (procedure)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 5323412566073975000,
          label: "First intranasal pandemic influenza vaccination given by other healthcare provider (finding)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#884901000000107",
            name: "First intranasal pandemic influenza vaccination given by other healthcare provider (finding)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 8857688303562069000,
          label: "Second measles mumps and rubella vaccination given by other healthcare provider (finding)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#1037271000000106",
            name: "Second measles mumps and rubella vaccination given by other healthcare provider (finding)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 15954411246513666000,
          label: "Administration of human immune globulin product (procedure)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#117103007", name: "Administration of human immune globulin product (procedure)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 13108431747635536000,
          label: "Intravenous injection of anticytomegalovirus immunoglobulin (procedure)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#271500008",
            name: "Intravenous injection of anticytomegalovirus immunoglobulin (procedure)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 5205018113005633000,
          label: "Booster meningitis C vaccination given by other healthcare provider (finding)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#882761000000103",
            name: "Booster meningitis C vaccination given by other healthcare provider (finding)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 11892382050474930000,
          label: "Pertussis vaccination given by other healthcare provider (finding)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#908671000000105",
            name: "Pertussis vaccination given by other healthcare provider (finding)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 4359494715301991400,
          label: "Seasonal influenza vaccination given by midwife (situation)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#1066171000000108",
            name: "Seasonal influenza vaccination given by midwife (situation)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 16155300231340917000,
          label: "Normal immunoglobulin given (situation)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#268503002", name: "Normal immunoglobulin given (situation)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 3960372954164480500,
          label: "Anti-D immunoglobulin given (situation)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#170459006", name: "Anti-D immunoglobulin given (situation)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 1271618880267293700,
          label: "Gamma globulin administration (procedure)",
          type: "from",
          value: { "@id": "http://snomed.info/sct#275844006", name: "Gamma globulin administration (procedure)", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 3747081885020497000,
          label: "First measles mumps and rubella vaccination given by other healthcare provider (finding)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#1037251000000102",
            name: "First measles mumps and rubella vaccination given by other healthcare provider (finding)",
            includeSubtypes: true
          },
          children: [],
          selectable: false
        }
      ]
    }
  ]
};

export const CSET_EmailOnlineEncounter = {
  from: {
    bool: "or",
    from: [
      {
        "@id": "http://endhealth.info/im#1681000252102",
        name: "Text message consultation",
        includeSubtypes: true
      },
      {
        "@id": "http://endhealth.info/im#901000252100",
        name: "Email consultation",
        includeSubtypes: true
      }
    ]
  }
};

export const CSET_EmailOnlineEncounterQueryDisplay = {
  children: [
    {
      key: 7921208678317353000,
      label: "any of",
      children: [
        {
          key: 5483659830858608000,
          label: "Text message consultation",
          type: "from",
          value: { "@id": "http://endhealth.info/im#1681000252102", name: "Text message consultation", includeSubtypes: true },
          children: [],
          selectable: false
        },
        {
          key: 13812800991045917000,
          label: "Email consultation",
          type: "from",
          value: { "@id": "http://endhealth.info/im#901000252100", name: "Email consultation", includeSubtypes: true },
          children: [],
          selectable: false
        }
      ]
    }
  ]
};

export const CSET_OralNSAIDs = {
  from: {
    "@id": "http://snomed.info/sct#763158003",
    name: "Medicinal product (product)",
    where: {
      bool: "and",
      where: [
        {
          "@id": "http://snomed.info/sct#127489000",
          name: "Has active ingredient (attribute)",
          in: [
            {
              "@id": "http://snomed.info/sct#372665008",
              name: "Non-steroidal anti-inflammatory agent (substance)",
              includeSubtypes: true
            }
          ],
          anyRoleGroup: true,
          includeSubtypes: true
        },
        {
          "@id": "http://snomed.info/sct#411116001",
          name: "Has manufactured dose form (attribute)",
          in: [
            {
              "@id": "http://snomed.info/sct#385268001",
              name: "Oral dose form (dose form)",
              includeSubtypes: true
            }
          ],
          anyRoleGroup: true,
          includeSubtypes: true
        }
      ]
    },
    includeSubtypes: true
  }
};

export const CSET_OralNSAIDsQueryDisplay = {
  children: [
    {
      key: 3369914316238540000,
      label: "must be a",
      children: [
        {
          key: 15031048831225008000,
          label: "Medicinal product (product)",
          type: "from",
          value: {
            "@id": "http://snomed.info/sct#763158003",
            name: "Medicinal product (product)",
            where: {
              bool: "and",
              where: [
                {
                  "@id": "http://snomed.info/sct#127489000",
                  name: "Has active ingredient (attribute)",
                  in: [{ "@id": "http://snomed.info/sct#372665008", name: "Non-steroidal anti-inflammatory agent (substance)", includeSubtypes: true }],
                  anyRoleGroup: true,
                  includeSubtypes: true
                },
                {
                  "@id": "http://snomed.info/sct#411116001",
                  name: "Has manufactured dose form (attribute)",
                  in: [{ "@id": "http://snomed.info/sct#385268001", name: "Oral dose form (dose form)", includeSubtypes: true }],
                  anyRoleGroup: true,
                  includeSubtypes: true
                }
              ]
            },
            includeSubtypes: true
          },
          children: [],
          selectable: false
        },
        {
          key: 4171934515944554500,
          label: "with",
          children: [
            {
              key: 8782314670016581000,
              label: "Has active ingredient (attribute)",
              type: "propertyIs",
              value: {
                property: { "@id": "http://snomed.info/sct#127489000", name: "Has active ingredient (attribute)", includeSubtypes: true },
                is: { "@id": "http://snomed.info/sct#372665008", name: "Non-steroidal anti-inflammatory agent (substance)", includeSubtypes: true }
              },
              children: [],
              selectable: false
            },
            {
              key: 7529732558385236000,
              label: "Has manufactured dose form (attribute)",
              type: "propertyIs",
              value: {
                property: { "@id": "http://snomed.info/sct#411116001", name: "Has manufactured dose form (attribute)", includeSubtypes: true },
                is: { "@id": "http://snomed.info/sct#385268001", name: "Oral dose form (dose form)", includeSubtypes: true }
              },
              children: [],
              selectable: false
            }
          ]
        }
      ]
    }
  ]
};
