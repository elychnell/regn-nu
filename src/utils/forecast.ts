import type { DayForecast, WeatherResponse, MorningForecast, WeatherPoint } from "../types";

export const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

export const hourFormatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    hourCycle: "h23",
});

export function formatSwedishTime(time: string): string {
    return new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Stockholm",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).format(new Date(time));
}

function getDate(date: Date): string {
    return dateFormatter.format(date);
}

// Hämtar dagens prognos.
export function getTodayForecast(
    days: DayForecast[],
    now: Date = new Date()
): DayForecast | undefined {
    const today = getDate(now);

    return days.find(day => day.date === today);
}

// Hämtar nästa relevanta morgon.
// Före kl. 09 väljer vi dagens morgon, annars morgondagens.
export function getNextMorningForecast(
    mornings: MorningForecast[],
    now: Date = new Date()
): MorningForecast | undefined {
    const currentDate = getDate(now);

    const currentHour = Number(hourFormatter.format(now));

    const targetDate = new Date(`${currentDate}T12:00:00Z`);

    if (currentHour >= 9) {
        targetDate.setUTCDate(targetDate.getUTCDate() + 1);
    }

    const targetDateString = getDate(targetDate);

    return mornings.find(morning => morning.date === targetDateString);
}

export function buildDayForecasts(
    response: WeatherResponse
): DayForecast[] {
    const days = new Map<string, DayForecast>();

    for (const point of response.timeSeries) {
        const date = dateFormatter.format(
            new Date(point.time)
        );

        let day = days.get(date);

        if (!day) {
            day = {
                date,
                hours: [],
                minTemperature: point.data.air_temperature,
                maxTemperature: point.data.air_temperature,
            };

            days.set(date, day);
        }

        day.hours.push(point);

        day.minTemperature = Math.min(
            day.minTemperature,
            point.data.air_temperature
        );

        day.maxTemperature = Math.max(
            day.maxTemperature,
            point.data.air_temperature
        );
    }

    return Array.from(days.values());
}

export function buildMorningForecasts(
    days: DayForecast[]
): MorningForecast[] {
    return days
        .map(day => ({
            date: day.date,
            hours: day.hours.filter(point => {
                const hour = Number(
                    hourFormatter.format(new Date(point.time))
                );

                return hour >= 6 && hour <= 9;
            }),
        }))
        .filter(day => day.hours.length > 0);
}