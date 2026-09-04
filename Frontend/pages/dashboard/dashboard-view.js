import { TimeActivies } from "../../Components/dashboard/timed-activities/timed-activities.js";
import { UnTimeActivies } from "../../Components/dashboard/untimed-activities/untimed-activities.js";
import { Sessions } from "../../Components/dashboard/sessions/sessions.js";
import { DailyNote } from "../../Components/dashboard/daily-note/daily-note.js";
import { Clock } from "../../Components/dashboard/clock/clock.js";
import { Statistic } from "../../Components/dashboard/statistics/statistics.js";
import { Calendar } from "../../Components/dashboard/calendar/calendar.js";

// ============================================================
// Dashboard View Component
// ============================================================

export function DashboardView() {
    return `
        <main class="dashboard">
            <div class="dashboard__container">
                <section class="dashboard__layout">
                    <!-- Right Column: Activities & Notes -->
                    <div class="dashboard__activities">
                        <section class="dashboard__timed-activities">
                            ${TimeActivies()}
                        </section>

                        <section class="dashboard__untimed-activities">
                            ${UnTimeActivies()}
                        </section>

                        <section class="dashboard__sessions">
                            ${Sessions()}
                        </section>

                        <section class="dashboard__notes">
                            ${DailyNote()}
                        </section>
                    </div>

                    <!-- Center Column: Clock & Statistics -->
                    <div class="dashboard__center">
                        <section class="dashboard__clock">
                            ${Clock()}
                        </section>

                        <section class="dashboard__statistics">
                            ${Statistic()}
                        </section>
                    </div>

                    <!-- Left Column: Calendar -->
                    <section class="dashboard__calendar">
                        ${Calendar()}
                    </section>
                </section>
            </div>
        </main>
    `;
}