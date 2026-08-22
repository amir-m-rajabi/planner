let sessions = [
    {
        id: 101,
        activityId: 1,
        title: "برنامه‌نویسی",
        color: "#4f9ea5",
        startTime: "10:30",
        endTime: "12:15",
        duration: "1 ساعت و 45 دقیقه",
        hasNote: false
    },

    {
        id: 102,
        activityId: 2,
        title: "مطالعه",
        color: "#e0a458",
        startTime: "14:00",
        endTime: "15:20",
        duration: "1 ساعت و 20 دقیقه",
        hasNote: true
    },

    {
        id: 103,
        activityId: 3,
        title: "زبان انگلیسی",
        color: "#d96b6b",
        startTime: "17:10",
        endTime: "18:00",
        duration: "50 دقیقه",
        hasNote: false
    }
];

let eventsInitialized = false;

let sessionModalMode = "add";
let selectedSession = null;

let sessionToDelete = null;

let sessionForNote = null;




export function Sessions(){

  setupSessionEvents()

  return `
        <!-- ========================================
                Sessions
        ======================================== -->
<section class="recent-activities">
  <!-- Header -->
  <header class="recent-activities__header">
    <div class="recent-activities__heading">
      <span class="recent-activities__eyebrow"> امروز </span>

      <h2 class="recent-activities__title">سشن‌های امروز</h2>
    </div>

    <button
      type="button"
      class="recent-activities__view-all"
      data-action="view-all-sessions"
    >
      <span>مشاهده همه</span>

      <span class="recent-activities__view-all-icon" aria-hidden="true">
        ↗
      </span>
    </button>
  </header>

  <!-- Sessions -->
  <div class="recent-activities__content">
    <div class="recent-activities__list">

          ${renderSessionsList()}
 
    </div>
  </div>

  <!-- ========================================
         Add Session
    ======================================== -->

  <button
    type="button"
    class="recent-activities__add"
    data-action="add-session"
  >
    <span class="recent-activities__add-icon" aria-hidden="true"> + </span>

    <span> افزودن سشن </span>
  </button>
</section>


 <!-- Modalها -->
    ${AllSessionsModal()}
    ${SessionFormModal()}
    ${DeleteSessionModal()}
    ${SessionNoteModal()}
    `;
}


function createSessionHTML(session) {
    const hasNote = Boolean(session.note);

    return `
        <article
        class="recent-activity"
        data-activity-id="${session.activityId}"
        data-session-id="${session.id}"
        style="--activity-color: ${session.color}"
      >
        <span class="recent-activity__color" aria-hidden="true"></span>

        <div class="recent-activity__main">
          <div class="recent-activity__info">
            <h3 class="recent-activity__title">${session.title}</h3>

            <div class="recent-activity__time">
              <span class="recent-activity__start"> ${session.startTime} </span>

              <span class="recent-activity__separator" aria-hidden="true">
                ←
              </span>

              <span class="recent-activity__end"> ${session.endTime} </span>
            </div>
          </div>

          <span class="recent-activity__duration"> ${session.duration}</span>

          <div class="recent-activity__actions">
            <button
              type="button"
              class="recent-activity__action recent-activity__edit"
              data-action="edit-session"
              data-session-id="${session.id}"
              aria-label="ویرایش سشن"
              title="ویرایش"
            >
              ✎
            </button>

            <button
              type="button"
              class="recent-activity__action recent-activity__delete"
              data-action="delete-session"
              data-session-id="${session.id}"
              aria-label="حذف سشن"
              title="حذف"
            >
              🗑
            </button>
          </div>
        </div>

        <button
            type="button"
            class="recent-activity__note ${hasNote ? "recent-activity__note--has-note" : ""}"
            data-action="session-note"
            data-session-id="${session.id}"
            aria-label="${hasNote ? "مشاهده یادداشت" : "افزودن یادداشت"}"
            title="${hasNote ? "مشاهده یادداشت" : "افزودن یادداشت"}">
            ${hasNote ? "📖" : "+"}
        </button>
      </article>
    `;
}


///////////// Create Modals Sessions ////////////////
function AllSessionsModal(){
    return `
        <!-- =========================================
            View All Sessions Modal
        ========================================= -->
<div class="sessions-modal" id="sessionsModal" aria-hidden="true">
  <!-- Overlay -->
  <div class="sessions-modal__overlay"></div>

  <!-- Modal -->
  <div class="sessions-modal__box">
    <!-- ===============================
             Header
        ================================ -->

    <header class="sessions-modal__header">
      <div class="sessions-modal__header-info">
        <span class="sessions-modal__label"> فعالیت‌های امروز </span>

        <h2 class="sessions-modal__title">سشن‌های امروز</h2>

        <span class="sessions-modal__date"> دوشنبه، ۱۰ شهریور ۱۴۰۵ </span>
      </div>

      <button class="sessions-modal__close" type="button" aria-label="بستن">
        ×
      </button>
    </header>

    <!-- ===============================
             Summary
        ================================ -->

    <div class="sessions-modal__summary">
      <div class="sessions-modal__summary-item">
        <span> زمان مفید </span>

        <strong> 04:35 </strong>
      </div>

      <div class="sessions-modal__summary-divider"></div>

      <div class="sessions-modal__summary-item">
        <span> تعداد سشن </span>

        <strong> ${sessions.length} </strong>
      </div>

      <button class="sessions-modal__add" type="button" data-action="add-session">
        <span class="sessions-modal__add-icon"> + </span>

        افزودن سشن
      </button>
    </div>

    <!-- ===============================
             Sessions
        ================================ -->

    <main class="sessions-modal__content">
      <div class="sessions-modal__list">
        ${renderSessionsList()}
      </div>
    </main>

    <!-- ===============================
             Footer
        ================================ -->

    <footer class="sessions-modal__footer">
      <span class="sessions-modal__footer-text">
        ${sessions.length} سشن در این روز ثبت شده است
      </span>

      <button class="sessions-modal__footer-close" type="button">بستن</button>
    </footer>
  </div>
</div>
    `;
}

function SessionFormModal() {

    return `
<!-- =========================================
      Add / Edit Session Modal
========================================= -->
<div
    class="session-form-modal"
    id="sessionFormModal"
    aria-hidden="true"
>
    <!-- Overlay -->
    <div class="session-form-modal__overlay"></div>


    <!-- Modal -->
    <div class="session-form-modal__box">

        <!-- Header -->
        <header class="session-form-modal__header">

            <div class="session-form-modal__header-info">

                <span class="session-form-modal__label">
                    ثبت زمان فعالیت
                </span>

                <h2
                    class="session-form-modal__title"
                    id="sessionFormModalTitle"
                >
                    افزودن سشن
                </h2>

                <p class="session-form-modal__description">
                    زمان انجام فعالیت را ثبت کنید.
                </p>

            </div>


            <button
                type="button"
                class="session-form-modal__close"
                id="sessionFormModalClose"
                aria-label="بستن"
            >
                ×
            </button>

        </header>


        <!-- Form -->
        <form
            class="session-form"
            id="sessionForm"
        >

            <!-- Activity -->
            <div class="session-form__field">

                <label
                    for="sessionActivity"
                    class="session-form__label"
                >
                    فعالیت
                </label>


                <div class="session-form__select-wrapper">

                    <select
                        id="sessionActivity"
                        name="activity"
                        class="session-form__select"
                        required
                    >
                        <option value="">
                            انتخاب فعالیت
                        </option>

                        <option value="1">
                            برنامه‌نویسی
                        </option>

                        <option value="2">
                            مطالعه
                        </option>

                        <option value="3">
                            زبان انگلیسی
                        </option>

                        <option value="4">
                            ریاضیات
                        </option>

                    </select>

                    <span class="session-form__select-arrow">
                        ⌄
                    </span>

                </div>

            </div>


            <!-- Time -->
            <div class="session-form__time-row">

                <!-- Start -->
                <div class="session-form__field">

                    <label
                        for="sessionStart"
                        class="session-form__label"
                    >
                        زمان شروع
                    </label>

                    <input
                        type="time"
                        id="sessionStart"
                        name="startTime"
                        class="session-form__input"
                        required
                    />

                </div>


                <!-- Arrow -->
                <span class="session-form__time-arrow">
                    ←
                </span>


                <!-- End -->
                <div class="session-form__field">

                    <label
                        for="sessionEnd"
                        class="session-form__label"
                    >
                        زمان پایان
                    </label>

                    <input
                        type="time"
                        id="sessionEnd"
                        name="endTime"
                        class="session-form__input"
                        required
                    />

                </div>

            </div>


            <!-- Duration Preview -->
            <div class="session-form__duration">

                <span class="session-form__duration-label">
                    مدت زمان
                </span>

                <strong
                    class="session-form__duration-value"
                    id="sessionDuration"
                >
                    00:00
                </strong>

            </div>


            <!-- Actions -->
            <div class="session-form__actions">

                <button
                    type="button"
                    class="session-form__cancel"
                    id="sessionFormCancel"
                >
                    انصراف
                </button>


                <button
                    type="submit"
                    class="session-form__submit"
                    id="sessionFormSubmit"
                >
                    افزودن سشن
                </button>

            </div>

        </form>

    </div>

</div>

    `;
}

function DeleteSessionModal(){
    return `
    <!-- =========================================
             Delete Session Modal
    ========================================= -->
<div class="delete-session-modal" id="deleteSessionModal">
  <!-- Overlay -->
  <div class="delete-session-modal__overlay"></div>

  <!-- Modal -->
  <div class="delete-session-modal__box">
    <!-- Icon -->

    <div class="delete-session-modal__icon">!</div>

    <!-- Content -->

    <div class="delete-session-modal__content">
      <h2 class="delete-session-modal__title">حذف سشن</h2>

      <p class="delete-session-modal__message">
        آیا از حذف این سشن مطمئن هستید؟
      </p>

      <!-- Session Preview -->

      <div class="delete-session-modal__session">
        <span
          class="delete-session-modal__session-color"
          id="deleteSessionColor"
        ></span>

        <div class="delete-session-modal__session-info">
          <strong id="deleteSessionTitle"> برنامه‌نویسی </strong>

          <span id="deleteSessionTime"> 10:30 ← 12:15 </span>
        </div>
      </div>

      <p class="delete-session-modal__warning">
        این سشن به‌طور کامل حذف می‌شود و قابل بازگردانی نیست.
      </p>
    </div>

    <!-- Actions -->

    <div class="delete-session-modal__actions">
      <button
        type="button"
        class="delete-session-modal__cancel"
        id="deleteSessionCancel"
      >
        انصراف
      </button>

      <button
        type="button"
        class="delete-session-modal__confirm"
        id="deleteSessionConfirm"
      >
        حذف سشن
      </button>
    </div>
  </div>
</div>

    `;

}

function SessionNoteModal() {

    return `
        <div
            class="session-note-modal"
            id="sessionNoteModal"
            aria-hidden="true"
        >

            <div class="session-note-modal__overlay"></div>


            <div
                class="session-note-modal__box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="sessionNoteModalTitle"
            >

                <header class="session-note-modal__header">

                    <div>

                        <span class="session-note-modal__label">
                            یادداشت Session
                        </span>

                        <h2
                            class="session-note-modal__title"
                            id="sessionNoteModalTitle"
                        >
                            یادداشت
                        </h2>

                    </div>


                    <button
                        type="button"
                        class="session-note-modal__close"
                        id="sessionNoteModalClose"
                        aria-label="بستن"
                    >
                        ×
                    </button>

                </header>


                <div class="session-note-modal__session">

                    <strong
                        id="sessionNoteActivity"
                        class="session-note-modal__activity"
                    >
                        برنامه‌نویسی
                    </strong>

                    <span
                        id="sessionNoteTime"
                        class="session-note-modal__time"
                    >
                        10:30 ← 12:15
                    </span>

                </div>


                <form
                    class="session-note-form"
                    id="sessionNoteForm"
                >

                    <textarea
                        id="sessionNoteInput"
                        class="session-note-form__textarea"
                        placeholder="نکته یا توضیحات این Session را بنویسید..."
                        maxlength="1000"
                    ></textarea>


                    <div class="session-note-form__footer">

                        <span
                            class="session-note-form__hint"
                        >
                            یادداشت مخصوص همین Session است.
                        </span>


                        <div class="session-note-form__actions">

                            <button
                                type="button"
                                class="session-note-form__cancel"
                                id="sessionNoteCancel"
                            >
                                انصراف
                            </button>

                            <button
                                type="submit"
                                class="session-note-form__submit"
                            >
                                ذخیره یادداشت
                            </button>

                        </div>

                    </div>

                </form>

            </div>

        </div>
    `;
}


function renderSessionsList() {

    return sessions
        .map(createSessionHTML)
        .join("");
}

function setupSessionEvents() {

    if (eventsInitialized) {
        return;
    }

    eventsInitialized = true;


    document.addEventListener("click", (event) => {

        const addButton = event.target.closest(
            '[data-action="add-session"]'
        );


        if (!addButton) {
            return;
        }


        openSessionModal();
    });
}


///////////// All Sessions Modal ////////////////
function openAllSessionsModal() {
    const modal = document.querySelector("#sessionsModal");

    if (!modal) {
        console.error("Modal سشن‌ها پیدا نشد.");
        return;
    }

    modal.classList.add("is-open");
}

function closeAllSessionsModal() {
    const modal = document.querySelector("#sessionsModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("is-open");
}

function renderSessionsModalListToDOM() {

    const list = document.querySelector(
        ".sessions-modal__list"
    );

    if (!list) {
        return;
    }

    list.innerHTML = renderSessionsList();
}

///////////// Add / Edit Modal ////////////////
function openSessionModal(mode, session = null) {

    sessionModalMode = mode;

    selectedSession = session;


    const modal = document.querySelector(
        "#sessionFormModal"
    );


    if (!modal) {
        return;
    }


    updateSessionModal();


    modal.classList.add("is-open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}

function updateSessionModal() {

    const modal = document.querySelector(
        "#sessionFormModal"
    );


    if (!modal) {
        return;
    }


    const title = modal.querySelector(
        "#sessionFormModalTitle"
    );

    const activitySelect = modal.querySelector(
        "#sessionActivity"
    );

    const startInput = modal.querySelector(
        "#sessionStart"
    );

    const endInput = modal.querySelector(
        "#sessionEnd"
    );

    const sessionDuration = modal.querySelector(
        "#sessionDuration"
    );

    const submitButton = modal.querySelector(
        "#sessionFormSubmit"
    );


    /*
     * ADD
     */
    if (sessionModalMode === "add") {

        title.textContent = "افزودن سشن";

        submitButton.textContent = "افزودن سشن";


        activitySelect.value = "";

        startInput.value = "";

        endInput.value = "";

    }


    /*
     * EDIT
     */
    if (
        sessionModalMode === "edit" &&
        selectedSession
    ) {

        title.textContent = "ویرایش سشن";

        submitButton.textContent = "ذخیره تغییرات";


        activitySelect.value =
            String(selectedSession.activityId);


        startInput.value =
            selectedSession.startTime;


        endInput.value =
            selectedSession.endTime;

        sessionDuration.value =
            selectedSession.sessionDuration;
    }
}

function closeSessionModal() {

    const modal = document.querySelector(
        "#sessionFormModal"
    );


    if (!modal) {
        return;
    }


    modal.classList.remove("is-open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    selectedSession = null;

    sessionModalMode = "add";
}


///////////// Delete Modal ////////////////
function openDeleteSessionModal(session) {

    sessionToDelete = session;

    const modal = document.querySelector(
        "#deleteSessionModal"
    );

    if (!modal) {
        return;
    }

    const color = modal.querySelector(
        "#deleteSessionColor"
    );

    const title = modal.querySelector(
        "#deleteSessionTitle"
    );

    const time = modal.querySelector(
        "#deleteSessionTime"
    );


    // اطلاعات Session
    color.style.backgroundColor = session.color;

    title.textContent = session.title;

    time.textContent =
        `${session.startTime} ← ${session.endTime}`;


    modal.classList.add("is-open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}

function closeDeleteSessionModal() {

    const modal = document.querySelector(
        "#deleteSessionModal"
    );

    if (!modal) {
        return;
    }

    modal.classList.remove("is-open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    sessionToDelete = null;
}

function renderSessionListToDOM() {

    const list = document.querySelector(
        ".recent-activities__list"
    );

    if (!list) {
        return;
    }

    list.innerHTML = renderSessionsList();
}

///////////// Note Modal ////////////////
function openSessionNoteModal(session) {

    sessionForNote = session;


    const modal = document.querySelector(
        "#sessionNoteModal"
    );

    if (!modal) {
        return;
    }


    const activity =
        modal.querySelector(
            "#sessionNoteActivity"
        );

    const time =
        modal.querySelector(
            "#sessionNoteTime"
        );

    const input =
        modal.querySelector(
            "#sessionNoteInput"
        );


    activity.textContent =
        session.title;


    time.textContent =
        `${session.startTime} ← ${session.endTime}`;


    input.value =
        session.note || "";


    modal.classList.add("is-open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    input.focus();
}

function closeSessionNoteModal() {

    const modal = document.querySelector(
        "#sessionNoteModal"
    );

    if (!modal) {
        return;
    }


    modal.classList.remove("is-open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    sessionForNote = null;
}

///////////// All Sessions Modal ////////////////
document.addEventListener("click", (event) => {
    const button = event.target.closest(
        ".recent-activities__view-all"
    );

    if (!button) {
        return;
    }

    openAllSessionsModal();
});

document.addEventListener("click", (event) => {
    const button = event.target.closest(
        ".sessions-modal__close"
    );

    if (!button) {
        return;
    }

    closeAllSessionsModal();
});

document.addEventListener("click", (event) => {
    const button = event.target.closest(
        ".sessions-modal__footer-close"
    );

    if (!button) {
        return;
    }

    closeAllSessionsModal();
});

document.addEventListener("click", (event) => {
    const overlay = event.target.closest(
        ".sessions-modal__overlay"
    );

    if (!overlay) {
        return;
    }

    closeAllSessionsModal();
});

document.addEventListener('keyup',(event)=>{
  if(event.key == 'Escape'){
    closeAllSessionsModal();
  }
})


///////////// Add / Edit Modal ////////////////
document.addEventListener("click", (event) => {

    const addButton = event.target.closest(
        '[data-action="add-session"]'
    );


    if (!addButton) {
        return;
    }


    openSessionModal("add");
});

document.addEventListener("click", (event) => {

    const editButton = event.target.closest(
        '[data-action="edit-session"]'
    );


    if (!editButton) {
        return;
    }


    const sessionId =
        Number(editButton.dataset.sessionId);


    const session =
        sessions.find(
            item => item.id === sessionId
        );


    if (!session) {
        return;
    }


    openSessionModal(
        "edit",
        session
    );
});

document.addEventListener("click", (event) => {

    if (
        event.target.closest(
            "#sessionFormModalClose"
        ) ||
        event.target.closest(
            "#sessionFormCancel"
        ) ||
        event.target.classList.contains(
            "session-form-modal__overlay"
        )
    ) {

        closeSessionModal();

    }

});

document.addEventListener('keyup',(event)=>{
  if(event.key == 'Escape'){
    closeSessionModal();
  }
})


///////////// Delete Modal ////////////////
document.addEventListener("click", (event) => {

    const deleteButton = event.target.closest(
        '[data-action="delete-session"]'
    );

    if (!deleteButton) {
        return;
    }

    const sessionId =
        Number(deleteButton.dataset.sessionId);

    const session =
        sessions.find(
            item => item.id === sessionId
        );

    if (!session) {
        return;
    }

    openDeleteSessionModal(session);
});

document.addEventListener("click", (event) => {

    const confirmButton = event.target.closest(
        "#deleteSessionConfirm"
    );

    if (!confirmButton) {
        return;
    }

    if (!sessionToDelete) {
        return;
    }

    sessions = sessions.filter(
        session =>
            session.id !== sessionToDelete.id
    );

    closeDeleteSessionModal();

    renderSessionListToDOM();

    renderSessionsModalListToDOM();    
});

document.addEventListener("click", (event) => {

    const cancelButton = event.target.closest(
        "#deleteSessionCancel"
    );

    if (!cancelButton) {
        return;
    }

    closeDeleteSessionModal();
});

document.addEventListener('keyup',(event)=>{
  if(event.key == 'Escape'){
    closeDeleteSessionModal();
  }
})


///////////// Note Modal ////////////////
document.addEventListener("click", (event) => {

    const noteButton = event.target.closest(
        '[data-action="session-note"]'
    );

    if (!noteButton) {
        return;
    }


    const sessionId =
        Number(noteButton.dataset.sessionId);


    const session =
        sessions.find(
            item => item.id === sessionId
        );


    if (!session) {
        return;
    }


    openSessionNoteModal(session);
});

document.addEventListener("click", (event) => {

    if (
        event.target.closest(
            "#sessionNoteModalClose"
        ) ||
        event.target.closest(
            "#sessionNoteCancel"
        ) ||
        event.target.classList.contains(
            "session-note-modal__overlay"
        )
    ) {

        closeSessionNoteModal();

    }

});

document.addEventListener("submit", (event) => {

    if (event.target.id !== "sessionNoteForm") {
        return;
    }

    event.preventDefault();

    if (!sessionForNote) {
        return;
    }

    const input = document.querySelector(
        "#sessionNoteInput"
    );

    if (!input) {
        return;
    }

    const note = input.value.trim();

    sessionForNote.note = note;

    closeSessionNoteModal();

    renderSessionListToDOM();

    renderSessionsModalListToDOM();
});

document.addEventListener('keyup',(event)=>{
  if(event.key == 'Escape'){
    closeSessionNoteModal();
  }
})



