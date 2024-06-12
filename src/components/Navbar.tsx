/** @format */
"use client";

import React, { useState, useEffect } from "react";
import {
  MdWbSunny,
  MdOutlineLocationOn,
  MdDarkMode,
  MdLightMode,
  MdMyLocation,
} from "react-icons/md";
import { TiWeatherSnow } from "react-icons/ti";
import axios from "axios";
import SearchBox from "./SearchBox";

type Props = { location?: string };

export default function Navbar({ location }: Props) {
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [place, setPlace] = useState<string | null>(null);
  const [loadingCity, setLoadingCity] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  async function handleInputChange(value: string) {
    setCity(value);
    if (value.length >= 3) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=57c094cd0d9cacd1bd7cc92fe670fdca`
        );

        const suggestions = response.data.list.map((item: any) => item.name);
        setSuggestions(suggestions);
        setError("");
        setShowSuggestions(true);
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handleSuggestionClick(value: string) {
    setCity(value);
    setShowSuggestions(false);
  }

  function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
    setLoadingCity(true);
    e.preventDefault();
    if (suggestions.length === 0) {
      setError("Location not found");
      setLoadingCity(false);
    } else {
      setError("");
      setTimeout(() => {
        setLoadingCity(false);
        setPlace(city);
        setShowSuggestions(false);
      }, 500);
    }
  }

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setLoadingCity(true);
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=57c094cd0d9cacd1bd7cc92fe670fdca`
          );
          setTimeout(() => {
            setLoadingCity(false);
            setPlace(response.data.name);
          }, 500);
        } catch (error) {
          setLoadingCity(false);
        }
      });
    }
  }

  return (
    <>
      <nav className="shadow-sm sticky top-0 left-0 z-50 bg-gray-900">
        <div className="h-[80px] w-full flex flex-col md:flex-row justify-between items-center max-w-7xl px-6 mx-auto">
          <div className="flex items-center gap-3 mb-2 md:mb-0">
            <TiWeatherSnow className="text-4xl text-yellow-300" />
            <h1 className="text-white text-3xl font-bold">WeatherNow</h1>
          </div>

          <section className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
            <div className="flex items-center gap-2 order-2 md:order-1">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="text-2xl text-gray-400 hover:opacity-80 cursor-pointer"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <MdLightMode /> : <MdDarkMode />}
              </button>
              <MdMyLocation
                title="Your Current Location"
                onClick={handleCurrentLocation}
                className="text-2xl text-gray-400 hover:opacity-80 cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1 text-white order-1 md:order-2">
              <MdOutlineLocationOn className="text-3xl" />
              <span className="text-lg">{location}</span>
            </div>
            <div className="relative order-3 w-full md:w-auto md:flex md:items-center">
              <SearchBox
                value={city}
                onSubmit={handleSubmitSearch}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <SuggestionBox
                showSuggestions={showSuggestions}
                suggestions={suggestions}
                handleSuggestionClick={handleSuggestionClick}
                error={error}
              />
            </div>
          </section>
        </div>
      </nav>
      <section className="flex max-w-7xl px-6 md:hidden mx-auto">
        <div className="relative w-full">
          <SearchBox
            value={city}
            onSubmit={handleSubmitSearch}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <SuggestionBox
            showSuggestions={showSuggestions}
            suggestions={suggestions}
            handleSuggestionClick={handleSuggestionClick}
            error={error}
          />
        </div>
      </section>
    </>
  );
}

function SuggestionBox({
  showSuggestions,
  suggestions,
  handleSuggestionClick,
  error,
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handleSuggestionClick: (item: string) => void;
  error: string;
}) {
  return (
    <>
      {((showSuggestions && suggestions.length > 1) || error) && (
        <ul className="mb-4 bg-white dark:bg-gray-800 absolute border top-[44px] left-0 border-gray-300 dark:border-gray-700 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2">
          {error && suggestions.length < 1 && (
            <li className="text-red-500 p-1"> {error}</li>
          )}
          {suggestions.map((item, i) => (
            <li
              key={i}
              onClick={() => handleSuggestionClick(item)}
              className="cursor-pointer p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
