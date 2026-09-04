// File: Components/dashboard/sessions/sessions.js

import { timedActivities } from "../timed-activities/timed-activities.js";
import { ActivitySessionsAPI } from "../../../js/api.js";
import { TimedActivitiesAPI } from "../../../js/api.js";

// ============================================================
// State
// ============================================================

export let sessions = [];
let eventsInitialized = false;
let sessionModalMode = "add";
let selectedSession = null;
let sessionToDelete = null;
let sessionForNote = null;
let currentSelectedDate = null;
let currentSessionsDateLabel = "امروز";
let sessionsLoaded = false;

// ============================================================
// Date Helpers
// ============================================================

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

// ============================================================
// Load Sessions from Database
// ============================================================

async function loadSessionsFromDatabase() {
    try {
        const session = JSON.parse(localStorage.getItem('auth:session')) || {};
        const userId = session.userId;

        if (!userId) {
            sessions = [];
            sessionsLoaded = true;
            return;
        }

        const activities = await TimedActivitiesAPI.getAll(userId) || [];
        
        let allSessions = [];
        for (const activity of activities) {
            try {
                const activitySessions = await ActivitySessionsAPI.getByActivity(activity.id);
                if (activitySessions && activitySessions.length > 0) {
                    const formatted = activitySessions.map(s => {
                        const startDate = new Date(s.started_at);
                        const endDate = s.ended_at ? new Date(s.ended_at) : null;
                        
                        return {
                            id: Number(s.id),
                            activityId: Number(s.activity_id),
                            title: activity.title,
                            color: activity.color,
                            startTime: startDate.toTimeString().slice(0, 8),
                            endTime: endDate ? endDate.toTimeString().slice(0, 8) : '00:00:00',
                            durationMinutes: s.duration_minutes || 0,
                            duration: formatDurationDetailed(s.duration_minutes || 0),
                            hasNote: Boolean(s.note_session),
                            note: s.note_session || '',
                            date: s.started_at || new Date().toISOString()
                        };
                    });
                    allSessions = [...allSessions, ...formatted];
                }
            } catch (err) {
                // Silently handle individual activity errors
            }
        }

        sessions = allSessions;
        sessionsLoaded = true;

    } catch (error) {
        sessions = [];
        sessionsLoaded = true;
    }
}

// ============================================================
// Formatting Helpers
// ============================================================

function formatDurationMinutes(minutes) {
    if (!minutes || minutes === 0) return "۰ دقیقه";
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours === 0) return `${mins} دقیقه`;
    if (mins === 0) return `${hours} ساعت`;
    return `${hours} ساعت و ${mins} دقیقه`;
}

function formatDurationDetailed(minutes) {
    if (!minutes || minutes === 0) return "۰ دقیقه";
    
    const totalSeconds = Math.round(minutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    let parts = [];
    if (hours > 0) parts.push(`${hours} ساعت`);
    if (mins > 0) parts.push(`${mins} دقیقه`);
    if (secs > 0) parts.push(`${secs} ثانیه`);
    
    return parts.join(' و ') || "۰ دقیقه";
}

function formatUsefulTime(minutes) {
    if (!minutes || minutes === 0) return "00:00";
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// ============================================================
// Session Filters
// ============================================================

function getSessionsForDate(date) {
    const targetDateStr = date ? date.toDateString() : new Date().toDateString();
    
    return sessions.filter(session => {
        if (session.date) {
            const sessionDate = new Date(session.date);
            return sessionDate.toDateString() === targetDateStr;
        }
        return new Date().toDateString() === targetDateStr;
    });
}

function getVisibleSessions() {
    const targetDate = currentSelectedDate || new Date();
    const targetDateStr = targetDate.toDateString();
    
    return sessions.filter(session => {
        if (session.date) {
            const sessionDate = new Date(session.date);
            return sessionDate.toDateString() === targetDateStr;
        }
        return new Date().toDateString() === targetDateStr;
    });
}

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

// ============================================================
// Time Helpers
// ============================================================

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
        totalMinutes += session.durationMinutes || 0;
    });
    return totalMinutes;
}

export function formatTotalDuration(minutes) {
    return formatUsefulTime(minutes);
}

// ============================================================
// Session Validation
// ============================================================

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
            message: "❌ امکان ثبت سشن در روزهای آینده وجود ندارد." 
        };
    }

    const isPastDate = targetDate && !isToday(targetDate) && targetDate < new Date();
    if (!isPastDate) {
        if (endTotal > nowTotal) {
            return { valid: false, message: "⏰ زمان پایان باید برابر یا قبل از زمان حال باشد." };
        }
        if (startTotal > nowTotal) {
            return { valid: false, message: "⏰ زمان شروع باید برابر یا قبل از زمان حال باشد." };
        }
    }

    const dateToCheck = targetDate || new Date();
    const dateStr = dateToCheck.toDateString();
    
    const daySessions = sessions.filter(s => {
        if (excludeSessionId && s.id === excludeSessionId) return false;
        if (s.date) {
            const sessionDate = new Date(s.date);
            return sessionDate.toDateString() === dateStr;
        }
        return new Date().toDateString() === dateStr;
    });
    
    for (const session of daySessions) {
        const sessionStart = timeToMinutes(session.startTime);
        const sessionEnd = timeToMinutes(session.endTime);
        
        if (startTotal < sessionEnd && endTotal > sessionStart) {
            return { 
                valid: false, 
                message: `⛔ تداخل با فعالیت "${session.title}" (${formatDisplayTime(session.startTime)} تا ${formatDisplayTime(session.endTime)})` 
            };
        }
    }

    return { valid: true };
}

// ============================================================
// Update Activity Select
// ============================================================

async function updateActivitySelect() {
    const select = document.getElementById('sessionActivity');
    if (!select) return;

    const currentValue = select.value;

    try {
        const session = JSON.parse(localStorage.getItem('auth:session')) || {};
        const userId = session.userId;
        
        if (!userId) {
            select.innerHTML = `<option value="">وارد حساب کاربری شوید</option>`;
            return;
        }

        const activities = await TimedActivitiesAPI.getAll(userId) || [];

        if (activities.length === 0) {
            select.innerHTML = `<option value="">هیچ فعالیتی موجود نیست</option>`;
            return;
        }

        const options = activities
            .filter(activity => !activity.is_archived)
            .map(activity => `
                <option 
                    value="${activity.id}" 
                    style="background-color: ${activity.color}22; color: ${activity.color}; font-weight: 600;"
                    data-color="${activity.color}"
                >
                    ${activity.title}
                </option>
            `)
            .join('');

        select.innerHTML = `
            <option value="">انتخاب فعالیت</option>
            ${options}
        `;

        if (currentValue && activities.some(a => String(a.id) === currentValue)) {
            select.value = currentValue;
        }

    } catch (error) {
        select.innerHTML = `<option value="">خطا در بارگذاری</option>`;
    }
}

// ============================================================
// Error Modal
// ============================================================

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

// ============================================================
// All Sessions Modal
// ============================================================

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
                    <button class="sessions-modal__close" type="button" id="sessionsModalClose">×</button>
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
                     <button class="sessions-modal__delete-all" type="button" data-action="delete-all-sessions">
                        🗑 حذف همه
                    </button>
                    <button class="sessions-modal__add" type="button" data-action="add-session">
                        <span class="sessions-modal__add-icon">+</span>
                        افزودن سشن
                    </button>
                </div>

                <main class="sessions-modal__content">
                    <div class="sessions-modal__list">
                        ${sortedSessions.length > 0
                            ? sortedSessions.map(createSessionHTML).join("")
                            : `<div class="sessions-modal__empty">هیچ سشنی ثبت نشده است.</div>`
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
    return now.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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

// ============================================================
// Delete All Sessions Modal
// ============================================================

function DeleteAllSessionsModal() {
    return `
        <div class="delete-all-modal" id="deleteAllSessionsModal" aria-hidden="true">
            <div class="delete-all-modal__overlay"></div>
            <div class="delete-all-modal__box" role="alertdialog" aria-modal="true" aria-labelledby="deleteAllSessionsTitle">
                <div class="delete-all-modal__icon" aria-hidden="true">⚠️</div>
                <div class="delete-all-modal__content">
                    <h2 class="delete-all-modal__title" id="deleteAllSessionsTitle">حذف همه سشن‌ها</h2>
                    <p class="delete-all-modal__message">آیا از حذف <strong>همه</strong> سشن‌های این روز مطمئن هستید؟</p>
                    <p class="delete-all-modal__warning">این عمل غیرقابل بازگشت است و تمام سشن‌های این روز به طور کامل حذف می‌شوند.</p>
                </div>
                <div class="delete-all-modal__actions">
                    <button type="button" class="delete-all-modal__cancel" id="deleteAllSessionsCancel">انصراف</button>
                    <button type="button" class="delete-all-modal__confirm" id="deleteAllSessionsConfirm">حذف همه</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// Session Form Modal
// ============================================================

export function SessionFormModal() {
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
                    <button type="button" class="session-modal__close" id="sessionFormModalClose">×</button>
                </header>

                <form class="session-form" id="sessionForm">
                    <div class="session-form__field">
                        <label for="sessionActivity" class="session-form__label">فعالیت</label>
                        <div class="session-form__select-wrapper">
                            <select id="sessionActivity" name="activity" class="session-form__select" required>
                                <option value="">انتخاب فعالیت</option>
                            </select>
                            <span class="session-form__select-arrow">⌄</span>
                        </div>
                    </div>

                    <div class="session-form__field">
                        <label class="session-form__label">زمان فعالیت</label>
                        <div class="session-form__time">
                            <div class="session-form__time-group">
                                <span class="session-form__time-label">شروع</span>
                                <div class="session-form__time-input">
                                    <select id="sessionStartMinute" required>
                                        <option value="">دقیقه</option>
                                        ${minuteOptions}
                                    </select>
                                    <span>:</span>
                                    <select id="sessionStartHour" required>
                                        <option value="">ساعت</option>
                                        ${hourOptions}
                                    </select>
                                </div>
                            </div>

                            <span class="session-form__time-arrow">←</span>

                            <div class="session-form__time-group">
                                <span class="session-form__time-label">پایان</span>
                                <div class="session-form__time-input">
                                    <select id="sessionEndMinute" required>
                                        <option value="">دقیقه</option>
                                        ${minuteOptions}
                                    </select>
                                    <span>:</span>
                                    <select id="sessionEndHour" required>
                                        <option value="">ساعت</option>
                                        ${hourOptions}
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

// ============================================================
// Session Form Functions
// ============================================================

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
    const startMinute = modal.querySelector("#sessionStartMinute");
    const startHour = modal.querySelector("#sessionStartHour");
    const endMinute = modal.querySelector("#sessionEndMinute");
    const endHour = modal.querySelector("#sessionEndHour");
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

        setTimeout(() => {
            activitySelect.value = String(selectedSession.activityId);
        }, 200);

        activitySelect.disabled = false;
        
        const startParts = selectedSession.startTime.split(':');
        startHour.value = startParts[0] || '';
        startMinute.value = startParts[1] || '';

        const endParts = selectedSession.endTime.split(':');
        endHour.value = endParts[0] || '';
        endMinute.value = endParts[1] || '';

        calculateDuration();
    }
}

// ============================================================
// Delete Session Modal
// ============================================================

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

// ============================================================
// Session Note Modal
// ============================================================

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
                    <button type="button" class="session-note-modal__close" id="sessionNoteModalClose">×</button>
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

// ============================================================
// Session Card
// ============================================================

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
                        <span class="recent-activity__separator">←</span>
                        <span class="recent-activity__end">${formatDisplayTime(session.endTime)}</span>
                    </div>
                </div>
                <span class="recent-activity__duration">${session.duration}</span>
                <div class="recent-activity__actions">
                    <button type="button" class="recent-activity__action recent-activity__edit" data-action="edit-session" data-session-id="${session.id}">✎</button>
                    <button type="button" class="recent-activity__action recent-activity__delete" data-action="delete-session" data-session-id="${session.id}">🗑</button>
                </div>
            </div>
            <button type="button" class="recent-activity__note ${hasNote ? "recent-activity__note--has-note" : ""}" data-action="session-note" data-session-id="${session.id}">${hasNote ? "📖" : "+"}</button>
        </article>
    `;
}

// ============================================================
// Render Sessions List
// ============================================================

export function renderSessionsList() {
    if (!sessionsLoaded) {
        return `<div class="recent-activities__empty">در حال بارگذاری...</div>`;
    }

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

export async function renderSessionListToDOM() {
    const list = document.querySelector("#sessionsList");
    if (!list) return;
    
    if (!sessionsLoaded) {
        await loadSessionsFromDatabase();
    }
    
    list.innerHTML = renderSessionsList();
    updateTotalDuration();
}

export async function renderSessionsModalListToDOM() {
    const list = document.querySelector(".sessions-modal__list");
    if (!list) return;

    if (!sessionsLoaded) {
        await loadSessionsFromDatabase();
    }

    const visibleSessions = getVisibleSessions();
    const sortedSessions = sortSessionsByTime(visibleSessions);

    list.innerHTML = sortedSessions.length > 0
        ? sortedSessions.map(createSessionHTML).join("")
        : `<div class="sessions-modal__empty">هیچ سشنی ثبت نشده است.</div>`;

    updateTotalDuration();
}

// ============================================================
// Update Total Duration
// ============================================================

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

// ============================================================
// Update Titles
// ============================================================

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

// ============================================================
// Filter Sessions by Date
// ============================================================

export function filterSessionsByDate(date, label) {
    currentSelectedDate = date;
    currentSessionsDateLabel = label || "امروز";
    
    updateSessionTitles(date, currentSessionsDateLabel);
    renderSessionListToDOM();
    renderSessionsModalListToDOM();
}

// ============================================================
// Main Component
// ============================================================

export function Sessions() {
    setTimeout(() => {
        renderSessionListToDOM();
    }, 100);
    
    return `
        <section class="recent-activities">
            <header class="recent-activities__header">
                <div class="recent-activities__heading">
                    <span class="recent-activities__eyebrow" id="sessionsEyebrow">امروز</span>
                    <h2 class="recent-activities__title" id="sessionsTitle">سشن‌های امروز</h2>
                </div>
                <button type="button" class="recent-activities__view-all" data-action="view-all-sessions">
                    <span>مشاهده همه</span>
                    <span class="recent-activities__view-all-icon">↗</span>
                </button>
            </header>

            <div class="recent-activities__content">
                <div class="recent-activities__list" id="sessionsList">
                    در حال بارگذاری...
                </div>
            </div>

            <button type="button" class="recent-activities__add" data-action="add-session">
                <span class="recent-activities__add-icon">+</span>
                <span>افزودن سشن</span>
            </button>
        </section>
    `;
}

// ============================================================
// Public API
// ============================================================

export function openSessionModal(mode, session = null) {
    sessionModalMode = mode;
    selectedSession = session;
    const modal = document.querySelector("#sessionFormModal");
    if (!modal) return;
    updateActivitySelect();
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

// ============================================================
// Event Listeners Setup
// ============================================================

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

    // ============================================================
    // Click: Add Session
    // ============================================================

    document.addEventListener("click", (event) => {
        const addButton = event.target.closest('[data-action="add-session"]');
        if (!addButton) return;
        openSessionModal("add");
    });

    // ============================================================
    // Click: Edit Session
    // ============================================================

    document.addEventListener("click", (event) => {
        const editButton = event.target.closest('[data-action="edit-session"]');
        if (!editButton) return;
        
        const sessionId = Number(editButton.dataset.sessionId);
        
        if (sessions.length === 0) {
            loadSessionsFromDatabase().then(() => {
                const session = sessions.find(item => item.id === sessionId);
                if (session) {
                    openSessionModal("edit", session);
                } else {
                    showError('سشن پیدا نشد');
                }
            });
            return;
        }
        
        const session = sessions.find(item => Number(item.id) === sessionId);
        
        if (!session) {
            showError('سشن پیدا نشد');
            return;
        }
        
        openSessionModal("edit", session);
    });

    // ============================================================
    // Click: Delete Session
    // ============================================================

    document.addEventListener("click", (event) => {
        const deleteButton = event.target.closest('[data-action="delete-session"]');
        if (!deleteButton) return;
        
        const sessionId = Number(deleteButton.dataset.sessionId);
        
        if (sessions.length === 0) {
            loadSessionsFromDatabase().then(() => {
                const session = sessions.find(item => Number(item.id) === sessionId);
                if (session) {
                    openDeleteSessionModal(session);
                } else {
                    showError('سشن پیدا نشد');
                }
            });
            return;
        }
        
        const session = sessions.find(item => Number(item.id) === sessionId);
        if (!session) {
            showError('سشن پیدا نشد');
            return;
        }
        
        openDeleteSessionModal(session);
    });

    // ============================================================
    // Click: Session Note
    // ============================================================

    document.addEventListener("click", (event) => {
        const noteButton = event.target.closest('[data-action="session-note"]');
        if (!noteButton) return;
        
        const sessionId = Number(noteButton.dataset.sessionId);
        
        if (sessions.length === 0) {
            loadSessionsFromDatabase().then(() => {
                const session = sessions.find(item => Number(item.id) === sessionId);
                if (session) {
                    openSessionNoteModal(session);
                } else {
                    showError('سشن پیدا نشد');
                }
            });
            return;
        }
        
        const session = sessions.find(item => Number(item.id) === sessionId);
        if (!session) {
            showError('سشن پیدا نشد');
            return;
        }
        
        openSessionNoteModal(session);
    });

    // ============================================================
    // Click: Delete All Sessions
    // ============================================================

    document.addEventListener("click", (event) => {
        const deleteAllBtn = event.target.closest('[data-action="delete-all-sessions"]');
        if (!deleteAllBtn) return;
        
        const modal = document.querySelector("#deleteAllSessionsModal");
        if (!modal) return;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
    });

    // ============================================================
    // Click: Cancel Delete All
    // ============================================================

    document.addEventListener("click", (event) => {
        const cancelBtn = event.target.closest("#deleteAllSessionsCancel");
        if (!cancelBtn) return;
        
        const modal = document.querySelector("#deleteAllSessionsModal");
        if (!modal) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
    });

    // ============================================================
    // Click: Overlay Delete All
    // ============================================================

    document.addEventListener("click", (event) => {
        const overlay = event.target.closest(".delete-all-modal__overlay");
        if (!overlay) return;
        
        const modal = document.querySelector("#deleteAllSessionsModal");
        if (!modal) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
    });

    // ============================================================
    // Keydown: Escape
    // ============================================================

    document.addEventListener("keyup", (event) => {
        if (event.key === "Escape") {
            const modal = document.querySelector("#deleteAllSessionsModal");
            if (!modal) return;
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
        }
    });

    // ============================================================
    // Click: Confirm Delete All
    // ============================================================

    document.addEventListener("click", async (event) => {
        const confirmBtn = event.target.closest("#deleteAllSessionsConfirm");
        if (!confirmBtn) return;
        
        const visibleSessions = getVisibleSessions();
        if (visibleSessions.length === 0) {
            showError('هیچ سشنی برای حذف وجود ندارد.');
            return;
        }

        try {
            for (const session of visibleSessions) {
                await ActivitySessionsAPI.delete(session.id);
            }
            
            const sessionIds = visibleSessions.map(s => s.id);
            sessions = sessions.filter(s => !sessionIds.includes(s.id));
            
            const modal = document.querySelector("#deleteAllSessionsModal");
            if (modal) {
                modal.classList.remove("is-open");
                modal.setAttribute("aria-hidden", "true");
            }
            
            await renderSessionListToDOM();
            await renderSessionsModalListToDOM();
            document.dispatchEvent(new CustomEvent('sessions:changed'));

        } catch (error) {
            showError(error.message || 'خطا در حذف همه سشن‌ها');
        }
    });

    // ============================================================
    // Click: Close Session Modal
    // ============================================================

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

    // ============================================================
    // Change: Calculate Duration
    // ============================================================

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

    // ============================================================
    // Click: Confirm Delete Session
    // ============================================================

    document.addEventListener("click", async (event) => {
        const confirmButton = event.target.closest("#deleteSessionConfirm");
        if (!confirmButton) return;
        if (!sessionToDelete) return;

        try {
            await ActivitySessionsAPI.delete(sessionToDelete.id);
            
            sessions = sessions.filter(session => session.id !== sessionToDelete.id);
            
            closeDeleteSessionModal();
            await renderSessionListToDOM();
            await renderSessionsModalListToDOM();
            document.dispatchEvent(new CustomEvent('sessions:changed'));

        } catch (error) {
            showError(error.message || 'خطا در حذف سشن');
        }
    });

    // ============================================================
    // Click: Close Delete Session Modal
    // ============================================================

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

    // ============================================================
    // Click: Close Session Note Modal
    // ============================================================

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

    // ============================================================
    // Submit: Session Note Form
    // ============================================================

    document.addEventListener("submit", async (event) => {
        const form = event.target.closest("#sessionNoteForm");
        if (!form) return;
        event.preventDefault();
        
        if (!sessionForNote) {
            showError('سشنی برای یادداشت انتخاب نشده است');
            return;
        }
        
        const input = document.querySelector("#sessionNoteInput");
        if (!input) return;
        
        const noteText = input.value.trim();
        
        try {
            await ActivitySessionsAPI.update(sessionForNote.id, {
                note_session: noteText
            });
            
            const session = sessions.find(s => s.id === sessionForNote.id);
            if (session) {
                session.note = noteText;
                session.hasNote = Boolean(noteText);
            }
            
            closeSessionNoteModal();
            await renderSessionListToDOM();
            await renderSessionsModalListToDOM();
            document.dispatchEvent(new CustomEvent('sessions:changed'));
            
        } catch (error) {
            showError(error.message || 'خطا در ذخیره یادداشت');
        }
    });

    // ============================================================
    // Click: Close Error Modal
    // ============================================================

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

    // ============================================================
    // Click: View All Sessions
    // ============================================================

    document.addEventListener("click", (event) => {
        const button = event.target.closest(".recent-activities__view-all");
        if (!button) return;
        openAllSessionsModal();
    });

    // ============================================================
    // Click: Close All Sessions Modal
    // ============================================================

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

    // ============================================================
    // Submit: Session Form
    // ============================================================

    document.addEventListener("submit", async (event) => {
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

        const activity = timedActivities.find(a => Number(a.id) === activityId);
        if (!activity) { 
            showError(`فعالیت با شناسه ${activityId} پیدا نشد.`); 
            return; 
        }

        const startTime = `${startHour}:${startMinute}:00`;
        const endTime = `${endHour}:${endMinute}:00`;

        const validation = validateSessionTimes(startTime, endTime, selectedSession?.id || null, currentSelectedDate);
        if (!validation.valid) {
            showError(validation.message);
            return;
        }

        let sessionDate = new Date();
        if (currentSelectedDate) {
            sessionDate = new Date(currentSelectedDate);
        }

        const year = sessionDate.getFullYear();
        const month = String(sessionDate.getMonth() + 1).padStart(2, '0');
        const day = String(sessionDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const startDateTime = new Date(`${dateStr}T${startTime}`);
        const endDateTime = new Date(`${dateStr}T${endTime}`);

        try {
            if (sessionModalMode === "add") {
                await ActivitySessionsAPI.createManual(
                    activityId,
                    startDateTime.toISOString(),
                    endDateTime.toISOString(),
                    null
                );
            }

            if (sessionModalMode === "edit" && selectedSession) {
                await ActivitySessionsAPI.update(selectedSession.id, {
                    activity_id: activityId,
                    started_at: startDateTime.toISOString(),
                    ended_at: endDateTime.toISOString()
                });
            }

            closeSessionModal();
            
            await loadSessionsFromDatabase();
            updateActivitySelect();
            renderSessionListToDOM();
            renderSessionsModalListToDOM();
            
            document.dispatchEvent(new CustomEvent('sessions:changed'));

        } catch (error) {
            showError(error.message || 'خطا در ذخیره سشن');
        }
    });
}

// ============================================================
// Public Update Function
// ============================================================

export function updateSessionsForDate(date, label) {
    filterSessionsByDate(date, label);
}

// ============================================================
// Initialize Sessions
// ============================================================

function initSessions() {
    if (!document.getElementById("sessionFormModal")) {
        document.body.insertAdjacentHTML(
            "beforeend",
            `${AllSessionsModal()}${SessionFormModal()}${DeleteSessionModal()}${SessionNoteModal()}${DeleteAllSessionsModal()}${ErrorModal()}`
        );
    }
    setTimeout(() => {
        updateActivitySelect();
    }, 300);
    setupSessionEvents();
}

setTimeout(() => {
    initSessions();
}, 0);

export { loadSessionsFromDatabase };