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
