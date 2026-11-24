import locationsData from "./svenska-orter.json";
import type { Location } from "../types.ts";

export const locations: Location[] = locationsData.map(location => ({
    name: location.locality,
    municipality: location.municipality,
    county: location.county,
    lat: location.lat,
    lon: location.lon,
}));