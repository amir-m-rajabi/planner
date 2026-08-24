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
        hasNote: false
    },
    {
        id: 102,
        activityId: 1,
        title: "مطالعه ریاضی",
        color: "#e0a458",
        startTime: "14:00:00",
        endTime: "15:20:00",
        duration: "1 ساعت و 20 دقیقه",
        hasNote: true
    },
    {
        id: 103,
        activityId: 3,
        title: "زبان انگلیسی",
        color: "#d96b6b",
        startTime: "17:10:00",
        endTime: "18:00:00",
        duration: "50 دقیقه",
        hasNote: false
    }
];

let eventsInitialized = false;
let sessionModalMode = "add";
let selectedSession = null;
let sessionToDelete = null;
let sessionForNote = null;

// ========================================
// Main Component
// ========================================
export function Sessions() {
    setupSessionEvents();
    return `
        <section class="recent-activities">
            <header class="recent-activities__header">
                <div class="recent-activities__heading">
                    <span class="recent-activities__eyebrow"> امروز </span>
                    <h2 class="recent-activities__title">سشن‌های امروز</h2>
                </div>
                <button type="button" class="recent-activities__view-all" data-action="view-all-sessions">
                    <span>مشاهده همه</span>
                    <span class="recent-activities__view-all-icon" aria-hidden="true">↗</span>
                </button>
            </header>

            <div class="recent-activities__content">
                <div class="recent-activities__list">
                    ${renderSessionsList()}
                </div>
            </div>

            <button type="button" class="recent-activities__add" data-action="add-session">
                <span class="recent-activities__add-icon" aria-hidden="true">+</span>
                <span>افزودن سشن</span>
            </button>
        </section>

        ${AllSessionsModal()}
        ${SessionFormModal()}
        ${DeleteSessionModal()}
        ${SessionNoteModal()}
    `;
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
    return sessions.map(createSessionHTML).join("");
}

export function renderSessionListToDOM() {
    const list = document.querySelector(".recent-activities__list");
    if (!list) return;
    list.innerHTML = renderSessionsList();
}

export function renderSessionsModalListToDOM() {
    const list = document.querySelector(".sessions-modal__list");
    if (!list) return;
    list.innerHTML = renderSessionsList();
}

// ========================================
// All Sessions Modal
// ========================================
export function AllSessionsModal() {
    return `
        <div class="sessions-modal" id="sessionsModal" aria-hidden="true">
            <div class="sessions-modal__overlay"></div>
            <div class="sessions-modal__box">
                <header class="sessions-modal__header">
                    <div class="sessions-modal__header-info">
                        <span class="sessions-modal__label">فعالیت‌های امروز</span>
                        <h2 class="sessions-modal__title">سشن‌های امروز</h2>
                        <span class="sessions-modal__date">دوشنبه، ۱۰ شهریور ۱۴۰۵</span>
                    </div>
                    <button class="sessions-modal__close" type="button" aria-label="بستن">×</button>
                </header>

                <div class="sessions-modal__summary">
                    <div class="sessions-modal__summary-item">
                        <span>زمان مفید</span>
                        <strong>04:35</strong>
                    </div>
                    <div class="sessions-modal__summary-divider"></div>
                    <div class="sessions-modal__summary-item">
                        <span>تعداد سشن</span>
                        <strong>${sessions.length}</strong>
                    </div>
                    <button class="sessions-modal__add" type="button" data-action="add-session">
                        <span class="sessions-modal__add-icon">+</span>
                        افزودن سشن
                    </button>
                </div>

                <main class="sessions-modal__content">
                    <div class="sessions-modal__list">
                        ${renderSessionsList()}
                    </div>
                </main>

                <footer class="sessions-modal__footer">
                    <span class="sessions-modal__footer-text">${sessions.length} سشن در این روز ثبت شده است</span>
                    <button class="sessions-modal__footer-close" type="button">بستن</button>
                </footer>
            </div>
        </div>
    `;
}

function openAllSessionsModal() {
    const modal = document.querySelector("#sessionsModal");
    if (!modal) return;
    modal.classList.add("is-open");
}

function closeAllSessionsModal() {
    const modal = document.querySelector("#sessionsModal");
    if (!modal) return;
    modal.classList.remove("is-open");
}

// ========================================
// Session Form Modal (Add/Edit)
// ========================================
export function SessionFormModal() {
    // ====== سلکت فعالیت با رنگ هر option ======
    const activityOptions = timedActivities
        .map(activity => `
            <option 
                value="${activity.id}" 
                data-color="${activity.color}"
                style="background-color: ${activity.color}22; color: ${activity.color}; font-weight: 600; padding: 6px 12px;"
            >
                ${activity.title}
            </option>
        `)
        .join('');

    // ====== سلکت روز (۱ تا ۳۱) ======
    const dayOptions = Array.from({ length: 31 }, (_, i) => {
        const day = String(i + 1).padStart(2, '0');
        return `<option value="${day}">${day}</option>`;
    }).join('');

    // ====== سلکت ماه (۱ تا ۱۲) ======
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const month = String(i + 1).padStart(2, '0');
        return `<option value="${month}">${month}</option>`;
    }).join('');

    // ====== سلکت سال (۱۴۰۰ تا ۱۴۱۰) ======
    const yearOptions = Array.from({ length: 11 }, (_, i) => {
        const year = 1400 + i;
        return `<option value="${year}">${year}</option>`;
    }).join('');

    // ====== سلکت ساعت (۰ تا ۲۳) ======
    const hourOptions = Array.from({ length: 24 }, (_, i) => {
        const hour = String(i).padStart(2, '0');
        return `<option value="${hour}">${hour}</option>`;
    }).join('');

    // ====== سلکت دقیقه (۰ تا ۵۹) ======
    const minuteOptions = Array.from({ length: 60 }, (_, i) => {
        const minute = String(i).padStart(2, '0');
        return `<option value="${minute}">${minute}</option>`;
    }).join('');

    return `
        <div class="session-modal" id="sessionFormModal" aria-hidden="true">
            <div class="session-modal__overlay"></div>
            <div class="session-modal__box">
                <!-- Header -->
                <header class="session-modal__header">
                    <div class="session-modal__header-info">
                        <span class="session-modal__label">ثبت زمان فعالیت</span>
                        <h2 class="session-modal__title" id="sessionFormModalTitle">افزودن سشن</h2>
                        <p class="session-modal__description">زمان انجام فعالیت را ثبت کنید.</p>
                    </div>
                    <button type="button" class="session-modal__close" id="sessionFormModalClose" aria-label="بستن">×</button>
                </header>

                <!-- Form -->
                <form class="session-form" id="sessionForm">
                    <!-- Activity -->
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

                    <!-- Date -->
                    <div class="session-form__field">
                        <label class="session-form__label">تاریخ فعالیت</label>
                        <div class="session-form__date">
                            <select id="sessionDay" name="day" class="session-form__select" required>
                                <option value="">روز</option>
                                ${dayOptions}
                            </select>
                            <select id="sessionMonth" name="month" class="session-form__select" required>
                                <option value="">ماه</option>
                                ${monthOptions}
                            </select>
                            <select id="sessionYear" name="year" class="session-form__select" required>
                                <option value="">سال</option>
                                ${yearOptions}
                            </select>
                        </div>
                    </div>

                    <!-- Time -->
                    <div class="session-form__field">
                        <label class="session-form__label">زمان فعالیت</label>
                        <div class="session-form__time">
                            <!-- Start -->
                            <div class="session-form__time-group">
                                <span class="session-form__time-label">شروع</span>
                                <div class="session-form__time-input">
                                    <select id="sessionStartHour" name="startHour" required>
                                        <option value="">ساعت</option>
                                        ${hourOptions}
                                    </select>
                                    <span>:</span>
                                    <select id="sessionStartMinute" name="startMinute" required>
                                        <option value="">دقیقه</option>
                                        ${minuteOptions}
                                    </select>
                                </div>
                            </div>

                            <span class="session-form__time-arrow" aria-hidden="true">←</span>

                            <!-- End -->
                            <div class="session-form__time-group">
                                <span class="session-form__time-label">پایان</span>
                                <div class="session-form__time-input">
                                    <select id="sessionEndHour" name="endHour" required>
                                        <option value="">ساعت</option>
                                        ${hourOptions}
                                    </select>
                                    <span>:</span>
                                    <select id="sessionEndMinute" name="endMinute" required>
                                        <option value="">دقیقه</option>
                                        ${minuteOptions}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Duration -->
                    <div class="session-form__duration">
                        <span class="session-form__duration-label">مدت زمان</span>
                        <strong class="session-form__duration-value" id="sessionDuration">۰ دقیقه</strong>
                    </div>

                    <!-- Actions -->
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

    const title = modal.querySelector("#sessionFormModalTitle");
    const activitySelect = modal.querySelector("#sessionActivity");
    const daySelect = modal.querySelector("#sessionDay");
    const monthSelect = modal.querySelector("#sessionMonth");
    const yearSelect = modal.querySelector("#sessionYear");
    const startHour = modal.querySelector("#sessionStartHour");
    const startMinute = modal.querySelector("#sessionStartMinute");
    const endHour = modal.querySelector("#sessionEndHour");
    const endMinute = modal.querySelector("#sessionEndMinute");
    const durationDisplay = modal.querySelector("#sessionDuration");
    const submitButton = modal.querySelector("#sessionFormSubmit");

    // ====== حالت افزودن ======
    if (sessionModalMode === "add") {
        title.textContent = "افزودن سشن";
        submitButton.textContent = "افزودن سشن";
        activitySelect.value = "";
        daySelect.value = "";
        monthSelect.value = "";
        yearSelect.value = "";
        startHour.value = "";
        startMinute.value = "";
        endHour.value = "";
        endMinute.value = "";
        durationDisplay.textContent = "۰ دقیقه";
        // ====== رنگ select رو ریست کن ======
        activitySelect.style.backgroundColor = "";
        activitySelect.style.color = "";
        return;
    }

    // ====== حالت ویرایش ======
    if (sessionModalMode === "edit" && selectedSession) {
        title.textContent = "ویرایش سشن";
        submitButton.textContent = "ذخیره تغییرات";

        // ====== فقط مقدار سلکت رو تنظیم کن ======
        activitySelect.value = String(selectedSession.activityId);
        
        // ====== رنگ select رو ریست کن (سفید بمونه) ======
        activitySelect.style.backgroundColor = "";
        activitySelect.style.color = "";
        activitySelect.style.borderColor = "";

        // ====== تنظیم تاریخ ======
        const now = new Date();
        daySelect.value = String(now.getDate()).padStart(2, '0');
        monthSelect.value = String(now.getMonth() + 1).padStart(2, '0');
        yearSelect.value = "1405";

        // ====== تنظیم زمان شروع ======
        const startParts = selectedSession.startTime.split(':');
        startHour.value = startParts[0] || '';
        startMinute.value = startParts[1] || '';

        // ====== تنظیم زمان پایان ======
        const endParts = selectedSession.endTime.split(':');
        endHour.value = endParts[0] || '';
        endMinute.value = endParts[1] || '';

        // ====== محاسبه و نمایش مدت زمان ======
        calculateDuration();
    }
}

function openSessionModal(mode, session = null) {
    sessionModalMode = mode;
    selectedSession = session;
    const modal = document.querySelector("#sessionFormModal");
    if (!modal) return;
    updateSessionModal();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
}

function closeSessionModal() {
    const modal = document.querySelector("#sessionFormModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    selectedSession = null;
    sessionModalMode = "add";
}

// ========================================
// Delete Session Modal
// ========================================
function DeleteSessionModal() {
    return `
        <div class="delete-session-modal" id="deleteSessionModal">
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

function openDeleteSessionModal(session) {
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

function closeDeleteSessionModal() {
    const modal = document.querySelector("#deleteSessionModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    sessionToDelete = null;
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

function openSessionNoteModal(session) {
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

function closeSessionNoteModal() {
    const modal = document.querySelector("#sessionNoteModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    sessionForNote = null;
}

// ========================================
// Time Helpers
// ========================================
function formatDisplayTime(time) {
    if (!time) return "";
    return time.split(":").slice(0, 2).join(":");
}

// ========================================
// Event Listeners
// ========================================
function setupSessionEvents() {
    if (eventsInitialized) return;
    eventsInitialized = true;

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
// ---- Change Activity Select Color ----
document.addEventListener("change", (event) => {
    const target = event.target;
    
    // ====== تغییر رنگ select بر اساس انتخاب ======
    // if (target.id === "sessionActivity") {
    //     const selectedOption = target.querySelector(`option[value="${target.value}"]`);
    //     if (selectedOption && target.value) {
    //         const color = selectedOption.dataset.color;
    //         target.style.backgroundColor = color;
    //         target.style.color = "#ffffff";
    //         target.style.fontWeight = "600";
    //         target.style.borderColor = color;
    //     } else {
    //         target.style.backgroundColor = "";
    //         target.style.color = "";
    //         target.style.fontWeight = "";
    //         target.style.borderColor = "";
    //     }
    // }

    // ====== محاسبه خودکار duration ======
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
        const day = form.querySelector("#sessionDay").value;
        const month = form.querySelector("#sessionMonth").value;
        const year = form.querySelector("#sessionYear").value;
        const startHour = form.querySelector("#sessionStartHour").value;
        const startMinute = form.querySelector("#sessionStartMinute").value;
        const endHour = form.querySelector("#sessionEndHour").value;
        const endMinute = form.querySelector("#sessionEndMinute").value;

        if (!activityId) { alert("لطفاً یک فعالیت انتخاب کنید."); return; }
        if (!day || !month || !year) { alert("لطفاً تاریخ را کامل وارد کنید."); return; }
        if (!startHour || !startMinute || !endHour || !endMinute) { alert("لطفاً زمان شروع و پایان را کامل وارد کنید."); return; }

        const activity = timedActivities.find(a => a.id === activityId);
        if (!activity) { alert("فعالیت مورد نظر پیدا نشد."); return; }

        const startTime = `${startHour}:${startMinute}:00`;
        const endTime = `${endHour}:${endMinute}:00`;

        const startTotal = (parseInt(startHour) * 60) + parseInt(startMinute);
        const endTotal = (parseInt(endHour) * 60) + parseInt(endMinute);
        let diffMinutes = endTotal - startTotal;
        if (diffMinutes < 0) diffMinutes += 1440;

        let durationText = "";
        if (diffMinutes === 0) {
            durationText = "۰ دقیقه";
        } else if (diffMinutes < 60) {
            durationText = `${diffMinutes} دقیقه`;
        } else {
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            durationText = minutes === 0 ? `${hours} ساعت` : `${hours} ساعت و ${minutes} دقیقه`;
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
                hasNote: false
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
        }

        closeSessionModal();
        renderSessionListToDOM();
        renderSessionsModalListToDOM();
    });

    // ---- View All Sessions ----
    document.addEventListener("click", (event) => {
        const button = event.target.closest(".recent-activities__view-all");
        if (!button) return;
        openAllSessionsModal();
    });

    document.addEventListener("click", (event) => {
        if (
            event.target.closest(".sessions-modal__close") ||
            event.target.closest(".sessions-modal__footer-close") ||
            event.target.closest(".sessions-modal__overlay")
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
    });

    document.addEventListener("click", (event) => {
        if (
            event.target.closest("#deleteSessionCancel") ||
            event.target.closest(".delete-session-modal__overlay")
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
    });
}