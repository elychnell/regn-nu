import "./scss/style.scss";
import locationsData from "./data/svenska-orter.json"

/* Represents a location with a name and coordinates. */
interface Location {
    name: string;
    lat: number;
    lon: number;
}

/* Mapping the data to the Location interface */
const locations: Location[] = locationsData.map(location => ({
    name: location.locality,
    lat: location.lat,
    lon: location.lon
}));

const locationElm = document.querySelector<HTMLDivElement>("#location");

/* Open the location dialog when the page loads */
const locationDialog = document.querySelector<HTMLDialogElement>("#location-dialog");
const hasVisited = localStorage.getItem("hasVisited");

if (!hasVisited) {
    locationDialog?.showModal();
    localStorage.setItem("hasVisited", "true");
}

const useLocationButton = document.querySelector<HTMLButtonElement>("#use-location");

useLocationButton?.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy  } = position.coords;
            console.log("Accuracy:", accuracy);
            localStorage.setItem("location", "gps");
            localStorage.setItem("lat", latitude.toString());
            localStorage.setItem("long", longitude.toString());
            localStorage.setItem("accuracy", accuracy.toString());
            locationDialog?.close();
            if (accuracy <= 2000) {
            const location = findNearestLocation(latitude, longitude);
            localStorage.setItem("cityName", location.name);
            }
            const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

            console.log('geolocation:', 'lat: ' + latitude + ', lon: ' + longitude);

            if (locationElm) {
            locationElm.innerHTML = `<span>Väder räknat från: ${latitude}, ${longitude}</span>
                                     <span>Platsens osäkerhet: ${formatAccuracy(accuracy)}</span>
                                     <a href="${mapsUrl}" target="_blank">Visa på karta</a>
                                     <button id="chooseLocation">Byt plats</button>`;
            }
            // Hämta GPS väder här
            getWeather(latitude, longitude);
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
});

const chooseCityButton = document.querySelector<HTMLButtonElement>("#choose-city");
chooseCityButton?.addEventListener("click", () => {
    showCityPicker();
});

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
    locationDialog?.showModal();
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

    const results = locationsData
        .filter(location =>
            location.locality.toLowerCase().includes(search)
        )
        .slice(0, 10);

    cityResults!.innerHTML = results
        .map(location => `
            <li>
                <button
                    class="city-result"
                    data-lat="${location.lat}"
                    data-lon="${location.lon}"
                    data-name="${location.locality}"
                >
                    ${location.locality}
                </button>
            </li>
        `)
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

    // Hämta CITY PICKER väder här
    getWeather(lat, lon);
});

}

const enterCoordinatesButton =
    document.querySelector<HTMLButtonElement>("#enter-coordinates");

enterCoordinatesButton?.addEventListener("click", () => {
    showCoordinatePicker();
});

function showCoordinatePicker(
    locationDialog: HTMLDialogElement | null =
        document.querySelector<HTMLDialogElement>("#location-dialog")
) {
    if (locationDialog) {
        locationDialog.innerHTML = `
            <div id="coordinate-picker">
                <h2>Ange koordinater</h2>

                <label for="latitude">Latitud</label>
                <input
                    type="number"
                    id="latitude"
                    placeholder="59.8586"
                    step="any"
                >

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
    const latitudeInput =
        document.querySelector<HTMLInputElement>("#latitude");

    const longitudeInput =
        document.querySelector<HTMLInputElement>("#longitude");

    const latitude = Number(latitudeInput?.value);
    const longitude = Number(longitudeInput?.value);

    console.log("Manuella koordinater:", latitude, longitude);
});

    const backToLocationButton =
        document.querySelector<HTMLButtonElement>("#back-to-location");

    backToLocationButton?.addEventListener("click", () => {
        locationDialog?.close();
        locationDialog?.showModal();
    });
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

async function getWeather(lat: number, lon: number) {
    const url = `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/${lon}/lat/${lat}/data.json`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`SMHI request failed: ${response.status}`);
        }

        const data = await response.json();

        console.log("SMHI data:", data);

        return data;
    } catch (error) {
        console.error("Kunde inte hämta väderdata:", error);
    }
}