// Malaysian IC: YYMMDD-PB-###G → returns 'YYYY-MM-DD' or null if invalid
export function birthDateFromIc(ic: string): string | null {
  const match = /^(\d{2})(\d{2})(\d{2})-\d{2}-\d{4}$/.exec(ic);
  if (!match) return null;

  const [, yy, mm, dd] = match;
  const thisYearShort = new Date().getFullYear() % 100;
  const year =
    Number(yy) > thisYearShort ? 1900 + Number(yy) : 2000 + Number(yy);

  const birth = new Date(Date.UTC(year, Number(mm) - 1, Number(dd)));
  if (
    birth.getUTCMonth() !== Number(mm) - 1 ||
    birth.getUTCDate() !== Number(dd)
  )
    return null;
  if (birth > new Date()) return null;

  return `${year}-${mm}-${dd}`;
}

// 'YYYY-MM-DD' → age in whole years
export function ageFromBirthDate(dateOfBirth: string): number {
  const [y, m, d] = dateOfBirth.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  const month = today.getMonth() + 1;
  const hadBirthday = month > m || (month === m && today.getDate() >= d);
  if (!hadBirthday) age--;
  return age;
}
