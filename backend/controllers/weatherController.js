const fetch = require('node-fetch');

exports.getWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(400).json({ message: data.message });
    }

    const suggestions = [];
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const weatherMain = data.weather[0].main;
    const rain = data.rain ? data.rain['1h'] || data.rain['3h'] || 0 : 0;

    if (rain > 0 || weatherMain === 'Rain' || weatherMain === 'Drizzle') {
      suggestions.push('Carry Umbrella');
    }
    if (temp > 30) {
      suggestions.push('Carry Water Bottle');
      suggestions.push('Stay Hydrated');
    }
    if (temp < 15) {
      suggestions.push('Carry Jacket');
    }
    if (humidity > 70) {
      suggestions.push('High Humidity - Stay Hydrated');
    }
    if (weatherMain === 'Clear' && temp > 20 && temp < 30) {
      suggestions.push('Perfect Weather for Travel');
    }

    res.json({
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      weather: data.weather[0],
      windSpeed: data.wind.speed,
      rain,
      visibility: data.visibility,
      name: data.name,
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
