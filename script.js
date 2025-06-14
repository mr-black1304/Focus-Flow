const timeDisplay = document.getElementById('time-display');
const pomodoroBtn = document.getElementById('pomodoro-btn');
const shortBreakBtn = document.getElementById('short-break-btn');
const longBreakBtn = document.getElementById('long-break-btn');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const sessionCountDisplay = document.getElementById('session-count');

const alarmSound = new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3');

const timers = {
    pomodoro: 25 * 60,    // 25 minutes in seconds
    shortBreak: 5 * 60,   // 5 minutes
    longBreak: 15 * 60,   // 15 minutes
};
let currentMode = 'pomodoro';
let timeLeft = timers.pomodoro;
let timerInterval = null;
let isPaused = true;
let sessionCount = 0;
let tasks = [];



function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}


function startTimer() {
    if (isPaused) {
        isPaused = false;
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');

        timerInterval = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alarmSound.play();
                
                if (currentMode === 'pomodoro') {
                    sessionCount++;
                    updateSessionCount();
                    saveData();
                    
                    if (sessionCount % 4 === 0) {
                        switchMode('longBreak');
                    } else {
                        switchMode('shortBreak');
                    }
                } else {
                    switchMode('pomodoro');
                }
                startTimer();
            }
        }, 1000);
    }
}

// Pause the timer
function pauseTimer() {
    isPaused = true;
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    clearInterval(timerInterval);
}

// Reset the timer
function resetTimer() {
    pauseTimer();
    timeLeft = timers[currentMode];
    updateDisplay();
}

// Switch between Pomodoro, Short Break, and Long Break
function switchMode(mode) {
    currentMode = mode;
    isPaused = true;
    clearInterval(timerInterval);
    timeLeft = timers[mode];
    
    // Update active button style
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${mode}-btn`).classList.add('active');

    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    
    updateDisplay();
}

// --- TASK LIST FUNCTIONS ---
function renderTasks() {
    taskList.innerHTML = ''; // Clear existing list
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.dataset.index = index;
        if (task.completed) {
            li.classList.add('completed');
        }

        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×'; // 'x' symbol

        li.appendChild(taskText);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

function addTask(text) {
    tasks.push({ text: text, completed: false });
    renderTasks();
    saveData();
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
    saveData();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
    saveData();
}

function updateSessionCount() {
    sessionCountDisplay.textContent = sessionCount;
}

// --- LOCAL STORAGE FUNCTIONS ---
function saveData() {
    localStorage.setItem('focusFlowTasks', JSON.stringify(tasks));
    localStorage.setItem('focusFlowSessionCount', sessionCount);
}

function loadData() {
    const loadedTasks = localStorage.getItem('focusFlowTasks');
    const loadedCount = localStorage.getItem('focusFlowSessionCount');
    if (loadedTasks) {
        tasks = JSON.parse(loadedTasks);
    }
    if (loadedCount) {
        sessionCount = parseInt(loadedCount, 10);
    }
    renderTasks();
    updateSessionCount();
}

// --- EVENT LISTENERS ---
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

pomodoroBtn.addEventListener('click', () => switchMode('pomodoro'));
shortBreakBtn.addEventListener('click', () => switchMode('shortBreak'));
longBreakBtn.addEventListener('click', () => switchMode('longBreak'));

taskForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page refresh
    const text = taskInput.value.trim();
    if (text !== '') {
        addTask(text);
        taskInput.value = '';
    }
});

taskList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return; // Exit if the click was not on an li or its child

    const index = li.dataset.index;
    
    if (e.target.classList.contains('delete-btn')) {
        deleteTask(index);
    } else {
        toggleTask(index);
    }
});

// Load data and set initial state when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    switchMode('pomodoro');
});