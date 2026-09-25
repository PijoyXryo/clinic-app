//FEE RULES: CHILD < 12 = 25, ADULT = 35, SENIOR 60+ = 20

export function getFee(age) {
    if (age < 12) return 25;
    if (age >= 60) return 20;
    return 35;
}