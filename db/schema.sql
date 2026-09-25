-- Clinic database structure

CREATE TABLE patients (
  id             SERIAL PRIMARY KEY,
  full_name      VARCHAR(150) NOT NULL,
  ic_number      VARCHAR(20)  NOT NULL UNIQUE,
  date_of_birth  DATE         NOT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
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

-- Indexes: speed up the most common queries
CREATE INDEX idx_appointments_patient ON appointments (patient_id);  -- patient history
CREATE INDEX idx_appointments_date    ON appointments (visit_date);  -- today's queue