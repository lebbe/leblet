// Simple notes application using localStorage

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

const NOTES_STORAGE_KEY = 'leblet-notes'

/**
 * Get notes from localStorage
 * @returns {string}
 */
function getNotes() {
  return localStorage.getItem(NOTES_STORAGE_KEY) || ''
}

/**
 * Save notes to localStorage
 * @param {string} text
 * @returns {void}
 */
function saveNotes(text) {
  localStorage.setItem(NOTES_STORAGE_KEY, text)
}

/**
 * Initialize notes functionality
 * @returns {void}
 */
function initNotes() {
  const notesTextarea = getRequiredElement(
    'notes-textarea',
    HTMLTextAreaElement
  )

  // Load saved notes
  notesTextarea.value = getNotes()

  // Save on input (with debounce for performance)
  /** @type {number | undefined} */
  let saveTimeout
  notesTextarea.addEventListener('input', () => {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      saveNotes(notesTextarea.value)
    }, 300)
  })

  // Also save on blur (when leaving the textarea)
  notesTextarea.addEventListener('blur', () => {
    saveNotes(notesTextarea.value)
  })
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initNotes)
