import {
    timedActivities,
    ActivityFormModal,
    ConcurrentActivityWarningModal,
    requestStartActivity,
    openActivityForm,
    getActiveActivity
} from "../../Components/dashboard/timed-activities/timed-activities.js";

export function ActivitiesView(){
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
            <!--
                    activity-status-filter.html
                    اینجا قرار می‌گیرد
                -->
            <div
              class="activity-status-filter"
              role="tablist"
              aria-label="وضعیت فعالیت‌ها"
            >
              <button
                class="activity-status-filter__item activity-status-filter__item--active"
                type="button"
                role="tab"
                aria-selected="true"
                data-status="active"
              >
                <span class="activity-status-filter__indicator"></span>

                <span class="activity-status-filter__label">
                  فعالیت‌های فعال
                </span>

                <span class="activity-status-filter__count"> 6 </span>
              </button>

              <button
                class="activity-status-filter__item"
                type="button"
                role="tab"
                aria-selected="false"
                data-status="archived"
              >
                <span class="activity-status-filter__indicator"></span>

                <span class="activity-status-filter__label"> آرشیو شده </span>

                <span class="activity-status-filter__count"> 3 </span>
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

                <span class="activity-column__count"> 3 </span>
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
              <article
                class="untimed-activity-card"
                data-activity-id="4"
                data-activity-type="untimed"
              >
                <!-- Activity Color -->
                <span
                  class="untimed-activity-card__color"
                  aria-hidden="true"
                ></span>

                <!-- Main Content -->
                <div class="untimed-activity-card__content">
                  <!-- Header -->
                  <div class="untimed-activity-card__header">
                    <div class="untimed-activity-card__title-wrapper">
                      <h3 class="untimed-activity-card__title">مطالعه زبان</h3>

                      <span class="untimed-activity-card__type">
                        بدون زمان
                      </span>
                    </div>
                  </div>

                  <!-- Information -->
                  <div class="untimed-activity-card__info">
                    <span class="untimed-activity-card__created">
                      ایجاد شده: ۱۵ شهریور
                    </span>

                    <span class="untimed-activity-card__goal">
                      هدف: ۶ بار
                    </span>
                  </div>

                  <!-- Checkboxes -->
                  <div
                    class="untimed-activity-card__checks"
                    role="group"
                    aria-label="پیشرفت فعالیت"
                  >
                    <label class="untimed-activity-card__check">
                      <input type="checkbox" checked />

                      <span class="untimed-activity-card__checkbox">
                        <span class="untimed-activity-card__checkmark">
                          ✓
                        </span>
                      </span>
                    </label>

                    <label class="untimed-activity-card__check">
                      <input type="checkbox" checked />

                      <span class="untimed-activity-card__checkbox">
                        <span class="untimed-activity-card__checkmark">
                          ✓
                        </span>
                      </span>
                    </label>

                    <label class="untimed-activity-card__check">
                      <input type="checkbox" checked />

                      <span class="untimed-activity-card__checkbox">
                        <span class="untimed-activity-card__checkmark">
                          ✓
                        </span>
                      </span>
                    </label>

                    <label class="untimed-activity-card__check">
                      <input type="checkbox" />

                      <span class="untimed-activity-card__checkbox">
                        <span class="untimed-activity-card__checkmark">
                          ✓
                        </span>
                      </span>
                    </label>

                    <label class="untimed-activity-card__check">
                      <input type="checkbox" />

                      <span class="untimed-activity-card__checkbox">
                        <span class="untimed-activity-card__checkmark">
                          ✓
                        </span>
                      </span>
                    </label>

                    <label class="untimed-activity-card__check">
                      <input type="checkbox" />

                      <span class="untimed-activity-card__checkbox">
                        <span class="untimed-activity-card__checkmark">
                          ✓
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <!-- Actions -->
                <div class="untimed-activity-card__actions">
                  <button
                    class="untimed-activity-card__action-button untimed-activity-card__edit"
                    type="button"
                    aria-label="ویرایش فعالیت"
                    data-action="edit"
                  >
                    <span
                      class="untimed-activity-card__action-icon"
                      aria-hidden="true"
                    >
                      ✎
                    </span>
                  </button>

                  <button
                    class="untimed-activity-card__action-button untimed-activity-card__archive"
                    type="button"
                    aria-label="آرشیو فعالیت"
                    data-action="archive"
                  >
                    <span
                      class="untimed-activity-card__action-icon"
                      aria-hidden="true"
                    >
                      🗑
                    </span>
                  </button>
                </div>
              </article>

              <!-- archive -->
              <article
                class="untimed-activity-card untimed-activity-card--archived"
                data-activity-id="4"
                data-activity-type="untimed"
                data-activity-status="archived"
              >
                <!-- Activity Color -->
                <span
                  class="untimed-activity-card__color"
                  aria-hidden="true"
                ></span>

                <!-- Main Content -->
                <div class="untimed-activity-card__content">
                  <div class="untimed-activity-card__header">
                    <div class="untimed-activity-card__title-wrapper">
                      <h3 class="untimed-activity-card__title">مطالعه زبان</h3>

                      <span class="untimed-activity-card__type">
                        بدون زمان
                      </span>
                    </div>
                  </div>

                  <div class="untimed-activity-card__info">
                    <span class="untimed-activity-card__created">
                      ایجاد شده: ۱۵ شهریور
                    </span>

                    <span class="untimed-activity-card__goal">
                      هدف: ۶ بار
                    </span>
                  </div>

                  <!-- Progress -->
                  <div
                    class="untimed-activity-card__checks"
                    aria-label="پیشرفت فعالیت"
                  >
                    <span
                      class="untimed-activity-card__checkbox untimed-activity-card__checkbox--checked"
                    >
                      ✓
                    </span>

                    <span
                      class="untimed-activity-card__checkbox untimed-activity-card__checkbox--checked"
                    >
                      ✓
                    </span>

                    <span
                      class="untimed-activity-card__checkbox untimed-activity-card__checkbox--checked"
                    >
                      ✓
                    </span>

                    <span class="untimed-activity-card__checkbox"> </span>

                    <span class="untimed-activity-card__checkbox"> </span>

                    <span class="untimed-activity-card__checkbox"> </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="untimed-activity-card__actions">
                  <!-- Edit -->
                  <button
                    class="untimed-activity-card__action-button untimed-activity-card__edit"
                    type="button"
                    aria-label="ویرایش فعالیت"
                    data-action="edit"
                  >
                    <span
                      class="untimed-activity-card__action-icon"
                      aria-hidden="true"
                    >
                      ✎
                    </span>
                  </button>

                  <!-- Restore -->
                  <button
                    class="untimed-activity-card__action-button untimed-activity-card__restore"
                    type="button"
                    aria-label="بازگردانی فعالیت"
                    data-action="restore"
                  >
                    <span
                      class="untimed-activity-card__action-icon"
                      aria-hidden="true"
                    >
                      ↩
                    </span>
                  </button>

                  <!-- Delete -->
                  <button
                    class="untimed-activity-card__action-button untimed-activity-card__delete"
                    type="button"
                    aria-label="حذف کامل فعالیت"
                    data-action="delete"
                  >
                    <span
                      class="untimed-activity-card__action-icon"
                      aria-hidden="true"
                    >
                      ×
                    </span>
                  </button>
                </div>
              </article>
            </div>
          </section>
        </section>
      </div>

      ${ActivityFormModal()}
      ${ArchiveConfirmModal()}
      ${ConcurrentActivityWarningModal()}
    `;
}


// ========================================
// Render Timed Activities
// ========================================

export function renderTimedActivities() {

    const list = document.querySelector(
        ".activity-column--timed .activity-column__list"
    );

    if (!list) {
        return;
    }

    const activeActivities = timedActivities.filter(
        activity => !activity.archived
    );

    list.innerHTML = activeActivities
        .map(activity => {

            return `
                <article
                    class="activity-card activity-card--timed"
                    data-activity-id="${activity.id}"
                    data-activity-type="timed"
                    style="--activity-color: ${activity.color};"
                >

                    <!-- Activity Color -->
                    <span
                        class="activity-card__color"
                        aria-hidden="true"
                    ></span>

                    <!-- Main Content -->
                    <div class="activity-card__content">

                        <div class="activity-card__header">

                            <div class="activity-card__title-wrapper">

                                <h3 class="activity-card__title">
                                    ${activity.title}
                                </h3>

                            </div>

                        </div>

                        <div class="activity-card__info">

                            <span class="activity-card__created">
                                ایجاد شده در ${formatCreatedDate(activity.createdAt)}
                            </span>

                        </div>

                    </div>

                    <!-- Actions -->
                    <div class="activity-card__actions">

                        <button
                            class="activity-card__action-button activity-card__edit"
                            type="button"
                            aria-label="ویرایش فعالیت"
                            data-action="edit"
                        >
                            <span
                                class="activity-card__action-icon"
                                aria-hidden="true"
                            >
                                ✎
                            </span>
                        </button>

                        <button
                            class="activity-card__action-button activity-card__archive"
                            type="button"
                            aria-label="آرشیو فعالیت"
                            data-action="archive"
                            data-activity-id="${activity.id}"
                        >
                            <span
                                class="activity-card__action-icon"
                                aria-hidden="true"
                            >
                                🗑
                            </span>
                        </button>

                        <button
                            class="activity-card__start"
                            type="button"
                            data-action="start"
                            style="--activity-color: ${activity.color};"
                        >
                            <span
                                class="activity-card__start-icon"
                                aria-hidden="true"
                            >
                                ▶
                            </span>

                            <span>
                                شروع
                            </span>

                        </button>

                    </div>

                </article>
            `;

        })
        .join("");

    updateTimedActivitiesCount(activeActivities.length);
    restoreActiveTimedCard();
}

function updateTimedActivitiesCount(count) {
    const countEl = document.querySelector("#timedActivitiesCount");
    if (!countEl) return;
    countEl.textContent = count;
}

// اگه یه فعالیت (حتی از داشبورد) در حال اجراست، دکمه‌ی همون کارت
// روی این صفحه هم باید حالت «پایان» رو نشون بده، نه «شروع».
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

function formatCreatedDate(date) {
    const createdDate = new Date(date);

    return new Intl.DateTimeFormat("fa-IR", {
        day: "numeric",
        month: "long"
    }).format(createdDate);
}


// ========================================
// دکمه‌ی شروع/پایان — از همون منطق مشترک با داشبورد استفاده می‌کنه
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
// دکمه‌ی ویرایش — همون مودال ایجاد فعالیت، فقط توی حالت ویرایش
// ========================================
document.addEventListener("click", (event) => {
    const editButton = event.target.closest(
        '.activity-column--timed [data-action="edit"]'
    );

    if (!editButton) return;

    const card = editButton.closest(".activity-card");
    if (!card) return;

    const activityId = Number(card.dataset.activityId);
    const activity = timedActivities.find(item => item.id === activityId);
    if (!activity) return;

    openActivityForm(activity);
});


// ========================================
// Archive Confirm Modal
// ساختارش مثل بقیه‌ی مودال‌های تاییدی اپ (آیکون + پیام +
// دکمه‌های انصراف/تایید)، فقط برای فعالیت‌های زمان‌دار.
// ========================================

let activityPendingArchive = null;

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
                        فعالیت آرشیوشده از لیست فعالیت‌های فعال خارج می‌شه، ولی سابقه‌ی سشن‌هاش حفظ می‌مونه.
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

function openArchiveConfirmModal(activity) {
    activityPendingArchive = activity;

    const modal = document.querySelector("#archiveConfirmModal");
    if (!modal) return;

    const colorEl = modal.querySelector("#archiveConfirmColor");
    const nameEl = modal.querySelector("#archiveConfirmName");

    if (colorEl) colorEl.style.backgroundColor = activity.color;
    if (nameEl) nameEl.textContent = activity.title;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
}

function closeArchiveConfirmModal() {
    const modal = document.querySelector("#archiveConfirmModal");
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    activityPendingArchive = null;
}

// باز کردن مودال آرشیو با کلیک روی دکمه‌ی سطل‌آشغال (فقط ستون زمان‌دار)
document.addEventListener("click", (event) => {
    const archiveButton = event.target.closest(
        '.activity-column--timed [data-action="archive"]'
    );

    if (!archiveButton) return;

    const activityId = Number(archiveButton.dataset.activityId);
    const activity = timedActivities.find(item => item.id === activityId);

    if (!activity) return;

    openArchiveConfirmModal(activity);
});

// انصراف / کلیک روی overlay
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

// تایید نهایی آرشیو
document.addEventListener("click", (event) => {
    const confirmButton = event.target.closest("#archiveConfirmConfirm");
    if (!confirmButton) return;
    if (!activityPendingArchive) return;

    activityPendingArchive.archived = true;

    closeArchiveConfirmModal();
    renderTimedActivities();
});

// وقتی از هرجای دیگه (مثلاً مودال ایجاد/ویرایش فعالیت که مشترکه)
// چیزی توی لیست فعالیت‌ها عوض شد، لیست این صفحه هم به‌روز بشه.
document.addEventListener("timed-activities:changed", () => {
    renderTimedActivities();
});