export function isPasswordValid(value: string) {
  if (!value) {
    return 0;
  }
  if (value.length < 6) {
    return 0;
  }
  if (value.length > 50) {
    return 0;
  }
  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{6,}$/;
  if (!passwordRegex.test(value)) {
    return 0;
  }

  return 1;
}
