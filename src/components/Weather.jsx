import React, { useState } from "react";
import axios from "axios";
import "../styles/Weather.css";
import background from "../images/img.jpg";

function Weather() {
  // State variables
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [temperatureUnit, setTemperatureUnit] = useState("Celsius");
  const [showForecast, setShowForecast] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const apiKey = process.env.REACT_APP_API_KEY;

  // Function to toggle temperature unit between Celsius and Fahrenheit
  const toggleTemperatureUnit = () => {
    if (temperatureUnit === "Celsius") {
      setTemperatureUnit("Fahrenheit");
    } else {
      setTemperatureUnit("Celsius");
    }
  };

  // Event handler for location input field change
  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  // Event handler to fetch current weather data
  const handleGetWeather = () => {
    if (location) {
      setShowWeather(true);
      setShowForecast(false);
      setLoading(true);
      setError("");
      // Fetch current weather data from the API
      axios
        .get(`${apiUrl}/weather?q=${location}&units=metric&appid=${apiKey}`)
        .then((response) => {
          setWeatherData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching weather data:", error);
          setError("Location not found. Please try again.");
          setLoading(false);
        });
    } else {
      setError("Please enter the location.");
      setLoading(false);
    }
  };

  // Event handler to fetch 3-day weather forecast data
  const handleGetForecast = () => {
    if (location) {
      setShowWeather(false);
      setShowForecast(true);
      setLoading(true);
      setError("");
      // Fetch 3-day weather forecast data from the API
      axios
        .get(
          `${apiUrl}/forecast?q=${location}&units=metric&cnt=18&appid=${apiKey}`
        )
        .then((response) => {
          const dailyForecastData = filterDailyForecast(response.data.list);
          setForecastData(dailyForecastData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching forecast data:", error);
          setError("Error fetching forecast data. Please try again.");
          setLoading(false);
          setShowForecast(false);
          setForecastData([]); // Clear forecast data on error
        });
    } else {
      setError("Please enter the location.");
      setShowForecast(false);
    }
  };

  // Function to filter and return daily forecast data
  function filterDailyForecast(forecastList) {
    const dailyForecast = [];
    const seenDates = {};

    for (const entry of forecastList) {
      const date = entry.dt_txt.split(" ")[0];

      if (!seenDates[date]) {
        dailyForecast.push(entry);
        seenDates[date] = true;
      }
    }
    return dailyForecast;
  }

  return (
    <div style={{ backgroundImage: `url(${background})` }}>
      <div className="weather-container">
        <h1>Weather Dashboard</h1>
        <form onSubmit={(event) => event.preventDefault()}>
          <input
            type="text"
            placeholder="Enter city or zip code"
            value={location}
            onChange={handleLocationChange}
            className="input-field"
          />
          <button onClick={handleGetWeather} className="btn btn-primary">
            Get Weather
          </button>
          <button onClick={handleGetForecast} className="btn btn-secondary">
            Get 3-Day Weather Forecast
          </button>
        </form>
        {loading ? (
          <p className="loading">Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          weatherData != null &&
          showWeather && (
            <div className="weather-data">
              <h2>
                {weatherData.name}, {weatherData.sys.country}
              </h2>
              <p>
                Current Temperature:{" "}
                {temperatureUnit === "Celsius"
                  ? `${weatherData.main.temp}°C`
                  : `${(weatherData.main.temp * 9) / 5 + 32}°F`}
              </p>
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>Wind Speed: {weatherData.wind.speed} m/s</p>
              <img
                src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`}
                alt={weatherData.weather[0].description}
              />
              <p>Weather: {weatherData.weather[0].description}</p>
            </div>
          )
        )}
        {showForecast && (
          <div className="forecast">
            <h3>3 Days Weather Forecast</h3>
            {forecastData.length > 0 ? (
              forecastData.map((forecast, index) => (
                <div key={index} className="forecast-item">
                  <div className="day-data">
                    <p>Date: {forecast.dt_txt}</p>
                    <p>
                      High:{" "}
                      {temperatureUnit === "Celsius"
                        ? `${forecast.main.temp_max}°C`
                        : `${(forecast.main.temp_max * 9) / 5 + 32}°F`}
                    </p>
                    <p>
                      Low:{" "}
                      {temperatureUnit === "Celsius"
                        ? `${forecast.main.temp_min}°C`
                        : `${(forecast.main.temp_min * 9) / 5 + 32}°F`}
                    </p>
                    <img
                      src={`http://openweathermap.org/img/w/${forecast.weather[0].icon}.png`}
                      alt={forecast.weather[0].description}
                    />
                    <p>Weather: {forecast.weather[0].description}</p>
                  </div>
                  {index < forecastData.length - 1 && (
                    <hr className="separator" />
                  )}
                </div>
              ))
            ) : (
              <p className="">Loading...</p>
            )}
          </div>
        )}
        <button onClick={toggleTemperatureUnit} className="btn btn-toggle">
          Toggle Temperature Unit ({temperatureUnit})
        </button>
      </div>
    </div>
  );
}

export default Weather;
