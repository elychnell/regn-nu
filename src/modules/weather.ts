import { getTodayAndTomorrowPoints, buildRainPeriods } from "./rain.ts";
import { buildDayForecasts, buildDayOverview, getTodayForecast, buildMorningForecasts, getNextMorningForecast } from "../utils/forecast.ts";
import { printWeatherForecast } from "./ui.ts";

export async function getWeather(lat: number, lon: number) {
    const url = `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/${lon}/lat/${lat}/data.json`;

    try {
        const response = await fetch(url, {
            cache: "no-store",
        });
        if (!response.ok) {
            throw new Error(`SMHI request failed: ${response.status}`);
        }

        const data = await response.json();
        const relevantPoints = getTodayAndTomorrowPoints(data.timeSeries);
        const rainPeriods = buildRainPeriods(relevantPoints);
        console.log(rainPeriods);
        const days = buildDayForecasts(data);
        const today = getTodayForecast(days);

        if (!today) {
        console.error("Hittade ingen prognos för idag.");
        return;
        }

        const overviewHours = buildDayOverview(data,today.date,rainPeriods);
        const mornings = buildMorningForecasts(days);
        const nextMorning = getNextMorningForecast(mornings);
        const morningOverviewHours = nextMorning ? buildDayOverview(data,nextMorning.date,rainPeriods) : undefined;
    
        return {today, overviewHours, nextMorning };
        } catch (error) {
        console.error("Kunde inte hämta väderdata:", error);
    }
}

export function scheduleWeatherUpdate(
    lat: number,
    lon: number,
    onWeatherUpdate: (forecast: WeatherForecast) => void
    ) {
    const now = new Date();
    const nextHour = new Date(now);

    nextHour.setHours(now.getHours() + 1, 0, 0, 0);

    const delay = nextHour.getTime() - now.getTime();

    setTimeout(async () => {
        const forecast = await getWeather(lat, lon);
        if (forecast) {
        onWeatherUpdate(forecast);
        }
        scheduleWeatherUpdate(lat, lon, onWeatherUpdate);
    }, delay);
}