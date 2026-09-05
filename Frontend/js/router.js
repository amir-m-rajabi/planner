// File: Frontend/js/router.js

import { DashboardView } from "../pages/dashboard/dashboard-view.js";
import { ActivitiesView } from "../pages/activities/activities-view.js";
import { ReportsView } from "../pages/reports/reports-view.js";
import { CalendarView } from "../pages/calendar/calendar-view.js";
import { ProfileView } from "../pages/profile/profile-view.js";
import { AuthView, initAuthPage, isLoggedIn } from "../pages/login_register/auth.js";
import { initTimedActivities } from "../Components/dashboard/timed-activities/timed-activities.js";
import { initDailyNotes } from "../Components/dashboard/daily-note/daily-note.js";
import { initUntimedActivities } from "../Components/dashboard/untimed-activities/untimed-activities.js";
import { initClock } from "../Components/dashboard/clock/clock.js";
import { initActivitiesPage } from '../pages/activities/activities-view.js';
import { initProfilePage } from '../pages/profile/profile-view.js';
import { initReportsPage } from '../pages/reports/reports-view.js';
import { initCalendar } from '../Components/dashboard/calendar/calendar.js';
import { loadSessionsFromDatabase } from "../Components/dashboard/sessions/sessions.js";

// ============================================================
// Initialize Dashboard
// ============================================================

async function initDashboard() {
    await loadSessionsFromDatabase();

    initTimedActivities();
    initUntimedActivities();
    initDailyNotes();
    initClock();
    initCalendar();
}

// ============================================================
// Router
// ============================================================

export function router() {
    const pageContent = document.querySelector("#page-content");
    const path = window.location.pathname;

    switch (path) {
        case "/":
        case "./index.html":
            pageContent.innerHTML = DashboardView();
            setTimeout(() => {
                initDashboard();
            }, 100);
            break;

        case "/activities":
            pageContent.innerHTML = ActivitiesView();
            initActivitiesPage();
            break;

        case "/reports":
            pageContent.innerHTML = ReportsView();
            initReportsPage();
            break;

        case "/calendar":
            pageContent.innerHTML = CalendarView();
            break;

        case "/profile":
            if (isLoggedIn()) {
                pageContent.innerHTML = ProfileView();
                initProfilePage();
            } else {
                pageContent.innerHTML = AuthView();
                initAuthPage();
                setTimeout(() => {
                    const loginTab = document.getElementById('loginTabBtn');
                    if (loginTab) loginTab.click();
                }, 50);
            }
            break;

        case "/login":
        case "/register":
        case "/auth":
            pageContent.innerHTML = AuthView();
            initAuthPage();

            setTimeout(() => {
                const mode = path === "/register" ? "register" : "login";
                const tabBtn = document.getElementById(mode === 'login' ? 'loginTabBtn' : 'registerTabBtn');
                if (tabBtn) tabBtn.click();
            }, 50);
            break;

        default:
            pageContent.innerHTML = `
                <section class="page-not-found">
                    <h1>صفحه پیدا نشد</h1>
                    <p>مسیر ${path} پیدا نشد.</p>
                    <a href="./index.html" data-route="/" style="color: var(--color-primary);">بازگشت به صفحه اصلی</a>
                </section>
            `;
    }
}