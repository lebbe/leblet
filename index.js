// @ts-check

/**
 * @typedef {Object} WeatherDetails
 * @property {number} air_temperature
 * @property {number} [wind_speed]
 * @property {number} [precipitation_amount]
 */

/**
 * @typedef {Object} WeatherSummary
 * @property {string} symbol_code
 */

/**
 * @typedef {Object} WeatherData
 * @property {{ details: WeatherDetails }} instant
 * @property {{ summary: WeatherSummary }} [next_1_hours]
 * @property {{ summary: WeatherSummary }} [next_6_hours]
 */

/**
 * @typedef {Object} TimeseriesEntry
 * @property {string} time
 * @property {WeatherData} data
 */

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

/**
 * Weather icon mapping based on MET.no symbol codes
 * Maps symbol codes to SVG icon filenames in /icons folder
 * @type {Record<string, string>}
 */
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

/**
 * Weather description mapping
 * @type {Record<string, string>}
 */
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

/**
 * Require a DOM element by id and type.
 * @template {HTMLElement} T
 * @param {string} id
 * @param {new (...args: any[]) => T} ctor
 * @returns {T}
 */
function getRequiredElement(id, ctor) {
  const el = document.getElementById(id)
  if (!el || !(el instanceof ctor)) {
    throw new Error(`Element #${id} missing or not a ${ctor.name}`)
  }
  return /** @type {T} */ (el)
}

// DOM elements
const currentIcon = getRequiredElement('current-icon', HTMLElement)
const currentTemp = getRequiredElement('current-temp', HTMLElement)
const weatherForecast = getRequiredElement('weather-forecast', HTMLElement)
const sunriseTime = getRequiredElement('sunrise-time', HTMLElement)
const sunsetTime = getRequiredElement('sunset-time', HTMLElement)
const clockEl = getRequiredElement('clock', HTMLElement)

/**
 * Tab switching functionality
 * @returns {void}
 */
function initTabs() {
  const tabButtons = /** @type {NodeListOf<HTMLButtonElement>} */ (
    document.querySelectorAll('.tab-btn')
  )
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

/**
 * Initialize blinking clock in HH:MM format
 * @returns {void}
 */
function initClock() {
  const updateClock = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const blink = now.getSeconds() % 2 === 0 ? ':' : ' '
    clockEl.textContent = `${hours}${blink}${minutes}`
  }

  updateClock()
  setInterval(updateClock, 1000)
}

/**
 * Get icon HTML for symbol code
 * @param {string} symbolCode
 * @param {number} [size=48]
 * @returns {string}
 */
function getIcon(symbolCode, size = 48) {
  const iconName = iconMap[symbolCode] || symbolCode
  return `<img src="icons/${iconName}.svg" alt="${symbolCode}" width="${size}" height="${size}" />`
}

/**
 * Get description for symbol code
 * @param {string} symbolCode
 * @returns {string}
 */
function getDescription(symbolCode) {
  // Remove _day, _night, _polartwilight suffixes for description lookup
  const baseSymbol = symbolCode.replace(/_(day|night|polartwilight)$/, '')
  return descriptionMap[baseSymbol] || symbolCode
}

/**
 * Format time for display
 * @param {string} isoString
 * @returns {string}
 */
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

/**
 * Render current weather in quick overview
 * @param {TimeseriesEntry} current
 * @returns {void}
 */
function renderCurrentWeather(current) {
  const temperature = current.data.instant.details.air_temperature
  const symbolCode =
    current.data.next_1_hours?.summary?.symbol_code ||
    current.data.next_6_hours?.summary?.symbol_code ||
    'cloudy'

  currentIcon.innerHTML = getIcon(symbolCode, 40)
  currentTemp.textContent = `${Math.round(temperature)}°C`
}

/**
 * Render weather forecast
 * @param {TimeseriesEntry[]} timeseries
 * @returns {void}
 */
function renderForecast(timeseries) {
  const now = new Date()
  /** @type {TimeseriesEntry[]} */
  const forecastItems = []
  /** @type {Date | null} */
  let lastIncludedTime = null

  for (const item of timeseries) {
    const itemTime = new Date(item.time)
    const hoursFromNow = (itemTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Only include items within next 24 hours
    if (hoursFromNow < 0 || hoursFromNow > 24) continue

    // Include if it's the first item or at least 3 hours since last included
    if (
      lastIncludedTime === null ||
      (itemTime.getTime() - lastIncludedTime.getTime()) / (1000 * 60 * 60) >= 3
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

/**
 * Fetch and display weather data
 * @returns {Promise<void>}
 */
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

/**
 * Fetch sunrise and sunset times from MET.no
 * @returns {Promise<void>}
 */
async function fetchSunTimes() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const sunUrl = `https://api.met.no/weatherapi/sunrise/3.0/sun?lat=${lat}&lon=${lon}&date=${today}`

    const response = await fetch(sunUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const properties = data.properties

    if (properties.sunrise && properties.sunrise.time) {
      const sunrise = new Date(properties.sunrise.time)
      sunriseTime.textContent = sunrise.toLocaleTimeString('no-NO', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else {
      sunriseTime.textContent = '--'
    }

    if (properties.sunset && properties.sunset.time) {
      const sunset = new Date(properties.sunset.time)
      sunsetTime.textContent = sunset.toLocaleTimeString('no-NO', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else {
      sunsetTime.textContent = '--'
    }
  } catch (error) {
    console.error('Error fetching sun times:', error)
    sunriseTime.textContent = '--'
    sunsetTime.textContent = '--'
  }
}

/**
 * Transport iframe integration
 * @returns {void}
 */
function initTransport() {
  const transportFrame = /** @type {HTMLIFrameElement | null} */ (
    document.getElementById('transport-frame')
  )
  if (!transportFrame) return

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
  initClock()

  // Fetch weather and sun data immediately and then periodically
  if (lat && lon) {
    fetchWeather()
    fetchSunTimes()
    setInterval(fetchWeather, 900000) // Every 15 minutes
    setInterval(fetchSunTimes, 3600000) // Every hour
  } else {
    currentIcon.innerHTML = '<span class="error-icon">!</span>'
    currentTemp.textContent = '--'
    weatherForecast.innerHTML =
      '<div class="forecast-item">Mangler posisjonsdata</div>'
  }
})
