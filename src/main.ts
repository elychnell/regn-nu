import "./scss/style.scss";
import locationsData from "./data/svenska-orter.json"
import { getWeatherIcon } from "./utils/weatherSymbols.ts";
import type { DayForecast,MorningForecast, Location } from "./types.ts";
import { buildDayForecasts, buildMorningForecasts, getNextMorningForecast, getTodayForecast, formatSwedishTime, } from "./utils/forecast.ts";


/* Mapping the data to the Location interface */
const locations: Location[] = locationsData.map(location => ({
    name: location.locality,
    municipality: location.municipality,
    county: location.county,
    lat: location.lat,
    lon: location.lon,   
}));

const locationElm = document.querySelector<HTMLDivElement>("#location");


function showLocationPicker() {
    const locationDialog = document.querySelector<HTMLDialogElement>("#location-dialog");
    const dialogContent = `
    <div class="location-dialog-content">
        <h2>Var är du?</h2>

        <p>För att visa rätt väder behöver vi veta ungefär var du befinner dig.</p>

        <button id="use-location">
        📍 Använd min plats
        </button>
        <button id="choose-city">
            🏙️ Välj stad
        </button>
        <button id="enter-coordinates">
        🌐 Ange koordinater
        </button>
    </div>
    `;
    locationDialog!.innerHTML = dialogContent;

    const useLocationButton = document.querySelector<HTMLButtonElement>("#use-location");
    useLocationButton?.addEventListener("click", () => { useLocationClick(); });
    const chooseCityButton = document.querySelector<HTMLButtonElement>("#choose-city");
    chooseCityButton?.addEventListener("click", () => { showCityPicker(); });
    const enterCoordinatesButton = document.querySelector<HTMLButtonElement>("#enter-coordinates");
    enterCoordinatesButton?.addEventListener("click", () => { showCoordinatePicker();});
    locationDialog?.showModal();
}

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
            getWeather(lat, lon);
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

function useLocationClick() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
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
            getWeather(latitude, longitude);
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



function formatAccuracy(accuracy: number): string {
    if (accuracy < 1000) {
        return `${Math.round(accuracy)} m`;
    }

    return `${(accuracy / 1000).toFixed(1)} km`;
}

function showCityPicker(locationDialog: HTMLDialogElement | null = document.querySelector<HTMLDialogElement>("#location-dialog")) {
if (locationDialog) {
   locationDialog.innerHTML = `
   <div id="city-picker">
    <h2>Välj stad</h2>

    <input
        type="search"
        id="city-search"
        placeholder="Sök efter stad..."
        autocomplete="off"
    >

    <ul id="city-results" class="city-results"></ul>

    <button id="back-to-location">
        ← Tillbaka
    </button>
</div>`;
}

const backToLocationButton = document.querySelector<HTMLButtonElement>("#back-to-location");
backToLocationButton?.addEventListener("click", () => {
    locationDialog?.close();
    showLocationPicker();
});

const searchInput =
    document.querySelector<HTMLInputElement>("#city-search");

const cityResults =
    document.querySelector<HTMLUListElement>("#city-results");

searchInput?.addEventListener("input", () => {
    const search = searchInput.value.toLowerCase().trim();

    if (!search) {
        cityResults!.innerHTML = "";
        return;
    }

    const results = locations
    .map(location => {
        const name = location.name.toLowerCase();
        const municipality = location.municipality?.toLowerCase() ?? "";

        let priority = 3;

        if (name === search) {
            priority = 0; // Exakt ortsnamn
        } else if (name.includes(search)) {
            priority = 1; // Del av ortsnamnet
        } else if (municipality.includes(search)) {
            priority = 2; // Kommun
        }

        return { location, priority };
    })
    .filter(result => result.priority < 3)
    .sort((a, b) =>
        a.priority - b.priority ||
        a.location.name.localeCompare(b.location.name, "sv")
    )
    .slice(0, 10);

    cityResults!.innerHTML = results
    .map(({ location, priority }) => {
        const name = priority === 3
            ? `${location.name} (${location.municipality}, ${location.county} län)`
            : formatCity(location);

        return `
            <li>
                <button
                    class="city-result"
                    data-lat="${location.lat}"
                    data-lon="${location.lon}"
                    data-name="${name}"
                >
                    ${name}
                </button>
            </li>
        `;
    })
    .join("");
});

cityResults?.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement)
        .closest<HTMLButtonElement>(".city-result");

    if (!button) return;

    const name = button.dataset.name!;
    const lat = Number(button.dataset.lat);
    const lon = Number(button.dataset.lon);

    console.log("Vald ort:", name);
    console.log("Koordinater:", lat, lon);

    localStorage.setItem("location", "city");
    localStorage.setItem("cityName", name);
    localStorage.setItem("lat", lat.toString());
    localStorage.setItem("long", lon.toString());

    locationDialog?.close();
    printLocationInfo("city", lat, lon);
    getWeather(lat, lon);
    scheduleWeatherUpdate(lat, lon);
});

}

function printLocationInfo(type: "city" | "Manual" | "GPS", lat: number, lon: number) {
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    switch (type) {
        
        case "city":
            const cityName = localStorage.getItem("cityName");
            if (locationElm) {
            locationElm.innerHTML = `
            <span>Du befinner dig i: ${cityName}</span><br/>
            <span>Väder räknat från: ${lat}, ${lon}</span><br/>
            <a href="${mapsUrl}" target="_blank">Visa på karta</a>
            <button id="chooseLocation">Byt plats</button>`;
            }
            break;
        case "Manual":
            const manualCity = localStorage.getItem("cityName");
            if (locationElm) {
                locationElm.innerHTML = `
            <span>Väder räknat från: ${lat}, ${lon}</span><br/>
            <span>I närheten av: ${manualCity}</span><br/>
            <a href="${mapsUrl}" target="_blank">Visa på karta</a>
            <button id="chooseLocation">Byt plats</button>`;
             }
            break;
           
        case "GPS":
            const accuracy = localStorage.getItem("accuracy");
            const gpsCity = localStorage.getItem("cityName");

            if (locationElm) {
                locationElm.innerHTML = `
            <span>Väder räknat från: ${lat}, ${lon}</span><br/>
            <span>I närheten av: ${gpsCity}</span><br/>
            <span>Platsens osäkerhet: ${formatAccuracy(Number(accuracy))}</span><br/>
            <a href="${mapsUrl}" target="_blank">Visa på karta</a>
            <button id="chooseLocation">Byt plats</button>`;
           }
            break;
    }
    const chooseLocationButton = document.querySelector<HTMLButtonElement>("#chooseLocation");
    chooseLocationButton?.addEventListener("click", () => {
        showLocationPicker();
    });

}
   
function showCoordinatePicker(
    locationDialog: HTMLDialogElement | null =
        document.querySelector<HTMLDialogElement>("#location-dialog")
) {
    if (locationDialog) {
        locationDialog.innerHTML = `
            <div id="coordinate-picker">
                <h2>Ange koordinater</h2>
                <p><strong>Hitta koordinater med mobilen</strong></p>
                <ol>
                    <li>Öppna Google Maps på din mobil.</li>
                    <li>Tryck och håll på din plats på kartan för att placera en nål.</li>
                    <li>Leta upp koordinaterna i det övre sökfältet.</li>
                    <li>Skriv sedan in dem i fälten nedan.</li>
                </ol>
                <label for="latitude">Latitud</label>
                <input
                    type="number"
                    id="latitude"
                    placeholder="59.8586"
                    step="any"
                >
                <br/>
                <label for="longitude">Longitud</label>
                <input
                    type="number"
                    id="longitude"
                    placeholder="17.6389"
                    step="any"
                >

                <button id="use-coordinates">
                    Använd koordinater
                </button>

                <button id="back-to-location">
                    ← Tillbaka
                </button>
            </div>
        `;
    }
    
    const useCoordinatesButton =
    document.querySelector<HTMLButtonElement>("#use-coordinates");

useCoordinatesButton?.addEventListener("click", () => {
    const latInput =
        document.querySelector<HTMLInputElement>("#latitude");

    const lonInput =
        document.querySelector<HTMLInputElement>("#longitude");

    if (!latInput || !lonInput) {
        console.error("Kunde inte hitta koordinatfälten.");
        return;
    }

    const lat = Number(latInput?.value);
    const lon = Number(lonInput?.value);

    if (!isValidCoordinates(lat, lon)) {
        console.error("Ogiltiga koordinater.");
        return;
    }

    localStorage.setItem("location", "manual");
    localStorage.setItem("latitude", lat.toString());
    localStorage.setItem("longitude", lon.toString());

    const location = findNearestLocation(lat, lon);
    localStorage.setItem("cityName", formatCity(location));

    locationDialog?.close();

    printLocationInfo("Manual", lat, lon);
    getWeather(lat, lon);
    scheduleWeatherUpdate(lat, lon);
});

    const backToLocationButton =
        document.querySelector<HTMLButtonElement>("#back-to-location");

    backToLocationButton?.addEventListener("click", () => {
        locationDialog?.close();
        showLocationPicker();
    });
}


function isValidCoordinates(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}
    
function findNearestLocation(lat: number, lon: number): Location {
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

function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}


function printWeatherForecast(
    today: DayForecast | undefined,
    nextMorning: MorningForecast | undefined
) {
    const weatherElm =
        document.querySelector<HTMLElement>("#weather-forecast");

    if (!weatherElm) return;

    const formatTemperature = (temperature: number) =>
        temperature.toLocaleString("sv-SE", {
            maximumFractionDigits: 1,
        });

    weatherElm.innerHTML = `
        <section class="today-forecast">
            <h2>Idag${today ? ` – ${today.date}` : ""}</h2>

            ${
                today
                    ? `
                        <p>
                            Temperaturspann:
                            ${formatTemperature(today.minTemperature)}–${formatTemperature(today.maxTemperature)} °C
                        </p>

                        <h3>Prognos under dagen</h3>

                        <ul>
                            ${today.hours.map(point => `
                                <li>
                                    ${formatSwedishTime(point.time)}
                                    – ${formatTemperature(point.data.air_temperature)} °C
                                </li>
                            `).join("")}
                        </ul>
                    `
                    : "<p>Ingen prognos tillgänglig för idag.</p>"
            }
        </section>

        <section class="morning-forecast">
            <h2>
                Nästa morgon${nextMorning ? ` – ${nextMorning.date}` : ""}
            </h2>

            ${
                nextMorning
                    ? `
                        <ul>
                            ${nextMorning.hours.map(point => `
                                <li>
                                    ${formatSwedishTime(point.time)}
                                    – ${formatTemperature(point.data.air_temperature)} °C
                                </li>
                            `).join("")}
                        </ul>
                    `
                    : "<p>Ingen morgonprognos tillgänglig.</p>"
            }
        </section>
    `;
}

async function getWeather(lat: number, lon: number) {
    const url = `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/${lon}/lat/${lat}/data.json`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`SMHI request failed: ${response.status}`);
        }

        const data = await response.json();
        const days = buildDayForecasts(data);
        const mornings = buildMorningForecasts(days);

        const today = getTodayForecast(days);
        const nextMorning = getNextMorningForecast(mornings);

        printWeatherForecast(today, nextMorning);
    
        return data;
        } catch (error) {
        console.error("Kunde inte hämta väderdata:", error);
    }
}


function formatCity(place: Location): string {
    if ( !place.municipality || place.name === place.municipality )
    {
    return place.name;
    }
    return `${place.name} (${place.municipality})`;
}

function scheduleWeatherUpdate(lat: number, lon: number) {
    const now = new Date();
    const nextHour = new Date(now);

    nextHour.setHours(now.getHours() + 1, 0, 0, 0);

    const delay = nextHour.getTime() - now.getTime();

    setTimeout(async () => {
        await getWeather(lat, lon);
        scheduleWeatherUpdate(lat, lon);
    }, delay);
}
