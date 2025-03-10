
// script.js
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var task = document.getElementById(data);
    
    if (event.target.classList.contains("column")) {
        event.target.appendChild(task);
    } else if (event.target.parentElement.classList.contains("column")) {
        event.target.parentElement.appendChild(task);
    }
}

function addTask() {
    let taskText = prompt("Enter task name:");
    if (taskText) {
        let task = document.createElement("div");
        task.className = "task";
        task.draggable = true;
        task.ondragstart = drag;
        task.onclick = editTask;
        task.id = "task-" + new Date().getTime();
        
        let taskContent = document.createElement("span");
        taskContent.innerText = taskText;
        task.appendChild(taskContent);
        
        let deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerText = "X";
        deleteBtn.onclick = function() { task.remove(); };
        task.appendChild(deleteBtn);
        
        document.getElementById("todo").appendChild(task);
    }
}

function editTask(event) {
    if (event.target.tagName === "SPAN") {
        let newText = prompt("Edit task name:", event.target.innerText);
        if (newText) {
            event.target.innerText = newText;
        }
    }
}
