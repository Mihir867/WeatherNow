/** @format */
"use client";

import React, { useState, useEffect } from "react";
import { MdWbSunny, MdDarkMode, MdLightMode, MdMyLocation, MdOutlineLocationOn } from "react-icons/md";
import { TiWeatherSnow } from "react-icons/ti";
import axios from "axios";

type Props = { location?: string };

export default function Navbar({ location }: Props) {
  const [loadingCity, setLoadingCity] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setLoadingCity(true);
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=c913f441399fb1486c5aaa5fedc3776a`
          );
          setTimeout(() => {
            setLoadingCity(false);
            // Handle the response to update the place
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

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-white">
              <MdOutlineLocationOn className="text-3xl" />
              <span className="text-lg">{location}</span>
            </div>
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
        </div>
      </nav>
    </>
  );
}
