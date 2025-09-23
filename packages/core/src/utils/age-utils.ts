export function calculateAge(
  dateOfBirth: Date,
  referenceDate: Date = new Date()
): number {
  const birthDate = new Date(dateOfBirth);
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export function isValidPlayerAge(
  dateOfBirth: Date,
  minAge: number = 15,
  maxAge: number = 50
): boolean {
  const age = calculateAge(dateOfBirth);
  return age >= minAge && age <= maxAge;
}

export function getAgeCategory(dateOfBirth: Date): string {
  const age = calculateAge(dateOfBirth);

  if (age < 18) return "Youth";
  if (age < 23) return "Young";
  if (age < 30) return "Prime";
  if (age < 35) return "Experienced";
  return "Veteran";
}
