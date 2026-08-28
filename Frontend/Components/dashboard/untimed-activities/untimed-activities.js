// ========================================
// Mock Data - Untimed Activities
// ========================================

export const CURRENT_DATE = "2026-08-25";

export const untimedActivities = [
    {
        id: 1,
        title: "آب خوردن",
        targetCount: 8,
        isActive: true,
        archived: false
    },

    {
        id: 2,
        title: "نماز",
        targetCount: 5,
        isActive: true,
        archived: false
    },

    {
        id: 3,
        title: "مسواک",
        targetCount: 1,
        isActive: true,
        archived: false
    },

    {
        id: 4,
        title: "استراحت کوتاه",
        targetCount: 3,
        isActive: true,
        archived: false
    }
];


// ========================================
// Mock Data - Daily Records
// ========================================

export const untimedActivityRecords = [
    {
        id: 1,

        activityId: 1,

        recordDate: "2026-08-25",

        completedCount: 5,

        completedChecks: [0, 1, 2, 3, 4]
    },

    {
        id: 2,

        activityId: 2,

        recordDate: "2026-08-25",

        completedCount: 3,

        completedChecks: [0, 3, 4]
    },

    {
        id: 3,

        activityId: 3,

        recordDate: "2026-08-25",

        completedCount: 1,

        completedChecks: [0]
    },

    {
        id: 4,

        activityId: 4,

        recordDate: "2026-08-25",

        completedCount: 1,

        completedChecks: [0]
    }
];


// اگه فرم توی حالت «ویرایش» بازه، فعالیتی که داره ویرایش می‌شه اینجاست.
let untimedActivityBeingEdited = null;


export function UnTimeActivies() {
    return `
        <section class="untimed-activities">

            <!-- Header -->
            <header class="untimed-activities__header">

                <h2 class="untimed-activities__title">
                    فعالیت‌های بدون زمان
                </h2>

                <button
                    type="button"
                    class="untimed-activities__add"
                    aria-label="افزودن فعالیت بدون زمان"
                    title="افزودن فعالیت"
                >
                    +
                </button>

            </header>


            <!-- Activities -->
            <div class="untimed-activities__content">

                <div
                    class="untimed-activities__list"
                    aria-live="polite"
                >
                    <!--
                        فعالیت‌ها توسط JavaScript
                        اینجا قرار می‌گیرند.
                    -->
                </div>

            </div>

        </section>

        ${UntimedActivityForm()}
    `;
}

// ========================================
// Untimed Activity Form Modal
// دقیقاً مثل ActivityFormModal در timed-activities.js —
// هم برای «ایجاد» هم برای «ویرایش» استفاده می‌شه.
// ========================================

export function UntimedActivityForm() {
    return `
        <section
            class="activity-form"
            data-activity-type="untimed"
            aria-labelledby="untimed-activity-form-title"
        >

            <div class="activity-form__container">

                <!-- Header -->
                <header class="activity-form__header">

                    <div class="activity-form__heading">

                        <span class="activity-form__eyebrow">
                            فعالیت‌ها
                        </span>

                        <h2
                            class="activity-form__title"
                            id="untimed-activity-form-title"
                        >
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


                <!-- Form -->
                <form
                    class="activity-form__form"
                    id="untimed-activity-form"
                >

                    <!-- Basic Information -->
                    <fieldset class="activity-form__section">

                        <legend class="activity-form__section-title">
                            اطلاعات فعالیت
                        </legend>


                        <!-- Title -->
                        <div class="activity-form__field">

                            <label
                                class="activity-form__label"
                                for="untimed-activity-title"
                            >
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


                        <!-- Target -->
                        <div class="activity-form__field">

                            <label
                                class="activity-form__label"
                                for="untimed-activity-target"
                            >
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

                                <span class="activity-form__target-unit">
                                    بار
                                </span>

                            </div>

                        </div>

                    </fieldset>


                    <!-- Actions -->
                    <footer class="activity-form__actions">

                        <button
                            class="activity-form__cancel"
                            type="button"
                            data-action="cancel"
                        >
                            انصراف
                        </button>

                        <button
                            class="activity-form__submit"
                            type="submit"
                        >

                            <span
                                class="activity-form__submit-icon"
                                aria-hidden="true"
                            >
                                +
                            </span>

                            <span>
                                ایجاد فعالیت
                            </span>

                        </button>

                    </footer>

                </form>

            </div>

        </section>
    `;
}


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
// منطق مشترک تیک‌زدن — هم ماژول داشبورد هم صفحه‌ی
// فعالیت‌ها از همین یکی استفاده می‌کنن.
// ========================================

export function toggleUntimedCheck(activityId, checkIndex, date = CURRENT_DATE) {

    let record = getActivityRecord(activityId, date);

    if (!record) {
        record = {
            id: Date.now(),
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

    // رکورد مربوط به همین فعالیت در تاریخ انتخاب‌شده
    const record = getActivityRecord(activity.id, date);

    // اگر رکوردی وجود نداشت، یعنی هنوز چیزی ثبت نشده
    const completedCount =
        record?.completedCount ?? 0;


    // ساخت Checkboxها بر اساس Target Count
    const checks = Array.from(
        { length: activity.targetCount },
        (_, index) => {

            const isCompleted = record?.completedChecks?.includes(index) ?? false;


            return `
                <button
                    type="button"
                    class="untimed-activity__check ${
                        isCompleted
                            ? "untimed-activity__check--completed"
                            : ""
                    }"
                    data-check-index="${index}"
                    aria-label="${
                        isCompleted
                            ? "انجام شده"
                            : "انجام نشده"
                    }"
                ></button>
            `;
        }
    ).join("");


    // ساخت کارت Activity
    return `
        <article
            class="untimed-activity"
            data-activity-id="${activity.id}"
        >

            <div class="untimed-activity__info">

                <h3 class="untimed-activity__title">
                    ${activity.title}
                </h3>

                <span class="untimed-activity__progress">
                    ${completedCount}/${activity.targetCount}
                </span>

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
// Render Untimed Activities
// ========================================

function renderUntimedActivities(
    date = CURRENT_DATE
) {

    return untimedActivities
        .filter(
            activity => activity.isActive && !activity.archived
        )
        .map(activity => {

            return createUntimedActivityHTML(
                activity,
                date
            );

        })
        .join("");
}

// ========================================
// Render Untimed Activities To DOM
// ========================================

export function renderUntimedActivitiesToDOM(
    date = CURRENT_DATE
) {

    const list =
        document.querySelector(
            ".untimed-activities__list"
        );

    if (!list) {
        return;
    }


    list.innerHTML =
        renderUntimedActivities(date);
}

// ========================================
// Initialize Untimed Activities
// ========================================

export function initUntimedActivities() {

    // Render activities
    renderUntimedActivitiesToDOM();

    // Handle activity checkboxes
    document.addEventListener(
        "click",
        handleUntimedActivityClick
    );

    // Handle close and cancel buttons
    document.addEventListener(
        "click",
        handleUntimedActivityFormActions
    );

    // Handle activity form submit
    document.addEventListener(
        "submit",
        handleUntimedActivityFormSubmit
    );
}

// باز کردن مودال ایجاد فعالیت — هم از دکمه‌ی «+» داشبورد،
// هم از دکمه‌ی «فعالیت جدید» صفحه‌ی فعالیت‌ها.
document.addEventListener("click", (event) => {

    const addButton = event.target.closest(
        '.untimed-activities__add, [data-action="create-untimed"]'
    );

    if (!addButton) {
        return;
    }

    openUntimedActivityForm();
});

// ========================================
// Handle Untimed Activity Form Actions
// ========================================

function handleUntimedActivityFormActions(event) {

    const actionButton =
        event.target.closest(
            '[data-action="close-form"], [data-action="cancel"]'
        );

    if (!actionButton) {
        return;
    }

    // فقط اگه این دکمه مال مودال «بدون‌زمان» باشه، ببندش —
    // وگرنه ممکنه مودال «زمان‌دار» رو اشتباهی ببنده.
    const form = actionButton.closest(
        '.activity-form[data-activity-type="untimed"]'
    );

    if (!form) {
        return;
    }

    closeUntimedActivityForm();
}

document.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
        closeUntimedActivityForm();
    }
})

// ========================================
// Handle Untimed Activity Form Submit
// ========================================

function handleUntimedActivityFormSubmit(event) {

    const form =
        event.target.closest(
            "#untimed-activity-form"
        );

    if (!form) {
        return;
    }

    // Prevent page reload
    event.preventDefault();

    // Get form data
    const formData =
        new FormData(form);

    const title =
        formData.get("title")?.trim();

    const target =
        Number(
            formData.get("target")
        );

    // Validate form data
    if (!title || !target) {
        return;
    }

    if (untimedActivityBeingEdited) {

        // ====== حالت ویرایش ======
        untimedActivityBeingEdited.title = title;
        untimedActivityBeingEdited.targetCount = target;

    } else {

        // ====== حالت ایجاد ======
        const newActivity = {
            id: Date.now(),
            title: title,
            targetCount: target,
            isActive: true,
            archived: false
        };

        untimedActivities.push(newActivity);
    }


    // ========================================
    // Re-render Activities
    // ========================================

    renderUntimedActivitiesToDOM();

    // به هر صفحه‌ی دیگه‌ای که همین لیست رو نشون می‌ده خبر بده
    document.dispatchEvent(new CustomEvent("untimed-activities:changed"));


    // ========================================
    // Reset Form
    // ========================================

    form.reset();


    // ========================================
    // Close Modal
    // ========================================

    closeUntimedActivityForm();
}

// ========================================
// Open Untimed Activity Form
// ========================================
// activity: اختیاری — اگه بدی، مودال توی حالت «ویرایش» باز می‌شه.
export function openUntimedActivityForm(activity = null) {

    const form =
        document.querySelector(
            '.activity-form[data-activity-type="untimed"]'
        );

    if (!form) {
        return;
    }

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

    const form =
        document.querySelector(
            '.activity-form[data-activity-type="untimed"]'
        );

    if (!form) {
        return;
    }

    form.classList.remove("is-open");
    untimedActivityBeingEdited = null;
}


// ========================================
// Handle Untimed Activity Check
// ========================================

function handleUntimedActivityClick(event) {

    const check =
        event.target.closest(
            ".untimed-activity__check"
        );


    // اگر روی Checkbox کلیک نشده بود
    if (!check) {
        return;
    }


    const activityCard =
        check.closest(
            ".untimed-activity"
        );


    if (!activityCard) {
        return;
    }


    const activityId =
        Number(
            activityCard.dataset.activityId
        );


    const activity =
        untimedActivities.find(
            item => item.id === activityId
        );


    if (!activity) {
        return;
    }


    const checkIndex =
        Number(
            check.dataset.checkIndex
        );


    const record = toggleUntimedCheck(activityId, checkIndex);

    console.log(
        "Updated record:",
        record
    );


    // ========================================
    // Re-render
    // ========================================

    renderUntimedActivitiesToDOM();

}