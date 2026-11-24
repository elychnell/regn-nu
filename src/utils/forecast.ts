import type { DayForecast, WeatherResponse, MorningForecast, WeatherPoint, RainPeriod } from "../types";

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

export const weekdayFormatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    weekday: "long",
});

export function formatSwedishWeekday(date: string): string {
    const weekday = weekdayFormatter.format(new Date(`${date}T12:00:00Z`));
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

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

export function getRainPeriodsForDay(
    rainPeriods: RainPeriod[],
    date: string
): RainPeriod[] {
    return rainPeriods.filter(period => {
        const periodStart = dateFormatter.format(new Date(period.start));
        const periodEnd = dateFormatter.format(new Date(period.end));
        return periodStart <= date && periodEnd >= date;
    });
}

export function buildDayOverview(
    response: WeatherResponse,
    date: string,
    rainPeriods: RainPeriod[]
): WeatherPoint[] {
const now = new Date();
const dayRainPeriods = getRainPeriodsForDay(rainPeriods,date);

console.log("Datum:", date);
console.log("Regnperioder för dagen:", dayRainPeriods);

    const points = response.timeSeries.filter(point => {
        const pointDate = dateFormatter.format(
            new Date(point.time)
        );

        return (
            pointDate >= date &&
            new Date(point.time) > now
        );
    });

    return points.filter(point => {
        const hour = Number(
            hourFormatter.format(new Date(point.time))
        );

        return hour % 3 === 0;
    }).slice(0, 4);
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

export function getWeatherDescription(
    symbolCode: number
): string {
    switch (symbolCode) {
        case 1:
            return "Klart";
        case 2:
            return "Nästan klart";
        case 3:
            return "Växlande molnighet";
        case 4:
            return "Halvklart";
        case 5:
            return "Molnigt";
        case 6:
            return "Mulet";
        case 7:
            return "Dimma";
        case 8:
            return "Lätta regnskurar";
        case 9:
            return "Måttliga regnskurar";
        case 10:
            return "Kraftiga regnskurar";
        case 11:
            return "Åska";
        case 12:
            return "Lätta snöblandade regnskurar";
        case 13:
            return "Måttliga snöblandade regnskurar";
        case 14:
            return "Kraftiga snöblandade regnskurar";
        case 15:
            return "Lätta snöbyar";
        case 16:
            return "Måttliga snöbyar";
        case 17:
            return "Kraftiga snöbyar";
        case 18:
            return "Lätt regn";
        case 19:
            return "Måttligt regn";
        case 20:
            return "Kraftigt regn";
        case 21:
            return "Åska";
        case 22:
            return "Lätt snöblandat regn";
        case 23:
            return "Måttligt snöblandat regn";
        case 24:
            return "Kraftigt snöblandat regn";
        case 25:
            return "Lätt snöfall";
        case 26:
            return "Måttligt snöfall";
        case 27:
            return "Kraftigt snöfall";
        default:
            return "Okänt väder";
    }
}
