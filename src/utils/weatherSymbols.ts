import clearDay from "@meteocons/svg/fill/clear-day.svg?url";
import clearNight from "@meteocons/svg/fill/clear-night.svg?url";
import partlyCloudyDay from "@meteocons/svg/fill/partly-cloudy-day.svg?url";
import partlyCloudyNight from "@meteocons/svg/fill/partly-cloudy-night.svg?url";
import overcastDay from "@meteocons/svg/fill/overcast-day.svg?url";
import overcastNight from "@meteocons/svg/fill/overcast-night.svg?url";
import overcast from "@meteocons/svg/fill/overcast.svg?url";
import fogDay from "@meteocons/svg/fill/fog-day.svg?url";
import fogNight from "@meteocons/svg/fill/fog-night.svg?url";
import partlyCloudyDayRain from "@meteocons/svg/fill/partly-cloudy-day-rain.svg?url";
import partlyCloudyNightRain from "@meteocons/svg/fill/partly-cloudy-night-rain.svg?url";
import thunderstormsDayRain from "@meteocons/svg/fill/thunderstorms-day-rain.svg?url";
import thunderstormsNightRain from "@meteocons/svg/fill/thunderstorms-night-rain.svg?url";
import partlyCloudyDaySleet from "@meteocons/svg/fill/partly-cloudy-day-sleet.svg?url";
import partlyCloudyNightSleet from "@meteocons/svg/fill/partly-cloudy-night-sleet.svg?url";
import partlyCloudyDaySnow from "@meteocons/svg/fill/partly-cloudy-day-snow.svg?url";
import partlyCloudyNightSnow from "@meteocons/svg/fill/partly-cloudy-night-snow.svg?url";
import drizzle from "@meteocons/svg/fill/drizzle.svg?url";
import rain from "@meteocons/svg/fill/rain.svg?url";
import thunderstormsRain from "@meteocons/svg/fill/thunderstorms-rain.svg?url";
import sleet from "@meteocons/svg/fill/sleet.svg?url";
import snow from "@meteocons/svg/fill/snow.svg?url";
import notAvailable from "@meteocons/svg/fill/not-available.svg?url";
import { isNight } from "./sun.ts";

const iconUrls: Record<string, string> = {
    "clear-day": clearDay,
    "clear-night": clearNight,
    "partly-cloudy-day": partlyCloudyDay,
    "partly-cloudy-night": partlyCloudyNight,
    "overcast-day": overcastDay,
    "overcast-night": overcastNight,
    "overcast": overcast,
    "fog-day": fogDay,
    "fog-night": fogNight,
    "partly-cloudy-day-rain": partlyCloudyDayRain,
    "partly-cloudy-night-rain": partlyCloudyNightRain,
    "thunderstorms-day-rain": thunderstormsDayRain,
    "thunderstorms-night-rain": thunderstormsNightRain,
    "partly-cloudy-day-sleet": partlyCloudyDaySleet,
    "partly-cloudy-night-sleet": partlyCloudyNightSleet,
    "partly-cloudy-day-snow": partlyCloudyDaySnow,
    "partly-cloudy-night-snow": partlyCloudyNightSnow,
    "drizzle": drizzle,
    "rain": rain,
    "thunderstorms-rain": thunderstormsRain,
    "sleet": sleet,
    "snow": snow,
    "not-available": notAvailable
};


export function getSmhiIconName(symbolCode: number, isNight = false) {
  const time = isNight ? 'night' : 'day';

  const map: Record<number, string> = {
    1: `clear-${time}`,                      // Klart
    2: `partly-cloudy-${time}`,              // Lätt molnighet
    3: `partly-cloudy-${time}`,              // Halvklart
    4: `overcast-${time}`,                   // Molnigt
    5: 'overcast',                           // Mycket moln
    6: 'overcast',                           // Mulet
    7: `fog-${time}`,                        // Dimma
    8: `partly-cloudy-${time}-rain`,         // Lätt regnskur
    9: `partly-cloudy-${time}-rain`,         // Regnskur
    10: `partly-cloudy-${time}-rain`,        // Kraftig regnskur
    11: `thunderstorms-${time}-rain`,        // Åskskur
    12: `partly-cloudy-${time}-sleet`,        // Lätt by av regn och snö
    13: `partly-cloudy-${time}-sleet`,        // By av regn och snö
    14: `partly-cloudy-${time}-sleet`,        // Kraftig by av regn och snö
    15: `partly-cloudy-${time}-snow`,         // Lätt snöby
    16: `partly-cloudy-${time}-snow`,         // Snöby
    17: `partly-cloudy-${time}-snow`,         // Kraftig snöby
    18: 'drizzle',                           // Lätt regn
    19: 'rain',                              // Regn
    20: 'rain',                              // Kraftigt regn (alt. 'extreme-rain')
    21: 'thunderstorms-rain',                // Åska
    22: 'sleet',                             // Lätt snöblandat regn
    23: 'sleet',                             // Snöblandat regn
    24: 'sleet',                             // Kraftigt snöblandat regn
    25: 'snow',                              // Lätt snöfall
    26: 'snow',                              // Snöfall
    27: 'snow'                               // Kraftigt snöfall (alt. 'extreme-snow')
  };

  return map[symbolCode] || 'not-available';
}

export function getWeatherIcon(
    symbolCode: number,
    time: Date
): string {
    const iconName = getSmhiIconName(symbolCode, isNight(time));
    const iconUrl = iconUrls[iconName]  ?? notAvailable;

    const description = getWeatherDescription(symbolCode);

    return `
    <div class="weatherIconWrap">
    <span class="weatherIconDesc">${description}</span>
    <img src="${iconUrl}" alt="${description} icon" class="weatherIcon" />
    </div>
    `;
}


export function getWeatherDescription(symbolCode: number): string {
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
    return "default";
}