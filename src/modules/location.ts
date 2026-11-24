import { locations } from "../data/locations.ts";
import type { Location } from "../types.ts";
import { formatCity, printLocationInfo, printWeatherForecast, showCityPicker } from "./ui.ts";
import { getWeather, scheduleWeatherUpdate } from "./weather.ts";

export function formatAccuracy(accuracy: number): string {
    if (accuracy < 1000) {
        return `${Math.round(accuracy)} m`;
    }

    return `${(accuracy / 1000).toFixed(1)} km`;
}

export function useLocationClick() {
    const locationDialog = document.querySelector<HTMLDialogElement>("#location-dialog");
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude, accuracy  } = position.coords;
            console.log("Accuracy:", accuracy);
            localStorage.setItem("location", "gps");
            localStorage.setItem("lat", latitude.toString());
            localStorage.setItem("long", longitude.toString());
            localStorage.setItem("accuracy", accuracy.toString());
            locationDialog?.close();
            
            const location = findNearestLocation(latitude, longitude);
            localStorage.setItem("cityName", formatCity(location));
            printLocationInfo("GPS", latitude, longitude);
            const forecast = await getWeather(latitude, longitude);

            if (forecast) {
            printWeatherForecast(
            forecast.today,
            forecast.overviewHours,
            forecast.nextMorning
            );
            }
            
            scheduleWeatherUpdate(latitude, longitude);
        },
        () => {
            showCityPicker();
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }
    );
};

function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

export function findNearestLocation(lat: number, lon: number): Location {
    let nearestLocation = locations[0];
    let shortestDistance = Infinity;

    for (const location of locations) {
        const distance = getDistance(
            lat,
            lon,
            location.lat,
            location.lon
        );

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestLocation = location;
        }
    }

    return nearestLocation;
}

function getDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const earthRadius = 6371;

    const latDifference = toRadians(lat2 - lat1);
    const lonDifference = toRadians(lon2 - lon1);

    const a =
        Math.sin(latDifference / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(lonDifference / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
}


export function isValidCoordinates(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}