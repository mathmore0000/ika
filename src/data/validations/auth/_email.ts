export function validateEmail(value: string): string | null {
  if (!value) {
    return "E-mail é obrigatório.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "E-mail inválido. Insira um e-mail válido.";
  }
  return null; // Sem erros
}