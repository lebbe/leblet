// Simple notes application using localStorage

const NOTES_STORAGE_KEY = 'leblet-notes'

// Get notes from localStorage
function getNotes() {
  return localStorage.getItem(NOTES_STORAGE_KEY) || ''
}

// Save notes to localStorage
function saveNotes(text) {
  localStorage.setItem(NOTES_STORAGE_KEY, text)
}

// Initialize notes functionality
function initNotes() {
  const notesTextarea = document.getElementById('notes-textarea')
  if (!notesTextarea) return

  // Load saved notes
  notesTextarea.value = getNotes()

  // Save on input (with debounce for performance)
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
