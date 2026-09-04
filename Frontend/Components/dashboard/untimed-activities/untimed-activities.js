// File: Components/dashboard/untimed-activities/untimed-activities.js

import { UntimedActivitiesAPI, UntimedRecordsAPI } from "../../../js/api.js";

// ============================================================
// State
// ============================================================

export let untimedActivities = [];
export let untimedActivityRecords = [];
let untimedActivityBeingEdited = null;
let currentViewDate = null;
let activitiesLoaded = false;

// ============================================================
// Date Helpers
// ============================================================

function formatDateKey(date) {
    if (!date) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export const CURRENT_DATE = formatDateKey(new Date());

function getUserId() {
    const session = JSON.parse(localStorage.getItem('auth:session')) || {};
    return session.userId;
}

// ============================================================
// Load Activities from API
// ============================================================

async function loadActivitiesFromAPI() {
    try {
        const userId = getUserId();
        if (!userId) {
            untimedActivities = [];
            untimedActivityRecords = [];
            activitiesLoaded = true;
            return;
        }

        const activities = await UntimedActivitiesAPI.getAll(userId);
        untimedActivities = activities || [];

        untimedActivityRecords = [];
        for (const activity of untimedActivities) {
            try {
                const records = await UntimedRecordsAPI.getByActivity(activity.id);
                if (records && records.length > 0) {
                    records.forEach(record => {
                        if (!record.completed_checks) {
                            record.completed_checks = [];
                        }
                        if (!record.completed_count) {
                            record.completed_count = 0;
                        }
                    });
                    untimedActivityRecords.push(...records);
                }
            } catch (err) {
                // Silently handle individual record errors
            }
        }

        activitiesLoaded = true;

    } catch (error) {
        untimedActivities = [];
        untimedActivityRecords = [];
        activitiesLoaded = true;
    }
}

// ============================================================
// Get Activity Record
// ============================================================

export function getActivityRecord(activityId, date = CURRENT_DATE) {
    let dateStr = date;
    if (date instanceof Date) {
        const d = date;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
    } else if (typeof date === 'string' && date.includes('T')) {
        dateStr = date.split('T')[0];
    } else if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateStr = date;
    } else {
        dateStr = CURRENT_DATE;
    }

    const result = untimedActivityRecords.find(record => {
        let recordDateStr = record.record_date;
        if (record.record_date && record.record_date.includes('T')) {
            recordDateStr = record.record_date.split('T')[0];
        } else if (record.record_date && !record.record_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const d = new Date(record.record_date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            recordDateStr = `${year}-${month}-${day}`;
        }
        return Number(record.activity_id) === Number(activityId) && 
               recordDateStr === dateStr;
    });

    return result;
}

// ============================================================
// Toggle Untimed Check
// ============================================================

export async function toggleUntimedCheck(activityId, checkIndex, date = CURRENT_DATE) {
    try {
        const userId = getUserId();
        if (!userId) {
            return null;
        }

        let dateStr = date;
        if (date instanceof Date) {
            const d = date;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dateStr = `${year}-${month}-${day}`;
        } else if (typeof date === 'string' && date.includes('T')) {
            dateStr = date.split('T')[0];
        } else if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            dateStr = date;
        } else {
            dateStr = CURRENT_DATE;
        }

        const today = new Date();
        const todayStr = formatDateKey(today);
        if (dateStr > todayStr) {
            return null;
        }

        let record = null;
        const allRecords = await UntimedRecordsAPI.getByActivity(activityId);

        const foundRecord = allRecords.find(r => {
            let rDate = r.record_date;
            if (rDate && rDate.includes('T')) {
                rDate = rDate.split('T')[0];
            } else if (rDate && !rDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const d = new Date(rDate);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                rDate = `${year}-${month}-${day}`;
            }
            return rDate === dateStr;
        });

        if (foundRecord) {
            record = foundRecord;
            const existingIndex = untimedActivityRecords.findIndex(r => r.id === record.id);
            if (existingIndex === -1) {
                untimedActivityRecords.push(record);
            } else {
                untimedActivityRecords[existingIndex] = record;
            }
        }

        let completedChecks = [];
        if (record) {
            completedChecks = [...(record.completed_checks || [])];
        }

        const checkPosition = completedChecks.indexOf(checkIndex);
        if (checkPosition === -1) {
            completedChecks.push(checkIndex);
        } else {
            completedChecks.splice(checkPosition, 1);
        }
        completedChecks.sort((a, b) => a - b);

        let result;
        if (record) {
            result = await UntimedRecordsAPI.update(record.id, completedChecks);
            const index = untimedActivityRecords.findIndex(r => r.id === record.id);
            if (index !== -1) {
                untimedActivityRecords[index] = result;
            }
        } else {
            result = await UntimedRecordsAPI.create(activityId, dateStr, completedChecks);
            untimedActivityRecords.push(result);
        }

        updateUntimedActivityInDOM(activityId, dateStr);

        return result;

    } catch (error) {
        return null;
    }
}

// ============================================================
// Create Untimed Activity HTML
// ============================================================

function createUntimedActivityHTML(activity, date = CURRENT_DATE) {
    let dateStr = date;
    if (date instanceof Date) {
        dateStr = formatDateKey(date);
    } else if (typeof date === 'string' && date.includes('T')) {
        dateStr = date.split('T')[0];
    }

    const record = getActivityRecord(activity.id, dateStr);
    const completedCount = record?.completed_count ?? 0;
    const target = Number(activity.target_count) || Number(activity.targetCount) || 0;

    const today = new Date();
    const todayStr = formatDateKey(today);
    const isFuture = dateStr > todayStr;

    const checks = Array.from(
        { length: target },
        (_, index) => {
            const isCompleted = record?.completed_checks?.includes(index) ?? false;
            const disabled = isFuture ? 'disabled' : '';
            const disabledClass = isFuture ? 'untimed-activity__check--disabled' : '';

            return `
                <button
                    type="button"
                    class="untimed-activity__check ${isCompleted ? 'untimed-activity__check--completed' : ''} ${disabledClass}"
                    data-check-index="${index}"
                    aria-label="${isCompleted ? 'انجام شده' : 'انجام نشده'}"
                    ${disabled}
                ></button>
            `;
        }
    ).join("");

    return `
        <article
            class="untimed-activity"
            data-activity-id="${activity.id}"
            data-date="${dateStr}"
        >
            <div class="untimed-activity__info">
                <h3 class="untimed-activity__title">${activity.title}</h3>
                <span class="untimed-activity__progress">${completedCount}/${target}</span>
                ${isFuture ? `<span class="untimed-activity__future-badge">🔮 آینده</span>` : ''}
            </div>

            <div
                class="untimed-activity__checks"
                role="group"
                aria-label="${activity.title}"
            >
                ${checks}
            </div>
        </article>
    `;
}

// ============================================================
// Update Single Untimed Activity
// ============================================================

export function updateUntimedActivityInDOM(activityId, date = CURRENT_DATE) {
    const activity = untimedActivities.find(item => Number(item.id) === activityId);
    if (!activity) return;

    const card = document.querySelector(`.untimed-activity[data-activity-id="${activityId}"]`);
    if (!card) return;

    const newHTML = createUntimedActivityHTML(activity, date);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newHTML;
    const newCard = tempDiv.firstElementChild;

    if (newCard) {
        card.replaceWith(newCard);

        newCard.querySelectorAll('.untimed-activity__check').forEach(check => {
            check.addEventListener('click', handleSingleCheckClick);
        });
    }
}

// ============================================================
// Handle Single Check Click
// ============================================================

async function handleSingleCheckClick(event) {
    const check = event.currentTarget;
    const activityCard = check.closest('.untimed-activity');
    if (!activityCard) return;

    const activityId = Number(activityCard.dataset.activityId);
    const activity = untimedActivities.find(item => Number(item.id) === activityId);
    if (!activity) return;

    const checkIndex = Number(check.dataset.checkIndex);

    let date = activityCard.dataset.date || CURRENT_DATE;
    if (typeof date !== 'string' || date.includes('T')) {
        date = formatDateKey(new Date(date));
    }

    await toggleUntimedCheck(activityId, checkIndex, date);
    updateUntimedActivityInDOM(activityId, date);
}

// ============================================================
// Render Untimed Activities
// ============================================================

function renderUntimedActivities(date = CURRENT_DATE) {
    if (!activitiesLoaded) {
        return '<div class="untimed-activities__loading">در حال بارگذاری...</div>';
    }

    if (untimedActivities.length === 0) {
        return '';
    }

    return untimedActivities
        .filter(activity => activity.is_active !== false && !activity.archived)
        .map(activity => createUntimedActivityHTML(activity, date))
        .join("");
}

// ============================================================
// Render Untimed Activities To DOM
// ============================================================

export async function renderUntimedActivitiesToDOM(date = CURRENT_DATE) {
    const list = document.querySelector(".untimed-activities__list");
    if (!list) return;

    currentViewDate = date;

    await loadActivitiesFromAPI();

    const activeActivities = untimedActivities.filter(
        activity => activity.is_active !== false && !activity.archived
    );

    if (activeActivities.length === 0) {
        list.innerHTML = `
            <div class="untimed-activities__empty">
                <p>هیچ فعالیتی برای این روز تعریف نشده است.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = renderUntimedActivities(date);

    setTimeout(() => {
        const checks = list.querySelectorAll('.untimed-activity__check');
        checks.forEach(check => {
            check.removeEventListener('click', handleSingleCheckClick);
            check.addEventListener('click', handleSingleCheckClick);
        });
    }, 100);
}

// ============================================================
// Untimed Activity Form Modal
// ============================================================

export function UntimedActivityForm() {
    return `
        <section
            class="activity-form"
            data-activity-type="untimed"
            aria-labelledby="untimed-activity-form-title"
        >
            <div class="activity-form__container">
                <header class="activity-form__header">
                    <div class="activity-form__heading">
                        <span class="activity-form__eyebrow">فعالیت‌ها</span>
                        <h2 class="activity-form__title" id="untimed-activity-form-title">
                            ایجاد فعالیت بدون زمان
                        </h2>
                        <p class="activity-form__description">
                            فعالیت خود را ایجاد کنید تا بتوانید انجام آن را ثبت و پیگیری کنید.
                        </p>
                    </div>
                    <button
                        class="activity-form__close"
                        type="button"
                        aria-label="بستن"
                        data-action="close-form"
                    >
                        ×
                    </button>
                </header>

                <form class="activity-form__form" id="untimed-activity-form">
                    <fieldset class="activity-form__section">
                        <legend class="activity-form__section-title">اطلاعات فعالیت</legend>

                        <div class="activity-form__field">
                            <label class="activity-form__label" for="untimed-activity-title">
                                عنوان فعالیت
                            </label>
                            <input
                                class="activity-form__input"
                                id="untimed-activity-title"
                                name="title"
                                type="text"
                                placeholder="مثلاً نماز"
                                maxlength="100"
                                required
                            />
                        </div>

                        <div class="activity-form__field">
                            <label class="activity-form__label" for="untimed-activity-target">
                                هدف فعالیت
                            </label>
                            <div class="activity-form__target">
                                <input
                                    class="activity-form__input"
                                    id="untimed-activity-target"
                                    name="target"
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="مثلاً ۵"
                                    required
                                />
                                <span class="activity-form__target-unit">بار</span>
                            </div>
                        </div>
                    </fieldset>

                    <footer class="activity-form__actions">
                        <button class="activity-form__cancel" type="button" data-action="cancel">
                            انصراف
                        </button>
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
// Open/Close Functions
// ============================================================

export function openUntimedActivityForm(activity = null) {
    const form = document.querySelector('.activity-form[data-activity-type="untimed"]');
    if (!form) return;

    untimedActivityBeingEdited = activity;

    const titleEl = form.querySelector("#untimed-activity-form-title");
    const descriptionEl = form.querySelector(".activity-form__description");
    const submitTextEl = form.querySelector(".activity-form__submit span:last-child");
    const titleInput = form.querySelector("#untimed-activity-title");
    const targetInput = form.querySelector("#untimed-activity-target");

    if (activity) {
        if (titleEl) titleEl.textContent = "ویرایش فعالیت";
        if (descriptionEl) descriptionEl.textContent = "عنوان یا هدف فعالیت را ویرایش کنید.";
        if (submitTextEl) submitTextEl.textContent = "ذخیره تغییرات";
        if (titleInput) titleInput.value = activity.title;
        if (targetInput) targetInput.value = activity.target_count || activity.targetCount;
    } else {
        if (titleEl) titleEl.textContent = "ایجاد فعالیت بدون زمان";
        if (descriptionEl) descriptionEl.textContent = "فعالیت خود را ایجاد کنید تا بتوانید انجام آن را ثبت و پیگیری کنید.";
        if (submitTextEl) submitTextEl.textContent = "ایجاد فعالیت";
        if (titleInput) titleInput.value = "";
        if (targetInput) targetInput.value = "";
    }

    form.classList.add("is-open");
}

function closeUntimedActivityForm() {
    const form = document.querySelector('.activity-form[data-activity-type="untimed"]');
    if (!form) return;

    form.classList.remove("is-open");
    untimedActivityBeingEdited = null;
}

// ============================================================
// Event Listeners
// ============================================================

// Add Activity
document.addEventListener("click", (event) => {
    const addButton = event.target.closest(
        '.untimed-activities__add, [data-action="create-untimed"]'
    );

    if (!addButton) return;

    event.preventDefault();
    openUntimedActivityForm();
});

// Close Form
document.addEventListener("click", (event) => {
    const actionButton = event.target.closest('[data-action="close-form"], [data-action="cancel"]');
    if (!actionButton) return;

    const form = actionButton.closest('.activity-form[data-activity-type="untimed"]');
    if (!form) return;

    closeUntimedActivityForm();
});

// Escape Key
document.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
        closeUntimedActivityForm();
    }
});

// Submit Form
document.addEventListener("submit", async (event) => {
    const form = event.target.closest("#untimed-activity-form");
    if (!form) return;

    event.preventDefault();

    const title = form.querySelector("#untimed-activity-title").value.trim();
    const target = Number(form.querySelector("#untimed-activity-target").value);

    if (!title || !target) {
        alert('لطفاً عنوان و هدف فعالیت را وارد کنید');
        return;
    }

    try {
        const userId = getUserId();
        if (!userId) {
            alert('لطفاً وارد حساب کاربری خود شوید');
            return;
        }

        if (untimedActivityBeingEdited) {
            await UntimedActivitiesAPI.update(untimedActivityBeingEdited.id, {
                title: title,
                target_count: target
            });
        } else {
            await UntimedActivitiesAPI.create(userId, title, target);
        }

        await renderUntimedActivitiesToDOM(currentViewDate);
        document.dispatchEvent(new CustomEvent("untimed-activities:changed"));

        form.reset();
        closeUntimedActivityForm();

    } catch (error) {
        alert(error.message || 'خطا در ذخیره فعالیت');
    }
});

// Day Selection
document.addEventListener("day:selected", (event) => {
    const { gy, gm, gd } = event.detail;
    const dateKey = `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
    renderUntimedActivitiesToDOM(dateKey);
});

// Activity Changes
document.addEventListener("untimed-activities:changed", () => {
    renderUntimedActivitiesToDOM(currentViewDate);
});

// ============================================================
// Main Component
// ============================================================

export function UnTimeActivies() {
    return `
        <section class="untimed-activities">
            <header class="untimed-activities__header">
                <h2 class="untimed-activities__title">فعالیت‌های بدون زمان</h2>
                <button
                    type="button"
                    class="untimed-activities__add"
                    aria-label="افزودن فعالیت بدون زمان"
                    title="افزودن فعالیت"
                >
                    +
                </button>
            </header>

            <div class="untimed-activities__content">
                <div class="untimed-activities__list" aria-live="polite">
                </div>
            </div>
        </section>
        ${UntimedActivityForm()}
    `;
}

// ============================================================
// Initialization
// ============================================================

export function initUntimedActivities() {
    renderUntimedActivitiesToDOM();
}