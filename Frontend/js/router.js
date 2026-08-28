import { DashboardView } from "../pages/dashboard/dashboard-view.js";
import { ActivitiesView } from "../pages/activities/activities-view.js";
import { ReportsView } from "../pages/reports/reports-view.js";
import { CalendarView } from "../pages/calendar/calendar-view.js";
import { ProfileView } from "../pages/profile/profile-view.js";
import { renderTimedActivitiesToDOM } from "../Components/dashboard/timed-activities/timed-activities.js"
import { initDailyNotes } from "../Components/dashboard/daily-note/daily-note.js";
import { initUntimedActivities } from "../Components/dashboard/untimed-activities/untimed-activities.js"

import { initClock } from "../Components/dashboard/clock/clock.js"

import { renderTimedActivities } from '../pages/activities/activities-view.js';

import { initProfilePage } from '../pages/profile/profile-view.js'

export function router() {

    const pageContent = document.querySelector("#page-content");

    const path = window.location.pathname;


    switch (path) {

        case "/":
        case "/Frontend/index.html":
            pageContent.innerHTML = DashboardView();
            renderTimedActivitiesToDOM()
            initUntimedActivities()
            initDailyNotes()
            initClock()
            break;
           
        case "/activities":

            pageContent.innerHTML = ActivitiesView();
            renderTimedActivities()

            break;

        case "/reports":

            pageContent.innerHTML = ReportsView();

            break;

        case "/calendar":

            pageContent.innerHTML = CalendarView();

            break;

        case "/profile":

            pageContent.innerHTML = ProfileView();
            initProfilePage()

            break;

        default:
            pageContent.innerHTML = `
                <section class="page-not-found">
                    <h1>صفحه پیدا نشد</h1>
                    <p>این مسیر هنوز ساخته نشده است.</p>
                </section>
            `;
    }
}