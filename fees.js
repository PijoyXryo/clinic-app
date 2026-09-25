export function getFee(age) {
    if (age < 12) return 25;
    if (age >= 60) return 20;
    return 35;
}