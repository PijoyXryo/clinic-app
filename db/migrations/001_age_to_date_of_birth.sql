-- Migration 001: store date of birth instead of age (age goes stale every birthday)

ALTER TABLE patients ADD COLUMN date_of_birth DATE;

UPDATE patients
SET date_of_birth = make_date(
  CASE
    WHEN substring(ic_number, 1, 2)::int > EXTRACT(YEAR FROM CURRENT_DATE)::int % 100
    THEN 1900 ELSE 2000
  END + substring(ic_number, 1, 2)::int,
  substring(ic_number, 3, 2)::int,
  substring(ic_number, 5, 2)::int
)
WHERE ic_number ~ '^\d{6}-\d{2}-\d{4}$';

UPDATE patients
SET date_of_birth = CURRENT_DATE - (age * 365 + floor(random() * 364))::int
WHERE date_of_birth IS NULL AND age IS NOT NULL;

ALTER TABLE patients ALTER COLUMN date_of_birth SET NOT NULL;
ALTER TABLE patients DROP COLUMN age;