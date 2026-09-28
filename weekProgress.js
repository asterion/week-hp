// SPDX-License-Identifier: GPL-2.0-or-later
//
// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

export const WORK_DAYS = 5;

// Fuera de este horario el día cuenta vacío (antes) o lleno (después).
// Con 0 y 24 cada día avanza durante las 24 horas.
const DAY_START_HOUR = 9;
const DAY_END_HOUR = 18;

/**
 * Avance de la semana laboral en un momento dado.
 *
 * @param {GLib.DateTime} now - fecha y hora local
 * @returns {{days: number[], today: ?number, total: number}} avance de cada día (0..1),
 *   índice del día actual (null en fin de semana) y avance total (0..1)
 */
export function getWeekProgress(now) {
    const weekday = now.get_day_of_week() - 1; // 0 = lunes … 6 = domingo

    if (weekday >= WORK_DAYS)
        return {days: Array(WORK_DAYS).fill(1), today: null, total: 1};

    const hours = now.get_hour() + now.get_minute() / 60;
    const todayFraction = Math.min(Math.max(
        (hours - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR), 0), 1);

    const days = Array.from({length: WORK_DAYS}, (_v, i) => {
        if (i < weekday)
            return 1;
        return i === weekday ? todayFraction : 0;
    });
    const total = days.reduce((sum, d) => sum + d, 0) / WORK_DAYS;
    return {days, today: weekday, total};
}
