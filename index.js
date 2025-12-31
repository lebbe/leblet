// Extract URL parameters
const params = new URLSearchParams(window.location.search)
const lat = params.get('lat')
const lon = params.get('lon')
const transport_url = params.get('transport_url')
const alt = params.get('alt')

// Validate required parameters
if (!lat) {
  console.error('Missing required parameter: lat')
}
if (!lon) {
  console.error('Missing required parameter: lon')
}
if (!transport_url) {
  console.error('Missing required parameter: transport_url')
}

// Weather icon mapping based on MET.no symbol codes
const iconMap = {
  clearsky_day: '☀️',
  clearsky_night: '🌙',
  fair_day: '🌤️',
  fair_night: '🌤️',
  partlycloudy_day: '⛅',
  partlycloudy_night: '⛅',
  cloudy: '☁️',
  rainshowers_day: '🌦️',
  rainshowers_night: '🌧️',
  rain: '🌧️',
  rainthunder_day: '⛈️',
  rainthunder_night: '⛈️',
  sleet: '🧊',
  snow: '❄️',
  snowshowers_day: '🌨️',
  snowshowers_night: '🌨️',
  fog: '🌫️',
}

const weatherContainer = document.getElementById('weather-container')

async function fetchWeather() {
  try {
    let weatherUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`
    if (alt) {
      weatherUrl += `&altitude=${alt}`
    }

    const response = await fetch(weatherUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const current = data.properties.timeseries[0]
    const temperature = current.data.instant.details.air_temperature
    const symbolCode =
      current.data.next_1_hours?.summary?.symbol_code ||
      current.data.next_6_hours?.summary?.symbol_code ||
      'cloudy'

    // Extract base symbol code (remove _day/_night suffix for mapping)
    const baseSymbol = symbolCode.replace(/_day|_night/, '')
    const icon = iconMap[symbolCode] || iconMap[baseSymbol] || '🌡️'

    weatherContainer.innerHTML = `
      <div class="weather-content">
        <div class="weather-icon">${icon}</div>
        <div class="weather-temperature">${temperature}°C</div>
        <div class="weather-description">${symbolCode}</div>
      </div>
    `
  } catch (error) {
    console.error('Error fetching weather:', error)
    weatherContainer.innerHTML = `<div class="weather-error">Unable to load weather data</div>`
  }
}

// Fetch weather data immediately and then every 15 minutes
if (lat && lon) {
  fetchWeather()
  setInterval(fetchWeather, 900000)
} else {
  weatherContainer.innerHTML = `<div class="weather-error">Missing latitude and longitude parameters</div>`
}

// Transport iframe integration
const transportFrame = document.getElementById('transport-frame')

if (transport_url) {
  // Validate that the URL is from supported providers
  const supportedDomains = ['tavle.entur.no', 'tavla.entur.no']
  let isSupported = false

  try {
    const url = new URL(transport_url)
    isSupported = supportedDomains.some((domain) =>
      url.hostname.includes(domain)
    )
  } catch {
    console.error('Invalid transport_url format:', transport_url)
  }

  if (isSupported) {
    transportFrame.src = transport_url
  } else {
    console.error(
      'Unsupported transport provider. Supported domains: ' +
        supportedDomains.join(', ')
    )
    transportFrame.src = 'about:blank'
  }
} else {
  console.error('Missing required parameter: transport_url')
  transportFrame.src = 'about:blank'
}
