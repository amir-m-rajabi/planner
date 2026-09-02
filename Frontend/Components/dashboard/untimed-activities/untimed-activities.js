// ========================================
// Mock Data - Untimed Activities
// ========================================

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export const CURRENT_DATE = formatDateKey(new Date());

export const untimedActivities = [
    {
        id: 1,
        title: "آب خوردن",
        targetCount: 8,
        isActive: true,
        archived: false,
        createdAt: "2026-08-28",
        updatedAt: null
    },
    {
        id: 2,
        title: "نماز",
        targetCount: 5,
        isActive: true,
        archived: false,
        createdAt: "2026-08-28",
        updatedAt: null
    },
    {
        id: 3,
        title: "مسواک",
        targetCount: 1,
        isActive: true,
        archived: false,
        createdAt: "2026-08-28",
        updatedAt: null
    },
    {
        id: 4,
        title: "استراحت کوتاه",
        targetCount: 3,
        isActive: true,
        archived: false,
        createdAt: "2026-08-28",
        updatedAt: null
    }
];

// ========================================
// Mock Data - Daily Records
// ========================================

export const untimedActivityRecords = [
    {
        id: 1,
        activityId: 1,
        recordDate: CURRENT_DATE,
        completedCount: 5,
        completedChecks: [0, 1, 2, 3, 4]
    },
    {
        id: 2,
        activityId: 2,
        recordDate: CURRENT_DATE,
        completedCount: 3,
        completedChecks: [0, 3, 4]
    },
    {
        id: 3,
        activityId: 3,
        recordDate: CURRENT_DATE,
        completedCount: 1,
        completedChecks: [0]
    },
    {
        id: 4,
        activityId: 4,
        recordDate: CURRENT_DATE,
        completedCount: 1,
        completedChecks: [0]
    }
];

let untimedActivityBeingEdited = null;
let currentViewDate = CURRENT_DATE;

// ========================================
// Get Activity Record For Date
// ========================================

export function getActivityRecord(activityId, date = CURRENT_DATE) {
    return untimedActivityRecords.find(
        record =>
            record.activityId === activityId &&
            record.recordDate === date
    );
}

// ========================================
// Toggle Untimed Check
// ========================================

export function toggleUntimedCheck(activityId, checkIndex, date = CURRENT_DATE) {
    let record = getActivityRecord(activityId, date);

    if (!record) {
        record = {
            id: Date.now() + Math.random() * 1000,
            activityId: activityId,
            recordDate: date,
            completedCount: 0,
            completedChecks: []
        };
        untimedActivityRecords.push(record);
    }

    const checkPosition = record.completedChecks.indexOf(checkIndex);

    if (checkPosition === -1) {
        record.completedChecks.push(checkIndex);
    } else {
        record.completedChecks.splice(checkPosition, 1);
    }

    record.completedCount = record.completedChecks.length;
    record.completedChecks.sort((a, b) => a - b);

    return record;
}

// ========================================
// Create Untimed Activity HTML
// ========================================

function createUntimedActivityHTML(activity, date = CURRENT_DATE) {
    const record = getActivityRecord(activity.id, date);
    const completedCount = record?.completedCount ?? 0;

    const checks = Array.from(
        { length: activity.targetCount },
        (_, index) => {
            const isCompleted = record?.completedChecks?.includes(index) ?? false;
            return `
                <button
                    type="button"
                    class="untimed-activity__check ${isCompleted ? 'untimed-activity__check--completed' : ''}"
                    data-check-index="${index}"
                    aria-label="${isCompleted ? 'انجام شده' : 'انجام نشده'}"
                ></button>
            `;
        }
    ).join("");

    return `
        <article
            class="untimed-activity"
            data-activity-id="${activity.id}"
            data-date="${date}"
        >
            <div class="untimed-activity__info">
                <h3 class="untimed-activity__title">${activity.title}</h3>
                <span class="untimed-activity__progress">${completedCount}/${activity.targetCount}</span>
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

// ========================================
// Update Single Untimed Activity
// ========================================

export function updateUntimedActivityInDOM(activityId, date = CURRENT_DATE) {
    const activity = untimedActivities.find(item => item.id === activityId);
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

// ========================================
// Handle Single Check Click
// ========================================

function handleSingleCheckClick(event) {
    const check = event.currentTarget;
    const activityCard = check.closest('.untimed-activity');
    if (!activityCard) return;

    const activityId = Number(activityCard.dataset.activityId);
    const activity = untimedActivities.find(item => item.id === activityId);
    if (!activity) return;

    const checkIndex = Number(check.dataset.checkIndex);
    const date = activityCard.dataset.date || CURRENT_DATE;

    toggleUntimedCheck(activityId, checkIndex, date);
    updateUntimedActivityInDOM(activityId, date);
}

// ========================================
// Render Untimed Activities
// ========================================

function renderUntimedActivities(date = CURRENT_DATE) {
    return untimedActivities
        .filter(activity => activity.isActive && !activity.archived)
        .map(activity => createUntimedActivityHTML(activity, date))
        .join("");
}

// ========================================
// Render Untimed Activities To DOM
// ========================================

export function renderUntimedActivitiesToDOM(date = CURRENT_DATE) {
    const list = document.querySelector(".untimed-activities__list");
    if (!list) return;

    currentViewDate = date;

    const activeActivities = untimedActivities.filter(
        activity => activity.isActive && !activity.archived
    );

    if (activeActivities.length === 0) {
        list.innerHTML = `
            <div class="untimed-activities__empty">
                <p>هیچ فعالیتی برای این روز تعریف نشده است.</p>
                <button type="button" class="untimed-activities__empty-add" data-action="create-untimed">
                    + افزودن فعالیت جدید
                </button>
            </div>
        `;
        return;
    }

    list.innerHTML = renderUntimedActivities(date);

    list.querySelectorAll('.untimed-activity__check').forEach(check => {
        check.addEventListener('click', handleSingleCheckClick);
    });
}

// ========================================
// Untimed Activity Form Modal
// ========================================

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

// ========================================
// Open Untimed Activity Form
// ========================================

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
        if (targetInput) targetInput.value = activity.targetCount;
    } else {
        if (titleEl) titleEl.textContent = "ایجاد فعالیت بدون زمان";
        if (descriptionEl) descriptionEl.textContent = "فعالیت خود را ایجاد کنید تا بتوانید انجام آن را ثبت و پیگیری کنید.";
        if (submitTextEl) submitTextEl.textContent = "ایجاد فعالیت";
        if (titleInput) titleInput.value = "";
        if (targetInput) targetInput.value = "";
    }

    form.classList.add("is-open");
}

// ========================================
// Close Untimed Activity Form
// ========================================

function closeUntimedActivityForm() {
    const form = document.querySelector('.activity-form[data-activity-type="untimed"]');
    if (!form) return;

    form.classList.remove("is-open");
    untimedActivityBeingEdited = null;
}

// ========================================
// Handle Untimed Activity Form Actions
// ========================================

function handleUntimedActivityFormActions(event) {
    const actionButton = event.target.closest('[data-action="close-form"], [data-action="cancel"]');
    if (!actionButton) return;

    const form = actionButton.closest('.activity-form[data-activity-type="untimed"]');
    if (!form) return;

    closeUntimedActivityForm();
}

// ========================================
// Handle Untimed Activity Form Submit
// ========================================

function handleUntimedActivityFormSubmit(event) {
    const form = event.target.closest("#untimed-activity-form");
    if (!form) return;

    event.preventDefault();

    const formData = new FormData(form);
    const title = formData.get("title")?.trim();
    const target = Number(formData.get("target"));

    if (!title || !target) return;

    if (untimedActivityBeingEdited) {
        untimedActivityBeingEdited.title = title;
        untimedActivityBeingEdited.targetCount = target;
        untimedActivityBeingEdited.updatedAt = new Date().toISOString();
    } else {
        const newActivity = {
            id: Date.now() + Math.random() * 1000,
            title: title,
            targetCount: target,
            isActive: true,
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: null
        };
        untimedActivities.push(newActivity);
    }

    renderUntimedActivitiesToDOM(currentViewDate);
    document.dispatchEvent(new CustomEvent("untimed-activities:changed"));

    form.reset();
    closeUntimedActivityForm();
}

// ========================================
// UnTimeActivities - تابع اصلی
// ========================================

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

// ========================================
// Initialize Untimed Activities
// ========================================

export function initUntimedActivities() {
    renderUntimedActivitiesToDOM();
    document.addEventListener("submit", handleUntimedActivityFormSubmit);
    document.addEventListener("click", handleUntimedActivityFormActions);
    document.addEventListener('keyup', (event) => {
        if (event.key === 'Escape') {
            closeUntimedActivityForm();
        }
    });
}

// ========================================
// باز کردن مودال ایجاد فعالیت
// ========================================

document.addEventListener("click", (event) => {
    const addButton = event.target.closest(
        '.untimed-activities__add, [data-action="create-untimed"]'
    );

    if (!addButton) return;
    
    event.preventDefault();
    openUntimedActivityForm();
});

// ========================================
// گوش‌دادن به انتخاب روز از تقویم
// ========================================

document.addEventListener("day:selected", (event) => {
    const { gy, gm, gd } = event.detail;
    const dateKey = `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
    renderUntimedActivitiesToDOM(dateKey);
});

// ========================================
// گوش دادن به تغییرات فعالیت‌ها
// ========================================

document.addEventListener("untimed-activities:changed", () => {
    renderUntimedActivitiesToDOM(currentViewDate);
});