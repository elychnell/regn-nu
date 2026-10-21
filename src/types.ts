export type WeatherPoint = {
    time: string;
    data: {
        air_temperature: number;
        precipitation_amount_mean: number;
        symbol_code: string;
    };
}

export type DayForecast = {
    date: string;
    hours: WeatherPoint[];
    minTemperature: number;
    maxTemperature: number;
}

export type MorningForecast = {
    date: string;
    hours: WeatherPoint[];
};

export type WeatherResponse = {
    timeSeries: WeatherPoint[];
}

export type Location = {
    name: string;
    lat: number;
    lon: number;
    municipality?: string;
    locality?: string;
    county?: string;
}