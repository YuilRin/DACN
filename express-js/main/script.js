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
    console.log("Login response:", data); // Debug log

    if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id); // Lưu userId
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

    try {
        const res = await fetch("http://localhost:5000/tasks", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            const tasks = await res.json();
            console.log("Tasks nhận được:", tasks); 

            document.getElementById("task-list").innerHTML = "";
            document.querySelectorAll(".task-container").forEach(container => {
                container.innerHTML = "";
            });

            tasks.forEach(task => {
                console.log("Render task:", task);
                renderTask(task);
            });
        } else {
            alert("Failed to fetch tasks. Please log in again.");
            localStorage.removeItem("token");
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}


function renderTask(task) {

    let table = document.getElementById("task-list");
    let row = document.createElement("tr");
    row.id = "task-" + task.id;
    row.innerHTML = `
        <td>${task.title}</td> 
        <td contenteditable="true" oninput="updateTaskText('${task.id}')">${task.description}</td>
        <td>
            <select onchange="updateTaskStatus('${task.id}', this.value)">
                <option value="todo" ${task.status === "todo" ? "selected" : ""}>To Do</option>
                <option value="in-progress" ${task.status === "in-progress" ? "selected" : ""}>In Progress</option>
                <option value="done" ${task.status === "done" ? "selected" : ""}>Done</option>
            </select>
        </td>
        <td><button onclick="deleteTask('${task.id}')">Delete</button></td>
    `;
    table.appendChild(row);

    let kanbanTask = document.createElement("div");
    kanbanTask.className = "task";
    kanbanTask.id = "kanban-task-" + task.id;
    kanbanTask.draggable = true;
    kanbanTask.ondragstart = (event) => drag(event); 
    kanbanTask.innerHTML = `
        ${task.title} 
        <button onclick="deleteTask('${task.id}')">X</button>
    `;

    let column = document.getElementById(task.status)?.querySelector(".task-container");
    if (column) {
        column.appendChild(kanbanTask);
    }
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}



function addTask() {
    let taskText = prompt("Enter task summary:");
    if (!taskText) return;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // Lấy userId đã lưu

    if (!token || !userId) {
        alert("Bạn chưa đăng nhập!");
        return;
    }

    fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
            userId: userId,   // ID của người dùng
            title: taskText,  // Tiêu đề task
            description: "taskDescription", // Mô tả task (nếu cần)
            status: "todo",   // Trạng thái task
            
            createdAt: new Date().toISOString(), // Thời gian tạo
            updatedAt: new Date().toISOString()  // Thời gian cập nhật
           
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Lỗi: " + data.error);
        } else {
            alert("Task đã được thêm!");
            fetchTasks(); // Cập nhật danh sách task
        }
    })
    .catch(error => console.error("Lỗi:", error));
}


function updateTaskText(taskId) {
    let summary = document.getElementById("task-" + taskId).cells[1].innerText;
    fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary })
    });
}

function updateTaskStatus(taskId, status) {
    fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    }).then(fetchTasks);
}

function deleteTask(taskId) {
    fetch(`http://localhost:5000/tasks/${taskId}`, { method: "DELETE" }).then(fetchTasks);
}

function toggleView() {
    let listView = document.getElementById("list-view");
    let kanbanView = document.getElementById("kanban-view");

    if (listView.style.display === "none") {
        listView.style.display = "block";
        kanbanView.style.display = "none";
    } else {
        listView.style.display = "none";
        kanbanView.style.display = "block";
    }
    fetchTasks();
}


socket.on("update", fetchTasks);

fetchTasks();
