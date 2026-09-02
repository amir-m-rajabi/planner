// فایل: Components/dashboard/sessions/sessions.js

import { timedActivities } from "../timed-activities/timed-activities.js";

export let sessions = [
    {
        id: 101,
        activityId: 2,
        title: "برنامه‌نویسی",
        color: "#4f9ea5",
        startTime: "10:30:00",
        endTime: "12:15:00",
        duration: "1 ساعت و 45 دقیقه",
        hasNote: false,
        date: new Date().toISOString()
    },
    {
        id: 102,
        activityId: 1,
        title: "مطالعه ریاضی",
        color: "#e0a458",
        startTime: "14:00:00",
        endTime: "15:20:00",
        duration: "1 ساعت و 20 دقیقه",
        hasNote: true,
        date: new Date().toISOString()
    },
    {
        id: 103,
        activityId: 3,
        title: "زبان انگلیسی",
        color: "#d96b6b",
        startTime: "17:10:00",
        endTime: "18:00:00",
        duration: "50 دقیقه",
        hasNote: false,
        date: new Date().toISOString()
    }
];

let eventsInitialized = false;
let sessionModalMode = "add";
let selectedSession = null;
let sessionToDelete = null;
let sessionForNote = null;

let currentSelectedDate = null;
let currentSessionsDateLabel = "امروز";

// ========================================
// توابع کمکی تاریخ
// ========================================

function getDateKey(date) {
    if (!date) return new Date().toDateString();
    return date.toDateString();
}

function isToday(date) {
    if (!date) return true;
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
}

function isDateInFuture(date) {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate > today;
}

// ========================================
// دریافت سشن‌های یک تاریخ خاص
// ========================================

function getSessionsForDate(date) {
    if (!date) {
        // فقط سشن‌های امروز
        return sessions.filter(session => {
            if (session.date) {
                const sessionDate = new Date(session.date);
                return isToday(sessionDate);
            }
            return true;
        });
    }
    
    const dateStr = date.toDateString();
    return sessions.filter(session => {
        if (session.date) {
            const sessionDate = new Date(session.date);
            return sessionDate.toDateString() === dateStr;
        }
        return new Date().toDateString() === dateStr;
    });
}

function getVisibleSessions() {
    if (!currentSelectedDate) {
        // فقط سشن‌های امروز
        return sessions.filter(session => {
            if (session.date) {
                const sessionDate = new Date(session.date);
                return isToday(sessionDate);
            }
            return true;
        });
    }
    return getSessionsForDate(currentSelectedDate);
}

// ========================================
// مرتب‌سازی سشن‌ها بر اساس زمان شروع
// ========================================

function sortSessionsByTime(sessionsList) {
    return [...sessionsList].sort((a, b) => {
        const aStart = a.startTime.split(':').map(Number);
        const bStart = b.startTime.split(':').map(Number);
        const aMinutes = aStart[0] * 60 + aStart[1];
        const bMinutes = bStart[0] * 60 + bStart[1];
        
        if (aMinutes !== bMinutes) {
            return aMinutes - bMinutes;
        }
        
        const aEnd = a.endTime.split(':').map(Number);
        const bEnd = b.endTime.split(':').map(Number);
        return (aEnd[0] * 60 + aEnd[1]) - (bEnd[0] * 60 + bEnd[1]);
    });
}

// ========================================
// توابع کمکی زمان
// ========================================

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function timeToMinutes(time) {
    const parts = time.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function formatDisplayTime(time) {
    if (!time) return "";
    return time.split(":").slice(0, 2).join(":");
}

function calculateDurationText(startTime, endTime) {
    const startTotal = timeToMinutes(startTime);
    const endTotal = timeToMinutes(endTime);
    let diffMinutes = endTotal - startTotal;
    if (diffMinutes < 0) diffMinutes += 1440;

    if (diffMinutes === 0) return "۰ دقیقه";
    if (diffMinutes < 60) return `${diffMinutes} دقیقه`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return minutes === 0 ? `${hours} ساعت` : `${hours} ساعت و ${minutes} دقیقه`;
}

export function getTotalDuration(sessionsList) {
    let totalMinutes = 0;
    sessionsList.forEach(session => {
        const start = timeToMinutes(session.startTime);
        const end = timeToMinutes(session.endTime);
        let diff = end - start;
        if (diff < 0) diff += 1440;
        totalMinutes += diff;
    });
    return totalMinutes;
}

export function formatTotalDuration(minutes) {
    if (minutes === 0) return "00:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// ========================================
// توابع اعتبارسنجی سشن
// ========================================

function validateSessionTimes(startTime, endTime, excludeSessionId = null, targetDate = null) {
    const startTotal = timeToMinutes(startTime);
    const endTotal = timeToMinutes(endTime);
    const nowTotal = timeToMinutes(getCurrentTime());

    if (startTotal >= endTotal) {
        return { valid: false, message: "زمان پایان باید بعد از زمان شروع باشد." };
    }

    if (targetDate && isDateInFuture(targetDate)) {
        return { 
            valid: false, 
            message: "❌ امکان ثبت سشن در روزهای آینده وجود ندارد. لطفاً روزی از گذشته یا امروز را انتخاب کنید." 
        };
    }

    const isPastDate = targetDate && !isToday(targetDate) && targetDate < new Date();
    if (!isPastDate) {
        if (endTotal > nowTotal) {
            return { valid: false, message: "⏰ امکان ثبت سشن در آینده وجود ندارد. زمان پایان باید برابر یا قبل از زمان حال باشد." };
        }
        if (startTotal > nowTotal) {
            return { valid: false, message: "⏰ امکان ثبت سشن در آینده وجود ندارد. زمان شروع باید برابر یا قبل از زمان حال باشد." };
        }
    }

    const dateToCheck = targetDate || new Date();
    const daySessions = sessions.filter(s => {
        if (s.id === excludeSessionId) return false;
        if (s.date) {
            const sessionDate = new Date(s.date);
            return sessionDate.toDateString() === dateToCheck.toDateString();
        }
        return new Date().toDateString() === dateToCheck.toDateString();
    });
    
    for (const session of daySessions) {
        const sessionStart = timeToMinutes(session.startTime);
        const sessionEnd = timeToMinutes(session.endTime);
        
        if (startTotal < sessionEnd && endTotal > sessionStart) {
            return { 
                valid: false, 
                message: `⛔ این بازه زمانی با سشن "${session.title}" (${formatDisplayTime(session.startTime)} تا ${formatDisplayTime(session.endTime)}) در این روز تداخل دارد.` 
            };
        }
    }

    return { valid: true };
}

// ========================================
// تابع بروزرسانی سلکت فعالیت‌ها
// ========================================

function updateActivitySelect() {
    const select = document.getElementById('sessionActivity');
    if (!select) return;

    const currentValue = select.value;

    const options = timedActivities
        .filter(activity => !activity.archived)
        .map(activity => `
            <option 
                value="${activity.id}" 
                style="background-color: ${activity.color}22; color: ${activity.color}; font-weight: 600; padding: 6px 12px; border-radius: 4px;"
                data-color="${activity.color}"
            >
                ${activity.title}
            </option>
        `)
        .join('');

    select.innerHTML = `
        <option value="" style="background-color: transparent; color: var(--color-text-secondary);">انتخاب فعالیت</option>
        ${options}
    `;

    if (currentValue && timedActivities.some(a => a.id === parseInt(currentValue))) {
        select.value = currentValue;
    }
}

// ========================================
// Error Modal
// ========================================

function ErrorModal() {
    return `
        <div class="error-modal" id="errorModal" aria-hidden="true">
            <div class="error-modal__overlay"></div>
            <div class="error-modal__box">
                <div class="error-modal__icon">⚠️</div>
                <h2 class="error-modal__title">خطا</h2>
                <p class="error-modal__message" id="errorModalMessage">خطا رخ داده است.</p>
                <button type="button" class="error-modal__button" id="errorModalButton">متوجه شدم</button>
            </div>
        </div>
    `;
}

function showError(message) {
    const modal = document.querySelector("#errorModal");
    const messageEl = document.querySelector("#errorModalMessage");
    if (!modal || !messageEl) return;
    messageEl.textContent = message;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
}

function closeErrorModal() {
    const modal = document.querySelector("#errorModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
}

// ========================================
// All Sessions Modal
// ========================================

export function AllSessionsModal() {
    const visibleSessions = getVisibleSessions();
    const sortedSessions = sortSessionsByTime(visibleSessions);
    const totalMinutes = getTotalDuration(sortedSessions);
    const formatted = formatTotalDuration(totalMinutes);

    return `
        <div class="sessions-modal" id="sessionsModal" aria-hidden="true">
            <div class="sessions-modal__overlay"></div>
            <div class="sessions-modal__box">
                <header class="sessions-modal__header">
                    <div class="sessions-modal__header-info">
                        <span class="sessions-modal__label">فعالیت‌های امروز</span>
                        <h2 class="sessions-modal__title">سشن‌های امروز</h2>
                        <span class="sessions-modal__date">${getPersianDate()}</span>
                    </div>
                    <button class="sessions-modal__close" type="button" aria-label="بستن" id="sessionsModalClose">×</button>
                </header>

                <div class="sessions-modal__summary">
                    <div class="sessions-modal__summary-item">
                        <span>زمان مفید</span>
                        <strong>${formatted}</strong>
                    </div>
                    <div class="sessions-modal__summary-divider"></div>
                    <div class="sessions-modal__summary-item">
                        <span>تعداد سشن</span>
                        <strong>${sortedSessions.length}</strong>
                    </div>
                    <button class="sessions-modal__add" type="button" data-action="add-session">
                        <span class="sessions-modal__add-icon">+</span>
                        افزودن سشن
                    </button>
                </div>

                <main class="sessions-modal__content">
                    <div class="sessions-modal__list">
                        ${sortedSessions.length > 0
                            ? sortedSessions.map(createSessionHTML).join("")
                            : `<div class="sessions-modal__empty">${
                                isToday(currentSelectedDate)
                                    ? "هیچ سشنی ثبت نشده است."
                                    : `برای ${currentSessionsDateLabel} سشنی ثبت نشده است.`
                              }</div>`
                        }
                    </div>
                </main>

                <footer class="sessions-modal__footer">
                    <span class="sessions-modal__footer-text">${sortedSessions.length} سشن در این روز ثبت شده است</span>
                    <button class="sessions-modal__footer-close" type="button" id="sessionsModalFooterClose">بستن</button>
                </footer>
            </div>
        </div>
    `;
}

function getPersianDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('fa-IR', options);
}

function openAllSessionsModal() {
    const modal = document.querySelector("#sessionsModal");
    if (!modal) return;
    updateTotalDuration();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
}

function closeAllSessionsModal() {
    const modal = document.querySelector("#sessionsModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
}

// ========================================
// Session Form Modal (Add/Edit)
// ========================================

export function SessionFormModal() {
    const activityOptions = timedActivities
        .filter(activity => !activity.archived)
        .map(activity => `
            <option 
                value="${activity.id}" 
                data-color="${activity.color}"
                style="background-color: ${activity.color}22; color: ${activity.color}; font-weight: 600;"
            >
                ● ${activity.title}
            </option>
        `)
        .join('');

    const hourOptions = Array.from({ length: 24 }, (_, i) => {
        const hour = String(i).padStart(2, '0');
        return `<option value="${hour}">${hour}</option>`;
    }).join('');

    const minuteOptions = Array.from({ length: 60 }, (_, i) => {
        const minute = String(i).padStart(2, '0');
        return `<option value="${minute}">${minute}</option>`;
    }).join('');

    return `
        <div class="session-modal" id="sessionFormModal" aria-hidden="true">
            <div class="session-modal__overlay"></div>
            <div class="session-modal__box">
                <header class="session-modal__header">
                    <div class="session-modal__header-info">
                        <span class="session-modal__label">ثبت زمان فعالیت</span>
                        <h2 class="session-modal__title" id="sessionFormModalTitle">افزودن سشن</h2>
                        <p class="session-modal__description">زمان انجام فعالیت را ثبت کنید.</p>
                    </div>
                    <button type="button" class="session-modal__close" id="sessionFormModalClose" aria-label="بستن">×</button>
                </header>

                <form class="session-form" id="sessionForm">
                    <div class="session-form__field">
                        <label for="sessionActivity" class="session-form__label">فعالیت</label>
                        <div class="session-form__select-wrapper">
                            <select id="sessionActivity" name="activity" class="session-form__select" required>
                                <option value="" style="background-color: transparent; color: var(--color-text-secondary);">انتخاب فعالیت</option>
                                ${activityOptions}
                            </select>
                            <span class="session-form__select-arrow" aria-hidden="true">⌄</span>
                        </div>
                    </div>

                    <div class="session-form__field">
                        <label class="session-form__label">زمان فعالیت</label>
                        <div class="session-form__time">
                            <div class="session-form__time-group">
                                <span class="session-form__time-label">شروع</span>
                                <div class="session-form__time-input">
                                    <select id="sessionStartHour" required>
                                        <option value="">ساعت</option>
                                        ${hourOptions}
                                    </select>
                                    <span>:</span>
                                    <select id="sessionStartMinute" required>
                                        <option value="">دقیقه</option>
                                        ${minuteOptions}
                                    </select>
                                </div>
                            </div>

                            <span class="session-form__time-arrow" aria-hidden="true">←</span>

                            <div class="session-form__time-group">
                                <span class="session-form__time-label">پایان</span>
                                <div class="session-form__time-input">
                                    <select id="sessionEndHour" required>
                                        <option value="">ساعت</option>
                                        ${hourOptions}
                                    </select>
                                    <span>:</span>
                                    <select id="sessionEndMinute" required>
                                        <option value="">دقیقه</option>
                                        ${minuteOptions}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="session-form__duration">
                        <span class="session-form__duration-label">مدت زمان</span>
                        <strong class="session-form__duration-value" id="sessionDuration">۰ دقیقه</strong>
                    </div>

                    <div class="session-form__actions">
                        <button type="button" class="session-form__cancel" id="sessionFormCancel">انصراف</button>
                        <button type="submit" class="session-form__submit" id="sessionFormSubmit">افزودن سشن</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// ========================================
// Session Form Functions
// ========================================

function calculateDuration() {
    const modal = document.querySelector("#sessionFormModal");
    if (!modal) return;

    const startHour = parseInt(modal.querySelector("#sessionStartHour").value) || 0;
    const startMinute = parseInt(modal.querySelector("#sessionStartMinute").value) || 0;
    const endHour = parseInt(modal.querySelector("#sessionEndHour").value) || 0;
    const endMinute = parseInt(modal.querySelector("#sessionEndMinute").value) || 0;
    const durationDisplay = modal.querySelector("#sessionDuration");

    if (!startHour && !startMinute && !endHour && !endMinute) {
        durationDisplay.textContent = "۰ دقیقه";
        return;
    }

    let startTotal = (startHour * 60) + startMinute;
    let endTotal = (endHour * 60) + endMinute;
    let diffMinutes = endTotal - startTotal;
    if (diffMinutes < 0) diffMinutes += 1440;

    if (diffMinutes === 0) {
        durationDisplay.textContent = "۰ دقیقه";
    } else if (diffMinutes < 60) {
        durationDisplay.textContent = `${diffMinutes} دقیقه`;
    } else {
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        if (minutes === 0) {
            durationDisplay.textContent = `${hours} ساعت`;
        } else {
            durationDisplay.textContent = `${hours} ساعت و ${minutes} دقیقه`;
        }
    }
}

function updateSessionModal() {
    const modal = document.querySelector("#sessionFormModal");
    if (!modal) return;

    updateActivitySelect();

    const title = modal.querySelector("#sessionFormModalTitle");
    const activitySelect = modal.querySelector("#sessionActivity");
    const startHour = modal.querySelector("#sessionStartHour");
    const startMinute = modal.querySelector("#sessionStartMinute");
    const endHour = modal.querySelector("#sessionEndHour");
    const endMinute = modal.querySelector("#sessionEndMinute");
    const durationDisplay = modal.querySelector("#sessionDuration");
    const submitButton = modal.querySelector("#sessionFormSubmit");

    if (sessionModalMode === "add") {
        title.textContent = "افزودن سشن";
        submitButton.textContent = "افزودن سشن";
        activitySelect.value = "";
        
        startHour.value = "";
        startMinute.value = "00";
        endHour.value = "";
        endMinute.value = "00";
        durationDisplay.textContent = "۰ دقیقه";
        return;
    }

    if (sessionModalMode === "edit" && selectedSession) {
        title.textContent = "ویرایش سشن";
        submitButton.textContent = "ذخیره تغییرات";

        activitySelect.value = String(selectedSession.activityId);
        
        const startParts = selectedSession.startTime.split(':');
        startHour.value = startParts[0] || '';
        startMinute.value = startParts[1] || '';

        const endParts = selectedSession.endTime.split(':');
        endHour.value = endParts[0] || '';
        endMinute.value = endParts[1] || '';

        calculateDuration();
    }
}

// ========================================
// توابع عمومی برای استفاده در سایر ماژول‌ها
// ========================================

export function openSessionModal(mode, session = null) {
    sessionModalMode = mode;
    selectedSession = session;
    const modal = document.querySelector("#sessionFormModal");
    if (!modal) return;
    updateSessionModal();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
}

export function closeSessionModal() {
    const modal = document.querySelector("#sessionFormModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    selectedSession = null;
    sessionModalMode = "add";
}

export function openDeleteSessionModal(session) {
    sessionToDelete = session;
    const modal = document.querySelector("#deleteSessionModal");
    if (!modal) return;

    const color = modal.querySelector("#deleteSessionColor");
    const title = modal.querySelector("#deleteSessionTitle");
    const time = modal.querySelector("#deleteSessionTime");

    color.style.backgroundColor = session.color;
    title.textContent = session.title;
    time.textContent = `${formatDisplayTime(session.startTime)} ← ${formatDisplayTime(session.endTime)}`;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
}

export function closeDeleteSessionModal() {
    const modal = document.querySelector("#deleteSessionModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    sessionToDelete = null;
}

// ========================================
// Delete Session Modal
// ========================================

function DeleteSessionModal() {
    return `
        <div class="delete-session-modal" id="deleteSessionModal" aria-hidden="true">
            <div class="delete-session-modal__overlay"></div>
            <div class="delete-session-modal__box">
                <div class="delete-session-modal__icon">!</div>
                <div class="delete-session-modal__content">
                    <h2 class="delete-session-modal__title">حذف سشن</h2>
                    <p class="delete-session-modal__message">آیا از حذف این سشن مطمئن هستید؟</p>
                    <div class="delete-session-modal__session">
                        <span class="delete-session-modal__session-color" id="deleteSessionColor"></span>
                        <div class="delete-session-modal__session-info">
                            <strong id="deleteSessionTitle">برنامه‌نویسی</strong>
                            <span id="deleteSessionTime">10:30 ← 12:15</span>
                        </div>
                    </div>
                    <p class="delete-session-modal__warning">این سشن به‌طور کامل حذف می‌شود و قابل بازگردانی نیست.</p>
                </div>
                <div class="delete-session-modal__actions">
                    <button type="button" class="delete-session-modal__cancel" id="deleteSessionCancel">انصراف</button>
                    <button type="button" class="delete-session-modal__confirm" id="deleteSessionConfirm">حذف سشن</button>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// Session Note Modal
// ========================================

function SessionNoteModal() {
    return `
        <div class="session-note-modal" id="sessionNoteModal" aria-hidden="true">
            <div class="session-note-modal__overlay"></div>
            <div class="session-note-modal__box" role="dialog" aria-modal="true" aria-labelledby="sessionNoteModalTitle">
                <header class="session-note-modal__header">
                    <div>
                        <span class="session-note-modal__label">یادداشت Session</span>
                        <h2 class="session-note-modal__title" id="sessionNoteModalTitle">یادداشت</h2>
                    </div>
                    <button type="button" class="session-note-modal__close" id="sessionNoteModalClose" aria-label="بستن">×</button>
                </header>

                <div class="session-note-modal__session">
                    <strong id="sessionNoteActivity" class="session-note-modal__activity">برنامه‌نویسی</strong>
                    <span id="sessionNoteTime" class="session-note-modal__time">10:30 ← 12:15</span>
                </div>

                <form class="session-note-form" id="sessionNoteForm">
                    <textarea id="sessionNoteInput" class="session-note-form__textarea" placeholder="نکته یا توضیحات این Session را بنویسید..." maxlength="1000"></textarea>
                    <div class="session-note-form__footer">
                        <span class="session-note-form__hint">یادداشت مخصوص همین Session است.</span>
                        <div class="session-note-form__actions">
                            <button type="button" class="session-note-form__cancel" id="sessionNoteCancel">انصراف</button>
                            <button type="submit" class="session-note-form__submit">ذخیره یادداشت</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
}

export function openSessionNoteModal(session) {
    sessionForNote = session;
    const modal = document.querySelector("#sessionNoteModal");
    if (!modal) return;

    const activity = modal.querySelector("#sessionNoteActivity");
    const time = modal.querySelector("#sessionNoteTime");
    const input = modal.querySelector("#sessionNoteInput");

    activity.textContent = session.title;
    time.textContent = `${formatDisplayTime(session.startTime)} ← ${formatDisplayTime(session.endTime)}`;
    input.value = session.note || "";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    input.focus();
}

export function closeSessionNoteModal() {
    const modal = document.querySelector("#sessionNoteModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    sessionForNote = null;
}

// ========================================
// Session Card
// ========================================

export function createSessionHTML(session) {
    const hasNote = Boolean(session.note);
    return `
        <article class="recent-activity" data-activity-id="${session.activityId}" data-session-id="${session.id}" style="--activity-color: ${session.color}">
            <span class="recent-activity__color" aria-hidden="true"></span>
            <div class="recent-activity__main">
                <div class="recent-activity__info">
                    <h3 class="recent-activity__title">${session.title}</h3>
                    <div class="recent-activity__time">
                        <span class="recent-activity__start">${formatDisplayTime(session.startTime)}</span>
                        <span class="recent-activity__separator" aria-hidden="true">←</span>
                        <span class="recent-activity__end">${formatDisplayTime(session.endTime)}</span>
                    </div>
                </div>
                <span class="recent-activity__duration">${session.duration}</span>
                <div class="recent-activity__actions">
                    <button type="button" class="recent-activity__action recent-activity__edit" data-action="edit-session" data-session-id="${session.id}" aria-label="ویرایش سشن" title="ویرایش">✎</button>
                    <button type="button" class="recent-activity__action recent-activity__delete" data-action="delete-session" data-session-id="${session.id}" aria-label="حذف سشن" title="حذف">🗑</button>
                </div>
            </div>
            <button type="button" class="recent-activity__note ${hasNote ? "recent-activity__note--has-note" : ""}" data-action="session-note" data-session-id="${session.id}" aria-label="${hasNote ? "مشاهده یادداشت" : "افزودن یادداشت"}" title="${hasNote ? "مشاهده یادداشت" : "افزودن یادداشت"}">${hasNote ? "📖" : "+"}</button>
        </article>
    `;
}

// ========================================
// Render Sessions List
// ========================================

export function renderSessionsList() {
    const visibleSessions = getVisibleSessions();
    const sortedSessions = sortSessionsByTime(visibleSessions);

    if (sortedSessions.length === 0) {
        const message = isToday(currentSelectedDate)
            ? "هیچ سشنی برای امروز ثبت نشده است."
            : `برای ${currentSessionsDateLabel} سشنی ثبت نشده است.`;
        return `<div class="recent-activities__empty">${message}</div>`;
    }
    return sortedSessions.map(createSessionHTML).join("");
}

export function renderSessionListToDOM() {
    const list = document.querySelector("#sessionsList");
    if (!list) return;
    list.innerHTML = renderSessionsList();
    updateTotalDuration();
}

export function renderSessionsModalListToDOM() {
    const list = document.querySelector(".sessions-modal__list");
    if (!list) return;

    const visibleSessions = getVisibleSessions();
    const sortedSessions = sortSessionsByTime(visibleSessions);

    list.innerHTML = sortedSessions.length > 0
        ? sortedSessions.map(createSessionHTML).join("")
        : `<div class="sessions-modal__empty">${
            isToday(currentSelectedDate)
                ? "هیچ سشنی ثبت نشده است."
                : `برای ${currentSessionsDateLabel} سشنی ثبت نشده است.`
          }</div>`;

    updateTotalDuration();
}

// ========================================
// به‌روزرسانی زمان مفید + تعداد سشن
// ========================================

function updateTotalDuration() {
    const visibleSessions = getVisibleSessions();
    const sortedSessions = sortSessionsByTime(visibleSessions);
    const totalMinutes = getTotalDuration(sortedSessions);
    const formatted = formatTotalDuration(totalMinutes);

    const summaryItems = document.querySelectorAll('.sessions-modal__summary-item strong');
    summaryItems.forEach(item => {
        const label = item.closest('.sessions-modal__summary-item').querySelector('span')?.textContent;
        if (label === 'زمان مفید') {
            item.textContent = formatted;
        } else if (label === 'تعداد سشن') {
            item.textContent = sortedSessions.length;
        }
    });

    const footerText = document.querySelector('.sessions-modal__footer-text');
    if (footerText) {
        footerText.textContent = `${sortedSessions.length} سشن در این روز ثبت شده است`;
    }
}

// ========================================
// بروزرسانی عنوان‌ها
// ========================================

function updateSessionTitles(date, label) {
    const eyebrowEl = document.getElementById("sessionsEyebrow");
    const titleEl = document.getElementById("sessionsTitle");
    const modalLabelEl = document.querySelector(".sessions-modal__label");
    const modalTitleEl = document.querySelector(".sessions-modal__title");
    const modalDateEl = document.querySelector(".sessions-modal__date");

    const isTodayDate = isToday(date);
    const displayLabel = isTodayDate ? "امروز" : label;

    if (eyebrowEl) eyebrowEl.textContent = displayLabel;
    if (titleEl) titleEl.textContent = isTodayDate ? "سشن‌های امروز" : `سشن‌های ${displayLabel}`;
    if (modalLabelEl) modalLabelEl.textContent = `فعالیت‌های ${displayLabel}`;
    if (modalTitleEl) modalTitleEl.textContent = isTodayDate ? "سشن‌های امروز" : `سشن‌های ${displayLabel}`;
    if (modalDateEl) modalDateEl.textContent = isTodayDate ? getPersianDate() : displayLabel;
}

// ========================================
// فیلتر سشن‌ها بر اساس تاریخ انتخاب شده
// ========================================

export function filterSessionsByDate(date, label) {
    currentSelectedDate = date;
    currentSessionsDateLabel = label || "امروز";
    
    updateSessionTitles(date, currentSessionsDateLabel);
    renderSessionListToDOM();
    renderSessionsModalListToDOM();
}

// ========================================
// برگرداندن به حالت امروز
// ========================================

export function resetToTodaySessions() {
    currentSelectedDate = null;
    currentSessionsDateLabel = "امروز";
    renderSessionListToDOM();
    renderSessionsModalListToDOM();
}

// ========================================
// Main Component
// ========================================

export function Sessions() {
    return `
        <section class="recent-activities">
            <header class="recent-activities__header">
                <div class="recent-activities__heading">
                    <span class="recent-activities__eyebrow" id="sessionsEyebrow">امروز</span>
                    <h2 class="recent-activities__title" id="sessionsTitle">سشن‌های امروز</h2>
                </div>
                <button type="button" class="recent-activities__view-all" data-action="view-all-sessions">
                    <span>مشاهده همه</span>
                    <span class="recent-activities__view-all-icon" aria-hidden="true">↗</span>
                </button>
            </header>

            <div class="recent-activities__content">
                <div class="recent-activities__list" id="sessionsList">
                    ${renderSessionsList()}
                </div>
            </div>

            <button type="button" class="recent-activities__add" data-action="add-session">
                <span class="recent-activities__add-icon" aria-hidden="true">+</span>
                <span>افزودن سشن</span>
            </button>
        </section>
    `;
}

// ========================================
// تزریق مودال‌ها و راه‌اندازی رویدادها
// ========================================

function initSessions() {
    if (!document.getElementById("sessionFormModal")) {
        document.body.insertAdjacentHTML(
            "beforeend",
            `${AllSessionsModal()}${SessionFormModal()}${DeleteSessionModal()}${SessionNoteModal()}${ErrorModal()}`
        );
    }
    setupSessionEvents();
}

// ========================================
// Event Listeners
// ========================================

function setupSessionEvents() {
    if (eventsInitialized) return;
    eventsInitialized = true;

    document.addEventListener("timed-activities:changed", () => {
        updateActivitySelect();
    });

    document.addEventListener("day:selected", (event) => {
        const { gy, gm, gd, isToday, label } = event.detail;
        
        let date = null;
        if (!isToday) {
            date = new Date(gy, gm - 1, gd);
        }
        
        filterSessionsByDate(date, label);
    });

    document.addEventListener("calendar:edit-session", (event) => {
        const { sessionId } = event.detail;
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            closeSessionModal();
            closeDeleteSessionModal();
            setTimeout(() => {
                openSessionModal('edit', session);
            }, 150);
        }
    });

    document.addEventListener("calendar:delete-session", (event) => {
        const { sessionId } = event.detail;
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            closeSessionModal();
            closeDeleteSessionModal();
            setTimeout(() => {
                openDeleteSessionModal(session);
            }, 150);
        }
    });

    document.addEventListener("calendar:session-note", (event) => {
        const { sessionId } = event.detail;
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            openSessionNoteModal(session);
        }
    });

    // ---- Add Session ----
    document.addEventListener("click", (event) => {
        const addButton = event.target.closest('[data-action="add-session"]');
        if (!addButton) return;
        openSessionModal("add");
    });

    // ---- Edit Session ----
    document.addEventListener("click", (event) => {
        const editButton = event.target.closest('[data-action="edit-session"]');
        if (!editButton) return;
        const sessionId = Number(editButton.dataset.sessionId);
        const session = sessions.find(item => item.id === sessionId);
        if (!session) return;
        openSessionModal("edit", session);
    });

    // ---- Close Session Form Modal ----
    document.addEventListener("click", (event) => {
        if (
            event.target.closest("#sessionFormModalClose") ||
            event.target.closest("#sessionFormCancel") ||
            event.target.classList.contains("session-modal__overlay")
        ) {
            closeSessionModal();
        }
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "Escape") {
            closeSessionModal();
        }
    });

    // ---- Calculate Duration on Time Change ----
    document.addEventListener("change", (event) => {
        const target = event.target;
        if (
            target.id === "sessionStartHour" ||
            target.id === "sessionStartMinute" ||
            target.id === "sessionEndHour" ||
            target.id === "sessionEndMinute"
        ) {
            calculateDuration();
        }
    });

    // ---- Submit Session Form ----
    document.addEventListener("submit", (event) => {
        const form = event.target.closest("#sessionForm");
        if (!form) return;
        event.preventDefault();

        const activityId = parseInt(form.querySelector("#sessionActivity").value);
        const startHour = form.querySelector("#sessionStartHour").value;
        const startMinute = form.querySelector("#sessionStartMinute").value;
        const endHour = form.querySelector("#sessionEndHour").value;
        const endMinute = form.querySelector("#sessionEndMinute").value;

        if (!activityId) { 
            showError("لطفاً یک فعالیت انتخاب کنید."); 
            return; 
        }
        if (!startHour || !startMinute || !endHour || !endMinute) { 
            showError("لطفاً زمان شروع و پایان را کامل وارد کنید."); 
            return; 
        }

        const activity = timedActivities.find(a => a.id === activityId);
        if (!activity) { 
            showError("فعالیت مورد نظر پیدا نشد."); 
            return; 
        }

        const startTime = `${startHour}:${startMinute}:00`;
        const endTime = `${endHour}:${endMinute}:00`;
        const durationText = calculateDurationText(startTime, endTime);

        let sessionDate = new Date();
        if (currentSelectedDate) {
            sessionDate = new Date(currentSelectedDate);
        }

        const validation = validateSessionTimes(startTime, endTime, selectedSession?.id || null, sessionDate);
        if (!validation.valid) {
            showError(validation.message);
            return;
        }

        if (sessionModalMode === "add") {
            const newSession = {
                id: Date.now(),
                activityId: activity.id,
                title: activity.title,
                color: activity.color,
                startTime: startTime,
                endTime: endTime,
                duration: durationText,
                hasNote: false,
                date: sessionDate.toISOString()
            };
            sessions.push(newSession);
        }

        if (sessionModalMode === "edit" && selectedSession) {
            selectedSession.activityId = activity.id;
            selectedSession.title = activity.title;
            selectedSession.color = activity.color;
            selectedSession.startTime = startTime;
            selectedSession.endTime = endTime;
            selectedSession.duration = durationText;
            selectedSession.date = sessionDate.toISOString();
        }

        closeSessionModal();
        renderSessionListToDOM();
        renderSessionsModalListToDOM();
        
        document.dispatchEvent(new CustomEvent('sessions:changed'));
    });

    // ---- View All Sessions ----
    document.addEventListener("click", (event) => {
        const button = event.target.closest(".recent-activities__view-all");
        if (!button) return;
        openAllSessionsModal();
    });

    document.addEventListener("click", (event) => {
        if (
            event.target.closest("#sessionsModalClose") ||
            event.target.closest("#sessionsModalFooterClose") ||
            event.target.classList.contains("sessions-modal__overlay")
        ) {
            closeAllSessionsModal();
        }
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "Escape") {
            closeAllSessionsModal();
        }
    });

    // ---- Delete Session ----
    document.addEventListener("click", (event) => {
        const deleteButton = event.target.closest('[data-action="delete-session"]');
        if (!deleteButton) return;
        const sessionId = Number(deleteButton.dataset.sessionId);
        const session = sessions.find(item => item.id === sessionId);
        if (!session) return;
        openDeleteSessionModal(session);
    });

    document.addEventListener("click", (event) => {
        const confirmButton = event.target.closest("#deleteSessionConfirm");
        if (!confirmButton) return;
        if (!sessionToDelete) return;
        sessions = sessions.filter(session => session.id !== sessionToDelete.id);
        closeDeleteSessionModal();
        renderSessionListToDOM();
        renderSessionsModalListToDOM();
        document.dispatchEvent(new CustomEvent('sessions:changed'));
    });

    document.addEventListener("click", (event) => {
        if (
            event.target.closest("#deleteSessionCancel") ||
            event.target.classList.contains("delete-session-modal__overlay")
        ) {
            closeDeleteSessionModal();
        }
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "Escape") {
            closeDeleteSessionModal();
        }
    });

    // ---- Session Note ----
    document.addEventListener("click", (event) => {
        const noteButton = event.target.closest('[data-action="session-note"]');
        if (!noteButton) return;
        const sessionId = Number(noteButton.dataset.sessionId);
        const session = sessions.find(item => item.id === sessionId);
        if (!session) return;
        openSessionNoteModal(session);
    });

    document.addEventListener("click", (event) => {
        if (
            event.target.closest("#sessionNoteModalClose") ||
            event.target.closest("#sessionNoteCancel") ||
            event.target.classList.contains("session-note-modal__overlay")
        ) {
            closeSessionNoteModal();
        }
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "Escape") {
            closeSessionNoteModal();
        }
    });

    document.addEventListener("submit", (event) => {
        if (event.target.id !== "sessionNoteForm") return;
        event.preventDefault();
        if (!sessionForNote) return;
        const input = document.querySelector("#sessionNoteInput");
        if (!input) return;
        sessionForNote.note = input.value.trim();
        closeSessionNoteModal();
        renderSessionListToDOM();
        renderSessionsModalListToDOM();
        document.dispatchEvent(new CustomEvent('sessions:changed'));
    });

    // ---- Error Modal Close ----
    document.addEventListener("click", (event) => {
        if (
            event.target.closest("#errorModalButton") ||
            event.target.classList.contains("error-modal__overlay")
        ) {
            closeErrorModal();
        }
    });

    document.addEventListener("keyup", (event) => {
        if (event.key === "Escape") {
            closeErrorModal();
        }
    });
}

export function updateSessionsForDate(date, label) {
    filterSessionsByDate(date, label);
}

// ========================================
// راه‌اندازی اولیه
// ========================================

setTimeout(() => {
    initSessions();
}, 0);