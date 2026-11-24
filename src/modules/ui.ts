import { locations } from "../data/locations.ts";
import type { Location, WeatherPoint, DayForecast, MorningForecast  } from "../types.ts";
import { getWeather, scheduleWeatherUpdate } from "./weather.ts";
import { useLocationClick, findNearestLocation, formatAccuracy, isValidCoordinates } from "./location";
import { formatSwedishWeekday, formatSwedishTime } from "../utils/forecast.ts";
import { getWeatherIcon } from "../utils/weatherSymbols.ts";

export function showLocationPicker() {
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

export function showCityPicker(locationDialog: HTMLDialogElement | null = document.querySelector<HTMLDialogElement>("#location-dialog")) {
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

export function showCoordinatePicker(
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
}

export function printLocationInfo(type: "city" | "Manual" | "GPS", lat: number, lon: number) {
    const locationElm = document.querySelector<HTMLDivElement>("#location");
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


export function printWeatherForecast(
    today: DayForecast | undefined,
    dayOverview: WeatherPoint[] | undefined,
    nextMorning: MorningForecast | undefined
) {
    const weatherElm =
        document.querySelector<HTMLElement>("#weather-forecast");

    if (!weatherElm) return;
    console.log("Today's forecast:", today);
    
    const formatTemperature = (temperature: number) =>
        temperature.toLocaleString("sv-SE", {
            maximumFractionDigits: 1,
        });

    weatherElm.innerHTML = `
        <section class="todays-forecast">
        <div class="nowSection">
        <h2>Idag${today ? ` – ${formatSwedishWeekday(today.date)}` : ""}</h2>
        ${today? `
        <div class="nowIcon"><p>Icon: ${getWeatherIcon(today.hours[0].data.symbol_code)}</p></div>
        <p class="nowTemp">${formatTemperature(today.hours[0].data.air_temperature)} °C - ${getWeatherIcon(today.hours[0].data.symbol_code)}</p>
        </div>
        <div class ="nowDetails">
        <p class="nowTempRange">${formatTemperature(today.minTemperature)}–${formatTemperature(today.maxTemperature)} °C</p>
        <p>Vind: ${today.hours[0].data.wind_speed} m/s, Gust: ${today.hours[0].data.wind_speed_of_gust}m/s</p>
        <p>Nederbörd: ${today.hours[0].data.precipitation_amount_mean} mm</p>
        </div>

        <h3>Prognos under dagen</h3>
            <ul class="todays-forecast-list">
            ${dayOverview?.map(point => `
            <li>
            <p>${formatSwedishTime(point.time)} | Icon:${point.data.symbol_code}</p>
            <p>${formatTemperature(point.data.air_temperature)} °C – ${getWeatherIcon(point.data.symbol_code)}</p>
            </li>
            `).join("")}
            </ul>
            `
        : "<p>Ingen prognos tillgänglig för idag.</p>"
            }
        </section>

        <section class="morning-forecast">
            <h2>
                Imorgon ${nextMorning ? ` – ${formatSwedishWeekday(nextMorning.date)}` : ""}
            </h2>

            ${
                nextMorning
                    ? `
                        <ul class="tomorrow-forecast-list">
                            ${nextMorning.hours.map(point => `
                                <li>
                                    <p>${formatSwedishTime(point.time)}
                                    – ${formatTemperature(point.data.air_temperature)} °C</p>
                                    <p>Symbol code: ${point.data.symbol_code} – ${getWeatherIcon(point.data.symbol_code)}</p>
                                </li>
                            `).join("")}
                        </ul>
                    `
                    : "<p>Ingen morgonprognos tillgänglig.</p>"
            }
        </section>
    `;
}


const useCoordinatesButton =
document.querySelector<HTMLButtonElement>("#use-coordinates");

useCoordinatesButton?.addEventListener("click", () => {
    const locationDialog = document.querySelector<HTMLDialogElement>("#location-dialog");
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

export function formatCity(place: Location): string {
    if ( !place.municipality || place.name === place.municipality )
    {
    return place.name;
    }
    return `${place.name} (${place.municipality})`;
}