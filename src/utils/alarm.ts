import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const showAllAlarmsCount = async () => {
    try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

        const count = scheduledNotifications.length;
        return count; // Retorna o total de alarmes, se precisar usar esse valor
    } catch (error) {
        console.error("Erro ao obter a contagem de alarmes:", error);
        return 0; // Retorna 0 em caso de erro
    }
};

// Função para agendar lembretes intrusivos (a cada 5 minutos) para um medicamento específico
export const scheduleIntrusiveMedicationReminders = async (hour, minute, medicationId, body, durationInMinutes = 60) => {
    // Configurar o horário inicial do alarme
    const startTime = new Date();
    startTime.setHours(hour);
    startTime.setMinutes(minute);
    startTime.setSeconds(0); // Opcional, para garantir que começa no início do minuto

    // Configurar o horário final do alarme (startTime + duração)
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationInMinutes);

    let passadasDentro = 0;
    while (startTime < endTime) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Lembrete de Medicação",
                body: body,
                data: { medicationId, hour, minute },
            },
            trigger: {
                hour: startTime.getHours(),
                minute: startTime.getMinutes(),
                repeats: true, // Define a repetição diária
            },
        });

        passadasDentro++;
        startTime.setMinutes(startTime.getMinutes() + 5); // Incrementa o horário do próximo lembrete em 5 minutos
    }
};

// Função para cancelar lembretes intrusivos da próxima hora para um medicamento específico, baseado em medicationId, hour e minute
export const cancelMedicationRemindersForNextHour = async (medicationId, hour, minute, body, durationInMinutes) => {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    // Cancela notificações agendadas para o próximo ciclo de uma hora
    scheduledNotifications.forEach(notification => {
        const { data } = notification.content;
        if (data?.medicationId === medicationId && data?.hour === hour && data?.minute === minute) {
            Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
    });

    // Reagenda as notificações intrusivas para o mesmo horário no próximo dia
    const startTime = new Date();
    startTime.setHours(hour);
    startTime.setMinutes(minute);
    startTime.setDate(startTime.getDate() + 1); // Define para o próximo dia

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationInMinutes);

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Lembrete de Medicação",
                body: body,
                data: { medicationId, hour, minute },
            },
            trigger: {
                seconds: ((currentTime.getTime() - new Date().getTime()) / 1000),
                repeats: true, // Define a repetição diária
            },
        });
        currentTime.setMinutes(currentTime.getMinutes() + 5); // Incrementa o tempo em 5 minutos
    }
};

export const deleteAllReminders = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error("Erro ao cancelar os alarmes:", error);
    }
};
