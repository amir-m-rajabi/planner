import { timedActivities } from "../timed-activities/timed-activities.js";
import { sessions } from "../sessions/sessions.js";
import { Chart, registerables } from "https://cdn.jsdelivr.net/npm/chart.js/+esm";

Chart.register(...registerables);

// ============================================================
// State Management
// ============================================================

let currentPeriod = "day"; // "day" | "week" | "month"
let selectedDate = new Date();
let selectedIsToday = true;
let selectedDateLabel = "امروز";

let donutChartInstance = null;
let statisticsInitialized = false;

// ============================================================
// Component
// ============================================================

export function Statistic() {
    return `
        <section class="statistics">
            <!-- Header -->
            <header class="statistics__header">
                <h2 class="statistics__title" id="statisticsTitle">آمار امروز</h2>
            </header>

            <!-- Period Selector -->
            <div class="statistics__periods">
                <button
                    type="button"
                    class="statistics__period statistics__period--active"
                    data-period="day"
                    id="statisticsPeriodDay"
                >
                    امروز
                </button>

                <button type="button" class="statistics__period" data-period="week">
                    هفته گذشته
                </button>

                <button type="button" class="statistics__period" data-period="month">
                    ماه گذشته
                </button>
            </div>

            <!-- Statistics Content -->
            <div class="statistics__content">
                <!-- Donut Chart -->
                <div class="statistics__chart">
                    <div class="statistics__donut">
                        <canvas id="statisticsDonutCanvas"></canvas>

                        <div class="statistics__donut-center">
                            <span class="statistics__donut-label">زمان مفید</span>
                            <strong class="statistics__donut-time" id="usefulTime">00:00</strong>
                        </div>
                    </div>
                </div>

                <!-- Activity Details -->
                <div class="statistics__details">
                    <div class="statistics__details-header">
                        <span>فعالیت‌ها</span>
                        <span>سهم از زمان</span>
                    </div>

                    <div class="statistics__activities" id="statisticsActivitiesList">
                        <!-- Populated by JavaScript -->
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ============================================================
// Time Helpers
// ============================================================

function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function timeToSeconds(time) {
    const [h, m, s] = time.split(":").map(Number);
    return h * 3600 + (m || 0) * 60 + (s || 0);
}

function formatHM(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// ============================================================
// Session Filters
// ============================================================

function getSessionsForDate(date) {
    return sessions.filter(s => {
        const sessionDate = s.date ? new Date(s.date) : new Date();
        return isSameDay(sessionDate, date);
    });
}

function getSessionsInRange(start, end) {
    return sessions.filter(s => {
        const sessionDate = s.date ? new Date(s.date) : new Date();
        return sessionDate >= start && sessionDate <= end;
    });
}

function getWeekRange(date) {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const start = new Date(date);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
}

function getMonthRange(date) {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const start = new Date(date);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start, end };
}

// ============================================================
// Compute Breakdown
// ============================================================

function computeBreakdown(periodSessions) {
    const totals = {};
    let grandTotal = 0;

    periodSessions.forEach(session => {
        const duration = Math.max(
            0,
            timeToSeconds(session.endTime) - timeToSeconds(session.startTime)
        );
        totals[session.activityId] = (totals[session.activityId] || 0) + duration;
        grandTotal += duration;
    });

    const breakdown = timedActivities
        .filter(activity => !activity.is_archived && totals[activity.id])
        .map(activity => ({
            title: activity.title,
            color: activity.color,
            seconds: totals[activity.id],
            percent: grandTotal > 0 ? Math.round((totals[activity.id] / grandTotal) * 100) : 0
        }))
        .sort((a, b) => b.seconds - a.seconds);

    return { breakdown, grandTotal };
}

// ============================================================
// Label Helpers
// ============================================================

function toShortLabel(fullLabel) {
    const parts = fullLabel.split("،");
    if (parts.length < 2) return fullLabel;

    const rest = parts[1].trim().split(" ");
    return `${rest[0]} ${rest[1]}`;
}

// ============================================================
// Donut Chart Renderer
// ============================================================

function renderDonutChart(breakdown) {
    const canvas = document.querySelector("#statisticsDonutCanvas");
    if (!canvas) return;

    if (donutChartInstance) {
        donutChartInstance.destroy();
        donutChartInstance = null;
    }

    if (breakdown.length === 0) {
        donutChartInstance = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: ["بدون داده"],
                datasets: [{
                    data: [1],
                    backgroundColor: ["#e8eaed"],
                    borderWidth: 0,
                    hoverOffset: 0
                }]
            },
            options: {
                cutout: "66%",
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
        return;
    }

    donutChartInstance = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: breakdown.map(item => item.title),
            datasets: [{
                data: breakdown.map(item => item.seconds),
                backgroundColor: breakdown.map(item => item.color),
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            cutout: "66%",
            plugins: {
                legend: { display: false },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${formatHM(ctx.raw)}`
                    }
                }
            }
        }
    });
}

// ============================================================
// Main Render Function
// ============================================================

function renderStatisticsToDOM() {
    const titleEl = document.querySelector("#statisticsTitle");
    const dayButtonEl = document.querySelector("#statisticsPeriodDay");
    const usefulTimeEl = document.querySelector("#usefulTime");
    const activitiesEl = document.querySelector("#statisticsActivitiesList");

    if (!activitiesEl) return;

    if (titleEl) titleEl.textContent = `آمار ${selectedDateLabel}`;
    if (dayButtonEl) dayButtonEl.textContent = selectedDateLabel;

    let periodSessions = [];
    let emptyMessage = "";

    if (currentPeriod === "day") {
        periodSessions = getSessionsForDate(selectedDate);
        emptyMessage = `هنوز داده‌ای برای ${selectedDateLabel} ثبت نشده است.`;
    } else if (currentPeriod === "week") {
        const { start, end } = getWeekRange(selectedDate);
        periodSessions = getSessionsInRange(start, end);
        emptyMessage = `هنوز داده‌ای برای هفته‌ی منتهی به ${selectedDateLabel} ثبت نشده است.`;
    } else {
        const { start, end } = getMonthRange(selectedDate);
        periodSessions = getSessionsInRange(start, end);
        emptyMessage = `هنوز داده‌ای برای ماه منتهی به ${selectedDateLabel} ثبت نشده است.`;
    }

    const { breakdown, grandTotal } = computeBreakdown(periodSessions);

    if (usefulTimeEl) usefulTimeEl.textContent = formatHM(grandTotal);

    activitiesEl.innerHTML = breakdown.length > 0
        ? breakdown.map(item => `
            <div class="statistics__activity" data-activity-color="${item.color}">
                <div class="statistics__activity-name">
                    <span class="statistics__activity-color" style="--activity-color: ${item.color}"></span>
                    <span>${item.title}</span>
                </div>

                <div class="statistics__activity-data">
                    <span class="statistics__activity-duration">${formatHM(item.seconds)}</span>
                    <span class="statistics__activity-percent">${item.percent}%</span>
                </div>
            </div>
        `).join("")
        : `<p class="statistics__empty">${emptyMessage}</p>`;

    renderDonutChart(breakdown);
}

// ============================================================
// Period Switch Handler
// ============================================================

document.addEventListener("click", (event) => {
    const periodButton = event.target.closest(".statistics__period");
    if (!periodButton) return;

    currentPeriod = periodButton.dataset.period;

    document.querySelectorAll(".statistics__period").forEach(btn => {
        btn.classList.toggle("statistics__period--active", btn === periodButton);
    });

    renderStatisticsToDOM();
});

// ============================================================
// Listen for Day Selection from Calendar
// ============================================================

document.addEventListener("day:selected", (event) => {
    const { gy, gm, gd, isToday, label } = event.detail;

    selectedDate = new Date(gy, gm - 1, gd);
    selectedIsToday = isToday;
    selectedDateLabel = isToday ? "امروز" : toShortLabel(label);

    renderStatisticsToDOM();
});

// ============================================================
// Listen for Activity/Session Changes
// ============================================================

document.addEventListener("timed-activities:changed", () => {
    setTimeout(() => {
        renderStatisticsToDOM();
    }, 100);
});

document.addEventListener("sessions:changed", () => {
    setTimeout(() => {
        renderStatisticsToDOM();
    }, 100);
});

// ============================================================
// Initialization
// ============================================================

export function initStatistics() {
    if (statisticsInitialized) return;
    statisticsInitialized = true;

    renderStatisticsToDOM();

    setTimeout(() => {
        const activitiesEl = document.querySelector("#statisticsActivitiesList");
        if (activitiesEl && activitiesEl.innerHTML === "") {
            renderStatisticsToDOM();
        }
    }, 100);

    setTimeout(() => {
        renderStatisticsToDOM();
    }, 500);
}

// ============================================================
// Initial Render with Delay
// ============================================================

setTimeout(() => {
    renderStatisticsToDOM();
}, 0);