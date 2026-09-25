export function getFee(age: number | null): number {
  if (age === null) return 35;
  if (age < 12) return 25;
  if (age >= 60) return 20;
  return 35;
}
