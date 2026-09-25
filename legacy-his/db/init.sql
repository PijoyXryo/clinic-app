-- Legacy Hospital Information System (HIS) — MariaDB
-- Run with:  C:\xampp\mysql\bin\mysql.exe -u root < legacy-his\db\init.sql

CREATE DATABASE IF NOT EXISTS his CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'his'@'localhost' IDENTIFIED BY 'his_dev_password';
GRANT ALL PRIVILEGES ON his.* TO 'his'@'localhost';

USE his;

CREATE TABLE IF NOT EXISTS pesakit (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nama          VARCHAR(150) NOT NULL,
  no_kp         VARCHAR(20)  NOT NULL,
  telefon       VARCHAR(20),
  dicipta_pada  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_no_kp (no_kp)
) ENGINE=InnoDB;

INSERT IGNORE INTO pesakit (nama, no_kp, telefon) VALUES
  ('Faridah binti Omar',  '850612-10-1234', '0123456789'),
  ('Lim Mei Ling',        '780315-14-5566', '0167778899'),
  ('Rajesh a/l Kumar',    '920808-10-7788', '0198887766'),
  ('Nur Aisyah binti Ali','150420-10-3344', '0112223344'),
  ('Wong Kah Wai',        '600101-08-9900', NULL);