let apiKey = "a9b525cfaeea4a0447315d17428bd246";
let searchButton = document.querySelector("#Search-button");
let cityNameElement = document.querySelector("#city-name");
let temperatureElement = document.querySelector("#temperature");
let windElement = document.querySelector("#wind");
let precipitationElement = document.querySelector("#precipitation");
let weatherDescriptionElement = document.querySelector("#weather-description");
let humidityElement = document.querySelector("#humidity");

function getWeatherData(cityName, apiKey, callback) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

  function handleResponse(response) {
    let weatherData = {
      cityName: cityName,
      temperature: Math.round(response.data.main.temp),
      wind: response.data.wind.speed,
      precipitation: response.data.rain
        ? response.data.rain["1h"] || "0mm"
        : "0mm",
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
    };
    callback(null, weatherData);
  }

  function handleError(error) {
    callback(
      `Failed to fetch weather data for ${cityName}. Please try again later.`,
      null
    );
  }

  axios
    .get(apiUrl)
    .then(function (response) {
      handleResponse(response);
    })
    .catch(function (error) {
      handleError(error);
    });
}

function updateWeatherUI(weatherData) {
  cityNameElement.textContent = weatherData.cityName;
  temperatureElement.textContent = `${Math.round(weatherData.temperature)}°C`;
  windElement.textContent = `${weatherData.wind} km/h`;
  weatherDescriptionElement.textContent = weatherData.description;
  precipitationElement.textContent = weatherData.precipitation;
  humidityElement.textContent = `${weatherData.humidity}%`;
}

function getWeeklyWeatherData(cityName, apiKey, callback) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

  axios
    .get(apiUrl)
    .then(function (response) {
      callback(null, response.data.list);
    })
    .catch(function (error) {
      callback(
        `Failed to fetch weather data for ${cityName}. Please try again later.`,
        null
      );
    });
}

function updateWeeklyWeatherUI(weatherDataList) {
  let weeklyWeatherElement = document.querySelector(".weather-row");

  weeklyWeatherElement.innerHTML = ""; // Clear existing content

  let dailyWeatherData = {};

  weatherDataList.forEach((weatherData) => {
    let date = new Date(weatherData.dt * 1000); // Convert timestamp to Date
    let day = date.toLocaleDateString("en-US", { day: "numeric" });

    // Check if we already have weather data for this day
    if (!dailyWeatherData[day]) {
      dailyWeatherData[day] = weatherData;
    } else {
      // Compare temperatures and keep the forecast with the highest temperature (assuming it's the daytime forecast)
      if (weatherData.main.temp_max > dailyWeatherData[day].main.temp_max) {
        dailyWeatherData[day] = weatherData;
      }
    }
  });

  // Create and add weather items for each day
  for (let day in dailyWeatherData) {
    let date = new Date(dailyWeatherData[day].dt * 1000);
    let dayOfWeek = date.toLocaleDateString("en-US", {
      weekday: "short",
    });
    let iconCode = dailyWeatherData[day].weather[0].icon;
    let temperature = Math.round(dailyWeatherData[day].main.temp);
    let minTemp = Math.round(dailyWeatherData[day].main.temp_min);
    let maxTemp = Math.round(dailyWeatherData[day].main.temp_max);

    let weatherItem = document.createElement("div");
    weatherItem.className = "col";
    weatherItem.innerHTML = `
      <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="Weather Icon" /><br />
      ${dayOfWeek}<br />
      ${temperature}°/${minTemp}°
    `;

    weeklyWeatherElement.appendChild(weatherItem);
  }
}

function getWeather(event) {
  event.preventDefault();

  let searchInput = document.querySelector("#searchExample");
  let cityName = searchInput.value.trim();

  if (cityName === "") {
    alert("Please enter a city name.");
    return false;
  }

  getWeatherData(cityName, apiKey, function (error, weatherData) {
    if (error) {
      alert(error);
    } else {
      updateWeatherUI(weatherData);
    }
  });

  getWeeklyWeatherData(cityName, apiKey, function (error, weeklyWeatherData) {
    if (error) {
      alert(error);
    } else {
      updateWeeklyWeatherUI(weeklyWeatherData);
    }
  });

  return false;
}

searchButton.addEventListener("click", getWeather);

// .today-temperature {
//   font-size: 30px;
//   color: rgb(15, 15, 15);
//   font-weight: bold;
// }

// .weekly-temperature {
//   color: rgb(226, 42, 42);
//   font-size: 25px;
//   font-weight: bold;
// }
