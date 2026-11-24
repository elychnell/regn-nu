export type WeatherPoint = {
    time: string;
    data: {
        air_temperature: number;
        symbol_code: number;
        wind_speed: number;
        wind_speed_of_gust: number;
        wind_from_direction: number;
        precipitation_amount_mean: number;
        precipitation_amount_mean_deterministic: number;
        precipitation_amount_min: number;
        precipitation_amount_max: number;
        probability_of_precipitation: number;
        thunderstorm_probability: number;
        probability_of_frozen_precipitation: number;
        precipitation_frozen_part: number;
        predominant_precipitation_type_at_surface: number;
        cloud_area_fraction: number;
        relative_humidity: number;
    };
}

export type RainPeriod = {
    start: string;
    end: string;
    probability: number;
    precipitation: number;
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