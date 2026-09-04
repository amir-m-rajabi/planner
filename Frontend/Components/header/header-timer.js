// ============================================================
// Header Timer - Active Activity Timer Management
// ============================================================

let activeTimer = null;
let timerInterval = null;

// ============================================================
// Start Header Timer
// ============================================================

export function startHeaderTimer(activity) {
    if (!activity || !activity.startTime) {
        return;
    }

    activeTimer = {
        id: Number(activity.id),
        title: activity.title,
        color: activity.color,
        startTime: new Date(activity.startTime),
        sessionId: Number(activity.sessionId)
    };

    showTimerUI();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateHeaderTimer, 1000);

    updateHeaderTimer();
}

// ============================================================
// Show Timer UI
// ============================================================

function showTimerUI() {
    if (!activeTimer) return;

    const timer = document.querySelector("#headerTimer");
    if (timer) timer.hidden = false;

    const activityName = document.querySelector("#headerTimerActivity");
    if (activityName) activityName.textContent = activeTimer.title;

    const indicator = document.querySelector("#headerTimerIndicator");
    if (indicator) indicator.style.backgroundColor = activeTimer.color;

    const stopButton = document.querySelector("#headerTimerStop");
    if (stopButton) {
        stopButton.style.backgroundColor = activeTimer.color;
        stopButton.style.borderColor = activeTimer.color;
    }
}

// ============================================================
// Stop Header Timer
// ============================================================

export function stopHeaderTimer() {
    const timer = document.querySelector("#headerTimer");
    if (timer) timer.hidden = true;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    activeTimer = null;
}

// ============================================================
// Update Header Timer
// ============================================================

function updateHeaderTimer() {
    if (!activeTimer || !activeTimer.startTime) {
        return;
    }

    const now = new Date();
    const elapsed = Math.floor((now - activeTimer.startTime) / 1000);

    if (isNaN(elapsed) || elapsed < 0) {
        return;
    }

    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    const timeElement = document.querySelector("#headerTimerTime");
    if (timeElement) {
        timeElement.textContent =
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`;
    }
}

// ============================================================
// Get Active Header Timer
// ============================================================

export function getActiveHeaderTimer() {
    return activeTimer;
}

// ============================================================
// Set Active Header Timer
// ============================================================

export function setActiveHeaderTimer(activity) {
    if (activity && activity.startTime) {
        startHeaderTimer(activity);
    } else {
        stopHeaderTimer();
    }
}

// ============================================================
// Refresh Header Timer UI
// ============================================================

export function refreshHeaderTimerUI() {
    if (activeTimer) {
        showTimerUI();
        updateHeaderTimer();
    } else {
        const timer = document.querySelector("#headerTimer");
        if (timer) timer.hidden = true;
    }
}

// ============================================================
// Stop Button Click Handler
// ============================================================

document.addEventListener("click", function headerTimerStopHandler(event) {
    const stopButton = event.target.closest("#headerTimerStop");
    if (!stopButton) return;
    if (!activeTimer) return;

    document.dispatchEvent(new CustomEvent('header-timer:stop', {
        detail: {
            activityId: activeTimer.id,
            sessionId: activeTimer.sessionId
        }
    }));
});