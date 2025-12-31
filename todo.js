// Get the todo list from localStorage or initialize an empty array
const todoList = JSON.parse(localStorage.getItem("todos") || "[]");

// Function to render the todo list
function renderTodoList() {
  const todoContainer = document.getElementById("todo-container");

  if (todoContainer instanceof HTMLElement === false) {
    throw new Error("Element with id 'todo-container' not found");
  }

  todoContainer.innerHTML = "";

  todoList.forEach((todo, index) => {
    const todoItem = document.createElement("div");
    todoItem.classList.add("todo-item");
    todoItem.innerHTML = `
			<input type="checkbox" ${
        todo.completed ? "checked" : ""
      } onchange="toggleTodoStatus(${index})">
			<span>${todo.text}</span>
			<button onclick="deleteTodo(${index})">Delete</button>
		`;
    todoContainer.appendChild(todoItem);
  });
}

// Function to add a new todo
function addTodo() {
  const todoInput = document.getElementById("todo-input");
  if (todoInput instanceof HTMLInputElement === false) {
    throw new Error("Element with id 'todo-input' not found");
  }

  const todoText = todoInput.value.trim();

  if (todoText !== "") {
    const newTodo = {
      text: todoText,
      completed: false,
    };

    todoList.push(newTodo);
    localStorage.setItem("todos", JSON.stringify(todoList));
    todoInput.value = "";
    renderTodoList();
  }
}

// Function to toggle the status of a todo
function toggleTodoStatus(index) {
  todoList[index].completed = !todoList[index].completed;
  localStorage.setItem("todos", JSON.stringify(todoList));
  renderTodoList();
}

// Function to delete a todo
function deleteTodo(index) {
  todoList.splice(index, 1);
  localStorage.setItem("todos", JSON.stringify(todoList));
  renderTodoList();
}

// Render the initial todo list
renderTodoList();
