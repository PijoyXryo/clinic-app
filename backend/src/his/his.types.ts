// What the Yii2 hospital system sends us (its format, not ours!)
export type LegacyPatient = {
  id: number | string; // MariaDB via PHP often sends numbers as text: "5"
  nama: string;
  no_kp: string;
  telefon: string | null;
  dicipta_pada: string;
};

export type SyncResult = {
  total: number;
  created: number;
  alreadyExists: number;
  failed: { noKp: string; reason: string }[];
};