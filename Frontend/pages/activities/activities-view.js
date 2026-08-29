import {
    timedActivities,
    ActivityFormModal,
    ConcurrentActivityWarningModal,
    requestStartActivity,
    openActivityForm,
    getActiveActivity
} from "../../Components/dashboard/timed-activities/timed-activities.js";

import {
    untimedActivities,
    untimedActivityRecords,
    UntimedActivityForm,
    openUntimedActivityForm,
    getActivityRecord,
    toggleUntimedCheck
} from "../../Components/dashboard/untimed-activities/untimed-activities.js";

// "active" | "archived" — کدوم تب الان نشون داده می‌شه
let currentStatusFilter = "active";

export function ActivitiesView(){
    const isActiveTab = currentStatusFilter === "active";
    const isArchivedTab = currentStatusFilter === "archived";

    return `
        <main class="activities-page">
      <div class="activities-page__container">
        <!-- Page Header -->
        <header class="activities-page__header">
          <div class="activities-page__heading">
            <h1 class="activities-page__title">فعالیت‌ها</h1>

            <p class="activities-page__description">
              فعالیت‌های روزانه خود را مدیریت و پیگیری کنید.
            </p>
          </div>

          <!-- Status Filter -->
          <div class="activities-page__filter">
            <div
              class="activity-status-filter"
              role="tablist"
              aria-label="وضعیت فعالیت‌ها"
            >
              <button
                class="activity-status-filter__item${isActiveTab ? " activity-status-filter__item--active" : ""}"
                type="button"
                role="tab"
                aria-selected="${isActiveTab}"
                data-status="active"
              >
                <span class="activity-status-filter__indicator"></span>

                <span class="activity-status-filter__label">
                  فعالیت‌های فعال
                </span>

                <span class="activity-status-filter__count" id="activeFilterCount"> 0 </span>
              </button>

              <button
                class="activity-status-filter__item${isArchivedTab ? " activity-status-filter__item--active" : ""}"
                type="button"
                role="tab"
                aria-selected="${isArchivedTab}"
                data-status="archived"
              >
                <span class="activity-status-filter__indicator"></span>

                <span class="activity-status-filter__label"> آرشیو شده </span>

                <span class="activity-status-filter__count" id="archivedFilterCount"> 0 </span>
              </button>
            </div>
          </div>
        </header>

        <!-- Activities Columns -->
        <section class="activities-page__columns">
          <!-- Timed Activities -->
          <section class="activity-column activity-column--timed">
            <header class="activity-column__header">
              <div class="activity-column__heading">
                <h2 class="activity-column__title">فعالیت‌های زمان‌دار</h2>

                <span class="activity-column__count" id="timedActivitiesCount"> 0 </span>
              </div>

              <button
                class="activity-column__add"
                type="button"
                data-action="create-timed"
              >
                <span class="activity-column__add-icon" aria-hidden="true">
                  +
                </span>

                <span> فعالیت جدید </span>
              </button>
            </header>

            <div class="activity-column__list">
              <!-- Timed Activity Cards -->
            
            </div>
          </section>

          <!-- Untimed Activities -->
          <section class="activity-column activity-column--untimed">
            <header class="activity-column__header">
              <div class="activity-column__heading">
                <h2 class="activity-column__title">فعالیت‌های بدون زمان</h2>

                <span class="activity-column__count" id="untimedActivitiesCount"> 0 </span>
              </div>

              <button
                class="activity-column__add"
                type="button"
                data-action="create-untimed"
              >
                <span class="activity-column__add-icon" aria-hidden="true">
                  +
                </span>

                <span> فعالیت جدید </span>
              </button>
            </header>

            <div class="activity-column__list">
              <!-- Untimed Activity Cards -->
            </div>
          </section>
        </section>
      </div>

      ${ActivityFormModal()}
      ${UntimedActivityForm()}
      ${ConcurrentActivityWarningModal()}
      ${ArchiveConfirmModal()}
      ${DeleteConfirmModal()}
    `;
}


// ========================================
// Render همه چیز — دوتا ستون + شمارنده‌های تب‌ها
// ========================================

export function renderActivityColumns() {
    renderTimedColumn();
    renderUntimedColumn();
    updateFilterTabCounts();
}

// برای سازگاری با کدهایی که قبلاً این اسم رو صدا می‌زدن
export function renderTimedActivities() {
    renderActivityColumns();
}

function updateFilterTabCounts() {
    const activeCount =
        timedActivities.filter(a => !a.archived).length +
        untimedActivities.filter(a => !a.archived).length;

    const archivedCount =
        timedActivities.filter(a => a.archived).length +
        untimedActivities.filter(a => a.archived).length;

    const activeCountEl = document.querySelector("#activeFilterCount");
    const archivedCountEl = document.querySelector("#archivedFilterCount");

    if (activeCountEl) activeCountEl.textContent = activeCount;
    if (archivedCountEl) archivedCountEl.textContent = archivedCount;
}

function formatCreatedDate(date) {
    const createdDate = new Date(date);

    return new Intl.DateTimeFormat("fa-IR", {
        day: "numeric",
        month: "long"
    }).format(createdDate);
}


// ========================================
// ستون فعالیت‌های زمان‌دار
// ========================================

function renderTimedColumn() {

    const list = document.querySelector(
        ".activity-column--timed .activity-column__list"
    );

    if (!list) {
        return;
    }

    const items = timedActivities.filter(activity =>
        currentStatusFilter === "archived" ? activity.archived : !activity.archived
    );

    list.innerHTML = items
        .map(activity =>
            currentStatusFilter === "archived"
                ? createTimedArchivedCardHTML(activity)
                : createTimedActiveCardHTML(activity)
        )
        .join("");

    const countEl = document.querySelector("#timedActivitiesCount");
    if (countEl) countEl.textContent = items.length;

    if (currentStatusFilter === "active") {
        restoreActiveTimedCard();
    }
}

function createTimedActiveCardHTML(activity) {
    return `
        <article
            class="activity-card activity-card--timed"
            data-activity-id="${activity.id}"
            data-activity-type="timed"
            style="--activity-color: ${activity.color};"
        >
            <span class="activity-card__color" aria-hidden="true"></span>

            <div class="activity-card__content">
                <div class="activity-card__header">
                    <div class="activity-card__title-wrapper">
                        <h3 class="activity-card__title">${activity.title}</h3>
                    </div>
                </div>

                <div class="activity-card__info">
                    <span class="activity-card__created">
                        ایجاد شده در ${formatCreatedDate(activity.createdAt)}
                    </span>
                </div>
            </div>

            <div class="activity-card__actions">
                <button class="activity-card__action-button activity-card__edit" type="button" aria-label="ویرایش فعالیت" data-action="edit">
                    <span class="activity-card__action-icon" aria-hidden="true">✎</span>
                </button>

                <button class="activity-card__action-button activity-card__archive" type="button" aria-label="آرشیو فعالیت" data-action="archive">
                    <span class="activity-card__action-icon" aria-hidden="true">🗑</span>
                </button>

                <button class="activity-card__start" type="button" data-action="start" style="--activity-color: ${activity.color};">
                    <span class="activity-card__start-icon" aria-hidden="true">▶</span>
                    <span>شروع</span>
                </button>
            </div>
        </article>
    `;
}

function createTimedArchivedCardHTML(activity) {
    return `
        <article
            class="activity-card activity-card--timed activity-card--archived"
            data-activity-id="${activity.id}"
            data-activity-type="timed"
            style="--activity-color: ${activity.color};"
        >
            <span class="activity-card__color" aria-hidden="true"></span>

            <div class="activity-card__content">
                <div class="activity-card__header">
                    <div class="activity-card__title-wrapper">
                        <h3 class="activity-card__title">${activity.title}</h3>
                    </div>
                </div>

                <div class="activity-card__info">
                    <span class="activity-card__created">
                        ایجاد شده در ${formatCreatedDate(activity.createdAt)}
                    </span>
                </div>
            </div>

            <div class="activity-card__actions">
                <button class="activity-card__action-button activity-card__edit" type="button" aria-label="ویرایش فعالیت" data-action="edit">
                    <span class="activity-card__action-icon" aria-hidden="true">✎</span>
                </button>

                <button class="activity-card__action-button activity-card__restore" type="button" aria-label="بازگردانی فعالیت" data-action="restore">
                    <span class="activity-card__action-icon" aria-hidden="true">↩</span>
                </button>

                <button class="activity-card__action-button activity-card__delete" type="button" aria-label="حذف کامل فعالیت" data-action="delete">
                    <span class="activity-card__action-icon" aria-hidden="true">×</span>
                </button>
            </div>
        </article>
    `;
}

// اگه یه فعالیت (حتی از داشبورد) در حال اجراست، دکمه‌ی همون کارت
// روی این صفحه هم باید حالت «پایان» رو نشون بده.
function restoreActiveTimedCard() {
    const activeActivity = getActiveActivity();
    if (!activeActivity) return;

    const card = document.querySelector(
        `.activity-column--timed .activity-card[data-activity-id="${activeActivity.id}"]`
    );
    if (!card) return;

    const button = card.querySelector(".activity-card__start");
    if (!button) return;

    button.classList.add("is-active");

    const icon = button.querySelector("span:first-child");
    if (icon) icon.textContent = "■";

    const text = button.querySelector("span:last-child");
    if (text) text.textContent = "پایان";
}


// ========================================
// ستون فعالیت‌های بدون‌زمان
// ========================================

function renderUntimedColumn() {

    const list = document.querySelector(
        ".activity-column--untimed .activity-column__list"
    );

    if (!list) {
        return;
    }

    const items = untimedActivities.filter(activity =>
        currentStatusFilter === "archived" ? activity.archived : !activity.archived
    );

    list.innerHTML = items
        .map(activity =>
            currentStatusFilter === "archived"
                ? createUntimedArchivedCardHTML(activity)
                : createUntimedActiveCardHTML(activity)
        )
        .join("");

    const countEl = document.querySelector("#untimedActivitiesCount");
    if (countEl) countEl.textContent = items.length;
}

function createUntimedActiveCardHTML(activity) {
    const record = getActivityRecord(activity.id);
    const completedChecks = record?.completedChecks ?? [];

    const checksHTML = Array.from({ length: activity.targetCount }, (_, index) => {
        const isChecked = completedChecks.includes(index);
        return `
            <label class="untimed-activity-card__check">
                <input type="checkbox" data-check-index="${index}" ${isChecked ? "checked" : ""} />
                <span class="untimed-activity-card__checkbox">
                    <span class="untimed-activity-card__checkmark">✓</span>
                </span>
            </label>
        `;
    }).join("");

    return `
        <article
            class="untimed-activity-card"
            data-activity-id="${activity.id}"
            data-activity-type="untimed"
        >
            <span class="untimed-activity-card__color" aria-hidden="true"></span>

            <div class="untimed-activity-card__content">
                <div class="untimed-activity-card__header">
                    <div class="untimed-activity-card__title-wrapper">
                        <h3 class="untimed-activity-card__title">${activity.title}</h3>
                        <span class="untimed-activity-card__type">بدون زمان</span>
                    </div>
                </div>

                <div class="untimed-activity-card__info">
                    <span class="untimed-activity-card__goal">
                        هدف: ${activity.targetCount} بار — ${completedChecks.length}/${activity.targetCount} انجام‌شده
                    </span>
                </div>

                <div class="untimed-activity-card__checks" role="group" aria-label="پیشرفت فعالیت">
                    ${checksHTML}
                </div>
            </div>

            <div class="untimed-activity-card__actions">
                <button class="untimed-activity-card__action-button untimed-activity-card__edit" type="button" aria-label="ویرایش فعالیت" data-action="edit">
                    <span class="untimed-activity-card__action-icon" aria-hidden="true">✎</span>
                </button>

                <button class="untimed-activity-card__action-button untimed-activity-card__archive" type="button" aria-label="آرشیو فعالیت" data-action="archive">
                    <span class="untimed-activity-card__action-icon" aria-hidden="true">🗑</span>
                </button>
            </div>
        </article>
    `;
}

function createUntimedArchivedCardHTML(activity) {
    const record = getActivityRecord(activity.id);
    const completedChecks = record?.completedChecks ?? [];

    const checksHTML = Array.from({ length: activity.targetCount }, (_, index) => {
        const isChecked = completedChecks.includes(index);
        return `
            <span class="untimed-activity-card__checkbox ${isChecked ? "untimed-activity-card__checkbox--checked" : ""}">
                ${isChecked ? "✓" : ""}
            </span>
        `;
    }).join("");

    return `
        <article
            class="untimed-activity-card untimed-activity-card--archived"
            data-activity-id="${activity.id}"
            data-activity-type="untimed"
            data-activity-status="archived"
        >
            <span class="untimed-activity-card__color" aria-hidden="true"></span>

            <div class="untimed-activity-card__content">
                <div class="untimed-activity-card__header">
                    <div class="untimed-activity-card__title-wrapper">
                        <h3 class="untimed-activity-card__title">${activity.title}</h3>
                        <span class="untimed-activity-card__type">بدون زمان</span>
                    </div>
                </div>

                <div class="untimed-activity-card__info">
                    <span class="untimed-activity-card__goal">هدف: ${activity.targetCount} بار</span>
                </div>

                <div class="untimed-activity-card__checks" aria-label="پیشرفت فعالیت">
                    ${checksHTML}
                </div>
            </div>

            <div class="untimed-activity-card__actions">
                <button class="untimed-activity-card__action-button untimed-activity-card__edit" type="button" aria-label="ویرایش فعالیت" data-action="edit">
                    <span class="untimed-activity-card__action-icon" aria-hidden="true">✎</span>
                </button>

                <button class="untimed-activity-card__action-button untimed-activity-card__restore" type="button" aria-label="بازگردانی فعالیت" data-action="restore">
                    <span class="untimed-activity-card__action-icon" aria-hidden="true">↩</span>
                </button>

                <button class="untimed-activity-card__action-button untimed-activity-card__delete" type="button" aria-label="حذف کامل فعالیت" data-action="delete">
                    <span class="untimed-activity-card__action-icon" aria-hidden="true">×</span>
                </button>
            </div>
        </article>
    `;
}


// ========================================
// تب‌های «فعال / آرشیو شده»
// ========================================

document.addEventListener("click", (event) => {
    const tabButton = event.target.closest(".activity-status-filter__item");
    if (!tabButton) return;

    const status = tabButton.dataset.status;
    if (!status || status === currentStatusFilter) return;

    currentStatusFilter = status;

    document.querySelectorAll(".activity-status-filter__item").forEach(item => {
        const isSelected = item === tabButton;
        item.classList.toggle("activity-status-filter__item--active", isSelected);
        item.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    renderActivityColumns();
});


// ========================================
// شروع/پایان فعالیت زمان‌دار — از منطق مشترک با داشبورد
// ========================================

document.addEventListener("click", (event) => {
    const startButton = event.target.closest(
        ".activity-column--timed .activity-card__start"
    );

    if (!startButton) return;

    const card = startButton.closest(".activity-card");
    if (!card) return;

    const activityId = Number(card.dataset.activityId);
    const activity = timedActivities.find(item => item.id === activityId);
    if (!activity) return;

    requestStartActivity(activity, startButton);
});


// ========================================
// چک‌باکس فعالیت بدون‌زمان
// ========================================

document.addEventListener("change", (event) => {
    const checkbox = event.target.closest(
        '.activity-column--untimed .untimed-activity-card__check input[type="checkbox"]'
    );

    if (!checkbox) return;

    const card = checkbox.closest(".untimed-activity-card");
    if (!card) return;

    const activityId = Number(card.dataset.activityId);
    const checkIndex = Number(checkbox.dataset.checkIndex);

    toggleUntimedCheck(activityId, checkIndex);

    renderUntimedColumn();
});


// ========================================
// ویرایش (هم زمان‌دار هم بدون‌زمان) — همون مودال ایجاد،
// فقط توی حالت ویرایش
// ========================================

document.addEventListener("click", (event) => {
    const editButton = event.target.closest('.activity-column [data-action="edit"]');
    if (!editButton) return;

    const card = editButton.closest(".activity-card, .untimed-activity-card");
    if (!card) return;

    const activityId = Number(card.dataset.activityId);
    const isTimed = card.classList.contains("activity-card");

    const activity = isTimed
        ? timedActivities.find(item => item.id === activityId)
        : untimedActivities.find(item => item.id === activityId);

    if (!activity) return;

    if (isTimed) {
        openActivityForm(activity);
    } else {
        openUntimedActivityForm(activity);
    }
});


// ========================================
// آرشیو کردن (هم زمان‌دار هم بدون‌زمان)
// ========================================

let itemPendingArchive = null; // { activity, type }

function ArchiveConfirmModal() {
    return `
        <div class="archive-confirm-modal" id="archiveConfirmModal" aria-hidden="true">
            <div class="archive-confirm-modal__overlay"></div>

            <div
                class="archive-confirm-modal__box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="archiveConfirmTitle"
            >
                <div class="archive-confirm-modal__icon" aria-hidden="true">🗑</div>

                <div class="archive-confirm-modal__content">
                    <h2 class="archive-confirm-modal__title" id="archiveConfirmTitle">
                        آرشیو فعالیت
                    </h2>

                    <p class="archive-confirm-modal__message">
                        آیا از آرشیو کردن این فعالیت مطمئن هستید؟
                    </p>

                    <div class="archive-confirm-modal__activity">
                        <span class="archive-confirm-modal__activity-color" id="archiveConfirmColor"></span>
                        <strong id="archiveConfirmName">—</strong>
                    </div>

                    <p class="archive-confirm-modal__note">
                        فعالیت آرشیوشده از لیست فعالیت‌های فعال خارج می‌شه، ولی سابقه‌ش حفظ می‌مونه.
                    </p>
                </div>

                <div class="archive-confirm-modal__actions">
                    <button type="button" class="archive-confirm-modal__cancel" id="archiveConfirmCancel">
                        انصراف
                    </button>

                    <button type="button" class="archive-confirm-modal__confirm" id="archiveConfirmConfirm">
                        آرشیو کن
                    </button>
                </div>
            </div>
        </div>
    `;
}

function openArchiveConfirmModal(activity, type) {
    itemPendingArchive = { activity, type };

    const modal = document.querySelector("#archiveConfirmModal");
    if (!modal) return;

    const colorEl = modal.querySelector("#archiveConfirmColor");
    const nameEl = modal.querySelector("#archiveConfirmName");

    if (colorEl) colorEl.style.backgroundColor = type === "timed" ? activity.color : "var(--color-primary)";
    if (nameEl) nameEl.textContent = activity.title;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
}

function closeArchiveConfirmModal() {
    const modal = document.querySelector("#archiveConfirmModal");
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    itemPendingArchive = null;
}

document.addEventListener("click", (event) => {
    const archiveButton = event.target.closest('.activity-column [data-action="archive"]');
    if (!archiveButton) return;

    const card = archiveButton.closest(".activity-card, .untimed-activity-card");
    if (!card) return;

    const activityId = Number(card.dataset.activityId);
    const isTimed = card.classList.contains("activity-card");

    const activity = isTimed
        ? timedActivities.find(item => item.id === activityId)
        : untimedActivities.find(item => item.id === activityId);

    if (!activity) return;

    openArchiveConfirmModal(activity, isTimed ? "timed" : "untimed");
});

document.addEventListener("click", (event) => {
    if (
        event.target.closest("#archiveConfirmCancel") ||
        event.target.closest(".archive-confirm-modal__overlay")
    ) {
        closeArchiveConfirmModal();
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
        closeArchiveConfirmModal();
    }
});

document.addEventListener("click", (event) => {
    const confirmButton = event.target.closest("#archiveConfirmConfirm");
    if (!confirmButton) return;
    if (!itemPendingArchive) return;

    itemPendingArchive.activity.archived = true;

    closeArchiveConfirmModal();
    renderActivityColumns();
});


// ========================================
// بازگردانی (فوری، بدون مودال)
// ========================================

document.addEventListener("click", (event) => {
    const restoreButton = event.target.closest('.activity-column [data-action="restore"]');
    if (!restoreButton) return;

    const card = restoreButton.closest(".activity-card, .untimed-activity-card");
    if (!card) return;

    const activityId = Number(card.dataset.activityId);
    const isTimed = card.classList.contains("activity-card");

    const activity = isTimed
        ? timedActivities.find(item => item.id === activityId)
        : untimedActivities.find(item => item.id === activityId);

    if (!activity) return;

    activity.archived = false;

    renderActivityColumns();
});


// ========================================
// حذف کامل (هم زمان‌دار هم بدون‌زمان) — غیرقابل بازگشت
// ========================================

let itemPendingDelete = null; // { activity, type }

function DeleteConfirmModal() {
    return `
        <div class="delete-confirm-modal" id="deleteConfirmModal" aria-hidden="true">
            <div class="delete-confirm-modal__overlay"></div>

            <div
                class="delete-confirm-modal__box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="deleteConfirmTitle"
            >
                <div class="delete-confirm-modal__icon" aria-hidden="true">×</div>

                <div class="delete-confirm-modal__content">
                    <h2 class="delete-confirm-modal__title" id="deleteConfirmTitle">
                        حذف کامل فعالیت
                    </h2>

                    <p class="delete-confirm-modal__message">
                        آیا از حذف کامل این فعالیت مطمئن هستید؟
                    </p>

                    <div class="delete-confirm-modal__activity">
                        <span class="delete-confirm-modal__activity-color" id="deleteConfirmColor"></span>
                        <strong id="deleteConfirmName">—</strong>
                    </div>

                    <p class="delete-confirm-modal__warning">
                        این فعالیت و تمام سابقه‌ی ثبت‌شده‌اش به‌طور کامل حذف می‌شه و قابل بازگردانی نیست.
                    </p>
                </div>

                <div class="delete-confirm-modal__actions">
                    <button type="button" class="delete-confirm-modal__cancel" id="deleteConfirmCancel">
                        انصراف
                    </button>

                    <button type="button" class="delete-confirm-modal__confirm" id="deleteConfirmConfirm">
                        حذف کامل
                    </button>
                </div>
            </div>
        </div>
    `;
}

function openDeleteConfirmModal(activity, type) {
    itemPendingDelete = { activity, type };

    const modal = document.querySelector("#deleteConfirmModal");
    if (!modal) return;

    const colorEl = modal.querySelector("#deleteConfirmColor");
    const nameEl = modal.querySelector("#deleteConfirmName");

    if (colorEl) colorEl.style.backgroundColor = type === "timed" ? activity.color : "var(--color-primary)";
    if (nameEl) nameEl.textContent = activity.title;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
}

function closeDeleteConfirmModal() {
    const modal = document.querySelector("#deleteConfirmModal");
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    itemPendingDelete = null;
}

document.addEventListener("click", (event) => {
    const deleteButton = event.target.closest('.activity-column [data-action="delete"]');
    if (!deleteButton) return;

    const card = deleteButton.closest(".activity-card, .untimed-activity-card");
    if (!card) return;

    const activityId = Number(card.dataset.activityId);
    const isTimed = card.classList.contains("activity-card");

    const activity = isTimed
        ? timedActivities.find(item => item.id === activityId)
        : untimedActivities.find(item => item.id === activityId);

    if (!activity) return;

    openDeleteConfirmModal(activity, isTimed ? "timed" : "untimed");
});

document.addEventListener("click", (event) => {
    if (
        event.target.closest("#deleteConfirmCancel") ||
        event.target.closest(".delete-confirm-modal__overlay")
    ) {
        closeDeleteConfirmModal();
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
        closeDeleteConfirmModal();
    }
});

document.addEventListener("click", (event) => {
    const confirmButton = event.target.closest("#deleteConfirmConfirm");
    if (!confirmButton) return;
    if (!itemPendingDelete) return;

    const { activity, type } = itemPendingDelete;

    if (type === "timed") {
        permanentlyRemove(timedActivities, activity.id);
    } else {
        permanentlyRemove(untimedActivities, activity.id);

        // رکوردهای روزانه‌ی مربوط به این فعالیت هم دیگه معنی ندارن
        for (let i = untimedActivityRecords.length - 1; i >= 0; i--) {
            if (untimedActivityRecords[i].activityId === activity.id) {
                untimedActivityRecords.splice(i, 1);
            }
        }
    }

    closeDeleteConfirmModal();
    renderActivityColumns();
});

function permanentlyRemove(array, id) {
    const index = array.findIndex(item => item.id === id);
    if (index !== -1) array.splice(index, 1);
}


// ========================================
// وقتی از هرجای دیگه (مثلاً مودال‌های ایجاد/ویرایش که مشترکن)
// چیزی توی لیست فعالیت‌ها عوض شد، این صفحه هم به‌روز بشه.
// ========================================

document.addEventListener("timed-activities:changed", renderActivityColumns);
document.addEventListener("untimed-activities:changed", renderActivityColumns);