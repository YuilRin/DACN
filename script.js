
const socket = io("http://localhost:3000");

function fetchTasks() {
    fetch("http://localhost:3000/tasks")
        .then(response => response.json())
        .then(tasks => {
            document.getElementById("task-list").innerHTML = "";
            ["todo", "in-progress", "done"].forEach(id => {
                document.getElementById(id).querySelector(".task-container").innerHTML = "";
            });
            tasks.forEach(task => renderTask(task));
        });
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
