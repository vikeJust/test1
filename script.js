const API_URL = '/api/timer'; // Vercel API endpoint

// Generate a unique clientId for this user
const clientId = 'client-' + Math.random().toString(36).substr(2, 9);

let timerInterval = null;
let runningStartTime = null; // Store the global start time

// Function to update the timer display
const updateDisplay = (startTime, stopTime) => {
    let displayTime = 0;

    if (startTime) {
        displayTime = Date.now() - startTime; // Calculate elapsed time
    } else if (stopTime) {
        displayTime = stopTime; // Use the stop time
    }

    // Calculate hours, minutes, seconds, and milliseconds
    const milliseconds = Math.floor((displayTime % 1000) / 10);
    const seconds = Math.floor((displayTime / 1000) % 60);
    const minutes = Math.floor((displayTime / (1000 * 60)) % 60);
    const hours = Math.floor(displayTime / (1000 * 60 * 60));

    // Pad single digits with a leading zero
    document.getElementById('display').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};


// Fetch the global timer state and sync the display
const fetchGlobalState = async () => {
    const response = await fetch(`${API_URL}?clientId=${clientId}`);
    const data = await response.json();

    // If the timer is running, sync the global start time
    if (data.running && data.startTime) {
        if (runningStartTime !== data.startTime) {
            runningStartTime = data.startTime; // Update the global start time
            clearInterval(timerInterval); // Clear the old interval
            timerInterval = setInterval(() => updateDisplay(runningStartTime, null), 10);
        }
    } else if (data.stopTime) {
        // If the timer is stopped, display the stop time
        clearInterval(timerInterval);
        updateDisplay(null, data.stopTime);
    }
};


// Start the timer
document.getElementById('startBtn').addEventListener('click', async () => {
    const response = await fetch(`${API_URL}?clientId=${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'start' }),
    });
    const data = await response.json();

    runningStartTime = data.startTime; // Sync the start time
    if (!timerInterval) {
        timerInterval = setInterval(() => updateDisplay(runningStartTime, null), 10);
    }
});

// Stop the timer
document.getElementById('stopBtn').addEventListener('click', async () => {
    const response = await fetch(`${API_URL}?clientId=${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'stop' }),
    });
    const data = await response.json();

    clearInterval(timerInterval);
    updateDisplay(null, data.stopTime); // Display the stop time
});

// Reset the timer
document.getElementById('resetBtn').addEventListener('click', async () => {
    await fetch(`${API_URL}?clientId=${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reset' }),
    });

    clearInterval(timerInterval);
    timerInterval = null;
    runningStartTime = null;
    updateDisplay(null, null); // Reset the display
});

// Regularly fetch the global state to keep all users in sync
setInterval(fetchGlobalState, 1000); // Poll the server every second
