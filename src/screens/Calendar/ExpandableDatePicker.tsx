// ExpandableDatePicker.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import { getDaysArray } from "@/utils/date";

const ExpandableDatePicker = ({ selectedDate, onDateSelect, expirationDates }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [monthDays, setMonthDays] = useState(getMonthDaysWithAdjacentDays(new Date().getFullYear(), new Date().getMonth()));
    const [displayedMonth, setDisplayedMonth] = useState(new Date().getMonth());
    const [displayedYear, setDisplayedYear] = useState(new Date().getFullYear());

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const handleDateSelect = (date) => {
        onDateSelect(date);
    };

    const navigateMonth = (direction) => {
        let newMonth = displayedMonth + direction;
        let newYear = displayedYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        setDisplayedMonth(newMonth);
        setDisplayedYear(newYear);
        setMonthDays(getMonthDaysWithAdjacentDays(newYear, newMonth));
    };
    const isSameDate = (date1, date2) => {
        return (
            date1.getUTCFullYear() === date2.getUTCFullYear() &&
            date1.getUTCMonth() === date2.getUTCMonth() &&
            date1.getUTCDate() === date2.getUTCDate()
        );
    };

    const today = new Date(); // Calcula a data de hoje a cada renderização
    const todayFormatted = today.toLocaleDateString("pt-BR", { weekday: "short", month: "short", day: "numeric" });

    const isExpirationDate = (date) => expirationDates.includes(date.toISOString().split("T")[0]);
    return (
        <View style={{ padding: 16, backgroundColor: "#FFF", borderRadius: 8 }}>
            {/* Header with current date and expand button */}
            <TouchableOpacity onPress={toggleExpand} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>{todayFormatted}</Text>
                <Icon name={isExpanded ? "up" : "down"} size={18} />
            </TouchableOpacity>

            {/* Weekly View */}
            {!isExpanded && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                    {getDaysArray(selectedDate).map((day) => (
                        <TouchableOpacity key={day.fullDate} onPress={() => handleDateSelect(new Date(day.fullDate))} style={{ marginRight: 8 }}>
                            <Text style={{ textAlign: "center", fontWeight: day.isSameDate ? "bold" : "normal" }}>
                                {/* {day.name} {day.number} */}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Expanded Monthly Calendar */}
            {isExpanded && (
                <View style={{ marginTop: 20 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => navigateMonth(-1)}>
                            <Icon name="left" size={18} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 16, fontWeight: "bold" }}>{monthNames[displayedMonth]} {displayedYear}</Text>
                        <TouchableOpacity onPress={() => navigateMonth(1)}>
                            <Icon name="right" size={18} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 10 }}>
                        {["D", "S", "T", "Q", "Q", "S", "S"].map((dayName, index) => (
                            <Text key={index} style={{ width: "14.28%", textAlign: "center", fontWeight: "bold" }}>{dayName}</Text>
                        ))}
                    </View>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
                        {monthDays.map((day) => {
                            const date = new Date(day.fullDate);
                            const isToday = isSameDate(date, today);
                            const isSelected = isSameDate(date, selectedDate);
                            const isAdjacentMonth = date.getMonth() !== displayedMonth;
                            const isExpiry = isExpirationDate(date);

                            return (
                                <TouchableOpacity
                                    key={day.fullDate}
                                    onPress={() => handleDateSelect(date)}
                                    style={{
                                        width: "14.28%",
                                        padding: 8,
                                        borderRadius: 4,
                                        backgroundColor: isSelected ? "#23527c" : isToday ? "#FFA500" : isExpiry ? "#F44336" : "transparent", // Red for expiration dates
                                    }}
                                >
                                    <Text style={{
                                        textAlign: "center",
                                        color: isSelected ? "#FFF" : isAdjacentMonth ? "#B0B0B0" : isToday || isExpiry ? "#FFF" : "#000", // White for today and expiration dates
                                        fontWeight: isToday || isExpiry ? "bold" : "normal"
                                    }}>
                                        {day.number}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
};

export default ExpandableDatePicker;

const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

/**
 * Generate days for the given month, including days from the previous and next months
 * to fill out a full 6-row calendar view if necessary.
 */
const getMonthDaysWithAdjacentDays = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = [];
    const dayOfWeekOfFirstDay = firstDayOfMonth.getDay(); // Day of the week (0=Sun, 1=Mon, ... 6=Sat)

    // Add previous month's days if the first day of the month doesn't start on Sunday
    if (dayOfWeekOfFirstDay !== 0) {
        const previousMonthLastDay = new Date(year, month, 0);
        for (let i = dayOfWeekOfFirstDay; i > 0; i--) {
            const date = new Date(previousMonthLastDay);
            date.setDate(previousMonthLastDay.getDate() - i + 1);
            daysInMonth.push({ name: date.toLocaleDateString("pt-BR", { weekday: "short" }), number: date.getDate(), fullDate: date.toISOString().split("T")[0] });
        }
    }

    // Add current month's days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        daysInMonth.push({ name: date.toLocaleDateString("pt-BR", { weekday: "short" }), number: i, fullDate: date.toISOString().split("T")[0] });
    }

    // Add next month's days to fill out the last row if necessary
    const remainingCells = 42 - daysInMonth.length; // 6 weeks * 7 days = 42 cells in a typical calendar view
    for (let i = 1; i <= remainingCells; i++) {
        const date = new Date(year, month + 1, i);
        daysInMonth.push({ name: date.toLocaleDateString("pt-BR", { weekday: "short" }), number: date.getDate(), fullDate: date.toISOString().split("T")[0] });
    }

    return daysInMonth;
};