/** @format */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import WeatherIcon from "@/components/WeatherIcon";
import WeatherDetails from "@/components/WeatherDetails";
import ForecastWeatherDetail from "@/components/ForcastWeatherDetails";
import { format, fromUnixTime, parseISO } from "date-fns";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelcius";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import { metersToKilometers } from "@/utils/metersToKilometers";
import { convertWindSpeed } from "@/utils/convertWindSpeed";

interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export default function Home() {
  const [place, setPlace] = useState("London");
  const [loadingCity, setLoadingCity] = useState(false);
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=57c094cd0d9cacd1bd7cc92fe670fdca&cnt=56`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [place]);

  const firstData = data?.list[0];

  const uniqueDates = [
    ...new Set(
      data?.list.map((entry) =>
        new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    ),
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce text-4xl text-blue-500">Loading...</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 bg-gradient-to-r from-gray-800 via-gray-900 to-black min-h-screen text-black dark:text-white">
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {loadingCity ? (
          <WeatherSkeleton />
        ) : (
          <>
            <section className="space-y-6">
              <div className="space-y-4 text-center">
                <h2 className="text-4xl font-bold">
                  {format(parseISO(firstData?.dt_txt ?? ""), "EEEE")}
                </h2>
                <p className="text-xl text-black">
                  {format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yyyy")}
                </p>
              </div>
              <Container className="flex flex-col items-center gap-4 text-black ">
                <div className="text-7xl text-blue-300">
                  {convertKelvinToCelsius(firstData?.main.temp ?? 296.37)}°
                </div>
                <div className="flex gap-10 justify-center">
                  <WeatherIcon
                    iconName={getDayOrNightIcon(
                      firstData?.weather[0].icon,
                      firstData?.dt_txt
                    )}
                  />
                  <div className="flex flex-col text-center">
                    <p className="text-lg">
                      {convertKelvinToCelsius(
                        firstData?.main.feels_like ?? 0
                      )}
                      ° Feels like
                    </p>
                    <p className="text-lg">
                      {convertKelvinToCelsius(firstData?.main.temp_min ?? 0)}° ↓{" "}
                      {convertKelvinToCelsius(firstData?.main.temp_max ?? 0)}° ↑
                    </p>
                  </div>
                </div>
              </Container>
              <Container className="flex justify-around bg-yellow-500/80 dark:bg-yellow-600/80 px-6 gap-4 ">
                <WeatherDetails
                  visability={metersToKilometers(
                    firstData?.visibility ?? 10000
                  )}
                  airPressure={`${firstData?.main.pressure} hPa`}
                  humidity={`${firstData?.main.humidity}%`}
                  sunrise={format(
                    fromUnixTime(data?.city.sunrise ?? 1702949452),
                    "H:mm"
                  )}
                  sunset={format(
                    fromUnixTime(data?.city.sunset ?? 1702517657),
                    "H:mm"
                  )}
                  windSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
                />
              </Container>
            </section>
            <section className="flex flex-col gap-4">
              <p className="text-3xl text-center text-gray-400">Forecast (next 5 days)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-black">
                {firstDataForEachDate.map((d, i) => (
                  <ForecastWeatherDetail
                    key={i}
                    description={d?.weather[0].description ?? ""}
                    weatehrIcon={d?.weather[0].icon ?? "01d"}
                    date={d ? format(parseISO(d.dt_txt), "dd.MM") : ""}
                    day={d ? format(parseISO(d.dt_txt), "EEEE") : ""}
                    feels_like={d?.main.feels_like ?? 0}
                    temp={d?.main.temp ?? 0}
                    temp_max={d?.main.temp_max ?? 0}
                    temp_min={d?.main.temp_min ?? 0}
                    airPressure={`${d?.main.pressure} hPa `}
                    humidity={`${d?.main.humidity}% `}
                    sunrise={format(
                      fromUnixTime(data?.city.sunrise ?? 1702517657),
                      "H:mm"
                    )}
                    sunset={format(
                      fromUnixTime(data?.city.sunset ?? 1702517657),
                      "H:mm"
                    )}
                    visability={`${metersToKilometers(
                      d?.visibility ?? 10000
                    )} `}
                    windSpeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)} `}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <section className="space-y-8">
      <div className="space-y-2 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="h-24 w-full bg-gray-300 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
}
