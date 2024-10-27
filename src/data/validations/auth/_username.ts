export function validateName(value: string): string | null {
  if (!value) {
    return "Nome é obrigatório.";
  }
  if (value.length < 2 || value.length > 50) {
    return "O nome deve ter entre 2 e 50 caracteres.";
  }
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/;
  if (!nameRegex.test(value)) {
    return "Nome inválido. Use apenas letras e espaços.";
  }
  return null; // Sem erros
}