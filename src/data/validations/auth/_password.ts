export function validatePassword(value: string): string | null {
  if (!value) {
    return "Senha é obrigatória.";
  }
  if (value.length < 6 || value.length > 50) {
    return "A senha deve ter entre 6 e 50 caracteres.";
  }
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])/;
  if (!passwordRegex.test(value)) {
    return "A senha deve conter letras maiúsculas, minúsculas, números e símbolos.";
  }
  return null; // Sem erros
}

export function validatePasswordLogin(value: string): string | null {
  if (!value) {
    return "Senha é obrigatória.";
  }
  if (value.length < 6 || value.length > 50) {
    return "A senha deve ter entre 6 e 50 caracteres.";
  }
  return null; // Sem erros
}