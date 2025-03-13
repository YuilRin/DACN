const API_URL = "http://localhost:4000"; // User service
async function register() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const bodyData = { username, email, password };
    console.log("Sending request:", bodyData); // Debug log

    const res = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData) // Chuyển object thành JSON
    });

    const data = await res.json();
    console.log("Response:", data); // Debug log

    if (res.ok) {
        alert("Registered successfully! Please log in.");
    } else {
        alert("Registration failed: " + data.error);
    }
}



async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        fetchTasks(); // Tải danh sách công việc
    } else {
        alert("Login failed");
    }
}

async function fetchTasks() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in first!");
        return;
    }

    const res = await fetch("http://localhost:3000/tasks", {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
        const tasks = await res.json();
        document.getElementById("task-list").innerHTML = "";
        tasks.forEach(task => renderTask(task));
    } else {
        alert("Failed to fetch tasks. Please log in again.");
        localStorage.removeItem("token");
    }
}


function renderTask(task) {
    let table = document.getElementById("task-list");
    let row = table.insertRow();
    row.id = "task-" + task.id;
    row.innerHTML = `
        <td>${task.key}</td>
        <td contenteditable="true" oninput="updateTaskText('${task.id}')">${task.summary}</td>
        <td>
            <select onchange="updateTaskStatus('${task.id}', this.value)">
                <option value="todo" ${task.status === "todo" ? "selected" : ""}>To Do</option>
                <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>In Progress</option>
                <option value="done" ${task.status === "done" ? "selected" : ""}>Done</option>
            </select>
        </td>
        <td><button onclick="deleteTask('${task.id}')">Delete</button></td>
    `;

    let kanbanTask = document.createElement("div");
    kanbanTask.className = "task";
    kanbanTask.id = "kanban-task-" + task.id;
    kanbanTask.draggable = true;
    kanbanTask.ondragstart = drag;
    kanbanTask.innerHTML = `${task.summary} <button onclick="deleteTask('${task.id}')">X</button>`;
    document.getElementById(task.status).querySelector(".task-container").appendChild(kanbanTask);
}

function addTask() {
    let taskText = prompt("Enter task summary:");
    if (taskText) {
        fetch("http://localhost:3000/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ summary: taskText, status: "todo" })
        }).then(fetchTasks);
    }
}

function updateTaskText(taskId) {
    let summary = document.getElementById("task-" + taskId).cells[1].innerText;
    fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary })
    });
}

function updateTaskStatus(taskId, status) {
    fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    }).then(fetchTasks);
}

function deleteTask(taskId) {
    fetch(`http://localhost:3000/tasks/${taskId}`, { method: "DELETE" }).then(fetchTasks);
}

socket.on("update", fetchTasks);

fetchTasks();
