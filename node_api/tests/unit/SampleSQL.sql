SET SCHEMA 'lair';

WITH
    pat1 AS (
        SELECT pat1.*
        FROM patient AS pat1
        WHERE 1 = 1 -- in query results http://endhealth.info/im#Q_RegisteredGMS
    ),
    pat3 AS (
        SELECT pat3.*
        FROM patient AS pat3
        WHERE (now() - INTERVAL '65 YEARS') >= pat3.date_of_birth
          AND (now() - INTERVAL '70 YEARS') < pat3.date_of_birth
    ),
    pat4 AS (
        SELECT pat4.*
        FROM patient AS pat4
        WHERE 1 = 1 -- in query results http://example/queries#Q_Diabetics
    ),
    pat5_sub1 AS (
        SELECT pat5_sub1.*
        FROM event AS pat5_sub1
        WHERE pat5_sub1.event_type = 'Observation'
          AND (
                pat5_sub1.concept = 'http://snomed.info/sct#714628002')

    ),
    pat5 AS (
        SELECT pat5.*
        FROM patient AS pat5
                 JOIN pat5_sub1 ON pat5_sub1.patient = pat5.id
    ),
    pat2 AS (
        SELECT pat2.*
        FROM patient AS pat2
                 LEFT JOIN pat3 ON pat3.id = pat2.id
                 LEFT JOIN pat4 ON pat4.id = pat2.id
                 LEFT JOIN pat5 ON pat5.id = pat2.id
        WHERE pat3.id IS NOT NULL
           OR pat4.id IS NOT NULL
           OR pat5.id IS NOT NULL
    ),
    latestBP_inner AS (
        SELECT latestBP_inner.*
        FROM event AS latestBP_inner
        WHERE latestBP_inner.event_type = 'Observation'
          AND (
                    latestBP_inner.concept IN ('http://snomed.info/sct#72313002', 'http://endhealth.info/emis#1994021000006104')
                AND latestBP_inner.effective_date >= (now() + INTERVAL '-6 MONTHS'))
    ),
    latestBP_part AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY patient ORDER BY latestBP_part.effective_date DESC) AS rn
        FROM latestBP_inner AS latestBP_part
    ),
    latestBP AS (
        SELECT latestBP.*
        FROM latestBP_part AS latestBP
        WHERE rn = 1
    ),
    pat6 AS (
        SELECT pat6.*
        FROM patient AS pat6
                 JOIN latestBP ON latestBP.patient = pat6.id
    ),
    lat7 AS (
        SELECT lat7.*
        FROM latestBP AS lat7
        WHERE lat7.concept = 'http://snomed.info/sct#72313002'
          AND ((lat7.json ->> 'custom_value_value')::DECIMAL) > 140
    ),
    lat8 AS (
        SELECT lat8.*
        FROM latestBP AS lat8
        WHERE lat8.concept = 'http://endhealth.info/emis#1994021000006104'
          AND ((lat8.json ->> 'custom_value_value')::DECIMAL) > 130
    ),
    highBPReading AS (
        SELECT highBPReading.*
        FROM latestBP AS highBPReading
                 LEFT JOIN lat7 ON lat7.id = highBPReading.id
                 LEFT JOIN lat8 ON lat8.id = highBPReading.id
        WHERE lat7.id IS NOT NULL
           OR lat8.id IS NOT NULL
    ),
    pat9_sub1 AS (
        SELECT pat9_sub1.*
        FROM event AS pat9_sub1
                 JOIN highBPReading ON highBPReading.id = pat9_sub1.id
        WHERE pat9_sub1.event_type = 'Observation'
          AND (
                    pat9_sub1.concept = 'SET [http://endhealth.info/im#InvitedForScreening]'
                AND pat9_sub1.effective_date >= highBPReading.effective_date)

    ),
    pat9 AS (
        SELECT pat9.*
        FROM patient AS pat9
                 JOIN pat9_sub1 ON pat9_sub1.patient = pat9.id
    ),
    pat10 AS (
        SELECT pat10.*
        FROM patient AS pat10
        WHERE 1 = 1 -- in query results http://endhealth.info/im#Q_Hypertensives
    )
SELECT pat0.*
FROM patient AS pat0
         JOIN pat1 ON pat1.id = pat0.id
         JOIN pat2 ON pat2.id = pat0.id
         JOIN pat6 ON pat6.id = pat0.id
         JOIN highBPReading ON highBPReading.id = pat0.id
         JOIN pat9 ON pat9.id = pat0.id
         JOIN pat10 ON pat10.id = pat0.id









LIMIT 100



; -- SQ


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
