// News ticker using NRK RSS feed

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

const RSS_URL = 'https://www.nrk.no/toppsaker.rss'
const NEWS_REFRESH_INTERVAL = 600000 // 10 minutes

/**
 * CORS proxies to try (in order of preference)
 * @type {Array<(url: string) => string>}
 */
const CORS_PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
]

/**
 * Check if news is enabled via URL parameter
 * @returns {boolean}
 */
function isNewsEnabled() {
  const params = new URLSearchParams(window.location.search)
  const newsParam = params.get('news')
  // Default to on if not specified
  return newsParam !== 'off'
}

/**
 * Try fetching with multiple CORS proxies
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetchWithProxy(url) {
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(url)
      const response = await fetch(proxyUrl)
      if (response.ok) {
        return await response.text()
      }
    } catch (e) {
      // Try next proxy
      continue
    }
  }
  throw new Error('All CORS proxies failed')
}

/**
 * Fetch and parse RSS feed
 * @returns {Promise<void>}
 */
async function fetchNews() {
  const tickerContent = getRequiredElement('news-ticker-content', HTMLElement)

  try {
    const xmlText = await fetchWithProxy(RSS_URL)
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

    const items = xmlDoc.querySelectorAll('item')
    /** @type {string[]} */
    const headlines = []

    items.forEach((item, index) => {
      if (index < 10) {
        // Limit to 10 headlines
        const title = item.querySelector('title')?.textContent || ''
        if (title) {
          headlines.push(title)
        }
      }
    })

    if (headlines.length > 0) {
      tickerContent.innerHTML = headlines
        .map(
          (headline) => `<span class="news-item">${escapeHtml(headline)}</span>`
        )
        .join('')

      // Adjust animation duration based on content length
      const totalLength = headlines.join('').length
      const duration = Math.max(30, totalLength * 0.3) // Minimum 30s, scale with content
      tickerContent.style.animationDuration = `${duration}s`
    } else {
      tickerContent.textContent = 'Ingen nyheter tilgjengelig'
    }
  } catch (error) {
    console.error('Error fetching news:', error)
    tickerContent.textContent = 'Kunne ikke laste nyheter'
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Initialize news ticker
 * @returns {void}
 */
function initNews() {
  if (!isNewsEnabled()) {
    const newsTicker = document.getElementById('news-ticker')
    if (newsTicker) {
      newsTicker.style.display = 'none'
    }
    return
  }

  fetchNews()
  setInterval(fetchNews, NEWS_REFRESH_INTERVAL)
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initNews)
