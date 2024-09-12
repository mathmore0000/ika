const getLocalDate = () => {
  const now = new Date();
  // Ajusta a data para o fuso horário local
  const offsetInMinutes = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offsetInMinutes * 60 * 1000);

  return localDate;
};

export const today = getLocalDate();

// Função para pegar o nome do dia da semana e os próximos dias
export const getDay = (date: Date) => {
  const options = { weekday: "long" } as const;
  return date.toLocaleDateString("pt-BR", options);
};

// Função para pegar o array de dias a partir de hoje
export const getDaysArray = (startDate: Date) => {
  const days = [];
  const startOfWeek = new Date(startDate.setDate(startDate.getDate() - startDate.getDay())); // Começa no domingo

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      name: date.toLocaleDateString("pt-BR", { weekday: "short" }), // Nome do dia (Seg, Ter, Qua)
      number: date.getDate(), // Número do dia
      fullDate: date.toISOString().split("T")[0], // Data completa no formato YYYY-MM-DD
    });
  }
  return days;
};

const getFormattedDate = (date: Date) => {
  const daysOfWeek = [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
  ];
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
    "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const dayOfWeek = daysOfWeek[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayOfWeek}, ${day} de ${month} de ${year}`;
};

export const todayFormatted = getFormattedDate(today);