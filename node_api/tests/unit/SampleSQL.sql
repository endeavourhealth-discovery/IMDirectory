SET SCHEMA 'lair';

-- MATCH TO WITH approach
WITH
    gms AS (
        SELECT * FROM patient -- REG GMS query results
    ),
    sixtyToSeventFive AS (
        SELECT sixtyToSeventFive.*
        FROM patient sixtyToSeventFive
        WHERE sixtyToSeventFive.date_of_birth >= (now() - INTERVAL '70 YEAR')
          AND sixtyToSeventFive.date_of_birth < (now() - INTERVAL '65 YEAR')
    ),
    qDiabetics AS (
        SELECT * FROM patient -- QDiabetics query results
    ),
    diabetes AS (
        SELECT diabetes.*
        FROM event diabetes
        WHERE diabetes.event_type = 'Observation' AND diabetes.concept = 'http://snomed.info/sct#714628002' -- DIABETES
    ),
    oldOrDiabetic AS (
        SELECT oldOrDiabetic.*
        FROM patient oldOrDiabetic
         LEFT JOIN sixtyToSeventFive ON sixtyToSeventFive.id = oldOrDiabetic.id  -- LEFT JOIN for "OR"s
         LEFT JOIN qDiabetics ON qDiabetics.id = oldOrDiabetic.id
         LEFT JOIN diabetes ON diabetes.patient = oldOrDiabetic.id -- NOTE: Join field = patient NOT id
        WHERE (
                      sixtyToSeventFive.id IS NOT NULL
                      OR qDiabetics.id IS NOT NULL
                      OR diabetes.id IS NOT NULL
                  )
    ),
    latestBp_1 AS (
        SELECT latestBp_1.*, ((json ->> 'custom_value_value')::DECIMAL) as value
        FROM event latestBp_1                                       -- "_1" produced by sub match => sub with
        WHERE latestBp_1.event_type = 'Observation'
          AND latestBp_1.concept IN ('http://snomed.info/sct#271649006', 'http://endhealth.info/emis#1994021000006104') -- SYSTOLIC BP, HOME SYSTOLIC BP
          AND latestBp_1.effective_date > (now() - INTERVAL '6 MONTH')
    ),
    latestBp_2 AS (
      SELECT latestBp_2.*, ROW_NUMBER() OVER (PARTITION BY patient ORDER BY latestBp_1.effective_date DESC) AS rn
      FROM latestBp_1 latestBp_2
    ),
    latestBp AS (
        SELECT latestBp_2.*
        FROM latestBp_2
        WHERE rn = 1 AND value > 150
    ),
    scrn AS (
        SELECT scrn.*
        FROM event scrn
         JOIN latestBp ON latestBp.patient = scrn.patient -- TRICKY BIT (one of!!)
        WHERE scrn.event_type = 'Observation' AND scrn.effective_date > latestBp.effective_date AND scrn.concept = 'http://snomed.info/sct#715891000000105' -- SCREENING
    ),
    hp AS (
        SELECT hp.*
        FROM event hp
        WHERE hp.event_type = 'Observation' AND hp.concept = 'http://snomed.info/sct#38341003' -- HYPERTENSION
    )
SELECT p.*
FROM patient p
JOIN gms ON gms.id = p.id
JOIN oldOrDiabetic on oldOrDiabetic.id = p.id
JOIN latestBp ON latestBp.patient = p.id                    -- NOTE join on patient, not id
LEFT JOIN scrn ON scrn.patient = p.id                       -- LEFT JOIN for "EXCLUDE"s
LEFT JOIN hp ON hp.patient = p.id
WHERE scrn.id IS NULL
  AND hp.id IS NULL
;
