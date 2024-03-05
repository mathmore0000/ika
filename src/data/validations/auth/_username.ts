export function isUsernameValid(value: string) {
  if (!value) {
    return 0;
  }
  if (value.length < 2) {
    return 0;
  }
  if (value.length > 50) {
    return 0;
  }
  const passwordRegex = /^[a-zA-Z0-9]{2,50}$/;
  if (!passwordRegex.test(value)) {
    return 0;
  }

  return 1;
}
