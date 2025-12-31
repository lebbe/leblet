// News ticker using NRK RSS feed

const RSS_URL = 'https://www.nrk.no/toppsaker.rss'
const CORS_PROXY = 'https://api.allorigins.win/raw?url='
const NEWS_REFRESH_INTERVAL = 600000 // 10 minutes

// Check if news is enabled via URL parameter
function isNewsEnabled() {
  const params = new URLSearchParams(window.location.search)
  const newsParam = params.get('news')
  // Default to on if not specified
  return newsParam !== 'off'
}

// Fetch and parse RSS feed
async function fetchNews() {
  const tickerContent = document.getElementById('news-ticker-content')

  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(RSS_URL))

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xmlText = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

    const items = xmlDoc.querySelectorAll('item')
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Initialize news ticker
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
