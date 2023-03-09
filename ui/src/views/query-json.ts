export const queryData = {
  name: "Patient",
  children: [
    {
      name: "aged 65 to 70 or diabetic",
      title: `
        <div>Registered for gms</div>
        <div>aged between 65 and 70 OR Diabetic</div>
        <div>latest BP in last 6 months is >150</div>
        <div>not followed by screening invite or is hypertensive</div>
      `,
      children: [
        {
          name: "Registered for gms",
          title: `<div>isSubsetOf: Q_RegisteredGMS</div>`
        },
        {
          name: "aged between 65 and 70",
          title: "<div>from: age >= 65 to: age > 70</div>"
        },
        {
          name: "latest BP in last 6 months is > 150",
          title: "<div>Home or office based systolic in the last 6 months is > 150</div>",
          children: [
            {
              name: "Home or office based systolic in the last 6 months is > 150",
              title: `
                <div>Home or office based Systolic</div>
                <div>Last 6 months</div>
                <div>orderBy effectiveDate</div>
                <div>numericValue > 150</div>
              `,
              children: [
                {
                  name: "Home or office based Systolic",
                  title: `
                    <div>concept: </div>
                    <div>Systolic blood pressure</div>
                    <div>Home systolic blood pressure</div>
                  `
                },
                {
                  name: "Last 6 months",
                  title: `
                    effectiveDate >= LastBp by -6 MONTHS
                  `
                }
              ]
            }
          ]
        },
        {
          name: "not followed by screening invite or is hypertensive",
          title: `
            <div>Invited for screening after high BP</div>
            <div>Hypertensive</div>
          `,
          children: [
            {
              name: "Invited for screening after high BP",
              title: `
                <div>concept: InvitedForScreening</div>
                <div>effectiveDate >= LatBP</div>
              `
            },
            {
              name: "Hypertensive",
              title: `
                  <div>observation: Hypertensives</div>
                `
            }
          ]
        }
      ]
    }
  ]
};
