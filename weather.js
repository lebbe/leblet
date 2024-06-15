import { weatherApiKey } from "./secrets.js";

function round(value) {
  return Math.round(value * 10) / 10;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function return24HourTime(date) {
  return date.toLocaleTimeString("no-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function setupNow(weather) {
  function nå({
    icon,
    beskrivelse,
    temperatur,
    følesSom,
    nedbør,
    vind,
    soloppgang,
    solnedgang,
    luftfuktighet,
  }) {
    return `<div class="forecast">
	<div class="bilde">
	  <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${beskrivelse}">
	  <div>${beskrivelse}</div>
	</div>
	<div class="detaljer">
	  <div class="foreblokk">🌡️ ${round(temperatur)}°C (${round(følesSom)})</div>
	  <div class="foreblokk">🌧️ ${nedbør} mm</div>
	  <div class="foreblokk">🌬️ ${vind} m/s</div>
	  <div class="foreblokk">🌅 ${soloppgang}</div>
	  <div class="foreblokk">🌇 ${solnedgang}</div>
	  <div class="foreblokk">🌫️ ${luftfuktighet}%</div>
	</div>
	</div>`;
  }

  const nåElem = document.getElementById("nå");

  if (!(nåElem instanceof HTMLElement)) {
    throw new Error('Fant ikke elementet med id "nå"');
  }

  nåElem.innerHTML = nå({
    icon: weather.weather[0].icon,
    beskrivelse: capitalizeFirstLetter(weather.weather[0].description),
    temperatur: weather.main.temp,
    følesSom: weather.main.feels_like,
    nedbør: weather.rain ? weather.rain["1h"] : 0,
    vind: weather.wind.speed,
    soloppgang: new Date(weather.sys.sunrise * 1000).toLocaleTimeString(
      "no-NO"
    ),
    solnedgang: new Date(weather.sys.sunset * 1000).toLocaleTimeString("no-NO"),
    luftfuktighet: weather.main.humidity,
  });
}

async function setupForecast(weather, forecast) {
  const splitInDays = {};

  forecast.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString("no-NO");

    if (!splitInDays[date]) {
      splitInDays[date] = [];
    }

    splitInDays[date].push(item);
  });

  // Delete today
  delete splitInDays[new Date(weather.dt * 1000).toLocaleDateString("no-NO")];
  // Delete last day (because it might be incomplete)
  delete splitInDays[Object.keys(splitInDays).pop()];

  Object.keys(splitInDays).forEach(function summationOfDay(date) {
    const day = splitInDays[date];
    const sum = day.reduce(
      (acc, item) => {
        acc.temp += item.main.temp;
        acc.lowestTemp = Math.min(
          acc.lowestTemp || 1000,
          item.main.temp || 1000
        );
        acc.highestTemp = Math.max(
          acc.highestTemp || -1000,
          item.main.temp || -1000
        );
        acc.clouds += item.clouds.all;
        acc.windSpeed += item.wind.speed;
        acc.humidity += item.main.humidity;
        acc.rain += item.rain ? item.rain["3h"] : 0;
        acc.snow += item.snow ? item.snow["3h"] : 0;
        acc.icon = item.weather[0].icon.includes("n")
          ? acc.icon || item.weather[0].icon
          : item.weather[0].icon;
        return acc;
      },
      {
        temp: 0,
        feelsLike: 0,
        clouds: 0,
        windSpeed: 0,
        humidity: 0,
        rain: 0,
        snow: 0,
      }
    );

    const avg = {
      temp: sum.temp / day.length,
      clouds: sum.clouds / day.length,
      windSpeed: sum.windSpeed / day.length,
      humidity: sum.humidity / day.length,
      rain: sum.rain,
      snow: sum.snow,
      icon: sum.icon,
      beskrivelse: day[0].weather[0].description,
      lowestTemp: sum.lowestTemp,
      highestTemp: sum.highestTemp,
    };

    splitInDays[date] = avg;
  });

  function dag({
    datostreng,
    icon,
    beskrivelse,
    lavesteTemperatur,
    høyesteTemperatur,
    nedbør,
    vind,
    luftfuktighet,
  }) {
    return `<div class="weather">
	<h1>${datostreng}</h1>
	<div class="forecast">
	<div class="bilde">
	  <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${beskrivelse}">
	  <div>${beskrivelse}</div>
	</div>
	<div class="detaljer">
	  <div class="foreblokk">🌡️ ${round(lavesteTemperatur)} - ${round(
      høyesteTemperatur
    )}</div>
	  <div class="foreblokk">🌧️ ${round(nedbør)} mm</div>
	  <div class="foreblokk">🌬️ ${round(vind)} m/s</div>
	  <div class="foreblokk">🌫️ ${round(luftfuktighet)}%</div>
	</div>
	</div></div>`;
  }

  const daysElem = document.getElementById("dager");

  if (!(daysElem instanceof HTMLElement)) {
    throw new Error('Fant ikke elementet med id "dager"');
  }

  Object.keys(splitInDays).forEach((dayKey) => {
    const dayElem = document.createElement("div");

    const day = splitInDays[dayKey];

    dayElem.innerHTML = dag({
      datostreng: dayKey,
      icon: day.icon,
      beskrivelse: capitalizeFirstLetter(day.beskrivelse),
      høyesteTemperatur: day.highestTemp,
      lavesteTemperatur: day.lowestTemp,
      nedbør: day.rain,
      vind: day.windSpeed,
      luftfuktighet: day.humidity,
    });

    daysElem.appendChild(dayElem);
  });
}

function setupHourlyForecast(forecast) {
  const hourlyForecastElem = document.getElementById("timer");

  if (!(hourlyForecastElem instanceof HTMLElement)) {
    throw new Error('Fant ikke elementet med id "hourly-forecast"');
  }

  forecast.list.forEach((item) => {
    const hourElem = document.createElement("div");

    hourElem.innerHTML = `<div class="weather">
	<h1>${new Date(item.dt * 1000).toLocaleDateString(
    "no-NO"
  )} - ${return24HourTime(new Date(item.dt * 1000))}</h1>
	<div class="forecast">
	<div class="bilde">
	  <img src="https://openweathermap.org/img/wn/${
      item.weather[0].icon
    }.png" alt="${item.weather[0].description}">
	  <div>${capitalizeFirstLetter(item.weather[0].description)}</div>
	</div>
	<div class="detaljer">
	<div class="foreblokk">🌡️${item.main.temp}°C (${item.main.feels_like})</div>
	<div class="foreblokk">☁️${item.clouds.all}%</div>
	<div class="foreblokk">🌬️${item.wind.speed}m/s</div>
	<div class="foreblokk">🌫️${item.main.humidity}%</div>
	<div class="foreblokk">${item.main.temp < 0 ? "🌨️" : "🌧️"}${
      item.rain ? item.rain["3h"] : 0
    }mm</div>
	  <div class="foreblokk">⏲️${item.main.pressure}hPa</div>
	</div>
	</div>
  </div>`;

    hourlyForecastElem.appendChild(hourElem);
  });
}

(async function setup() {
  const weather = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=59.9139&lon=10.7522&lang=no&units=metric&appid=${weatherApiKey}`
  ).then((res) => res.json());
  const forecast = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=59.9139&lon=10.7522&lang=no&units=metric&appid=${weatherApiKey}`
  ).then((res) => res.json());
  setupNow(weather);
  setupForecast(weather, forecast);
  setupHourlyForecast(forecast);
})();

// Reload page after 10 minutes
setTimeout(() => {
  location.reload();
}, 10 * 60 * 1000);

(function setupTabs() {
  const timeForTimeButton = document.getElementById("timerButton");
  const dagForDagButton = document.getElementById("dagerButton");

  // toggle day and hourly forecast
  function toggleForecast(timeForTime) {
    const hourlyForecast = document.getElementById("timer");
    const dailyForecast = document.getElementById("dager");

    if (!(hourlyForecast instanceof HTMLElement))
      throw new Error('Fant ikke elementet med id "timer"');
    if (!(dailyForecast instanceof HTMLElement))
      throw new Error('Fant ikke elementet med id "dager"');

    if (timeForTime) {
      hourlyForecast.style.display = "block";
      dailyForecast.style.display = "none";
      timeForTimeButton?.classList.add("active");
      dagForDagButton?.classList.remove("active");
    } else {
      hourlyForecast.style.display = "none";
      dailyForecast.style.display = "block";
      timeForTimeButton?.classList.remove("active");
      dagForDagButton?.classList.add("active");
    }
  }

  if (!(timeForTimeButton instanceof HTMLElement))
    throw new Error('Fant ikke elementet med id "timerButton"');
  if (!(dagForDagButton instanceof HTMLElement))
    throw new Error('Fant ikke elementet med id "dagerButton"');

  timeForTimeButton.addEventListener("click", () => toggleForecast(true));
  dagForDagButton.addEventListener("click", () => toggleForecast(false));
})();
