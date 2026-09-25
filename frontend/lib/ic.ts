// Malaysian IC: YYMMDD-PB-###G, e.g. 850612-10-1234

export function birthDateFromIc(ic: string): Date | null {
  const match = /^(\d{2})(\d{2})(\d{2})-\d{2}-\d{4}$/.exec(ic);
  if (!match) return null;

  const [, yy, mm, dd] = match;

  // "85" could be 1985 or 2085. If it's bigger than this year's last 2 digits, it must be 19xx
  const thisYearShort = new Date().getFullYear() % 100; // 2026 → 26
  const year = Number(yy) > thisYearShort ? 1900 + Number(yy) : 2000 + Number(yy);

  const birth = new Date(year, Number(mm) - 1, Number(dd)); // JS months start at 0!

  // Reject impossible dates like 31 February (JS would silently roll them into March)
  if (birth.getMonth() !== Number(mm) - 1 || birth.getDate() !== Number(dd)) return null;

  // Reject dates in the future
  if (birth > new Date()) return null;

  return birth;
}

export function ageFromIc(ic: string): number | null {
  const birth = birthDateFromIc(ic);
  if (!birth) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  // Subtract 1 if their birthday hasn't happened yet this year
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hadBirthday) age--;

  return age;
}
