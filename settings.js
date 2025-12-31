// Form and UI variables
const form = document.getElementById('settings-form')
const errorDiv = document.getElementById('error-message')
const successDiv = document.getElementById('success-message')

// Location picker variables
let map = null
let marker = null
const defaultLocation = [59.91, 10.75] // Oslo

const latInput = document.getElementById('location-latitude')
const lonInput = document.getElementById('location-longitude')
const altInput = document.getElementById('location-altitude')

// Initialize map on page load
function initMap() {
  map = L.map('map', { attributionControl: false }).setView(defaultLocation, 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  // Add marker at default location
  marker = L.marker(defaultLocation).addTo(map)
  latInput.value = defaultLocation[0].toFixed(4)
  lonInput.value = defaultLocation[1].toFixed(4)
  fetchAltitude(defaultLocation[0], defaultLocation[1])

  // Map click handler
  map.on('click', (e) => {
    const lat = e.latlng.lat
    const lon = e.latlng.lng
    updateLocation(lat, lon)
  })

  // Add geocoder control
  const geocoder = L.Control.geocoder({
    defaultMarkGeocode: false,
  })
    .on('markgeocode', (e) => {
      const lat = e.geocode.center.lat
      const lon = e.geocode.center.lng
      updateLocation(lat, lon)
    })
    .addTo(map)
}

function updateLocation(lat, lon) {
  lat = parseFloat(lat.toFixed(4))
  lon = parseFloat(lon.toFixed(4))

  // Update inputs
  latInput.value = lat
  lonInput.value = lon

  // Update marker
  if (marker) {
    marker.setLatLng([lat, lon])
  } else {
    marker = L.marker([lat, lon]).addTo(map)
  }

  // Center map
  map.setView([lat, lon], map.getZoom())

  // Fetch altitude
  fetchAltitude(lat, lon)

  // Update generate link
  updateGenerateLink()
}

async function fetchAltitude(lat, lon) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`
    )
    const data = await response.json()
    if (data.elevation && data.elevation.length > 0) {
      altInput.value = Math.round(data.elevation[0])
      updateGenerateLink()
    }
  } catch (error) {
    console.error('Error fetching altitude:', error)
  }
}

// Location input change handlers
latInput.addEventListener('change', () => {
  const lat = parseFloat(latInput.value)
  const lon = parseFloat(lonInput.value)
  if (!isNaN(lat) && !isNaN(lon)) {
    updateLocation(lat, lon)
  }
})

lonInput.addEventListener('change', () => {
  const lat = parseFloat(latInput.value)
  const lon = parseFloat(lonInput.value)
  if (!isNaN(lat) && !isNaN(lon)) {
    updateLocation(lat, lon)
  }
})

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initMap()

  // Load saved settings from localStorage
  const saved = localStorage.getItem('dashboardSettings')
  if (saved) {
    const settings = JSON.parse(saved)
    const lat = settings.lat
    const lon = settings.lon
    if (lat && lon) {
      updateLocation(parseFloat(lat), parseFloat(lon))
    }
    document.getElementById('station-input').value = settings.stationInput || ''
    if (settings.news !== undefined) {
      document.getElementById('news-toggle').checked = settings.news
    }
  }

  // Update the generate link with restored values
  updateGenerateLink()
})

function showError(message) {
  errorDiv.textContent = message
  errorDiv.classList.add('show')
  successDiv.classList.remove('show')
}

function showSuccess(message) {
  successDiv.textContent = message
  successDiv.classList.add('show')
  errorDiv.classList.remove('show')
}

function generateDashboardUrl(lat, lon, transportUrl, altitude) {
  const dashboardUrl = new URL('/index.html', window.location.origin)
  dashboardUrl.searchParams.set('lat', lat)
  dashboardUrl.searchParams.set('lon', lon)
  dashboardUrl.searchParams.set('transport_url', transportUrl)
  if (altitude) {
    dashboardUrl.searchParams.set('alt', altitude)
  }
  return dashboardUrl.toString()
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showSuccess('URL copied to clipboard!')
    })
    .catch(() => {
      showError('Failed to copy URL to clipboard')
    })
}

function displayGeneratedUrl(dashboardUrl) {
  const urlContainer = document.getElementById('url-container')
  const urlDisplay = document.getElementById('generated-url')
  const copyBtn = document.getElementById('copy-btn')
  const openBtn = document.getElementById('open-btn')

  urlDisplay.textContent = dashboardUrl
  urlContainer.classList.add('show')

  copyBtn.onclick = () => copyToClipboard(dashboardUrl)
  openBtn.onclick = () => {
    window.location.href = dashboardUrl
  }
}

function updateGenerateLink() {
  const mapLat = latInput.value
  const mapLon = lonInput.value
  const mapAlt = altInput.value
  const stationInput = document.getElementById('station-input').value.trim()

  const generateLink = document.getElementById('generate-link')

  if (mapLat && mapLon && stationInput) {
    try {
      // Validate URL
      if (!stationInput.startsWith('http')) {
        generateLink.style.opacity = '0.5'
        generateLink.style.pointerEvents = 'none'
        return
      }

      new URL(stationInput)

      // Build dashboard URL (use relative path for GitHub Pages compatibility)
      const basePath = window.location.pathname.replace(/\/[^/]*$/, '/')
      const dashboardUrl = new URL(basePath + 'index.html', window.location.origin)
      dashboardUrl.searchParams.set('lat', mapLat)
      dashboardUrl.searchParams.set('lon', mapLon)
      dashboardUrl.searchParams.set('transport_url', stationInput)
      if (mapAlt) {
        dashboardUrl.searchParams.set('alt', mapAlt)
      }
      const newsToggle = document.getElementById('news-toggle')
      dashboardUrl.searchParams.set('news', newsToggle.checked ? 'on' : 'off')

      // Save settings to localStorage
      const settings = {
        lat: mapLat,
        lon: mapLon,
        stationInput,
        transportUrl: stationInput,
        news: newsToggle.checked,
      }
      localStorage.setItem('dashboardSettings', JSON.stringify(settings))

      // Update link
      generateLink.href = dashboardUrl.toString()
      generateLink.style.opacity = '1'
      generateLink.style.pointerEvents = 'auto'
    } catch (error) {
      generateLink.style.opacity = '0.5'
      generateLink.style.pointerEvents = 'none'
    }
  } else {
    generateLink.style.opacity = '0.5'
    generateLink.style.pointerEvents = 'none'
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  updateGenerateLink()
})

// Update link whenever location or station input changes
latInput.addEventListener('change', updateGenerateLink)
lonInput.addEventListener('change', updateGenerateLink)
document
  .getElementById('station-input')
  .addEventListener('change', updateGenerateLink)
document
  .getElementById('station-input')
  .addEventListener('input', updateGenerateLink)
document
  .getElementById('news-toggle')
  .addEventListener('change', updateGenerateLink)
