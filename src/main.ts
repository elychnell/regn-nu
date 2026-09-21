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
if (locationElm) { locationElm.innerHTML = `<span>${locations[3].name}</span>`; }

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
            const { latitude, longitude } = position.coords;
            localStorage.setItem("location", "gps");
            locationDialog?.close();
            console.log('geolocation:', 'lat: ' + latitude + ', lon: ' + longitude);
            const location = locations.find(loc => loc.lat === latitude && loc.lon === longitude);
            if (location) {
                console.log('Ort:', location.name);
                localStorage.setItem("cityName", location.name);
            } else {
                console.log('Ort ej hittad i listan.');
            }
            // Hämta GPS väder här
        },
        () => {
            showCityPicker();
        }
    );
});

const chooseCityButton = document.querySelector<HTMLButtonElement>("#choose-city");
chooseCityButton?.addEventListener("click", () => {
    showCityPicker();
});

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
    localStorage.setItem("latitude", lat.toString());
    localStorage.setItem("longitude", lon.toString());

    locationDialog?.close();

    // Hämta CITY PICKER väder här
});

}

/* Get the user's location */
export function getLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            resolve,
            reject
        );
    });
}

const position = await getLocation();
const { latitude, longitude } = position.coords;
console.log(latitude, longitude);
