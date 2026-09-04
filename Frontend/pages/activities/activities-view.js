import {
    TimedActivitiesAPI,
    UntimedActivitiesAPI,
    UntimedRecordsAPI
} from "../../js/api.js";

import {
    ActivityFormModal,
    ConcurrentActivityWarningModal,
    openActivityForm
} from "../../Components/dashboard/timed-activities/timed-activities.js";

import {
    UntimedActivityForm,
    openUntimedActivityForm
} from "../../Components/dashboard/untimed-activities/untimed-activities.js";

// ============================================================
// Global State
// ============================================================

let currentStatusFilter = "active";
let timedActivities = [];
let untimedActivities = [];
let untimedRecords = [];
let activitiesLoaded = false;

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get current user id from local storage
 */
function getUserId() {
    const session = JSON.parse(localStorage.getItem('auth:session')) || {};
    return session.userId;
}

/**
 * Format date for display in Persian
 */
function formatDate(date) {
    if (!date) return "—";
    const d = new Date(date);
    return new Intl.DateTimeFormat("fa-IR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(d);
}

// ============================================================
// Data Loading
// ============================================================

/**
 * Load all activities from the API
 */
async function loadActivities() {
    try {
        const userId = getUserId();
        if (!userId) {
            timedActivities = [];
            untimedActivities = [];
            untimedRecords = [];
            activitiesLoaded = true;
            return;
        }

        // Load timed activities
        if (currentStatusFilter === "active") {
            timedActivities = await TimedActivitiesAPI.getAll(userId) || [];
        } else {
            timedActivities = await TimedActivitiesAPI.getArchived(userId) || [];
        }

        // Load untimed activities
        if (currentStatusFilter === "active") {
            untimedActivities = await UntimedActivitiesAPI.getAll(userId) || [];
        } else {
            untimedActivities = await UntimedActivitiesAPI.getArchived(userId) || [];
        }

        // Load untimed records
        untimedRecords = [];
        for (const activity of untimedActivities) {
            try {
                const records = await UntimedRecordsAPI.getByActivity(activity.id);
                if (records && records.length > 0) {
                    untimedRecords.push(...records);
                }
            } catch (err) {
                // Silently handle individual record errors
            }
        }

        activitiesLoaded = true;

    } catch (error) {
        timedActivities = [];
        untimedActivities = [];
        untimedRecords = [];
        activitiesLoaded = true;
    }
}

/**
 * Get activity counts for filter tabs
 */
async function getActivitiesCount() {
    try {
        const userId = getUserId();
        if (!userId) {
            return { active: 0, archived: 0 };
        }

        const allTimed = await TimedActivitiesAPI.getAll(userId) || [];
        const allTimedArchived = await TimedActivitiesAPI.getArchived(userId) || [];
        
        const allUntimed = await UntimedActivitiesAPI.getAll(userId) || [];
        const allUntimedArchived = await UntimedActivitiesAPI.getArchived(userId) || [];

        const activeCount = allTimed.length + allUntimed.length;
        const archivedCount = allTimedArchived.length + allUntimedArchived.length;

        return { active: activeCount, archived: archivedCount };

    } catch (error) {
        return { active: 0, archived: 0 };
    }
}

// ============================================================
// Main View Component
// ============================================================

export function ActivitiesView() {
    const isActiveTab = currentStatusFilter === "active";
    const isArchivedTab = currentStatusFilter === "archived";

    return `
        <main class="activities-page">
            <div class="activities-page__container">
                <header class="activities-page__header">
                    <div class="activities-page__heading">
                        <h1 class="activities-page__title">فعالیت‌ها</h1>
                        <p class="activities-page__description">
                            فعالیت‌های روزانه خود را مدیریت و پیگیری کنید.
                        </p>
                    </div>

                    <div class="activities-page__filter">
                        <div class="activity-status-filter" role="tablist" aria-label="وضعیت فعالیت‌ها">
                            <button
                                class="activity-status-filter__item${isActiveTab ? " activity-status-filter__item--active" : ""}"
                                type="button"
                                role="tab"
                                aria-selected="${isActiveTab}"
                                data-status="active"
                            >
                                <span class="activity-status-filter__indicator"></span>
                                <span class="activity-status-filter__label">فعالیت‌های فعال</span>
                                <span class="activity-status-filter__count" id="activeFilterCount">0</span>
                            </button>

                            <button
                                class="activity-status-filter__item${isArchivedTab ? " activity-status-filter__item--active" : ""}"
                                type="button"
                                role="tab"
                                aria-selected="${isArchivedTab}"
                                data-status="archived"
                            >
                                <span class="activity-status-filter__indicator"></span>
                                <span class="activity-status-filter__label">آرشیو شده</span>
                                <span class="activity-status-filter__count" id="archivedFilterCount">0</span>
                            </button>
                        </div>
                    </div>
                </header>

                <section class="activities-page__columns">
                    <!-- Timed Activities -->
                    <section class="activity-column activity-column--timed">
                        <header class="activity-column__header">
                            <div class="activity-column__heading">
                                <h2 class="activity-column__title">فعالیت‌های زمان‌دار</h2>
                                <span class="activity-column__count" id="timedActivitiesCount">0</span>
                            </div>
                            ${isActiveTab ? `
                                <button class="activity-column__add" type="button" data-action="create-timed">
                                    <span class="activity-column__add-icon" aria-hidden="true">+</span>
                                    <span>فعالیت جدید</span>
                                </button>
                            ` : ''}
                        </header>
                        <div class="activity-column__list"></div>
                    </section>

                    <!-- Untimed Activities -->
                    <section class="activity-column activity-column--untimed">
                        <header class="activity-column__header">
                            <div class="activity-column__heading">
                                <h2 class="activity-column__title">فعالیت‌های بدون زمان</h2>
                                <span class="activity-column__count" id="untimedActivitiesCount">0</span>
                            </div>
                            ${isActiveTab ? `
                                <button class="activity-column__add" type="button" data-action="create-untimed">
                                    <span class="activity-column__add-icon" aria-hidden="true">+</span>
                                    <span>فعالیت جدید</span>
                                </button>
                            ` : ''}
                        </header>
                        <div class="activity-column__list"></div>
                    </section>
                </section>
            </div>

            ${ActivityFormModal()}
            ${UntimedActivityForm()}
            ${ConcurrentActivityWarningModal()}
            ${ArchiveConfirmModal()}
            ${DeleteConfirmModal()}
        </main>
    `;
}

// ============================================================
// Render Functions
// ============================================================

export async function renderActivityColumns() {
    activitiesLoaded = false;
    await loadActivities();
    renderTimedColumn();
    renderUntimedColumn();
    await updateFilterTabCounts();
}

export function renderTimedActivities() {
    renderActivityColumns();
}

/**
 * Update filter tab counts
 */
async function updateFilterTabCounts() {
    const counts = await getActivitiesCount();
    
    const activeCountEl = document.querySelector("#activeFilterCount");
    const archivedCountEl = document.querySelector("#archivedFilterCount");

    if (activeCountEl) activeCountEl.textContent = counts.active;
    if (archivedCountEl) archivedCountEl.textContent = counts.archived;
}

// ============================================================
// Timed Activities Column
// ============================================================

function renderTimedColumn() {
    const list = document.querySelector(".activity-column--timed .activity-column__list");
    if (!list) return;

    const items = timedActivities.filter(activity =>
        currentStatusFilter === "archived" ? activity.is_archived === true : activity.is_archived === false
    );

    list.innerHTML = items.length > 0
        ? items.map(activity =>
            currentStatusFilter === "archived"
                ? createTimedArchivedCardHTML(activity)
                : createTimedActiveCardHTML(activity)
          ).join("")
        : `<p class="activity-column__empty">
            ${currentStatusFilter === "archived"
                ? "هیچ فعالیت زمان‌دار آرشیوشده‌ای وجود ندارد."
                : "هنوز هیچ فعالیت زمان‌داری ایجاد نکرده‌اید."}
          </p>`;

    const countEl = document.querySelector("#timedActivitiesCount");
    if (countEl) countEl.textContent = items.length;
}

function createTimedActiveCardHTML(activity) {
    const createdDate = activity.created_at ? formatDate(activity.created_at) : '—';
    
    let updatedText = '';
    if (activity.updated_at && activity.updated_at !== activity.created_at) {
        updatedText = `
            <span class="activity-card__date activity-card__date--updated">
                آخرین تغییر: ${formatDate(activity.updated_at)}
            </span>
        `;
    }

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
                    <h3 class="activity-card__title">${activity.title}</h3>
                    <span class="activity-card__type">زمان‌دار</span>
                </div>
                <div class="activity-card__dates">
                    <span class="activity-card__date">ایجاد: ${createdDate}</span>
                    ${updatedText}
                </div>
            </div>
            <div class="activity-card__actions">
                <button class="activity-card__action-button activity-card__edit" type="button" data-action="edit">✎</button>
                <button class="activity-card__action-button activity-card__archive" type="button" data-action="archive">🗑</button>
            </div>
        </article>
    `;
}

function createTimedArchivedCardHTML(activity) {
    const createdDate = activity.created_at ? formatDate(activity.created_at) : '—';
    
    let updatedText = '';
    if (activity.updated_at && activity.updated_at !== activity.created_at) {
        updatedText = `
            <span class="activity-card__date activity-card__date--updated">
                آخرین تغییر: ${formatDate(activity.updated_at)}
            </span>
        `;
    }

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
                    <h3 class="activity-card__title">${activity.title}</h3>
                    <span class="activity-card__type">زمان‌دار</span>
                </div>
                <div class="activity-card__dates">
                    <span class="activity-card__date">ایجاد: ${createdDate}</span>
                    ${updatedText}
                </div>
            </div>
            <div class="activity-card__actions">
                <button class="activity-card__action-button activity-card__edit" type="button" data-action="edit">✎</button>
                <button class="activity-card__action-button activity-card__restore" type="button" data-action="restore">↩</button>
                <button class="activity-card__action-button activity-card__delete" type="button" data-action="delete">×</button>
            </div>
        </article>
    `;
}

// ============================================================
// Untimed Activities Column
// ============================================================

function renderUntimedColumn() {
    const list = document.querySelector(".activity-column--untimed .activity-column__list");
    if (!list) return;

    const items = untimedActivities.filter(activity =>
        currentStatusFilter === "archived" ? activity.is_active === false : activity.is_active === true
    );

    list.innerHTML = items.length > 0
        ? items.map(activity =>
            currentStatusFilter === "archived"
                ? createUntimedArchivedCardHTML(activity)
                : createUntimedActiveCardHTML(activity)
          ).join("")
        : `<p class="activity-column__empty">
            ${currentStatusFilter === "archived"
                ? "هیچ فعالیت بدون‌زمان آرشیوشده‌ای وجود ندارد."
                : "هنوز هیچ فعالیت بدون‌زمانی ایجاد نکرده‌اید."}
          </p>`;

    const countEl = document.querySelector("#untimedActivitiesCount");
    if (countEl) countEl.textContent = items.length;
}

function createUntimedActiveCardHTML(activity) {
    const createdDate = activity.created_at ? formatDate(activity.created_at) : '—';
    
    let updatedText = '';
    if (activity.updated_at && activity.updated_at !== activity.created_at) {
        updatedText = `
            <span class="untimed-activity-card__date untimed-activity-card__date--updated">
                آخرین تغییر: ${formatDate(activity.updated_at)}
            </span>
        `;
    }

    return `
        <article
            class="untimed-activity-card"
            data-activity-id="${activity.id}"
            data-activity-type="untimed"
        >
            <span class="untimed-activity-card__color" aria-hidden="true"></span>
            <div class="untimed-activity-card__content">
                <div class="untimed-activity-card__header">
                    <h3 class="untimed-activity-card__title">${activity.title}</h3>
                    <span class="untimed-activity-card__type">بدون زمان</span>
                </div>
                <div class="untimed-activity-card__dates">
                    <span class="untimed-activity-card__date">ایجاد: ${createdDate}</span>
                    ${updatedText}
                </div>
            </div>
            <div class="untimed-activity-card__actions">
                <button class="untimed-activity-card__action-button untimed-activity-card__edit" type="button" data-action="edit">✎</button>
                <button class="untimed-activity-card__action-button untimed-activity-card__archive" type="button" data-action="archive">🗑</button>
            </div>
        </article>
    `;
}

function createUntimedArchivedCardHTML(activity) {
    const createdDate = activity.created_at ? formatDate(activity.created_at) : '—';
    
    let updatedText = '';
    if (activity.updated_at && activity.updated_at !== activity.created_at) {
        updatedText = `
            <span class="untimed-activity-card__date untimed-activity-card__date--updated">
                آخرین تغییر: ${formatDate(activity.updated_at)}
            </span>
        `;
    }

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
                    <h3 class="untimed-activity-card__title">${activity.title}</h3>
                    <span class="untimed-activity-card__type">بدون زمان</span>
                </div>
                <div class="untimed-activity-card__dates">
                    <span class="untimed-activity-card__date">ایجاد: ${createdDate}</span>
                    ${updatedText}
                </div>
            </div>
            <div class="untimed-activity-card__actions">
                <button class="untimed-activity-card__action-button untimed-activity-card__edit" type="button" data-action="edit">✎</button>
                <button class="untimed-activity-card__action-button untimed-activity-card__restore" type="button" data-action="restore">↩</button>
                <button class="untimed-activity-card__action-button untimed-activity-card__delete" type="button" data-action="delete">×</button>
            </div>
        </article>
    `;
}

// ============================================================
// Filter Tabs Handler
// ============================================================

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
    updateAddButtons();
});

// ============================================================
// Add Buttons Handler
// ============================================================

function updateAddButtons() {
    const addButtons = document.querySelectorAll('.activity-column__add');
    addButtons.forEach(btn => {
        btn.style.display = currentStatusFilter === "archived" ? 'none' : '';
    });
}

// ============================================================
// Edit Handler
// ============================================================

document.addEventListener("click", (event) => {
    const editButton = event.target.closest('.activity-column [data-action="edit"]');
    if (!editButton) return;

    const card = editButton.closest(".activity-card, .untimed-activity-card");
    if (!card) return;

    const activityId = Number(card.dataset.activityId);
    const isTimed = card.classList.contains("activity-card");

    const activity = isTimed
        ? timedActivities.find(item => Number(item.id) === activityId)
        : untimedActivities.find(item => Number(item.id) === activityId);

    if (!activity) {
        alert('فعالیت پیدا نشد');
        return;
    }

    if (isTimed) {
        openActivityForm(activity);
    } else {
        openUntimedActivityForm({
            id: activity.id,
            title: activity.title,
            targetCount: activity.target_count,
            createdAt: activity.created_at,
            updatedAt: activity.updated_at,
            isActive: activity.is_active
        });
    }
});

// ============================================================
// Archive Modal
// ============================================================

let itemPendingArchive = null;

function ArchiveConfirmModal() {
    return `
        <div class="archive-confirm-modal" id="archiveConfirmModal" aria-hidden="true">
            <div class="archive-confirm-modal__overlay"></div>
            <div class="archive-confirm-modal__box" role="dialog" aria-modal="true" aria-labelledby="archiveConfirmTitle">
                <div class="archive-confirm-modal__icon" aria-hidden="true">🗑</div>
                <div class="archive-confirm-modal__content">
                    <h2 class="archive-confirm-modal__title" id="archiveConfirmTitle">آرشیو فعالیت</h2>
                    <p class="archive-confirm-modal__message">آیا از آرشیو کردن این فعالیت مطمئن هستید؟</p>
                    <div class="archive-confirm-modal__activity">
                        <span class="archive-confirm-modal__activity-color" id="archiveConfirmColor"></span>
                        <strong id="archiveConfirmName">—</strong>
                    </div>
                    <p class="archive-confirm-modal__note">فعالیت آرشیوشده از لیست فعالیت‌های فعال خارج می‌شه، ولی سابقه‌ش حفظ می‌مونه.</p>
                </div>
                <div class="archive-confirm-modal__actions">
                    <button type="button" class="archive-confirm-modal__cancel" id="archiveConfirmCancel">انصراف</button>
                    <button type="button" class="archive-confirm-modal__confirm" id="archiveConfirmConfirm">آرشیو کن</button>
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
        ? timedActivities.find(item => Number(item.id) === activityId)
        : untimedActivities.find(item => Number(item.id) === activityId);

    if (!activity) return;

    openArchiveConfirmModal(activity, isTimed ? "timed" : "untimed");
});

document.addEventListener("click", (event) => {
    if (event.target.closest("#archiveConfirmCancel") || event.target.closest(".archive-confirm-modal__overlay")) {
        closeArchiveConfirmModal();
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") closeArchiveConfirmModal();
});

document.addEventListener("click", async (event) => {
    const confirmButton = event.target.closest("#archiveConfirmConfirm");
    if (!confirmButton) return;
    if (!itemPendingArchive) return;

    const { activity, type } = itemPendingArchive;

    try {
        if (type === "timed") {
            const result = await TimedActivitiesAPI.archive(activity.id);
            const index = timedActivities.findIndex(item => Number(item.id) === Number(activity.id));
            if (index !== -1) {
                timedActivities[index] = result.activity || result;
            }
        } else {
            const result = await UntimedActivitiesAPI.archive(activity.id);
            const index = untimedActivities.findIndex(item => Number(item.id) === Number(activity.id));
            if (index !== -1) {
                untimedActivities[index] = result.activity || result;
            }
        }

        closeArchiveConfirmModal();
        await renderActivityColumns();
        updateAddButtons();

        document.dispatchEvent(new CustomEvent('timed-activities:changed'));
        document.dispatchEvent(new CustomEvent('untimed-activities:changed'));

    } catch (error) {
        alert('خطا در آرشیو فعالیت');
    }
});

// ============================================================
// Restore Handler
// ============================================================

document.addEventListener("click", async (event) => {
    const restoreButton = event.target.closest('.activity-column [data-action="restore"]');
    if (!restoreButton) return;

    const card = restoreButton.closest(".activity-card, .untimed-activity-card");
    if (!card) return;

    const activityId = Number(card.dataset.activityId);
    const isTimed = card.classList.contains("activity-card");

    const activity = isTimed
        ? timedActivities.find(item => Number(item.id) === activityId)
        : untimedActivities.find(item => Number(item.id) === activityId);

    if (!activity) return;

    try {
        if (isTimed) {
            const result = await TimedActivitiesAPI.restore(activity.id);
            const index = timedActivities.findIndex(item => Number(item.id) === Number(activity.id));
            if (index !== -1) {
                timedActivities[index] = result.activity || result;
            }
        } else {
            const result = await UntimedActivitiesAPI.restore(activity.id);
            const index = untimedActivities.findIndex(item => Number(item.id) === Number(activity.id));
            if (index !== -1) {
                untimedActivities[index] = result.activity || result;
            }
        }

        await renderActivityColumns();
        updateAddButtons();

        document.dispatchEvent(new CustomEvent('timed-activities:changed'));
        document.dispatchEvent(new CustomEvent('untimed-activities:changed'));

    } catch (error) {
        alert('خطا در بازگردانی فعالیت');
    }
});

// ============================================================
// Delete Modal
// ============================================================

let itemPendingDelete = null;

function DeleteConfirmModal() {
    return `
        <div class="delete-confirm-modal" id="deleteConfirmModal" aria-hidden="true">
            <div class="delete-confirm-modal__overlay"></div>
            <div class="delete-confirm-modal__box" role="dialog" aria-modal="true" aria-labelledby="deleteConfirmTitle">
                <div class="delete-confirm-modal__icon" aria-hidden="true">×</div>
                <div class="delete-confirm-modal__content">
                    <h2 class="delete-confirm-modal__title" id="deleteConfirmTitle">حذف کامل فعالیت</h2>
                    <p class="delete-confirm-modal__message">آیا از حذف کامل این فعالیت مطمئن هستید؟</p>
                    <div class="delete-confirm-modal__activity">
                        <span class="delete-confirm-modal__activity-color" id="deleteConfirmColor"></span>
                        <strong id="deleteConfirmName">—</strong>
                    </div>
                    <p class="delete-confirm-modal__warning">این فعالیت و تمام سابقه‌ی ثبت‌شده‌اش به‌طور کامل حذف می‌شه و قابل بازگردانی نیست.</p>
                </div>
                <div class="delete-confirm-modal__actions">
                    <button type="button" class="delete-confirm-modal__cancel" id="deleteConfirmCancel">انصراف</button>
                    <button type="button" class="delete-confirm-modal__confirm" id="deleteConfirmConfirm">حذف کامل</button>
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
        ? timedActivities.find(item => Number(item.id) === activityId)
        : untimedActivities.find(item => Number(item.id) === activityId);

    if (!activity) return;

    openDeleteConfirmModal(activity, isTimed ? "timed" : "untimed");
});

document.addEventListener("click", (event) => {
    if (event.target.closest("#deleteConfirmCancel") || event.target.closest(".delete-confirm-modal__overlay")) {
        closeDeleteConfirmModal();
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") closeDeleteConfirmModal();
});

document.addEventListener("click", async (event) => {
    const confirmButton = event.target.closest("#deleteConfirmConfirm");
    if (!confirmButton) return;
    if (!itemPendingDelete) return;

    const { activity, type } = itemPendingDelete;

    try {
        if (type === "timed") {
            await TimedActivitiesAPI.delete(activity.id);
            const index = timedActivities.findIndex(item => Number(item.id) === Number(activity.id));
            if (index !== -1) timedActivities.splice(index, 1);
        } else {
            await UntimedActivitiesAPI.delete(activity.id);
            const index = untimedActivities.findIndex(item => Number(item.id) === Number(activity.id));
            if (index !== -1) untimedActivities.splice(index, 1);
            
            for (let i = untimedRecords.length - 1; i >= 0; i--) {
                if (Number(untimedRecords[i].activity_id) === Number(activity.id)) {
                    untimedRecords.splice(i, 1);
                }
            }
        }

        closeDeleteConfirmModal();
        await renderActivityColumns();
        updateAddButtons();

        document.dispatchEvent(new CustomEvent('timed-activities:changed'));
        document.dispatchEvent(new CustomEvent('untimed-activities:changed'));

    } catch (error) {
        alert('خطا در حذف فعالیت');
    }
});

// ============================================================
// Event Listeners for External Changes
// ============================================================

document.addEventListener("timed-activities:changed", () => {
    loadActivities().then(() => renderActivityColumns());
});

document.addEventListener("untimed-activities:changed", () => {
    loadActivities().then(() => renderActivityColumns());
});

// ============================================================
// Initialization
// ============================================================

export function initActivitiesPage() {
    loadActivities().then(async () => {
        await renderActivityColumns();
        updateAddButtons();
    });
}