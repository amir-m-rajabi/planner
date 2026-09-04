import { sessions } from "../sessions/sessions.js";
import { renderSessionListToDOM } from "../sessions/sessions.js";
import { renderSessionsModalListToDOM } from "../sessions/sessions.js";
import { TimedActivitiesAPI, ActivitySessionsAPI } from "../../../js/api.js";
import { startHeaderTimer, stopHeaderTimer } from "../../header/header-timer.js";

// ============================================================
// State
// ============================================================

export let timedActivities = [];

let activeActivity = null;
let timerInterval = null;
let activityTimerInterval = null;
let activityBeingEdited = null;
let currentSelectedDate = null;
let currentIsToday = true;
let activitiesLoaded = false;

// ============================================================
// Utility Functions
// ============================================================

function isToday(date) {
    if (!date) return true;
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
}

function getDateKey(date) {
    if (!date) date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getSessionsForDate(date) {
    const dateStr = getDateKey(date);
    
    return sessions.filter(session => {
        if (session.date) {
            const sessionDate = new Date(session.date);
            return getDateKey(sessionDate) === dateStr;
        }
        return getDateKey(new Date()) === dateStr;
    });
}

function getActivityDurationForDate(activityId, date) {
    const daySessions = getSessionsForDate(date);
    let totalSeconds = 0;
    
    daySessions
        .filter(session => Number(session.activityId) === Number(activityId))
        .forEach(session => {
            const start = timeToSeconds(session.startTime);
            const end = timeToSeconds(session.endTime);
            totalSeconds += (end - start);
        });
    
    return totalSeconds;
}

// ============================================================
// Component
// ============================================================

export function TimeActivies() {
    return `
        <section class="timed-activities">
            <div class="timed-activities__header">
                <h2 class="timed-activities__title">فعالیت‌های زمان‌دار</h2>
                <button
                    type="button"
                    class="timed-activities__add"
                    id="activityFormModal"
                    aria-label="add timed-activity"
                >
                    +
                </button>
            </div>

            <div class="timed-activities__content">
                <div class="timed-activities__list">
                    در حال بارگذاری...
                </div>
            </div>

            <div class="timed-activities__scroll-hint" aria-hidden="true">
                <span></span>
            </div>
        </section>

        ${ActivityFormModal()}
        ${ConcurrentActivityWarningModal()}
    `;
}

// ============================================================
// Activity Form Modal
// ============================================================

export function ActivityFormModal() {
    return `
        <section
            class="activity-form"
            data-activity-type="timed"
            aria-labelledby="activity-form-title"
        >
            <div class="activity-form__container">
                <header class="activity-form__header">
                    <div class="activity-form__heading">
                        <span class="activity-form__eyebrow">فعالیت‌ها</span>
                        <h2 class="activity-form__title" id="activity-form-title">ایجاد فعالیت زمان‌دار</h2>
                        <p class="activity-form__description">فعالیت خود را ایجاد کنید تا بتوانید زمان انجام آن را ثبت و پیگیری کنید.</p>
                    </div>
                    <button class="activity-form__close" type="button" aria-label="بستن" data-action="close-form">×</button>
                </header>

                <form class="activity-form__form" id="activity-form">
                    <fieldset class="activity-form__section">
                        <legend class="activity-form__section-title">اطلاعات فعالیت</legend>

                        <div class="activity-form__field">
                            <label class="activity-form__label" for="activity-title">عنوان فعالیت</label>
                            <input class="activity-form__input" id="activity-title" name="title" type="text" placeholder="مثلاً مطالعه ریاضی" maxlength="100" required />
                        </div>

                        <div class="activity-form__field activity-form__field--timed" data-field="timed-color">
                            <label class="activity-form__label" for="activity-color">رنگ فعالیت</label>
                            <div class="activity-form__color-picker">
                                <input class="activity-form__color-input" id="activity-color" name="color" type="color" value="#4f9ea5" />
                                <span class="activity-form__color-preview">رنگ فعالیت</span>
                            </div>
                        </div>
                    </fieldset>

                    <footer class="activity-form__actions">
                        <button class="activity-form__cancel" type="button" data-action="cancel">انصراف</button>
                        <button class="activity-form__submit" type="submit">
                            <span class="activity-form__submit-icon" aria-hidden="true">+</span>
                            <span>ایجاد فعالیت</span>
                        </button>
                    </footer>
                </form>
            </div>
        </section>
    `;
}

// ============================================================
// Concurrent Activity Warning Modal
// ============================================================

export function ConcurrentActivityWarningModal() {
    return `
        <div class="activity-warning-modal" id="concurrentActivityWarningModal" aria-hidden="true">
            <div class="activity-warning-modal__overlay"></div>
            <div class="activity-warning-modal__box" role="alertdialog" aria-modal="true" aria-labelledby="concurrentActivityWarningTitle">
                <div class="activity-warning-modal__icon" aria-hidden="true">!</div>
                <div class="activity-warning-modal__content">
                    <h2 class="activity-warning-modal__title" id="concurrentActivityWarningTitle">یه فعالیت دیگه در حال اجراست</h2>
                    <p class="activity-warning-modal__message" id="concurrentActivityWarningMessage">نمی‌تونید هم‌زمان چند فعالیت رو شروع کنید.</p>
                </div>
                <div class="activity-warning-modal__actions">
                    <button type="button" class="activity-warning-modal__confirm" id="concurrentActivityWarningClose">متوجه شدم</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// Open/Close Functions
// ============================================================

function openConcurrentActivityWarning(runningActivity) {
    const modal = document.querySelector("#concurrentActivityWarningModal");
    if (!modal) return;

    const messageEl = modal.querySelector("#concurrentActivityWarningMessage");
    if (messageEl) {
        messageEl.textContent = runningActivity
            ? `فعالیت «${runningActivity.title}» در حال اجراست. برای شروع فعالیت جدید، اول اون رو تموم کنید.`
            : "نمی‌تونید هم‌زمان چند فعالیت رو شروع کنید.";
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
}

function closeConcurrentActivityWarning() {
    const modal = document.querySelector("#concurrentActivityWarningModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
}

export function openActivityForm(activity = null) {
    const form = document.querySelector('.activity-form[data-activity-type="timed"]');
    if (!form) return;

    activityBeingEdited = activity;

    const titleEl = form.querySelector("#activity-form-title");
    const descriptionEl = form.querySelector(".activity-form__description");
    const submitTextEl = form.querySelector(".activity-form__submit span:last-child");
    const titleInput = form.querySelector("#activity-title");
    const colorInput = form.querySelector("#activity-color");

    if (activity) {
        if (titleEl) titleEl.textContent = "ویرایش فعالیت";
        if (descriptionEl) descriptionEl.textContent = "عنوان یا رنگ فعالیت را ویرایش کنید.";
        if (submitTextEl) submitTextEl.textContent = "ذخیره تغییرات";
        if (titleInput) titleInput.value = activity.title;
        if (colorInput) colorInput.value = activity.color;
    } else {
        if (titleEl) titleEl.textContent = "ایجاد فعالیت زمان‌دار";
        if (descriptionEl) descriptionEl.textContent = "فعالیت خود را ایجاد کنید تا بتوانید زمان انجام آن را ثبت و پیگیری کنید.";
        if (submitTextEl) submitTextEl.textContent = "ایجاد فعالیت";
        if (titleInput) titleInput.value = "";
        if (colorInput) colorInput.value = "#4f9ea5";
    }

    form.classList.add("is-open");
}

function closeActivityForm() {
    const form = document.querySelector('.activity-form[data-activity-type="timed"]');
    if (!form) return;
    form.classList.remove("is-open");
    activityBeingEdited = null;
}

// ============================================================
// Load Activities from API
// ============================================================

async function loadActivitiesFromAPI() {
    try {
        const session = JSON.parse(localStorage.getItem('auth:session')) || {};
        const userId = session.userId;

        if (!userId) {
            timedActivities = [];
            activitiesLoaded = true;
            return;
        }

        const activities = await TimedActivitiesAPI.getAll(userId);
        timedActivities = activities || [];
        activitiesLoaded = true;
    } catch (error) {
        timedActivities = [];
        activitiesLoaded = true;
    }
}

// ============================================================
// Calculate Activity Time
// ============================================================

function getTotalActivityTimeForDate(activityId, date) {
    let totalSeconds = getActivityDurationForDate(activityId, date);
    
    if (activeActivity && Number(activeActivity.id) === Number(activityId) && currentIsToday) {
        const now = new Date();
        const elapsedSeconds = Math.floor((now - activeActivity.startTime) / 1000);
        totalSeconds += elapsedSeconds;
    }
    
    return totalSeconds;
}

// ============================================================
// Render Activities
// ============================================================

function renderTimedActivities() {
    const displayDate = currentSelectedDate || new Date();
    const isTodayDate = isToday(displayDate);

    if (timedActivities.length === 0) {
        return '<div class="timed-activities__empty">هیچ فعالیت زمان‌داری تعریف نشده است.</div>';
    }

    const activeActivities = timedActivities.filter(activity => !activity.is_archived);

    if (activeActivities.length === 0) {
        return '<div class="timed-activities__empty">هیچ فعالیت فعالی وجود ندارد.</div>';
    }

    return activeActivities
        .map(activity => {
            const totalSeconds = getTotalActivityTimeForDate(activity.id, displayDate);
            
            const isDisabled = !isTodayDate;
            const isActive = activeActivity && Number(activeActivity.id) === Number(activity.id);

            return `
                <article
                    class="timed-activity"
                    data-activity-id="${activity.id}"
                >
                    <div
                        class="timed-activity__indicator"
                        style="--activity-color: ${activity.color}"
                    ></div>

                    <div class="timed-activity__info">
                        <h3 class="timed-activity__title">${activity.title}</h3>
                        <span class="timed-activity__duration" data-activity-duration="${activity.id}">
                            ${formatDuration(totalSeconds)}
                        </span>
                    </div>

                    <button
                        type="button"
                        class="timed-activity__start ${isDisabled ? 'timed-activity__start--disabled' : ''} ${isActive ? 'is-active' : ''}"
                        style="--activity-color: ${activity.color}"
                        ${isDisabled ? 'disabled' : ''}
                        data-activity-id="${activity.id}"
                    >
                        <span class="timed-activity__start-icon">
                            ${isDisabled ? '⛔' : (isActive ? '■' : '▶')}
                        </span>
                        <span>
                            ${isDisabled ? 'غیرفعال' : (isActive ? 'پایان' : 'شروع')}
                        </span>
                    </button>
                </article>
            `;
        })
        .join("");
}

export async function renderTimedActivitiesToDOM() {
    const list = document.querySelector(".timed-activities__list");
    if (!list) return;

    await loadActivitiesFromAPI();
    list.innerHTML = renderTimedActivities();
}

// ============================================================
// Update Single Activity Duration
// ============================================================

function updateSingleActivityDuration(activityId) {
    const durationElement = document.querySelector(`.timed-activity__duration[data-activity-duration="${activityId}"]`);
    if (!durationElement) return;
    
    const displayDate = currentSelectedDate || new Date();
    const totalSeconds = getTotalActivityTimeForDate(activityId, displayDate);
    durationElement.textContent = formatDuration(totalSeconds);
}

// ============================================================
// Start / End Activity
// ============================================================

export function getActiveActivity() {
    return activeActivity;
}

async function startActivity(activity, button) {
    try {
        const result = await ActivitySessionsAPI.start(activity.id);

        const now = new Date();
        
        activeActivity = {
            ...activity,
            startTime: now,
            sessionId: Number(result.id)
        };

        localStorage.setItem('activeActivity', JSON.stringify({
            id: activeActivity.id,
            title: activeActivity.title,
            color: activeActivity.color,
            startTime: now.toISOString(),
            sessionId: activeActivity.sessionId
        }));

        document.querySelectorAll(`.timed-activity__start[data-activity-id="${activity.id}"]`).forEach(btn => {
            btn.classList.add("is-active");
            const text = btn.querySelector("span:last-child");
            if (text) text.textContent = "پایان";
            const icon = btn.querySelector(".timed-activity__start-icon");
            if (icon) icon.textContent = "■";
        });

        if (activityTimerInterval) clearInterval(activityTimerInterval);
        activityTimerInterval = setInterval(() => {
            updateSingleActivityDuration(activity.id);
        }, 1000);

        setTimeout(() => {
            startHeaderTimer({
                id: activity.id,
                title: activity.title,
                color: activity.color,
                startTime: now,
                sessionId: Number(result.id)
            });
        }, 50);

        document.dispatchEvent(new CustomEvent('sessions:changed'));

    } catch (error) {
        showError(error.message || 'خطا در شروع سشن');
    }
}

async function finishActivity(activity, button) {
    if (!activeActivity) return;
    
    const endTime = new Date();

    try {
        const result = await ActivitySessionsAPI.stop(activeActivity.sessionId);

        const activityData = timedActivities.find(a => Number(a.id) === activity.id);
        
        const newSession = {
            id: Number(result.id),
            activityId: Number(result.activity_id),
            title: activityData ? activityData.title : activity.title,
            color: activityData ? activityData.color : activity.color,
            startTime: formatTime(activeActivity.startTime),
            endTime: formatTime(endTime),
            duration: formatDurationMinutes(result.duration_minutes),
            hasNote: false,
            note: '',
            date: result.started_at
        };

        const existingIndex = sessions.findIndex(s => s.id === Number(result.id));
        if (existingIndex !== -1) {
            sessions[existingIndex] = newSession;
        } else {
            sessions.push(newSession);
        }

        document.querySelectorAll(`.timed-activity__start[data-activity-id="${activity.id}"]`).forEach(btn => {
            btn.classList.remove("is-active");
            const text = btn.querySelector("span:last-child");
            if (text) text.textContent = "شروع";
            const icon = btn.querySelector(".timed-activity__start-icon");
            if (icon) icon.textContent = "▶";
        });

        clearInterval(timerInterval);
        clearInterval(activityTimerInterval);
        timerInterval = null;
        activityTimerInterval = null;

        stopHeaderTimer();
        localStorage.removeItem('activeActivity');

        activeActivity = null;

        updateSingleActivityDuration(activity.id);

        await renderSessionListToDOM();
        await renderSessionsModalListToDOM();
        document.dispatchEvent(new CustomEvent('sessions:changed'));

    } catch (error) {
        showError(error.message || 'خطا در بستن سشن');
    }
}

// ============================================================
// Time Helpers
// ============================================================

function timeToSeconds(time) {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
        .map(v => String(v).padStart(2, "0"))
        .join(":");
}

function formatDurationMinutes(minutes) {
    if (!minutes) return "۰ دقیقه";
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins} دقیقه`;
    if (mins === 0) return `${hours} ساعت`;
    return `${hours} ساعت و ${mins} دقیقه`;
}

// ============================================================
// Error Modal
// ============================================================

function showError(message) {
    const modal = document.querySelector("#errorModal");
    const messageEl = document.querySelector("#errorModalMessage");
    if (!modal || !messageEl) return;
    messageEl.textContent = message;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
}

// ============================================================
// Event Listeners
// ============================================================

// Add Activity
document.addEventListener("click", (event) => {
    const addButton = event.target.closest(".timed-activities__add, [data-action=\"create-timed\"]");
    if (!addButton) return;
    openActivityForm();
});

// Close Form
document.addEventListener("click", (event) => {
    const closeButton = event.target.closest('[data-action="close-form"], [data-action="cancel"]');
    if (!closeButton) return;
    const form = closeButton.closest('.activity-form[data-activity-type="timed"]');
    if (!form) return;
    closeActivityForm();
});

// Close Warning Modal
document.addEventListener("click", (event) => {
    const confirmButton = event.target.closest("#concurrentActivityWarningClose");
    if (confirmButton) {
        event.preventDefault();
        event.stopPropagation();
        closeConcurrentActivityWarning();
        return;
    }
    
    const overlay = event.target.closest(".activity-warning-modal__overlay");
    if (overlay) {
        event.preventDefault();
        event.stopPropagation();
        closeConcurrentActivityWarning();
        return;
    }
});

// Escape Key
document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
        closeActivityForm();
        closeConcurrentActivityWarning();
    }
});

// Submit Activity Form
document.addEventListener("submit", async (event) => {
    const form = event.target.closest("#activity-form");
    if (!form) return;

    event.preventDefault();

    const title = form.querySelector("#activity-title").value.trim();
    const color = form.querySelector("#activity-color").value;

    if (!title) {
        alert('لطفاً عنوان فعالیت را وارد کنید');
        return;
    }

    try {
        const session = JSON.parse(localStorage.getItem('auth:session')) || {};
        const userId = session.userId;

        if (!userId) {
            alert('لطفاً وارد حساب کاربری خود شوید');
            return;
        }

        if (activityBeingEdited) {
            await TimedActivitiesAPI.update(activityBeingEdited.id, {
                title: title,
                color: color
            });
            
            await loadActivitiesFromAPI();
            updateSessionsForActivity(activityBeingEdited.id, title, color);
            
        } else {
            await TimedActivitiesAPI.create(userId, title, color);
            await loadActivitiesFromAPI();
        }

        await renderTimedActivitiesToDOM();
        
        document.dispatchEvent(new CustomEvent("timed-activities:changed"));
        document.dispatchEvent(new CustomEvent("sessions:changed"));

        form.reset();
        closeActivityForm();

    } catch (error) {
        alert(error.message || 'خطا در ذخیره فعالیت');
    }
});

// Update Sessions for Activity
function updateSessionsForActivity(activityId, newTitle, newColor) {
    sessions.forEach(session => {
        if (Number(session.activityId) === Number(activityId)) {
            session.title = newTitle;
            session.color = newColor;
        }
    });
    
    try {
        const savedSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
        const updatedSessions = savedSessions.map(s => {
            if (Number(s.activityId) === Number(activityId)) {
                return { ...s, title: newTitle, color: newColor };
            }
            return s;
        });
        localStorage.setItem('sessions', JSON.stringify(updatedSessions));
    } catch (e) {
        // Silently handle localStorage errors
    }
    
    document.dispatchEvent(new CustomEvent('sessions:changed'));
    document.dispatchEvent(new CustomEvent('timed-activities:changed'));
}

// Start/Stop Activity
document.addEventListener("click", (event) => {
    const startButton = event.target.closest(".timed-activity__start");
    if (!startButton) return;
    if (startButton.disabled) return;

    const activityId = Number(startButton.dataset.activityId);
    const activity = timedActivities.find(a => Number(a.id) === activityId);
    
    if (!activity) return;

    if (activeActivity && Number(activeActivity.id) === Number(activity.id)) {
        finishActivity(activity, startButton);
        return;
    }

    if (activeActivity) {
        openConcurrentActivityWarning(activeActivity);
        return;
    }

    startActivity(activity, startButton);
});

// Header Timer Stop
document.addEventListener("click", (event) => {
    const stopButton = event.target.closest("#headerTimerStop");
    if (!stopButton) return;
    if (!activeActivity) return;

    const activity = timedActivities.find(a => Number(a.id) === activeActivity.id);
    if (!activity) return;

    const anyButton = document.querySelector(`.timed-activity__start[data-activity-id="${activity.id}"]`);
    if (!anyButton) return;

    finishActivity(activity, anyButton);
});

document.addEventListener("header-timer:stop", async (event) => {
    const { activityId } = event.detail;
    
    const activity = timedActivities.find(a => Number(a.id) === Number(activityId));
    if (!activity) return;

    const anyButton = document.querySelector(`.timed-activity__start[data-activity-id="${activityId}"]`);
    if (!anyButton) {
        if (activeActivity && Number(activeActivity.id) === Number(activityId)) {
            await finishActivity(activity, null);
        }
        return;
    }

    await finishActivity(activity, anyButton);
});

// Day Selection
document.addEventListener("day:selected", (event) => {
    const { gy, gm, gd, isToday } = event.detail;
    
    currentIsToday = isToday;
    currentSelectedDate = isToday ? null : new Date(gy, gm - 1, gd);
    
    renderTimedActivitiesToDOM();
});

// Session Changes
document.addEventListener('sessions:changed', () => {
    renderTimedActivitiesToDOM();
});

// ============================================================
// Initialization
// ============================================================

export function initTimedActivities() {
    renderTimedActivitiesToDOM();
}