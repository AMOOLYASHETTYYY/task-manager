const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filters button");
const loadingEl = document.getElementById("loading");

let tasks = [];

/* ---------- Utility Functions ---------- */

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showError(message) {
    const errorEl = document.getElementById("errorMessage");
    errorEl.textContent = message;
    setTimeout(() => errorEl.textContent = "", 3000);
}

function getActiveFilter() {
    return document.querySelector(".filters .active").dataset.filter;
}

/* ---------- Render Tasks ---------- */
function renderTasks(filter = "all") {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        if (
            (filter === "completed" && !task.completed) ||
            (filter === "pending" && task.completed)
        ) return;

        const li = document.createElement("li");
        if (task.completed) li.classList.add("completed");

        // Checkbox for completion
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => toggleTask(index));

        // Task text
        const span = document.createElement("span");
        span.textContent = task.text;

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => deleteTask(index));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
}


/* ---------- Load Initial Tasks (API + localStorage) ---------- */

async function loadInitialTasks() {
    loadingEl.style.display = "block";

    const storedTasks = localStorage.getItem("tasks");

    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        loadingEl.style.display = "none";
        renderTasks();
        return;
    }

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        tasks = data.map(item => ({
            text: item.title,
            completed: item.completed
        }));

        saveTasks();
        renderTasks();
    } catch (error) {
        showError("Unable to load tasks. Please try again later.");
    } finally {
        loadingEl.style.display = "none";
    }
}

/* ---------- Task Actions ---------- */

addTaskBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    if (text === "") {
        showError("Task cannot be empty");
        return;
    }

    tasks.push({ text, completed: false });
    taskInput.value = "";
    saveTasks();
    renderTasks(getActiveFilter());
});

taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addTaskBtn.click();
    }
});

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks(getActiveFilter());
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks(getActiveFilter());
}

/* ---------- Filters ---------- */

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".filters .active").classList.remove("active");
        btn.classList.add("active");
        renderTasks(btn.dataset.filter);
    });
});

/* ---------- Start App ---------- */

loadInitialTasks();
