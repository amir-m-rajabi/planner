import { sessions } from "../sessions/sessions.js";
import { renderSessionListToDOM } from "../sessions/sessions.js"
import { renderSessionsModalListToDOM } from "../sessions/sessions.js"

export let timedActivities = [
    {
        id: 1,
        title: "مطالعه ریاضی",
        color: "#e6b84c",
        totalDuration: 4800,
        createdAt: "2026-08-28",
        archived: false
    },

    {
        id: 2,
        title: "برنامه‌نویسی",
        color: "#4f8fc0",
        totalDuration: 6300,
        createdAt: "2026-08-28",
        archived: false
    },

    {
        id: 3,
        title: "زبان انگلیسی",
        color: "#d96b6b",
        totalDuration: 3000,
        createdAt: "2026-08-28",
        archived: false
    }
];


let activeActivity = null;

let timerInterval = null;

let activityTimerInterval = null;

// اگه فرم توی حالت «ویرایش» بازه، فعالیتی که داره ویرایش می‌شه اینجاست.
// null یعنی فرم توی حالت «ایجاد فعالیت جدید»ه.
let activityBeingEdited = null;


export function TimeActivies(){
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
      ${renderTimedActivities()}
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

// ========================================
// Activity Form Modal
// ========================================
export function ActivityFormModal() {
    return `
<section
  class="activity-form"
  data-activity-type="timed"
  aria-labelledby="activity-form-title"
>
  <div class="activity-form__container">
    <!-- Header -->
    <header class="activity-form__header">
      <div class="activity-form__heading">
        <span class="activity-form__eyebrow"> فعالیت‌ها </span>

        <h2 class="activity-form__title" id="activity-form-title">
          ایجاد فعالیت زمان‌دار
        </h2>

        <p class="activity-form__description">
          فعالیت خود را ایجاد کنید تا بتوانید زمان انجام آن را ثبت و پیگیری
          کنید.
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
    <form class="activity-form__form" id="activity-form">
      <!-- Basic Information -->
      <fieldset class="activity-form__section">
        <legend class="activity-form__section-title">اطلاعات فعالیت</legend>

        <!-- Title -->
        <div class="activity-form__field">
          <label class="activity-form__label" for="activity-title">
            عنوان فعالیت
          </label>

          <input
            class="activity-form__input"
            id="activity-title"
            name="title"
            type="text"
            placeholder="مثلاً مطالعه ریاضی"
            maxlength="100"
            required
          />
        </div>

        <!-- Timed: Color -->
        <div
          class="activity-form__field activity-form__field--timed"
          data-field="timed-color"
        >
          <label class="activity-form__label" for="activity-color">
            رنگ فعالیت
          </label>

          <div class="activity-form__color-picker">
            <input
              class="activity-form__color-input"
              id="activity-color"
              name="color"
              type="color"
              value="#4f9ea5"
            />

            <span class="activity-form__color-preview"> رنگ فعالیت </span>
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

        <button class="activity-form__submit" type="submit">
          <span class="activity-form__submit-icon" aria-hidden="true"> + </span>

          <span> ایجاد فعالیت </span>
        </button>
      </footer>
    </form>
  </div>
</section>
    `;
}

// ========================================
// Concurrent Activity Warning Modal
// ========================================
export function ConcurrentActivityWarningModal() {
    return `
        <div class="activity-warning-modal" id="concurrentActivityWarningModal" aria-hidden="true">
            <div class="activity-warning-modal__overlay"></div>

            <div
                class="activity-warning-modal__box"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="concurrentActivityWarningTitle"
            >
                <div class="activity-warning-modal__icon" aria-hidden="true">!</div>

                <div class="activity-warning-modal__content">
                    <h2 class="activity-warning-modal__title" id="concurrentActivityWarningTitle">
                        یه فعالیت دیگه در حال اجراست
                    </h2>

                    <p class="activity-warning-modal__message" id="concurrentActivityWarningMessage">
                        نمی‌تونید هم‌زمان چند فعالیت رو شروع کنید.
                    </p>
                </div>

                <div class="activity-warning-modal__actions">
                    <button type="button" class="activity-warning-modal__confirm" id="concurrentActivityWarningClose">
                        متوجه شدم
                    </button>
                </div>
            </div>
        </div>
    `;
}

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

document.addEventListener("click", (event) => {
    if (
        event.target.closest("#concurrentActivityWarningClose") ||
        event.target.closest(".activity-warning-modal__overlay")
    ) {
        closeConcurrentActivityWarning();
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
        closeConcurrentActivityWarning();
    }
});

function renderTimedActivities() {

    return timedActivities
        .filter(activity => !activity.archived)
        .map(activity => {
            
            return `
                <article
                    class="timed-activity"
                    data-activity-id="${activity.id}"
                    data-duration="${activity.totalDuration}"
                >

                    <div
                        class="timed-activity__indicator"
                        style="--activity-color: ${activity.color}"
                    ></div>

                    <div class="timed-activity__info">

                        <h3 class="timed-activity__title" id="activity-title">
                            ${activity.title}
                        </h3>

                        <span class="timed-activity__duration">
                            ${formatDuration(
                                getActivityDuration(activity.id)
                            )}
                        </span>

                    </div>

                    <button
                        type="button"
                        class="timed-activity__start"
                        id="activity-color"
                        style="--activity-color: ${activity.color}"
                    >
                        <span class="timed-activity__start-icon">
                            ▶
                        </span>

                        <span>
                            شروع
                        </span>
                    </button>

                </article>
            `;
        })
        .join("");
}

export function renderTimedActivitiesToDOM() {

    const list =
        document.querySelector(".timed-activities__list");

    if (!list) {
        return;
    }

    list.innerHTML =
        renderTimedActivities();

        restoreActiveButton();
    
}



export function initTimedActivities() {

    document.addEventListener("click", (event) => {

        const startButton =
            event.target.closest(".timed-activity__start");

        if (!startButton) {
            return;
        }

        const activityCard =
            startButton.closest(".timed-activity");

        if (!activityCard) {
            return;
        }

        const activityId =
            Number(activityCard.dataset.activityId);

        const activity =
            timedActivities.find(
                item => item.id === activityId
            );

        if (!activity) {
            return;
        }

        requestStartActivity(activity, startButton);
    });



    // =====================================
        //  btn timer
        // =====================================
    document.addEventListener("click", (event) => {
        const stopButton = event.target.closest("#headerTimerStop");
        
        if (!stopButton) {
            return;
        }
        
        // اگه فعالیت فعالی وجود نداره، کاری نکن
        if (!activeActivity) {
            return;
        }
        
        // پیدا کردن دکمه شروع مربوط به فعالیت فعال
        const activeCard = document.querySelector(
            `[data-activity-id="${activeActivity.id}"]`
        );
        
        if (!activeCard) {
            return;
        }
        
        const startButton = activeCard.querySelector(".timed-activity__start, .activity-card__start");
        
        if (!startButton) {
            return;
        }
        
        // پایان دادن به فعالیت
        finishActivity(activeActivity, startButton);
    });
}

initTimedActivities()

// ========================================
// ورودی مشترک برای دکمه‌ی شروع/پایان
// ========================================
export function requestStartActivity(activity, button) {

    if (activeActivity && activeActivity.id === activity.id) {
        finishActivity(activity, button);
        return;
    }

    if (activeActivity) {
        openConcurrentActivityWarning(activeActivity);
        return;
    }

    startActivity(activity, button);
}

// وضعیت فعالیتِ در حال اجرا رو به هر صفحه‌ای که بخواد
// (مثلاً برای بازسازی ظاهر دکمه بعد از رندر) می‌ده.
export function getActiveActivity() {
    return activeActivity;
}

/////////////// Start & End Timer ///////
function startActivity(activity, button) {

    activeActivity = {
        ...activity,
        startTime: new Date()
    };


        // پاک کردن تایمرهای قبلی (اگه باشن)
    if (activityTimerInterval) {
        clearInterval(activityTimerInterval);
        activityTimerInterval = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    activityTimerInterval =
    setInterval(
        updateActivityTimer,
        1000
    );

    button.classList.add("is-active");

    const text =
        button.querySelector("span:last-child");

    if (text) {
        text.textContent = "پایان";
    }

    const icon =
        button.querySelector("span:first-child");

    if (icon) {
        icon.textContent = "■";
    }

    showHeaderTimer(activity);

    const timeElement =
        document.querySelector("#headerTimerTime");

    if (timeElement) {
        timeElement.textContent = "00:00:00";
    }

    timerInterval =
        setInterval(updateHeaderTimer, 1000);
}

function finishActivity(activity, button) {

    const endTime = new Date();

    const startTime =
        activeActivity.startTime;

    const duration =
        endTime - startTime;

    const durationInSeconds =
        Math.floor(duration / 1000);


    const newSession = {
        id: Date.now(),

        activityId: activity.id,

        title: activity.title,

        color: activity.color,

        startTime: formatTime(startTime),

        endTime: formatTime(endTime),

        duration: formatSessionDuration(duration),

        hasNote: false
    };  
    
    sessions.push(newSession);

    console.log(sessions);

    renderSessionListToDOM()
    renderSessionsModalListToDOM()
    
    // ====== ارسال event برای بروزرسانی سشن ======
    document.dispatchEvent(new CustomEvent("timed-activities:changed"));

    
    activity.totalDuration += durationInSeconds;

    const durationElement =
    document.querySelector(
        `[data-activity-id="${activity.id}"] .timed-activity__duration`
    );

    if (durationElement) {

    durationElement.textContent =
        formatDuration(
            activity.totalDuration
        );
    }


    // ======== پاک کردن تایمرها ========
    clearInterval(timerInterval);
    clearInterval(activityTimerInterval);
    timerInterval = null;
    activityTimerInterval = null;

    console.log("Duration:",durationInSeconds);

    console.log("New total duration:",activity.totalDuration);
    


    // بازگرداندن دکمه به حالت عادی

    button.classList.remove("is-active");

    const text =
        button.querySelector("span:last-child");

    if (text) {
        text.textContent = "شروع";
    }

    const icon =
        button.querySelector("span:first-child");

    if (icon) {
        icon.textContent = "▶";
    }


    // در حال حاضر Activity دیگر فعال نیست

    activeActivity = null;

    clearInterval(timerInterval);
    timerInterval = null;

    hideHeaderTimer();
}

function updateActivityTimer() {

    if (!activeActivity) {
        return;
    }

    const now = new Date();

    const elapsedSeconds =
        Math.floor(
            (now - activeActivity.startTime) / 1000
        );

    const currentDuration =
        activeActivity.totalDuration +
        elapsedSeconds;

    const durationElement =
        document.querySelector(
            `[data-activity-id="${activeActivity.id}"] .timed-activity__duration`
        );

    if (!durationElement) {
        return;
    }

    durationElement.textContent =
        formatDuration(currentDuration);
}

// ============================================
// تابع برای بازگردوندن وضعیت دکمه فعال (ماژول داشبورد)
// ============================================
function restoreActiveButton() {
    // اگه هیچ فعالیت فعالی نیست، کاری نکن
    if (!activeActivity) {
        return;
    }
    
    // همه کارت‌های فعالیت رو پیدا کن
    const cards = document.querySelectorAll(".timed-activity");
    
    cards.forEach(card => {
        // آی‌دی فعالیت این کارت رو بگیر
        const id = Number(card.dataset.activityId);
        
        // اگه این کارت مربوط به فعالیت فعاله
        if (id === activeActivity.id) {
            // دکمه شروع رو پیدا کن
            const button = card.querySelector(".timed-activity__start");
            
            if (button) {
                // کلاس فعال رو به دکمه اضافه کن
                button.classList.add("is-active");
                
                // متن دکمه رو به "پایان" تغییر بده
                const text = button.querySelector("span:last-child");
                if (text) {
                    text.textContent = "پایان";
                }
                
                // آیکون دکمه رو به شکل مربع تغییر بده
                const icon = button.querySelector("span:first-child");
                if (icon) {
                    icon.textContent = "■";
                }
            }
        }
    });
    
    // تایمر هدر رو نشون بده
    showHeaderTimer(activeActivity);
    
    // زمان رو آپدیت کن
    updateActivityTimer();
}


//////// Create Sessions with End Activitiy ///////
// ========================================
// Time Helpers
// ========================================

function timeToSeconds(time) {

    const [hours, minutes, seconds] =
        time.split(":").map(Number);

    return (
        hours * 3600 +
        minutes * 60 +
        seconds
    );
}


function formatTime(date) {

    const hours =
        String(date.getHours()).padStart(2, "0");

    const minutes =
        String(date.getMinutes()).padStart(2, "0");

    const seconds =
        String(date.getSeconds()).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
}


function formatSessionDuration(duration) {

    const totalSeconds =
        Math.floor(duration / 1000);

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor((totalSeconds % 3600) / 60);

    const seconds =
        totalSeconds % 60;

    if (hours > 0) {
        return `${hours} ساعت و ${minutes} دقیقه`;
    }

    if (minutes > 0) {
        return `${minutes} دقیقه`;
    }

    return `${seconds} ثانیه`;
}


function formatDuration(totalSeconds) {

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor((totalSeconds % 3600) / 60);

    const seconds =
        totalSeconds % 60;

    return [
        hours,
        minutes,
        seconds
    ]
        .map(value =>
            String(value).padStart(2, "0")
        )
        .join(":");
}


// ========================================
// Activity Total Duration
// ========================================

function getActivityDuration(activityId) {

    return sessions
        .filter(session =>
            session.activityId === activityId
        )
        .reduce((total, session) => {

            const start =
                timeToSeconds(session.startTime);

            const end =
                timeToSeconds(session.endTime);

            return total + (end - start);

        }, 0);
}


/////////// Modals //////////////////

// activity: اختیاری — اگه بدی، مودال توی حالت «ویرایش» باز می‌شه
// و فیلدها با اطلاعات همون فعالیت پر می‌شن. اگه ندی، حالت «ایجاد».
export function openActivityForm(activity = null) {

    const form =
        document.querySelector(".activity-form");

    if (!form) {
        return;
    }

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

    const form =
        document.querySelector(".activity-form");

    if (!form) {
        return;
    }

    form.classList.remove("is-open");
    activityBeingEdited = null;
}


//////////////// Header Modal (Timer) ///////////////
export function showHeaderTimer(activity) {

    const timer =
        document.querySelector("#headerTimer");

    if (!timer) {
        return;
    }

    timer.hidden = false;


    const activityName = document.querySelector("#headerTimerActivity");
    if (activityName) {
        activityName.textContent = activity.title;
    }
    
    // تنظیم رنگ اندیکاتور
    const indicator = document.querySelector("#headerTimerIndicator");
    if (indicator) {
        indicator.style.backgroundColor = activity.color;
    }
    
    // تنظیم رنگ دکمه پایان
    const stopButton = document.querySelector("#headerTimerStop");
    if (stopButton) {
        stopButton.style.backgroundColor = activity.color;
        stopButton.style.borderColor = activity.color;
    }

    console.log("Timer opened for:", activity.title);
}

export function hideHeaderTimer() {

    const timer =
        document.querySelector("#headerTimer");

    if (!timer) {
        return;
    }

    timer.hidden = true;
}

function updateHeaderTimer() {

    if (!activeActivity) {
        return;
    }

    const now = new Date();

    const elapsed =
        Math.floor(
            (now - activeActivity.startTime) / 1000
        );

    const hours =
        Math.floor(elapsed / 3600);

    const minutes =
        Math.floor(
            (elapsed % 3600) / 60
        );

    const seconds =
        elapsed % 60;

    const timeElement =
        document.querySelector(
            "#headerTimerTime"
        );

    if (!timeElement) {
        return;
    }

    timeElement.textContent =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;
}


/////////// Modals //////////////////

// باز کردن مودال ایجاد فعالیت — هم از دکمه‌ی «+» داشبورد،
// هم از دکمه‌ی «فعالیت جدید» صفحه‌ی فعالیت‌ها.
document.addEventListener("click", (event) => {

    const addButton =
        event.target.closest(".timed-activities__add, [data-action=\"create-timed\"]");

    if (!addButton) {
        return;
    }

    openActivityForm();
});

document.addEventListener("click", (event) => {

    const closeButton =
        event.target.closest(
            '[data-action="close-form"]'
        );

    if (!closeButton) {
        return;
    }

    closeActivityForm();
});

document.addEventListener("click", (event) => {

    const cancelButton =
        event.target.closest(
            '[data-action="cancel"]'
        );

    if (!cancelButton) {
        return;
    }

    closeActivityForm();
});

document.addEventListener('keyup',(event)=>{
    if(event.key === 'Escape'){
        closeActivityForm();
    }
})

//////////////// Add / Edit Activity //////////////
document.addEventListener("submit", (event) => {

    const form =
        event.target.closest("#activity-form");

    if (!form) {
        return;
    }

    event.preventDefault();

    const title =
        form.querySelector("#activity-title").value.trim();

    const color =
        form.querySelector("#activity-color").value;

    if (activityBeingEdited) {

        // ====== حالت ویرایش: خودِ فعالیت رو آپدیت کن ======
        activityBeingEdited.title = title;
        activityBeingEdited.color = color;

        renderTimedActivitiesToDOM();
        
        // ====== ارسال event برای بروزرسانی سشن ======
        document.dispatchEvent(new CustomEvent("timed-activities:changed"));

    } else {

        // ====== حالت ایجاد: یه فعالیت جدید بساز ======
        const newActivity = {
            id: Date.now(),
            title: title,
            color: color,
            totalDuration: 0,
            createdAt: new Date().toISOString(),
            archived: false
        };

        timedActivities.push(newActivity);

        renderTimedActivitiesToDOM();

        // ====== ارسال event برای بروزرسانی سشن ======
        document.dispatchEvent(new CustomEvent("timed-activities:changed"));
    }

    form.reset();
    closeActivityForm();
});