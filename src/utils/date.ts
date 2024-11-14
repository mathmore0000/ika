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
  const startOfWeek = new Date(startDate); // Criar uma cópia de startDate
  startOfWeek.setDate(startDate.getDate() - startDate.getDay()); // Começa no domingo
  const todayDayNumber = startDate.getDate();

    console.log("")
    for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek); // Criar uma cópia para cada dia
    date.setDate(startOfWeek.getDate() -1 + i);
    console.log("getDate", date.getDate())
    days.push({
      isSameDate: date.getDate() == todayDayNumber,
      name: date.toLocaleDateString("pt-BR", { weekday: "short" }), // Nome do dia (Seg, Ter, Qua)
      number: date.getDate(), // Número do dia
      fullDate: date.toISOString().split("T")[0], // Data completa no formato YYYY-MM-DD
    });
  }
  return days;
};

const getFormattedDate = (date: Date) => {
  const daysOfWeek = [
    "Domingo", "Segunda - feira", "Terça - feira", "Quarta - feira", "Quinta - feira", "Sexta - feira", "Sábado"
  ];
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
    "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const dayOfWeek = daysOfWeek[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayOfWeek}, ${month} ${day}`;
};

export const todayFormatted = getFormattedDate(today);

export function convertDateToLocalTimezone(date: Date) {
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return date.toLocaleString("en-US", { timeZone: localTimezone });
}

export function getDateAndHour(date: Date) {
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

//traduzir
export function formatNotificationDate(inputDate: Date) {
  const now = new Date();
  const targetDate = inputDate;
  const diffTime = now - targetDate;

  // Diferença em milissegundos
  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays >= 2) {
      // Se a data é há mais de 2 dias, retorna a data no formato "dd/mm"
      return targetDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } else if (diffDays === 1) {
      // Se a data é de um dia atrás, retorna "ontem"
      return "Ontem";
  } else if (diffHours >= 6) {
      // Se a data é há mais de 6 horas, retorna "há mais de 5hr"
      return "Há mais de 5hr";
  } else if (diffHours >= 1) {
      // Se a data é há 1 ou mais horas, retorna "há Xhr"
      return `Há ${diffHours}hr`;
  } else if (diffMinutes >= 1) {
      // Se a data é há 1 ou mais minutos, retorna "há Xmin"
      return `Há ${diffMinutes}min`;
  } else if (diffSeconds >= 1) {
      // Se a data é há 1 ou mais segundos, retorna "há Xseg"
      return `Há ${diffSeconds}seg`;
  } else {
      // Se a data é menos de 1 segundo, retorna "há menos de 1s"
      return "Há menos de 1s";
  }
}