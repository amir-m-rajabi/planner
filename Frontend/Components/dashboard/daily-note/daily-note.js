export function DailyNote() {
    return `
        <section class="daily-notes">

            <!-- Header -->

            <header class="daily-notes__header">
                <h2 class="daily-notes__title">
                    دفترچه امروز
                </h2>
            </header>


            <!-- Notebook -->

            <div class="daily-notes__content">

                <button
                    type="button"
                    class="daily-notebook"
                    id="dailyNotebook"
                    data-note-exists="false"
                    aria-label="باز کردن دفترچه یادداشت امروز"
                >



                    <!-- Notebook -->

                    <div class="daily-notebook__book">

                        <div class="daily-notebook__spine"></div>


                        <div class="daily-notebook__content">

                            <span class="daily-notebook__icon">
                                📖
                            </span>

                            <span class="daily-notebook__name">
                                یادداشت روزانه
                            </span>

                            <span
                                class="daily-notebook__date"
                                id="dailyNotebookDate"
                            >
                                امروز
                            </span>

                        </div>

                    </div>


                    <!-- Status -->

                    <div class="daily-notebook__status">

                        <span
                            class="daily-notebook__message"
                            id="dailyNotebookStatus"
                        >
                            هنوز یادداشتی برای امروز ثبت نشده
                        </span>

                    </div>

                </button>

            </div>


            <!-- ========================================
                 Daily Note Modal
            ======================================== -->

            <div
                class="daily-note-modal"
                id="dailyNoteModal"
                aria-hidden="true"
            >

                <!-- Overlay -->

                <div
                    class="daily-note-modal__overlay"
                    data-action="close-daily-note"
                ></div>


                <!-- Modal -->

                <div
                    class="daily-note-modal__book"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="dailyNoteModalTitle"
                >

                    <!-- Left / Cover -->

                    <div class="daily-note-modal__cover">


                        <div class="daily-note-modal__cover-content">

                            <span class="daily-note-modal__cover-icon">
                                📖
                            </span>

                            <span class="daily-note-modal__cover-title">
                                دفترچه امروز
                            </span>

                            <span class="daily-note-modal__cover-date">
                                امروز
                            </span>

                        </div>

                    </div>


                    <!-- Right / Writing Page -->

                    <div class="daily-note-modal__page">

                        <header class="daily-note-modal__header">

                            <div>

                                <span class="daily-note-modal__eyebrow">
                                    یادداشت روزانه
                                </span>

                                <h2
                                    class="daily-note-modal__title"
                                    id="dailyNoteModalTitle"
                                >
                                    امروز چه گذشت؟
                                </h2>

                            </div>


                            <button
                                type="button"
                                class="daily-note-modal__close"
                                data-action="close-daily-note"
                                aria-label="بستن دفترچه"
                            >
                                ×
                            </button>

                        </header>


                        <!-- Writing Area -->

                        <div class="daily-note-modal__editor">

                            <div
                                class="daily-note-modal__lines"
                                aria-hidden="true"
                            ></div>

                            <textarea
                                id="dailyNoteInput"
                                class="daily-note-modal__textarea"
                                placeholder="هر چیزی که امروز در ذهنت می‌گذرد بنویس..."
                                maxlength="5000"
                                spellcheck="false"
                            ></textarea>

                        </div>


                        <!-- Footer -->

                        <footer class="daily-note-modal__footer">

                            <span
                                class="daily-note-modal__counter"
                                id="dailyNoteCounter"
                            >
                                0 / 5000
                            </span>


                            <div class="daily-note-modal__actions">

                                <button
                                    type="button"
                                    class="daily-note-modal__cancel"
                                    data-action="close-daily-note"
                                >
                                    بستن
                                </button>

                                <button
                                    type="button"
                                    class="daily-note-modal__save"
                                    id="dailyNoteSave"
                                >
                                    ذخیره یادداشت
                                </button>

                            </div>

                        </footer>

                    </div>

                </div>

            </div>

        </section>
    `;
}

let dailyNoteContent = "";

// روزی که دفترچه الان بهش اشاره می‌کنه (پیش‌فرض: امروز).
// هر روز دفترچه‌ی خودش رو داره چون کلید localStorage بر
// اساس همین ساخته می‌شه.
let currentNoteDate = new Date();
let currentIsToday = true;
let currentDateLabel = "امروز";


/* ========================================
   Daily Notes
======================================== */


/* ========================================
   کلید ذخیره‌سازی برای یک تاریخ مشخص
======================================== */

function getNoteKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `daily-note-${year}-${month}-${day}`;
}


/* ========================================
   بارگذاری یادداشتِ روزِ فعلاً انتخاب‌شده
======================================== */

function loadNoteForCurrentDate() {

    dailyNoteContent =
        localStorage.getItem(
            getNoteKey(currentNoteDate)
        ) || "";
}


/* ========================================
   Init
======================================== */

export function initDailyNotes() {

    const notebook =
        document.querySelector("#dailyNotebook");

    const modal =
        document.querySelector("#dailyNoteModal");

    const saveButton =
        document.querySelector("#dailyNoteSave");

    const textarea =
        document.querySelector("#dailyNoteInput");

    const counter =
        document.querySelector("#dailyNoteCounter");

    if (
        !notebook ||
        !modal ||
        !saveButton ||
        !textarea
    ) {
        return;
    }


    /* ========================================
       Load Saved Note
    ======================================== */

    loadNoteForCurrentDate();


    /* ========================================
       Open Modal
    ======================================== */

    notebook.addEventListener("click", () => {

        openDailyNoteModal();

    });


    /* ========================================
       Close Button
    ======================================== */

    const closeButton =
        modal.querySelector(
            ".daily-note-modal__close"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                closeDailyNoteModal();

            }
        );

    }


    /* ========================================
       Cancel Button
    ======================================== */

    const cancelButton =
        modal.querySelector(
            ".daily-note-modal__cancel"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                closeDailyNoteModal();

            }
        );

    }


    /* ========================================
       Overlay
    ======================================== */

    const overlay =
        modal.querySelector(
            ".daily-note-modal__overlay"
        );

    if (overlay) {

        overlay.addEventListener(
            "click",
            () => {

                closeDailyNoteModal();

            }
        );

    }


    /* ========================================
       Save
    ======================================== */

    saveButton.addEventListener(
        "click",
        () => {

            saveDailyNote();

        }
    );


    /* ========================================
       Character Counter
    ======================================== */

    textarea.addEventListener(
        "input",
        () => {

            updateDailyNoteCounter();

        }
    );


    /* ========================================
       Initial State
    ======================================== */

    updateNotebookStatus();

    updateDailyNoteCounter();
}


/* ========================================
   گوش‌دادن به انتخاب روز از تقویم
   دفترچه، یادداشت، و متن‌های «امروز» همه عوض می‌شن.
======================================== */

document.addEventListener("day:selected", (event) => {

    const { gy, gm, gd, isToday, label } = event.detail;

    currentNoteDate = new Date(gy, gm - 1, gd);
    currentIsToday = isToday;
    currentDateLabel = isToday ? "امروز" : label;

    loadNoteForCurrentDate();
    updateNotebookDateDisplay();
    updateNotebookStatus();
});


/* ========================================
   آپدیت متن‌های تاریخ (به‌جای «امروز»)
======================================== */

function updateNotebookDateDisplay() {

    const dateEl =
        document.querySelector("#dailyNotebookDate");

    if (dateEl) {
        dateEl.textContent = currentDateLabel;
    }

    const coverDateEl =
        document.querySelector(".daily-note-modal__cover-date");

    if (coverDateEl) {
        coverDateEl.textContent = currentDateLabel;
    }

    const coverTitleEl =
        document.querySelector(".daily-note-modal__cover-title");

    if (coverTitleEl) {
        coverTitleEl.textContent =
            currentIsToday ? "دفترچه امروز" : `دفترچه ${currentDateLabel}`;
    }

    const modalTitleEl =
        document.querySelector("#dailyNoteModalTitle");

    if (modalTitleEl) {
        modalTitleEl.textContent =
            currentIsToday ? "امروز چه گذشت؟" : `${currentDateLabel} چه گذشت؟`;
    }

    const headerTitleEl =
        document.querySelector(".daily-notes__title");

    if (headerTitleEl) {
        headerTitleEl.textContent =
            currentIsToday ? "دفترچه امروز" : `دفترچه ${currentDateLabel}`;
    }
}


/* ========================================
   Open Modal
======================================== */

function openDailyNoteModal() {

    const modal =
        document.querySelector(
            "#dailyNoteModal"
        );

    const textarea =
        document.querySelector(
            "#dailyNoteInput"
        );

    if (!modal || !textarea) {
        return;
    }


    /* Load Current Note */

    textarea.value =
        dailyNoteContent;


    updateDailyNoteCounter();


    /* Open */

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "daily-note-modal-open"
    );


    /* Animation */

    requestAnimationFrame(() => {

        modal.classList.add(
            "is-open"
        );

    });


    /* Focus */

    setTimeout(() => {

        textarea.focus();

    }, 250);
}


/* ========================================
   Close Modal
======================================== */

function closeDailyNoteModal() {

    const modal =
        document.querySelector(
            "#dailyNoteModal"
        );

    if (!modal) {
        return;
    }


    modal.classList.remove(
        "is-open"
    );

    document.body.classList.remove(
        "daily-note-modal-open"
    );


    setTimeout(() => {

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }, 300);
}


/* ========================================
   Save Daily Note
   (روی کلیدِ همون روزی که الان انتخاب شده ذخیره می‌شه)
======================================== */

function saveDailyNote() {

    const textarea =
        document.querySelector(
            "#dailyNoteInput"
        );

    if (!textarea) {
        return;
    }


    /* Get Content */

    dailyNoteContent =
        textarea.value.trim();


    /* Save */

    localStorage.setItem(
        getNoteKey(currentNoteDate),
        dailyNoteContent
    );


    /* Update Notebook */

    updateNotebookStatus();


    /* Close */

    closeDailyNoteModal();


    console.log(
        "Daily note saved:",
        dailyNoteContent
    );
}


/* ========================================
   Update Notebook Status
======================================== */

function updateNotebookStatus() {

    const notebook =
        document.querySelector(
            "#dailyNotebook"
        );

    const status =
        document.querySelector(
            "#dailyNotebookStatus"
        );

    if (!notebook || !status) {
        return;
    }


    const hasNote =
        dailyNoteContent.trim().length > 0;


    /* Data Attribute */

    notebook.dataset.noteExists =
        String(hasNote);


    const dayPhrase =
        currentIsToday ? "امروز" : currentDateLabel;


    /* Status Text */

    if (hasNote) {

        status.textContent =
            `برای ${dayPhrase} یادداشت دارید`;
            status.style.backgroundColor = 'aquamarine'

    } else {

        status.textContent =
            `هنوز یادداشتی برای ${dayPhrase} ثبت نشده`;
            status.style.backgroundColor = 'white'


    }
}


/* ========================================
   Character Counter
======================================== */

function updateDailyNoteCounter() {

    const textarea =
        document.querySelector(
            "#dailyNoteInput"
        );

    const counter =
        document.querySelector(
            "#dailyNoteCounter"
        );

    if (!textarea || !counter) {
        return;
    }


    counter.textContent =
        `${textarea.value.length} / 5000`;
}


document.addEventListener('keyup',(event)=>{

    if(event.code === 'Escape'){
        closeDailyNoteModal()
    }
})