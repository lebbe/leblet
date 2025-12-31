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
// Maps symbol codes to SVG icon filenames in /icons folder
const iconMap = {
  // Clear sky
  clearsky_day: 'clearsky_day',
  clearsky_night: 'clearsky_night',
  clearsky_polartwilight: 'clearsky_polartwilight',
  // Fair
  fair_day: 'fair_day',
  fair_night: 'fair_night',
  fair_polartwilight: 'fair_polartwilight',
  // Partly cloudy
  partlycloudy_day: 'partlycloudy_day',
  partlycloudy_night: 'partlycloudy_night',
  partlycloudy_polartwilight: 'partlycloudy_polartwilight',
  // Cloudy
  cloudy: 'cloudy',
  // Fog
  fog: 'fog',
  // Rain
  lightrain: 'lightrain',
  rain: 'rain',
  heavyrain: 'heavyrain',
  // Rain showers
  lightrainshowers_day: 'lightrainshowers_day',
  lightrainshowers_night: 'lightrainshowers_night',
  lightrainshowers_polartwilight: 'lightrainshowers_polartwilight',
  rainshowers_day: 'rainshowers_day',
  rainshowers_night: 'rainshowers_night',
  rainshowers_polartwilight: 'rainshowers_polartwilight',
  heavyrainshowers_day: 'heavyrainshowers_day',
  heavyrainshowers_night: 'heavyrainshowers_night',
  heavyrainshowers_polartwilight: 'heavyrainshowers_polartwilight',
  // Rain and thunder
  lightrainandthunder: 'lightrainandthunder',
  rainandthunder: 'rainandthunder',
  heavyrainandthunder: 'heavyrainandthunder',
  lightrainshowersandthunder_day: 'lightrainshowersandthunder_day',
  lightrainshowersandthunder_night: 'lightrainshowersandthunder_night',
  lightrainshowersandthunder_polartwilight:
    'lightrainshowersandthunder_polartwilight',
  rainshowersandthunder_day: 'rainshowersandthunder_day',
  rainshowersandthunder_night: 'rainshowersandthunder_night',
  rainshowersandthunder_polartwilight: 'rainshowersandthunder_polartwilight',
  heavyrainshowersandthunder_day: 'heavyrainshowersandthunder_day',
  heavyrainshowersandthunder_night: 'heavyrainshowersandthunder_night',
  heavyrainshowersandthunder_polartwilight:
    'heavyrainshowersandthunder_polartwilight',
  // Sleet
  lightsleet: 'lightsleet',
  sleet: 'sleet',
  heavysleet: 'heavysleet',
  // Sleet showers
  lightsleetshowers_day: 'lightsleetshowers_day',
  lightsleetshowers_night: 'lightsleetshowers_night',
  lightsleetshowers_polartwilight: 'lightsleetshowers_polartwilight',
  sleetshowers_day: 'sleetshowers_day',
  sleetshowers_night: 'sleetshowers_night',
  sleetshowers_polartwilight: 'sleetshowers_polartwilight',
  heavysleetshowers_day: 'heavysleetshowers_day',
  heavysleetshowers_night: 'heavysleetshowers_night',
  heavysleetshowers_polartwilight: 'heavysleetshowers_polartwilight',
  // Sleet and thunder
  lightsleetandthunder: 'lightsleetandthunder',
  sleetandthunder: 'sleetandthunder',
  heavysleetandthunder: 'heavysleetandthunder',
  lightssleetshowersandthunder_day: 'lightssleetshowersandthunder_day',
  lightssleetshowersandthunder_night: 'lightssleetshowersandthunder_night',
  lightssleetshowersandthunder_polartwilight:
    'lightssleetshowersandthunder_polartwilight',
  sleetshowersandthunder_day: 'sleetshowersandthunder_day',
  sleetshowersandthunder_night: 'sleetshowersandthunder_night',
  sleetshowersandthunder_polartwilight: 'sleetshowersandthunder_polartwilight',
  heavysleetshowersandthunder_day: 'heavysleetshowersandthunder_day',
  heavysleetshowersandthunder_night: 'heavysleetshowersandthunder_night',
  heavysleetshowersandthunder_polartwilight:
    'heavysleetshowersandthunder_polartwilight',
  // Snow
  lightsnow: 'lightsnow',
  snow: 'snow',
  heavysnow: 'heavysnow',
  // Snow showers
  lightsnowshowers_day: 'lightsnowshowers_day',
  lightsnowshowers_night: 'lightsnowshowers_night',
  lightsnowshowers_polartwilight: 'lightsnowshowers_polartwilight',
  snowshowers_day: 'snowshowers_day',
  snowshowers_night: 'snowshowers_night',
  snowshowers_polartwilight: 'snowshowers_polartwilight',
  heavysnowshowers_day: 'heavysnowshowers_day',
  heavysnowshowers_night: 'heavysnowshowers_night',
  heavysnowshowers_polartwilight: 'heavysnowshowers_polartwilight',
  // Snow and thunder
  lightsnowandthunder: 'lightsnowandthunder',
  snowandthunder: 'snowandthunder',
  heavysnowandthunder: 'heavysnowandthunder',
  lightssnowshowersandthunder_day: 'lightssnowshowersandthunder_day',
  lightssnowshowersandthunder_night: 'lightssnowshowersandthunder_night',
  lightssnowshowersandthunder_polartwilight:
    'lightssnowshowersandthunder_polartwilight',
  snowshowersandthunder_day: 'snowshowersandthunder_day',
  snowshowersandthunder_night: 'snowshowersandthunder_night',
  snowshowersandthunder_polartwilight: 'snowshowersandthunder_polartwilight',
  heavysnowshowersandthunder_day: 'heavysnowshowersandthunder_day',
  heavysnowshowersandthunder_night: 'heavysnowshowersandthunder_night',
  heavysnowshowersandthunder_polartwilight:
    'heavysnowshowersandthunder_polartwilight',
}

// Weather description mapping
const descriptionMap = {
  // Clear/fair
  clearsky: 'Klart',
  fair: 'Lettskyet',
  partlycloudy: 'Delvis skyet',
  cloudy: 'Skyet',
  fog: 'Tåke',
  // Rain
  lightrain: 'Lett regn',
  rain: 'Regn',
  heavyrain: 'Kraftig regn',
  lightrainshowers: 'Lette regnbyger',
  rainshowers: 'Regnbyger',
  heavyrainshowers: 'Kraftige regnbyger',
  // Rain and thunder
  lightrainandthunder: 'Lett regn og torden',
  rainandthunder: 'Regn og torden',
  heavyrainandthunder: 'Kraftig regn og torden',
  lightrainshowersandthunder: 'Lette regnbyger og torden',
  rainshowersandthunder: 'Regnbyger og torden',
  heavyrainshowersandthunder: 'Kraftige regnbyger og torden',
  // Sleet
  lightsleet: 'Lett sludd',
  sleet: 'Sludd',
  heavysleet: 'Kraftig sludd',
  lightsleetshowers: 'Lette sluddbyger',
  sleetshowers: 'Sluddbyger',
  heavysleetshowers: 'Kraftige sluddbyger',
  // Sleet and thunder
  lightsleetandthunder: 'Lett sludd og torden',
  sleetandthunder: 'Sludd og torden',
  heavysleetandthunder: 'Kraftig sludd og torden',
  lightssleetshowersandthunder: 'Lette sluddbyger og torden',
  sleetshowersandthunder: 'Sluddbyger og torden',
  heavysleetshowersandthunder: 'Kraftige sluddbyger og torden',
  // Snow
  lightsnow: 'Lett snø',
  snow: 'Snø',
  heavysnow: 'Kraftig snø',
  lightsnowshowers: 'Lette snøbyger',
  snowshowers: 'Snøbyger',
  heavysnowshowers: 'Kraftige snøbyger',
  // Snow and thunder
  lightsnowandthunder: 'Lett snø og torden',
  snowandthunder: 'Snø og torden',
  heavysnowandthunder: 'Kraftig snø og torden',
  lightssnowshowersandthunder: 'Lette snøbyger og torden',
  snowshowersandthunder: 'Snøbyger og torden',
  heavysnowshowersandthunder: 'Kraftige snøbyger og torden',
}

// DOM elements
const currentIcon = document.getElementById('current-icon')
const currentTemp = document.getElementById('current-temp')
const weatherForecast = document.getElementById('weather-forecast')

// Tab switching functionality
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn')
  const tabPanes = document.querySelectorAll('.tab-pane')

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab

      // Update button states
      tabButtons.forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')

      // Update pane visibility
      tabPanes.forEach((pane) => {
        pane.classList.remove('active')
        if (pane.id === `${targetTab}-tab`) {
          pane.classList.add('active')
        }
      })
    })
  })
}

// Get icon HTML for symbol code
function getIcon(symbolCode, size = 48) {
  const iconName = iconMap[symbolCode] || symbolCode
  return `<img src="icons/${iconName}.svg" alt="${symbolCode}" width="${size}" height="${size}" />`
}

// Get description for symbol code
function getDescription(symbolCode) {
  // Remove _day, _night, _polartwilight suffixes for description lookup
  const baseSymbol = symbolCode.replace(/_(day|night|polartwilight)$/, '')
  return descriptionMap[baseSymbol] || symbolCode
}

// Format time for display
function formatTime(isoString) {
  const date = new Date(isoString)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const timeStr = date.toLocaleTimeString('no-NO', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (date.toDateString() === now.toDateString()) {
    return timeStr
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `I morgen ${timeStr}`
  } else {
    const dayStr = date.toLocaleDateString('no-NO', { weekday: 'short' })
    return `${dayStr} ${timeStr}`
  }
}

// Render current weather in quick overview
function renderCurrentWeather(current) {
  const temperature = current.data.instant.details.air_temperature
  const symbolCode =
    current.data.next_1_hours?.summary?.symbol_code ||
    current.data.next_6_hours?.summary?.symbol_code ||
    'cloudy'

  currentIcon.innerHTML = getIcon(symbolCode, 40)
  currentTemp.textContent = `${Math.round(temperature)}°C`
}

// Render weather forecast
function renderForecast(timeseries) {
  const now = new Date()
  const forecastItems = []
  let lastIncludedTime = null

  for (const item of timeseries) {
    const itemTime = new Date(item.time)
    const hoursFromNow = (itemTime - now) / (1000 * 60 * 60)

    // Only include items within next 24 hours
    if (hoursFromNow < 0 || hoursFromNow > 24) continue

    // Include if it's the first item or at least 3 hours since last included
    if (
      lastIncludedTime === null ||
      (itemTime - lastIncludedTime) / (1000 * 60 * 60) >= 3
    ) {
      forecastItems.push(item)
      lastIncludedTime = itemTime
    }

    // Stop after 8 items
    if (forecastItems.length >= 8) break
  }

  weatherForecast.innerHTML = forecastItems
    .map((item) => {
      const temp = item.data.instant.details.air_temperature
      const symbolCode =
        item.data.next_1_hours?.summary?.symbol_code ||
        item.data.next_6_hours?.summary?.symbol_code ||
        'cloudy'

      return `
      <div class="forecast-item">
        <span class="forecast-time">${formatTime(item.time)}</span>
        <span class="forecast-icon">${getIcon(symbolCode)}</span>
        <span class="forecast-temp">${Math.round(temp)}°C</span>
        <span class="forecast-desc">${getDescription(symbolCode)}</span>
      </div>
    `
    })
    .join('')
}

// Fetch and display weather data
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
    const timeseries = data.properties.timeseries

    // Render current weather
    renderCurrentWeather(timeseries[0])

    // Render forecast
    renderForecast(timeseries)
  } catch (error) {
    console.error('Error fetching weather:', error)
    currentIcon.innerHTML = '<span class="error-icon">!</span>'
    currentTemp.textContent = 'Feil'
    weatherForecast.innerHTML =
      '<div class="forecast-item">Kunne ikke laste værdata</div>'
  }
}

// Transport iframe integration
function initTransport() {
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
    } catch (e) {
      console.error('Invalid transport URL:', e)
    }

    if (isSupported) {
      transportFrame.src = transport_url
    } else {
      console.error(
        'Unsupported transport provider. Only Entur boards are supported.'
      )
      transportFrame.style.display = 'none'
    }
  } else {
    console.log('No transport URL provided')
    transportFrame.style.display = 'none'
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initTabs()
  initTransport()

  // Fetch weather data immediately and then every 15 minutes
  if (lat && lon) {
    fetchWeather()
    setInterval(fetchWeather, 900000)
  } else {
    currentIcon.innerHTML = '<span class="error-icon">!</span>'
    currentTemp.textContent = '--'
    weatherForecast.innerHTML =
      '<div class="forecast-item">Mangler posisjonsdata</div>'
  }
})
