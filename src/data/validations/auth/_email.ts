export function isEmailValid(value: string) {
  if (!value) {
    return 0;
  }
  if (!value.includes("@")) {
    return 0;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 0;
  }

  return 1;
}
