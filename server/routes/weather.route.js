import express from "express";
import axios from "axios";

const router = express.Router();

// City → Coordinates
const getCoordinates = async (city) => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&language=en&format=json`;

  const { data } = await axios.get(url);

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }

  return {
    lat: data.results[0].latitude,
    lon: data.results[0].longitude,
    name: data.results[0].name,
    country: data.results[0].country,
  };
};

// Weather route
router.get("/", async (req, res) => {
  try {
    const city = req.query.city;
    const lang = req.query.lang || "en";

    // 1. Get coordinates
    const { lat, lon, name, country } = await getCoordinates(city);

    // 2. Get weather from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`;
    const { data } = await axios.get(weatherUrl);

    const weather = data.current_weather;

    // Humidity (hourly array se nearest hour)
    const nowHour = new Date().getUTCHours();
    const humidityIndex = data.hourly.time.indexOf(data.current_weather.time);
    const humidity =
      humidityIndex !== -1
        ? data.hourly.relativehumidity_2m[humidityIndex]
        : null;

    // Weather description (basic)
    let condition = "Clear";
    if (weather.weathercode >= 1 && weather.weathercode <= 3)
      condition = "Partly Cloudy";
    else if (weather.weathercode >= 45 && weather.weathercode <= 48)
      condition = "Foggy";
    else if (weather.weathercode >= 51 && weather.weathercode <= 67)
      condition = "Rainy";
    else if (weather.weathercode >= 71 && weather.weathercode <= 77)
      condition = "Snowy";
    else if (weather.weathercode >= 80 && weather.weathercode <= 82)
      condition = "Rain Showers";
    else if (weather.weathercode >= 95) condition = "Thunderstorm";

    // Day/Night detection (simplified)
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour <= 18;
    const dayNight = isDay ? "Day" : "Night";

    // Response text
    const responseText =
      lang === "hi"
        ? `${name}, ${country} में वर्तमान तापमान ${weather.temperature}°C है, हवा की गति ${weather.windspeed} km/h, नमी ${humidity}%, मौसम ${condition} और यह ${dayNight} है।`
        : `Currently in ${name}, ${country}, temperature is ${weather.temperature}°C, wind speed ${weather.windspeed} km/h, humidity ${humidity}%, condition is ${condition}, and it is ${dayNight}.`;

    res.json({
      type: "weather_show",
      city: name,
      country,
      temperature: weather.temperature,
      windspeed: weather.windspeed,
      humidity,
      condition,
      dayNight,
      response: responseText,
    });
  } catch (error) {
    console.error("Weather fetch error:", error.message);
    res.status(500).json({
      type: "weather_show",
      response:
        req.query.lang === "hi"
          ? "माफ़ कीजिए, मौसम fetch नहीं कर पाया।"
          : "Sorry, I couldn't fetch the weather right now.",
    });
  }
});

export default router;
