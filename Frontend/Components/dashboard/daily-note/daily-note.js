import { DailyNotesAPI } from "../../../js/api.js";

// ============================================================
// Component
// ============================================================

export function DailyNote() {
    return `
        <section class="daily-notes">
            <header class="daily-notes__header">
                <h2 class="daily-notes__title">دفترچه امروز</h2>
            </header>

            <div class="daily-notes__content">
                <button
                    type="button"
                    class="daily-notebook"
                    id="dailyNotebook"
                    data-note-exists="false"
                    aria-label="باز کردن دفترچه یادداشت امروز"
                >
                    <div class="daily-notebook__book">
                        <div class="daily-notebook__spine"></div>
                        <div class="daily-notebook__content">
                            <span class="daily-notebook__icon">📖</span>
                            <span class="daily-notebook__name">یادداشت روزانه</span>
                            <span class="daily-notebook__date" id="dailyNotebookDate">امروز</span>
                        </div>
                    </div>

                    <div class="daily-notebook__status">
                        <span class="daily-notebook__message" id="dailyNotebookStatus">
                            هنوز یادداشتی برای امروز ثبت نشده
                        </span>
                    </div>
                </button>
            </div>

            <!-- Modal -->
            <div class="daily-note-modal" id="dailyNoteModal" aria-hidden="true">
                <div class="daily-note-modal__overlay" data-action="close-daily-note"></div>

                <div class="daily-note-modal__book" role="dialog" aria-modal="true" aria-labelledby="dailyNoteModalTitle">
                    <div class="daily-note-modal__cover">
                        <div class="daily-note-modal__cover-content">
                            <span class="daily-note-modal__cover-icon">📖</span>
                            <span class="daily-note-modal__cover-title">دفترچه امروز</span>
                            <span class="daily-note-modal__cover-date">امروز</span>
                        </div>
                    </div>

                    <div class="daily-note-modal__page">
                        <header class="daily-note-modal__header">
                            <div>
                                <span class="daily-note-modal__eyebrow">یادداشت روزانه</span>
                                <h2 class="daily-note-modal__title" id="dailyNoteModalTitle">امروز چه گذشت؟</h2>
                            </div>
                            <button type="button" class="daily-note-modal__close" data-action="close-daily-note" aria-label="بستن دفترچه">×</button>
                        </header>

                        <div class="daily-note-modal__editor">
                            <div class="daily-note-modal__lines" aria-hidden="true"></div>
                            <textarea
                                id="dailyNoteInput"
                                class="daily-note-modal__textarea"
                                placeholder="هر چیزی که امروز در ذهنت می‌گذرد بنویس..."
                                maxlength="5000"
                                spellcheck="false"
                            ></textarea>
                        </div>

                        <footer class="daily-note-modal__footer">
                            <span class="daily-note-modal__counter" id="dailyNoteCounter">0 / 5000</span>
                            <div class="daily-note-modal__actions">
                                <button type="button" class="daily-note-modal__cancel" data-action="close-daily-note">بستن</button>
                                <button type="button" class="daily-note-modal__save" id="dailyNoteSave">ذخیره یادداشت</button>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ============================================================
// State
// ============================================================

let dailyNoteContent = "";
let currentNoteDate = new Date();
let currentIsToday = true;
let currentDateLabel = "امروز";
let currentNoteId = null;

// ============================================================
// Utility Functions
// ============================================================

function getUserId() {
    const session = JSON.parse(localStorage.getItem('auth:session')) || {};
    return session.userId;
}

function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// ============================================================
// Load Note from Database
// ============================================================

async function loadNoteFromDatabase(date) {
    try {
        const userId = getUserId();
        if (!userId) {
            dailyNoteContent = "";
            currentNoteId = null;
            return;
        }

        const dateStr = getDateKey(date);
        const allNotes = await DailyNotesAPI.getAll(userId);

        const note = allNotes.find(n => {
            const noteDate = new Date(n.note_date);
            const noteDateStr = getDateKey(noteDate);
            return noteDateStr === dateStr;
        });

        if (note) {
            dailyNoteContent = note.content || "";
            currentNoteId = note.id;
        } else {
            dailyNoteContent = "";
            currentNoteId = null;
        }

    } catch (error) {
        dailyNoteContent = "";
        currentNoteId = null;
    }
}

// ============================================================
// Save Note to Database
// ============================================================

async function saveNoteToDatabase(content, date) {
    try {
        const userId = getUserId();

        if (!userId) {
            alert('لطفاً وارد حساب کاربری خود شوید');
            return false;
        }

        const dateStr = getDateKey(date);
        const allNotes = await DailyNotesAPI.getAll(userId);

        const existingNote = allNotes.find(n => {
            const noteDate = new Date(n.note_date);
            const noteDateStr = getDateKey(noteDate);
            return noteDateStr === dateStr;
        });

        if (existingNote) {
            await DailyNotesAPI.update(existingNote.id, content);
            currentNoteId = existingNote.id;
        } else {
            const result = await DailyNotesAPI.create(userId, dateStr, content);
            currentNoteId = result.id;
        }

        return true;

    } catch (error) {
        alert('خطا در ذخیره یادداشت: ' + error.message);
        return false;
    }
}

// ============================================================
// Load Note for Current Date
// ============================================================

async function loadNoteForCurrentDate() {
    await loadNoteFromDatabase(currentNoteDate);
    updateNotebookStatus();
}

// ============================================================
// Update Notebook Status
// ============================================================

function updateNotebookStatus() {
    const notebook = document.querySelector("#dailyNotebook");
    const status = document.querySelector("#dailyNotebookStatus");

    if (!notebook || !status) return;

    const hasNote = dailyNoteContent.trim().length > 0;
    notebook.dataset.noteExists = String(hasNote);

    const dayPhrase = currentIsToday ? "امروز" : currentDateLabel;

    if (hasNote) {
        status.textContent = `برای ${dayPhrase} یادداشت دارید`;
    } else {
        status.textContent = `هنوز یادداشتی برای ${dayPhrase} ثبت نشده`;
    }
}

// ============================================================
// Update Date Display
// ============================================================

function updateNotebookDateDisplay() {
    const dateEl = document.querySelector("#dailyNotebookDate");
    if (dateEl) dateEl.textContent = currentDateLabel;

    const coverDateEl = document.querySelector(".daily-note-modal__cover-date");
    if (coverDateEl) coverDateEl.textContent = currentDateLabel;

    const coverTitleEl = document.querySelector(".daily-note-modal__cover-title");
    if (coverTitleEl) {
        coverTitleEl.textContent = currentIsToday ? "دفترچه امروز" : `دفترچه ${currentDateLabel}`;
    }

    const modalTitleEl = document.querySelector("#dailyNoteModalTitle");
    if (modalTitleEl) {
        modalTitleEl.textContent = currentIsToday ? "امروز چه گذشت؟" : `${currentDateLabel} چه گذشت؟`;
    }

    const headerTitleEl = document.querySelector(".daily-notes__title");
    if (headerTitleEl) {
        headerTitleEl.textContent = currentIsToday ? "دفترچه امروز" : `دفترچه ${currentDateLabel}`;
    }
}

// ============================================================
// Character Counter
// ============================================================

function updateDailyNoteCounter() {
    const textarea = document.querySelector("#dailyNoteInput");
    const counter = document.querySelector("#dailyNoteCounter");

    if (!textarea || !counter) return;

    counter.textContent = `${textarea.value.length} / 5000`;
}

// ============================================================
// Open Modal
// ============================================================

function openDailyNoteModal() {
    const modal = document.querySelector("#dailyNoteModal");
    const textarea = document.querySelector("#dailyNoteInput");

    if (!modal || !textarea) return;

    textarea.value = dailyNoteContent;
    updateDailyNoteCounter();

    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("daily-note-modal-open");

    requestAnimationFrame(() => {
        modal.classList.add("is-open");
    });

    setTimeout(() => {
        textarea.focus();
    }, 250);
}

// ============================================================
// Close Modal
// ============================================================

function closeDailyNoteModal() {
    const modal = document.querySelector("#dailyNoteModal");
    if (!modal) return;

    modal.classList.remove("is-open");
    document.body.classList.remove("daily-note-modal-open");

    setTimeout(() => {
        modal.setAttribute("aria-hidden", "true");
    }, 300);
}

// ============================================================
// Save Daily Note
// ============================================================

async function saveDailyNote() {
    const textarea = document.querySelector("#dailyNoteInput");
    if (!textarea) return;

    const content = textarea.value.trim();
    const success = await saveNoteToDatabase(content, currentNoteDate);

    if (success) {
        dailyNoteContent = content;
        updateNotebookStatus();
        closeDailyNoteModal();
    }
}

// ============================================================
// Listen for Day Selection from Calendar
// ============================================================

document.addEventListener("day:selected", async (event) => {
    const { gy, gm, gd, isToday, label } = event.detail;

    currentNoteDate = new Date(gy, gm - 1, gd);
    currentIsToday = isToday;
    currentDateLabel = isToday ? "امروز" : label;

    await loadNoteForCurrentDate();
    updateNotebookDateDisplay();
    updateNotebookStatus();
});

// ============================================================
// Close with Escape Key
// ============================================================

document.addEventListener('keyup', (event) => {
    if (event.code === 'Escape') {
        closeDailyNoteModal();
    }
});

// ============================================================
// Initialization
// ============================================================

export async function initDailyNotes() {
    const notebook = document.querySelector("#dailyNotebook");
    const modal = document.querySelector("#dailyNoteModal");
    const saveButton = document.querySelector("#dailyNoteSave");
    const textarea = document.querySelector("#dailyNoteInput");

    if (!notebook || !modal || !saveButton || !textarea) return;

    await loadNoteForCurrentDate();
    updateNotebookStatus();
    updateDailyNoteCounter();

    // Open notebook
    notebook.addEventListener("click", openDailyNoteModal);

    // Close buttons
    const closeElements = modal.querySelectorAll('[data-action="close-daily-note"]');
    closeElements.forEach(el => {
        el.addEventListener("click", closeDailyNoteModal);
    });

    // Cancel button
    const cancelBtn = modal.querySelector(".daily-note-modal__cancel");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeDailyNoteModal);
    }

    // Save button
    saveButton.addEventListener("click", saveDailyNote);

    // Textarea input counter
    textarea.addEventListener("input", updateDailyNoteCounter);

    // Ctrl+Enter to save
    textarea.addEventListener("keydown", async (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            await saveDailyNote();
        }
    });
}