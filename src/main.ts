import "./scss/style.scss";
import { getWeather, scheduleWeatherUpdate } from "./modules/weather.ts";
import { showLocationPicker, printLocationInfo, printWeatherForecast } from "./modules/ui.ts";

/* Open the location dialog when the page loads */
const locationDialog = document.querySelector<HTMLDialogElement>("#location-dialog");
const savedLocation = localStorage.getItem("location");

if (!savedLocation) {
    showLocationPicker();
} else {
    switch (savedLocation) {
        case "city":
            const lat = Number(localStorage.getItem("lat"));
            const lon = Number(localStorage.getItem("long"));
            printLocationInfo("city", lat, lon);
            const forecast = await getWeather(lat, lon);

            if (forecast) {
            printWeatherForecast(
            forecast.today,
            forecast.overviewHours,
            forecast.nextMorning
            );
            }
            
            scheduleWeatherUpdate(lat, lon);
            break;
        case "manual":
            const manualLat = Number(localStorage.getItem("latitude"));
            const manualLon = Number(localStorage.getItem("longitude"));
            printLocationInfo("Manual", manualLat, manualLon);
            getWeather(manualLat, manualLon);
            scheduleWeatherUpdate(manualLat, manualLon);
            break;
        case "gps":
            const gpsLat = Number(localStorage.getItem("lat"));
            const gpsLon = Number(localStorage.getItem("long"));
            printLocationInfo("GPS", gpsLat, gpsLon);
            getWeather(gpsLat, gpsLon);
            scheduleWeatherUpdate(gpsLat, gpsLon);
            break;
    }
}

    const backToLocationButton =
        document.querySelector<HTMLButtonElement>("#back-to-location");

    backToLocationButton?.addEventListener("click", () => {
        locationDialog?.close();
        showLocationPicker();
    });
