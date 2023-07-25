SET SCHEME 'lair';

-- MATCH TO WITH approach
WITH
    gms AS (
        SELECT * FROM patient -- REG GMS query results
    ),
    sixtyToSeventFive AS (
        SELECT sixtyToSeventFive.*
        FROM patient sixtyToSeventFive
        WHERE sixtyToSeventFive.date_of_birth BETWEEN (now() - INTERVAL '70 YEAR') AND (now() - INTERVAL '65 YEAR')
    ),
    qDiabetics AS (
        SELECT * FROM patient -- QDiabetics query results
    ),
    diabetes AS (
        SELECT diabetes.*
        FROM event diabetes
        WHERE diabetes.event_type = 'Observation' AND diabetes.concept = 'http://snomed.info/sct#714628002' -- DIABETES
    ),
    latestBp_1 AS (   -- "_1" produced by sub match => sub where
        SELECT latestBp_1.*
             , ROW_NUMBER() OVER (PARTITION BY patient ORDER BY latestBp_1.effective_date DESC) AS rn
        FROM event latestBp_1
        WHERE latestBp_1.event_type = 'Observation'
          AND latestBp_1.concept = 'http://snomed.info/sct#72313002' -- SYSTOLIC BP
          AND latestBp_1.effective_date > (now() - INTERVAL '6 MONTH')
    ),
    latestBp AS (
        SELECT latestBp_1.*
        FROM latestBp_1
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
         LEFT JOIN sixtyToSeventFive ON sixtyToSeventFive.id = p.id  -- LEFT JOIN for "OR"s
         LEFT JOIN qDiabetics ON qDiabetics.id = p.id
         LEFT JOIN diabetes ON diabetes.patient = p.id
         JOIN latestBp ON latestBp.patient = p.id
         LEFT JOIN scrn ON scrn.patient = p.id                       -- LEFT JOIN for "EXCLUDE"s
         LEFT JOIN hp ON hp.patient = p.id
WHERE (
        sixtyToSeventFive.id IS NOT NULL
        OR qDiabetics.id IS NOT NULL
        OR diabetes.id IS NOT NULL
    )
  AND scrn.id IS NULL
  AND hp.id IS NULL
;
