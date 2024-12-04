require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather";

router.get('/', async (req, res) => {
  const location = req.query.location;

  if (!location) {
    return res.render('index', {
      user: req.user,
      title: 'Home',
      location: ''
    });
  }

  try {
    const weatherResponse = await axios.get(WEATHER_URL, {
      params: {
        q: location,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });

    const weatherData = weatherResponse.data;

    res.render('index', {
      title: 'Home',
      user: req.user,
      weather: weatherData,
      location: location
    });
  } catch (error) {
    res.render('index', {
      title: 'Home',
      user: req.user,
      error: 'Unable to fetch weather data. Please try again later.',
      location: location
    });
  }
});

module.exports = router;