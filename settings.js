// @ts-check

/**
 * @typedef {Object} DashboardSettings
 * @property {string} [lat]
 * @property {string} [lon]
 * @property {string} [stationInput]
 * @property {string} [transportUrl]
 * @property {boolean} [news]
 */

/**
 * @typedef {Object} LeafletLatLng
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} LeafletMap
 * @property {function(string, function(any): void): void} on
 * @property {function([number, number], number): LeafletMap} setView
 * @property {function(): number} getZoom
 */

/**
 * @typedef {Object} LeafletMarker
 * @property {function([number, number]): LeafletMarker} setLatLng
 * @property {function(LeafletMap): LeafletMarker} addTo
 */

/**
 * @typedef {Object} LeafletLayer
 * @property {function(LeafletMap): LeafletLayer} addTo
 */

/**
 * @typedef {Object} LeafletControl
 * @property {function(string, function(any): void): LeafletControl} on
 * @property {function(LeafletMap): LeafletControl} addTo
 */

/**
 * @typedef {Object} LeafletStatic
 * @property {function(string, Object): LeafletMap} map
 * @property {function(string, Object): LeafletLayer} tileLayer
 * @property {function([number, number]): LeafletMarker} marker
 * @property {Object} Control
 * @property {function(Object): LeafletControl} Control.geocoder
 */

/** @type {LeafletStatic} */
// @ts-ignore - Leaflet loaded from CDN
const L = window.L

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

// Form and UI variables
const form = getRequiredElement('settings-form', HTMLFormElement)
const errorDiv = getRequiredElement('error-message', HTMLElement)
const successDiv = getRequiredElement('success-message', HTMLElement)

// Location picker variables
/** @type {LeafletMap | null} */
let map = null
/** @type {LeafletMarker | null} */
let marker = null
/** @type {[number, number]} */
const defaultLocation = [59.91, 10.75] // Oslo

const latInput = getRequiredElement('location-latitude', HTMLInputElement)
const lonInput = getRequiredElement('location-longitude', HTMLInputElement)
const altInput = getRequiredElement('location-altitude', HTMLInputElement)

/**
 * Initialize map on page load
 * @returns {void}
 */
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
  map.on('click', (/** @type {any} */ e) => {
    const lat = e.latlng.lat
    const lon = e.latlng.lng
    updateLocation(lat, lon)
  })

  // Add geocoder control
  const geocoder = L.Control.geocoder({
    defaultMarkGeocode: false,
  })
    .on('markgeocode', (/** @type {any} */ e) => {
      const lat = e.geocode.center.lat
      const lon = e.geocode.center.lng
      updateLocation(lat, lon)
    })
    .addTo(map)
}

/**
 * Update location on map and inputs
 * @param {number} lat
 * @param {number} lon
 * @returns {void}
 */
function updateLocation(lat, lon) {
  lat = parseFloat(lat.toFixed(4))
  lon = parseFloat(lon.toFixed(4))

  // Update inputs
  latInput.value = String(lat)
  lonInput.value = String(lon)

  // Update marker
  if (marker) {
    marker.setLatLng([lat, lon])
  } else {
    if (map) marker = L.marker([lat, lon]).addTo(map)
  }

  // Center map
  if (map) map.setView([lat, lon], map.getZoom())

  // Fetch altitude
  fetchAltitude(lat, lon)

  // Update generate link
  updateGenerateLink()
}

/**
 * Fetch altitude from Open-Meteo API
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<void>}
 */
async function fetchAltitude(lat, lon) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`
    )
    const data = await response.json()
    if (data.elevation && data.elevation.length > 0) {
      altInput.value = String(Math.round(data.elevation[0]))
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
    const lat = /** @type {string | undefined} */ (settings.lat)
    const lon = /** @type {string | undefined} */ (settings.lon)
    if (lat && lon) {
      updateLocation(parseFloat(lat), parseFloat(lon))
    }
    const stationInputEl = document.getElementById('station-input')
    if (stationInputEl instanceof HTMLInputElement) {
      stationInputEl.value = settings.stationInput || ''
    }
    if (settings.news !== undefined) {
      const newsToggleEl = document.getElementById('news-toggle')
      if (newsToggleEl instanceof HTMLInputElement) {
        newsToggleEl.checked = settings.news
      }
    }
  }

  // Update the generate link with restored values
  updateGenerateLink()
})

/**
 * Show error message
 * @param {string} message
 * @returns {void}
 */
function showError(message) {
  errorDiv.textContent = message
  errorDiv.classList.add('show')
  successDiv.classList.remove('show')
}

/**
 * Show success message
 * @param {string} message
 * @returns {void}
 */
function showSuccess(message) {
  successDiv.textContent = message
  successDiv.classList.add('show')
  errorDiv.classList.remove('show')
}

/**
 * Generate dashboard URL with parameters
 * @param {string} lat
 * @param {string} lon
 * @param {string} transportUrl
 * @param {string} [altitude]
 * @returns {string}
 */
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

/**
 * Copy text to clipboard
 * @param {string} text
 * @returns {void}
 */
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

/**
 * Display generated URL in the UI
 * @param {string} dashboardUrl
 * @returns {void}
 */
function displayGeneratedUrl(dashboardUrl) {
  const urlContainer = document.getElementById('url-container')
  const urlDisplay = document.getElementById('generated-url')
  const copyBtn = document.getElementById('copy-btn')
  const openBtn = document.getElementById('open-btn')

  if (
    urlContainer instanceof HTMLElement === false ||
    urlDisplay instanceof HTMLElement === false ||
    copyBtn instanceof HTMLButtonElement === false ||
    openBtn instanceof HTMLButtonElement === false
  ) {
    return
  }

  urlDisplay.textContent = dashboardUrl
  urlContainer.classList.add('show')

  copyBtn.onclick = () => copyToClipboard(dashboardUrl)
  openBtn.onclick = () => {
    window.location.href = dashboardUrl
  }
}

/**
 * Update the generate link with current form values
 * @returns {void}
 */
function updateGenerateLink() {
  const mapLat = latInput.value
  const mapLon = lonInput.value
  const mapAlt = altInput.value
  const stationInputEl = document.getElementById('station-input')
  const generateLink = document.getElementById('generate-link')

  if (
    stationInputEl instanceof HTMLInputElement === false ||
    generateLink instanceof HTMLAnchorElement === false
  ) {
    return
  }

  const stationInput = stationInputEl.value.trim()

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
      const dashboardUrl = new URL(
        basePath + 'index.html',
        window.location.origin
      )
      dashboardUrl.searchParams.set('lat', mapLat)
      dashboardUrl.searchParams.set('lon', mapLon)
      dashboardUrl.searchParams.set('transport_url', stationInput)
      if (mapAlt) {
        dashboardUrl.searchParams.set('alt', mapAlt)
      }
      const newsToggle = document.getElementById('news-toggle')
      if (newsToggle instanceof HTMLInputElement) {
        dashboardUrl.searchParams.set('news', newsToggle.checked ? 'on' : 'off')
      }

      // Save settings to localStorage
      const settings = {
        lat: mapLat,
        lon: mapLon,
        stationInput,
        transportUrl: stationInput,
        news:
          newsToggle instanceof HTMLInputElement ? newsToggle.checked : false,
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

const stationInputEl2 = document.getElementById('station-input')
if (stationInputEl2 instanceof HTMLInputElement) {
  stationInputEl2.addEventListener('change', updateGenerateLink)
  stationInputEl2.addEventListener('input', updateGenerateLink)
}

const newsToggleEl2 = document.getElementById('news-toggle')
if (newsToggleEl2 instanceof HTMLInputElement) {
  newsToggleEl2.addEventListener('change', updateGenerateLink)
}
