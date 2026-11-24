
const temperatureIcon = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
<defs><style>.cls-1{fill:none;stroke:#020202;stroke-miterlimit:10;stroke-width:1.91px;}</style></defs>
<circle class="cls-1" cx="16.3" cy="3.89" r="0.48"/>
<circle class="cls-1" cx="6.27" cy="17.73" r="0.95"/>
<path class="cls-1" d="M10.09,14.89V5.32a3.82,3.82,0,0,0-7.64,0v9.57a4.77,4.77,0,1,0,8.6,2.84A4.74,4.74,0,0,0,10.09,14.89Z"/>
<line class="cls-1" x1="6.27" y1="10.09" x2="6.27" y2="16.77"/><line class="cls-1" x1="10.09" y1="6.27" x2="12.95" y2="6.27"/>
<line class="cls-1" x1="10.09" y1="10.09" x2="12.95" y2="10.09"/><line class="cls-1" x1="10.09" y1="13.91" x2="12.95" y2="13.91"/>
<path class="cls-1" d="M22.5,10.09A1.9,1.9,0,0,1,20.59,12h0a1.91,1.91,0,0,1-1.91-1.91V7.23a1.91,1.91,0,0,1,1.91-1.91h0A1.9,1.9,0,0,1,22.5,7.23"/></svg>`

const rainIcon = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="100%"
  height="100%"
>
  <path
  d="M13.6,16.77h4.6a4.3,4.3,0,1,0,0-8.59h-.56a6,6,0,0,0,.09-.95,5.73,5.73,0,0,0-11.46,0,4.77,4.77,0,0,0,0,9.54H10.4"
  fill="none"
  stroke="#64748b"
  stroke-width="1.91"
  stroke-linecap="round"
  stroke-linejoin="round"
  />
  <path
    d="M14.86,19.64a2.86,2.86,0,0,1-5.72,0c0-1.91,2.86-4.78,2.86-4.78S14.86,17.73,14.86,19.64Z"
    fill="none"
    stroke="#38bdf8"
    stroke-width="1.91"
    stroke-linecap="round"
    stroke-linejoin="round"
  /></svg>`;

export function getWeatherIcon(symbolCode: number): string {
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
    return rainIcon;
}