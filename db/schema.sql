-- Clinic database structure

CREATE TABLE patients (
  id          SERIAL PRIMARY KEY,
  full_name   VARCHAR(150) NOT NULL,
  ic_number   VARCHAR(20)  NOT NULL UNIQUE,
  age         INT CHECK (age >= 0),
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE appointments (
  id            SERIAL PRIMARY KEY,
  patient_id    INT NOT NULL REFERENCES patients(id),
  visit_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  queue_number  INT NOT NULL,
  reason        VARCHAR(200),
  status        VARCHAR(20) NOT NULL DEFAULT 'waiting',
  fee           NUMERIC(8,2) NOT NULL
);