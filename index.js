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
  clearsky: '☀️',
  fair_day: '🌤️',
  fair_night: '🌤️',
  fair: '🌤️',
  partlycloudy_day: '⛅',
  partlycloudy_night: '⛅',
  partlycloudy: '⛅',
  cloudy: '☁️',
  rainshowers_day: '🌦️',
  rainshowers_night: '🌧️',
  rainshowers: '🌦️',
  rain: '🌧️',
  lightrainshowers_day: '🌦️',
  lightrainshowers_night: '🌧️',
  lightrainshowers: '🌦️',
  lightrain: '🌧️',
  heavyrain: '🌧️',
  heavyrainshowers_day: '🌧️',
  heavyrainshowers_night: '🌧️',
  rainthunder_day: '⛈️',
  rainthunder_night: '⛈️',
  rainthunder: '⛈️',
  sleet: '🧊',
  sleetshowers_day: '🧊',
  sleetshowers_night: '🧊',
  snow: '❄️',
  snowshowers_day: '🌨️',
  snowshowers_night: '🌨️',
  snowshowers: '🌨️',
  lightsnow: '❄️',
  heavysnow: '❄️',
  fog: '🌫️',
}

// Weather description mapping
const descriptionMap = {
  clearsky: 'Klart',
  fair: 'Lettskyet',
  partlycloudy: 'Delvis skyet',
  cloudy: 'Skyet',
  rainshowers: 'Regnbyger',
  rain: 'Regn',
  lightrainshowers: 'Lette regnbyger',
  lightrain: 'Lett regn',
  heavyrain: 'Kraftig regn',
  heavyrainshowers: 'Kraftige regnbyger',
  rainthunder: 'Tordenvær',
  sleet: 'Sludd',
  sleetshowers: 'Sluddbyger',
  snow: 'Snø',
  snowshowers: 'Snøbyger',
  lightsnow: 'Lett snø',
  heavysnow: 'Kraftig snø',
  fog: 'Tåke',
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

// Get icon for symbol code
function getIcon(symbolCode) {
  const baseSymbol = symbolCode.replace(/_day|_night/, '')
  return iconMap[symbolCode] || iconMap[baseSymbol] || '🌡️'
}

// Get description for symbol code
function getDescription(symbolCode) {
  const baseSymbol = symbolCode.replace(/_day|_night/, '')
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

  currentIcon.textContent = getIcon(symbolCode)
  currentTemp.textContent = `${Math.round(temperature)}°C`
}

// Render weather forecast
function renderForecast(timeseries) {
  // Get forecast for next 24 hours, every 3 hours
  const now = new Date()
  const forecastItems = timeseries.filter((item, index) => {
    const itemTime = new Date(item.time)
    const hoursFromNow = (itemTime - now) / (1000 * 60 * 60)
    // Include items from 0-24 hours, roughly every 3 hours
    return hoursFromNow >= 0 && hoursFromNow <= 24 && index % 3 === 0
  })

  // Take up to 8 forecast items
  const displayItems = forecastItems.slice(0, 8)

  weatherForecast.innerHTML = displayItems
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
    currentIcon.textContent = '⚠️'
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
    currentIcon.textContent = '⚠️'
    currentTemp.textContent = '--'
    weatherForecast.innerHTML =
      '<div class="forecast-item">Mangler posisjonsdata</div>'
  }
})
