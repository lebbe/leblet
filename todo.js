// Simple TODO application using localStorage

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

/**
 * @typedef {Object} Todo
 * @property {string} id - Unique identifier
 * @property {string} text - Todo text content
 * @property {boolean} completed - Whether the todo is completed
 * @property {string} createdAt - ISO date string when created
 */

const STORAGE_KEY = 'leblet-todos'

/**
 * Get todos from localStorage
 * @returns {Todo[]}
 */
function getTodos() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

/**
 * Save todos to localStorage
 * @param {Todo[]} todos
 * @returns {void}
 */
function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

/**
 * Generate unique ID
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Update todo summary in quick overview
 * @returns {void}
 */
function updateTodoSummary() {
  const summaryEl = document.getElementById('todo-summary')
  if (!summaryEl) return

  const todos = getTodos()
  const incomplete = todos.filter((t) => !t.completed)

  if (incomplete.length === 0) {
    summaryEl.textContent = ''
  } else if (incomplete.length === 1) {
    summaryEl.textContent = `📝 ${incomplete[0].text}`
  } else {
    summaryEl.textContent = `📝 ${incomplete.length} gjøremål`
  }
}

/**
 * Render todo list
 * @returns {void}
 */
function renderTodos() {
  const todoList = getRequiredElement('todo-list', HTMLElement)
  const todos = getTodos()

  // Update summary in quick overview
  updateTodoSummary()

  if (todos.length === 0) {
    todoList.innerHTML =
      '<div class="todo-empty">Ingen gjøremål ennå. Legg til et ovenfor!</div>'
    return
  }

  todoList.innerHTML = todos
    .map(
      (todo) => `
      <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${
        todo.id
      }">
        <input 
          type="checkbox" 
          class="todo-checkbox" 
          ${todo.completed ? 'checked' : ''}
          onchange="toggleTodo('${todo.id}')"
        />
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="todo-delete" onclick="deleteTodo('${
          todo.id
        }')" title="Delete">×</button>
      </div>
    `
    )
    .join('')
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
 * Add new todo
 * @param {string} text
 * @returns {void}
 */
function addTodo(text) {
  if (!text.trim()) return

  const todos = getTodos()
  todos.push({
    id: generateId(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  })
  saveTodos(todos)
  renderTodos()
}

/**
 * Toggle todo completion
 * @param {string} id
 * @returns {void}
 */
function toggleTodo(id) {
  const todos = getTodos()
  const todo = todos.find((t) => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    saveTodos(todos)
    renderTodos()
  }
}

/**
 * Delete todo
 * @param {string} id
 * @returns {void}
 */
function deleteTodo(id) {
  const todos = getTodos().filter((t) => t.id !== id)
  saveTodos(todos)
  renderTodos()
}

/**
 * Initialize todo functionality
 * @returns {void}
 */
function initTodo() {
  const todoInput = getRequiredElement('todo-input', HTMLInputElement)
  const addButton = getRequiredElement('todo-add-btn', HTMLButtonElement)

  // Add on button click
  addButton.addEventListener('click', () => {
    addTodo(todoInput.value)
    todoInput.value = ''
    todoInput.focus()
  })

  // Add on Enter key
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo(todoInput.value)
      todoInput.value = ''
    }
  })

  // Initial render
  renderTodos()
}

// Make functions available globally for inline event handlers
window.toggleTodo = toggleTodo
window.deleteTodo = deleteTodo

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTodo)
