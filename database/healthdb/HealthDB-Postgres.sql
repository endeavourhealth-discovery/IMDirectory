DROP SCHEMA IF EXISTS lair CASCADE;

CREATE SCHEMA lair;

SET SCHEMA 'lair';

DROP TABLE IF EXISTS query_queue;

CREATE TABLE query_queue (
    id UUID PRIMARY KEY,        -- Unique run identifier
    iri VARCHAR(255) NOT NULL,  -- Query IRI
    name VARCHAR(255) NOT NULL, -- Query name
    user_id UUID NOT NULL,         -- User UUID
    queued TIMESTAMP NOT NULL,
    started TIMESTAMP,
    pid INT,                    -- Internal (postgres) process ID (for killing)
    finished TIMESTAMP,
    killed TIMESTAMP,
    status TEXT
);


DROP TABLE IF EXISTS query_result;

CREATE TABLE query_result (
    iri VARCHAR(255) NOT NULL,
    id UUID NOT NULL
);

CREATE INDEX idx_query_result_iri ON query_result(iri);

DROP TABLE IF EXISTS set_member;

CREATE TABLE set_member (
    iri VARCHAR(255) NOT NULL,
    member VARCHAR(255) NOT NULL
);

CREATE INDEX idx_set_member_iri ON set_member(iri);

DROP TABLE IF EXISTS tct;

CREATE TABLE tct (
    iri VARCHAR(255) NOT NULL,
    child VARCHAR(255) NOT NULL,
    level INT
);

CREATE INDEX idx_tct_iri ON tct(iri);

DROP TABLE IF EXISTS patient;

CREATE TABLE patient (
    id UUID PRIMARY KEY,
    json JSON NOT NULL
);

COPY patient(id, json) FROM 'Z:\\pojo\\out\\patient_Patient.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');

DROP TABLE IF EXISTS event;

CREATE TABLE event (
    id UUID PRIMARY KEY,
    json JSON NOT NULL
);

COPY event(id, json) FROM 'Z:\\pojo\\out\\enc1_Consultation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');
COPY event(id, json) FROM 'Z:\\pojo\\out\\enc2_Consultation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');
COPY event(id, json) FROM 'Z:\\pojo\\out\\enc3_Consultation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');

COPY event(id, json) FROM 'Z:\\pojo\\out\\eoc_EpisodeOfCare.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');

COPY event(id, json) FROM 'Z:\\pojo\\out\\fullbp_Observation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');
COPY event(id, json) FROM 'Z:\\pojo\\out\\individualbp_Observation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');

COPY event(id, json) FROM 'Z:\\pojo\\out\\obs1_Observation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');
COPY event(id, json) FROM 'Z:\\pojo\\out\\obs2_Observation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');
COPY event(id, json) FROM 'Z:\\pojo\\out\\obs3_Observation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');
COPY event(id, json) FROM 'Z:\\pojo\\out\\obs4_Observation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');
COPY event(id, json) FROM 'Z:\\pojo\\out\\obs5_Observation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');
COPY event(id, json) FROM 'Z:\\pojo\\out\\obs6_Observation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '`', ENCODING 'LATIN1', ESCAPE '\');

COPY event(id, json) FROM 'Z:\\pojo\\out\\rxs_MedicationAuthorisation.csv' (FORMAT CSV, DELIMITER '	', QUOTE '^', ENCODING 'LATIN1', ESCAPE '\');

CREATE OR REPLACE FUNCTION jdt(text)
    RETURNS timestamptz AS
        $$SELECT to_timestamp($1, 'YYYY-MM-DDTHH24:MI:SS')$$  -- adapt to your needs
LANGUAGE sql IMMUTABLE;

CREATE INDEX idx_pat_dob ON patient ((jdt(json ->> 'dateOfBirth')));
-- CREATE INDEX idx_pat_nhs ON patient ((json ->> 'nhsNumber'));

CREATE INDEX idx_evt_typ_cpt_dte ON event ((json ->> '_type'), (json ->> 'concept'), (jdt(json -> 'effectiveDate' ->> 'dateTime')));
-- CREATE INDEX idx_evt_pat_typ_cpt ON event USING HASH (((json ->> 'patient')::UUID), (json ->> '_type'), (json ->> 'concept'));
CREATE INDEX prt_eoc_ptp ON event (((json ->> 'patientType')::varchar)) WHERE (json ->> '_type') = 'EpisodeOfCare';
