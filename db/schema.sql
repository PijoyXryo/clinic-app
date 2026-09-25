-- Clinic database structure
CREATE TABLE patients (
  id          SERIAL PRIMARY KEY,
  full_name   VARCHAR(150) NOT NULL,
  ic_number   VARCHAR(20)  NOT NULL UNIQUE,
  age         INT CHECK (age >= 0),
  status      VARCHAR(20)  NOT NULL DEFAULT 'waiting',
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);