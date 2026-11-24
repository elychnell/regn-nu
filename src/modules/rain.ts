import type { WeatherPoint, RainPeriod, Location } from "../types";
import { dateFormatter } from "../utils/forecast";
import { rainConfig } from "./rainConfig";

export function getTodayAndTomorrowPoints(
  points: WeatherPoint[],
  now = new Date()
): WeatherPoint[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  return points.filter(point => {
    const pointDate = dateFormatter.format(new Date(point.time));
    const todayDate = dateFormatter.format(today);
    const dayAfterTomorrowDate =
      dateFormatter.format(dayAfterTomorrow);

    return pointDate >= todayDate &&
      pointDate < dayAfterTomorrowDate;
  });
}


export function findRainPoints(
  points: WeatherPoint[]
): WeatherPoint[] {
  return points.filter(point =>
    point.data.probability_of_precipitation >=
      rainConfig.detectionThreshold ||
    point.data.precipitation_amount_mean > 0
  );
}

export function buildRainPeriods(
  points: WeatherPoint[]
): RainPeriod[] {
  const rainPoints = findRainPoints(points)
    .sort(
      (a, b) =>
        new Date(a.time).getTime() -
        new Date(b.time).getTime()
    );

  const periods: RainPeriod[] = [];

  for (const point of rainPoints) {
    const lastPeriod = periods[periods.length - 1];

    if (!lastPeriod) {
      periods.push({
        start: point.time,
        end: point.time,
        probability: point.data.probability_of_precipitation,
        precipitation: point.data.precipitation_amount_mean,
      });

      continue;
    }

    const gapHours =
      (new Date(point.time).getTime() -
        new Date(lastPeriod.end).getTime()) /
      (1000 * 60 * 60);

    if (gapHours <= rainConfig.maxGapHours) {
      lastPeriod.end = point.time;

      lastPeriod.probability = Math.max(
        lastPeriod.probability,
        point.data.probability_of_precipitation
      );

      lastPeriod.precipitation +=
        point.data.precipitation_amount_mean;
    } else {
      periods.push({
        start: point.time,
        end: point.time,
        probability: point.data.probability_of_precipitation,
        precipitation: point.data.precipitation_amount_mean,
      });
    }
  }

  return periods;
}