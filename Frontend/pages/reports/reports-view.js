import { timedActivities } from "../../Components/dashboard/timed-activities/timed-activities.js";
import { sessions } from "../../Components/dashboard/sessions/sessions.js";
import { untimedActivities, untimedActivityRecords } from "../../Components/dashboard/untimed-activities/untimed-activities.js";
import { UntimedActivitiesAPI, UntimedRecordsAPI } from "../../js/api.js";
import { Chart, registerables } from "https://cdn.jsdelivr.net/npm/chart.js/+esm";

Chart.register(...registerables);

// ============================================================
// State Management
// ============================================================

let currentType = "timed";
let currentRange = "today";
let currentYear = 1405;
let currentMonth = 0;
let donutChartInstance = null;
let barChartInstance = null;
let untimedDataLoaded = false;

// ============================================================
// Constants
// ============================================================

const PERSIAN_MONTHS = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

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
 * Convert time string (HH:MM:SS) to total seconds
 */
function timeToSeconds(time) {
    const [h, m, s] = time.split(":").map(Number);
    return h * 3600 + (m || 0) * 60 + (s || 0);
}

/**
 * Format seconds to HH:MM
 */
function formatHM(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Format duration in human-readable persian text
 */
function formatDurationDetailed(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0 && minutes > 0) return `${hours} ساعت و ${minutes} دقیقه`;
    if (hours > 0) return `${hours} ساعت`;
    if (minutes > 0) return `${minutes} دقیقه`;
    return "۰ دقیقه";
}

/**
 * Convert english digits to persian digits
 */
function toPersianDigits(value) {
    const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(value).replace(/[0-9]/g, d => digits[d]);
}

/**
 * Get number of days for current range filter
 */
function getDaysInRange() {
    if (currentRange === "today") return 1;
    if (currentRange === "week") return 7;
    if (currentRange === "month") return 30;
    if (currentRange === "year") {
        if (currentMonth > 0) {
            return currentMonth <= 6 ? 31 : 30;
        }
        return 365;
    }
    return 1;
}

// ============================================================
// Data Loading
// ============================================================

/**
 * Load untimed activities and their records from api
 */
async function loadUntimedData() {
    try {
        const userId = getUserId();
        if (!userId) {
            untimedDataLoaded = true;
            return;
        }

        const activities = await UntimedActivitiesAPI.getAll(userId);
        untimedActivities.length = 0;
        untimedActivities.push(...(activities || []));

        untimedActivityRecords.length = 0;
        for (const activity of untimedActivities) {
            try {
                const records = await UntimedRecordsAPI.getByActivity(activity.id);
                if (records && records.length > 0) {
                    records.forEach(record => {
                        if (!record.completed_checks) {
                            record.completed_checks = [];
                        }
                        if (!record.completed_count) {
                            record.completed_count = 0;
                        }
                    });
                    untimedActivityRecords.push(...records);
                }
            } catch (err) {
                // Silently handle individual activity record errors
            }
        }

        untimedDataLoaded = true;
        
    } catch (error) {
        untimedDataLoaded = true;
    }
}

// ============================================================
// Component Render
// ============================================================

export function ReportsView() {
    currentType = "timed";
    currentRange = "today";
    currentMonth = 0;
    donutChartInstance = null;
    barChartInstance = null;
    untimedDataLoaded = false;
    
    return `
        <section class="statistics">
            <!-- Statistics type selector -->
            <div class="statistics-type">
                <button type="button" class="statistics-type__item statistics-type__item--active" data-type="timed">
                    <span class="statistics-type__icon">◷</span>
                    <span class="statistics-type__content">
                        <strong>فعالیت‌های زمان‌دار</strong>
                        <small>زمان صرف‌شده و سشن‌ها</small>
                    </span>
                </button>

                <button type="button" class="statistics-type__item" data-type="untimed">
                    <span class="statistics-type__icon">✓</span>
                    <span class="statistics-type__content">
                        <strong>فعالیت‌های بدون زمان</strong>
                        <small>میزان انجام و پیشرفت</small>
                    </span>
                </button>
            </div>

            <!-- Filters section -->
            <section class="statistics-filters">
                <div class="statistics-filters__quick">
                    <span class="statistics-filters__label">بازه سریع</span>
                    <div class="statistics-filters__quick-list">
                        <button type="button" class="statistics-filter-btn statistics-filter-btn--active" data-range="today">امروز</button>
                        <button type="button" class="statistics-filter-btn" data-range="week">هفته گذشته</button>
                        <button type="button" class="statistics-filter-btn" data-range="month">ماه گذشته</button>
                    </div>
                </div>

                <div class="statistics-filters__history">
                    <span class="statistics-filters__label">مشاهده سابقه</span>
                    <div class="statistics-filters__selectors">
                        <!-- Year selector -->
                        <div class="statistics-selector-wrapper">
                            <button type="button" class="statistics-selector" id="yearSelectorBtn">
                                <span class="statistics-selector__label">سال</span>
                                <strong class="statistics-selector__value" id="yearDisplay">${toPersianDigits(currentYear)}</strong>
                                <span class="statistics-selector__arrow">⌄</span>
                            </button>
                            
                            <div class="statistics-dropdown" id="yearDropdown" hidden>
                                ${[1405, 1404, 1403, 1402, 1401, 1400].map(year => `
                                    <button type="button" class="statistics-dropdown__item ${year === currentYear ? 'statistics-dropdown__item--active' : ''}" data-year="${year}">
                                        ${toPersianDigits(year)}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Month selector -->
                        <div class="statistics-selector-wrapper">
                            <button type="button" class="statistics-selector" id="monthSelectorBtn">
                                <span class="statistics-selector__label">ماه</span>
                                <strong class="statistics-selector__value" id="monthDisplay">${currentMonth === 0 ? 'کل سال' : PERSIAN_MONTHS[currentMonth - 1]}</strong>
                                <span class="statistics-selector__arrow">⌄</span>
                            </button>
                            
                            <div class="statistics-dropdown" id="monthDropdown" hidden>
                                <button type="button" class="statistics-dropdown__item ${currentMonth === 0 ? 'statistics-dropdown__item--active' : ''}" data-month="0">
                                    — کل سال —
                                </button>
                                ${PERSIAN_MONTHS.map((month, index) => `
                                    <button type="button" class="statistics-dropdown__item ${currentMonth === index + 1 ? 'statistics-dropdown__item--active' : ''}" data-month="${index + 1}">
                                        ${month}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Timed activities content -->
            <section class="statistics-content" id="timedContent">
                <div class="statistics-main-card">
                    <div class="statistics-main-card__header">
                        <div>
                            <span class="statistics-main-card__eyebrow">فعالیت‌های زمان‌دار</span>
                            <h2 class="statistics-main-card__title">توزیع زمان مفید</h2>
                        </div>
                    </div>

                    <div class="statistics-timed">
                        <div class="statistics-timed__chart">
                            <canvas id="timedDonutChart"></canvas>
                            <div class="statistics-donut-center">
                                <strong id="timedTotalTime">۰۰:۰۰</strong>
                                <span>زمان مفید</span>
                            </div>
                        </div>

                        <div class="statistics-timed__activities" id="timedActivitiesList"></div>
                    </div>
                </div>

                <div class="statistics-insights">
                    <div class="statistics-insight">
                        <span>بیشترین فعالیت</span>
                        <strong id="mostActiveTimed">—</strong>
                    </div>
                    <div class="statistics-insight">
                        <span>میانگین روزانه</span>
                        <strong id="avgDailyTimed">۰۰:۰۰</strong>
                    </div>
                    <div class="statistics-insight">
                        <span>تعداد سشن</span>
                        <strong id="sessionsCount">۰</strong>
                    </div>
                </div>
            </section>

            <!-- Untimed activities content -->
            <section class="statistics-content" id="untimedContent" hidden>
                <div class="statistics-main-card">
                    <div class="statistics-main-card__header">
                        <div>
                            <span class="statistics-main-card__eyebrow">فعالیت‌های بدون زمان</span>
                            <h2 class="statistics-main-card__title">میزان انجام فعالیت‌ها</h2>
                        </div>
                        <div class="statistics-main-card__total">
                            <span>مجموع انجام‌شده</span>
                            <strong id="untimedTotalDone">۰</strong>
                        </div>
                    </div>

                    <div class="statistics-timed">
                        <div class="statistics-timed__chart">
                            <canvas id="untimedBarChart"></canvas>
                        </div>

                        <div class="statistics-timed__activities" id="untimedActivitiesList"></div>
                    </div>
                </div>

                <div class="statistics-insights">
                    <div class="statistics-insight">
                        <span>بهترین فعالیت</span>
                        <strong id="bestUntimed">—</strong>
                    </div>
                    <div class="statistics-insight">
                        <span>نرخ تکمیل</span>
                        <strong id="completionRate">۰٪</strong>
                    </div>
                    <div class="statistics-insight">
                        <span>مجموع اهداف</span>
                        <strong id="totalTargets">۰</strong>
                    </div>
                </div>
            </section>
        </section>
    `;
}

// ============================================================
// Dropdown Event Handling
// ============================================================

document.addEventListener("click", (event) => {
    // Toggle year dropdown
    if (event.target.closest("#yearSelectorBtn")) {
        const dropdown = document.getElementById("yearDropdown");
        const monthDropdown = document.getElementById("monthDropdown");
        if (dropdown) dropdown.hidden = !dropdown.hidden;
        if (monthDropdown) monthDropdown.hidden = true;
        return;
    }
    
    // Toggle month dropdown
    if (event.target.closest("#monthSelectorBtn")) {
        const dropdown = document.getElementById("monthDropdown");
        const yearDropdown = document.getElementById("yearDropdown");
        if (dropdown) dropdown.hidden = !dropdown.hidden;
        if (yearDropdown) yearDropdown.hidden = true;
        return;
    }
    
    // Handle year selection
    const yearItem = event.target.closest("[data-year]");
    if (yearItem) {
        currentYear = Number(yearItem.dataset.year);
        currentRange = "year";
        
        const yearDisplay = document.getElementById("yearDisplay");
        if (yearDisplay) yearDisplay.textContent = toPersianDigits(currentYear);
        
        document.querySelectorAll("[data-year]").forEach(btn => {
            btn.classList.toggle("statistics-dropdown__item--active", btn === yearItem);
        });
        
        const dropdown = document.getElementById("yearDropdown");
        if (dropdown) dropdown.hidden = true;
        
        document.querySelectorAll("[data-range]").forEach(btn => {
            btn.classList.remove("statistics-filter-btn--active");
        });
        
        if (currentType === "timed") {
            renderTimedStatistics();
        } else {
            renderUntimedStatistics();
        }
        return;
    }
    
    // Handle month selection
    const monthItem = event.target.closest("[data-month]");
    if (monthItem) {
        currentMonth = Number(monthItem.dataset.month);
        currentRange = "year";
        
        const monthDisplay = document.getElementById("monthDisplay");
        if (monthDisplay) {
            monthDisplay.textContent = currentMonth === 0 ? 'کل سال' : PERSIAN_MONTHS[currentMonth - 1];
        }
        
        document.querySelectorAll("[data-month]").forEach(btn => {
            btn.classList.toggle("statistics-dropdown__item--active", btn === monthItem);
        });
        
        const dropdown = document.getElementById("monthDropdown");
        if (dropdown) dropdown.hidden = true;
        
        document.querySelectorAll("[data-range]").forEach(btn => {
            btn.classList.remove("statistics-filter-btn--active");
        });
        
        if (currentType === "timed") {
            renderTimedStatistics();
        } else {
            renderUntimedStatistics();
        }
        return;
    }
    
    // Close dropdowns on outside click
    if (!event.target.closest(".statistics-selector-wrapper")) {
        document.getElementById("yearDropdown")?.setAttribute("hidden", "");
        document.getElementById("monthDropdown")?.setAttribute("hidden", "");
    }
});

// ============================================================
// Type Toggle Event Handling
// ============================================================

document.addEventListener("click", (event) => {
    const typeBtn = event.target.closest("[data-type]");
    if (!typeBtn) return;
    
    const type = typeBtn.dataset.type;
    if (type === currentType) return;
    
    currentType = type;
    
    document.querySelectorAll("[data-type]").forEach(btn => {
        btn.classList.toggle("statistics-type__item--active", btn === typeBtn);
    });
    
    const timedContent = document.getElementById("timedContent");
    const untimedContent = document.getElementById("untimedContent");
    
    if (!timedContent || !untimedContent) return;
    
    if (type === "timed") {
        timedContent.hidden = false;
        untimedContent.hidden = true;
        setTimeout(() => renderTimedStatistics(), 50);
    } else {
        timedContent.hidden = true;
        untimedContent.hidden = false;
        setTimeout(async () => {
            await loadUntimedData();
            renderUntimedStatistics();
        }, 50);
    }
});

// ============================================================
// Range Filter Event Handling
// ============================================================

document.addEventListener("click", (event) => {
    const rangeBtn = event.target.closest("[data-range]");
    if (!rangeBtn) return;
    
    const range = rangeBtn.dataset.range;
    if (range === currentRange) return;
    
    currentRange = range;
    
    document.querySelectorAll("[data-range]").forEach(btn => {
        btn.classList.toggle("statistics-filter-btn--active", btn === rangeBtn);
    });
    
    if (currentType === "timed") {
        renderTimedStatistics();
    } else {
        renderUntimedStatistics();
    }
});

// ============================================================
// Custom Event Listeners
// ============================================================

document.addEventListener('timed-activities:changed', () => {
    if (currentType === "timed") {
        renderTimedStatistics();
    }
});

document.addEventListener('sessions:changed', () => {
    if (currentType === "timed") {
        renderTimedStatistics();
    } else {
        renderUntimedStatistics();
    }
});

// ============================================================
// Date Range Calculation
// ============================================================

/**
 * Calculate start and end date based on current filters
 */
function getDateRange() {
    const now = new Date();
    
    if (currentRange === "today") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        return { start, end };
    }
    
    if (currentRange === "week") {
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
    }
    
    if (currentRange === "month") {
        const start = new Date(now);
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        return { start, end: now };
    }
    
    if (currentRange === "year") {
        const gregorianYear = currentYear + 621;
        
        if (currentMonth === 0) {
            const start = new Date(gregorianYear, 2, 21);
            const end = new Date(gregorianYear + 1, 2, 20, 23, 59, 59);
            return { start, end };
        } else {
            const gregorianMonth = currentMonth + 2;
            const start = new Date(gregorianYear, gregorianMonth - 1, 21);
            const end = new Date(gregorianYear, gregorianMonth, 20, 23, 59, 59);
            return { start, end };
        }
    }
    
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return { start, end };
}

// ============================================================
// Timed Statistics Renderer
// ============================================================

/**
 * Render timed activities statistics
 */
function renderTimedStatistics() {
    const { start, end } = getDateRange();
    const periodSessions = sessions.filter(s => {
        const d = s.date ? new Date(s.date) : new Date();
        return d >= start && d <= end;
    });
    
    const breakdown = computeTimedBreakdown(periodSessions);
    const totalSeconds = breakdown.grandTotal;

    const totalEl = document.getElementById("timedTotalTime");
    if (totalEl) totalEl.textContent = formatHM(totalSeconds);

    const listEl = document.getElementById("timedActivitiesList");
    if (listEl) {
        if (breakdown.breakdown.length > 0) {
            listEl.innerHTML = breakdown.breakdown.map(item => `
                <article class="statistics-activity">
                    <span class="statistics-activity__color" style="--activity-color: ${item.color}"></span>
                    <div class="statistics-activity__info">
                        <strong>${item.title}</strong>
                        <span>${formatDurationDetailed(item.seconds)}</span>
                    </div>
                    <strong class="statistics-activity__percent">${toPersianDigits(item.percent)}٪</strong>
                </article>
            `).join("");
        } else {
            listEl.innerHTML = `<p class="statistics-activity statistics-activity--empty">داده‌ای ثبت نشده است.</p>`;
        }
    }

    const mostActiveEl = document.getElementById("mostActiveTimed");
    const avgDailyEl = document.getElementById("avgDailyTimed");
    const sessionsCountEl = document.getElementById("sessionsCount");

    if (mostActiveEl) mostActiveEl.textContent = breakdown.breakdown.length > 0 ? breakdown.breakdown[0].title : "—";
    
    if (avgDailyEl) {
        const days = getDaysInRange();
        avgDailyEl.textContent = formatHM(Math.floor(totalSeconds / days));
    }
    
    if (sessionsCountEl) sessionsCountEl.textContent = toPersianDigits(periodSessions.length);

    renderTimedDonut(breakdown.breakdown);
}

/**
 * Compute time breakdown for timed activities
 */
function computeTimedBreakdown(periodSessions) {
    const totals = {};
    let grandTotal = 0;

    periodSessions.forEach(session => {
        const duration = Math.max(0, timeToSeconds(session.endTime) - timeToSeconds(session.startTime));
        totals[session.activityId] = (totals[session.activityId] || 0) + duration;
        grandTotal += duration;
    });

    const breakdown = timedActivities
        .filter(a => !a.is_archived && totals[a.id])
        .map(a => ({
            title: a.title,
            color: a.color,
            seconds: totals[a.id],
            percent: grandTotal > 0 ? Math.round((totals[a.id] / grandTotal) * 100) : 0
        }))
        .sort((a, b) => b.seconds - a.seconds);

    return { breakdown, grandTotal };
}

/**
 * Render donut chart for timed activities
 */
function renderTimedDonut(breakdown) {
    const canvas = document.getElementById("timedDonutChart");
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
                cutout: "70%",
                responsive: true,
                maintainAspectRatio: false,
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
            cutout: "70%",
            responsive: true,
            maintainAspectRatio: false,
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
// Untimed Statistics Renderer
// ============================================================

/**
 * Render untimed activities statistics
 */
function renderUntimedStatistics() {
    if (!untimedDataLoaded) {
        loadUntimedData().then(() => {
            renderUntimedStatistics();
        });
        return;
    }

    const days = getDaysInRange();
    const activeActivities = untimedActivities.filter(a => a.is_active === true);
    const { start, end } = getDateRange();
    
    let totalDone = 0;
    let totalTargets = 0;

    const activityStats = activeActivities.map(activity => {
        const targetForPeriod = activity.target_count * days;
        let doneForPeriod = 0;
        
        const records = untimedActivityRecords.filter(r => {
            if (Number(r.activity_id) !== Number(activity.id)) return false;
            
            const recordDate = new Date(r.record_date + "T00:00:00");
            return recordDate >= start && recordDate <= end;
        });
        
        records.forEach(r => { 
            doneForPeriod += r.completed_count || 0; 
        });
        
        const percent = targetForPeriod > 0 ? Math.round((doneForPeriod / targetForPeriod) * 100) : 0;
        totalDone += doneForPeriod;
        totalTargets += targetForPeriod;
        
        return { 
            title: activity.title, 
            done: doneForPeriod, 
            target: targetForPeriod, 
            percent 
        };
    }).sort((a, b) => b.done - a.done);

    const totalDoneEl = document.getElementById("untimedTotalDone");
    if (totalDoneEl) totalDoneEl.textContent = toPersianDigits(totalDone);

    const listEl = document.getElementById("untimedActivitiesList");
    if (listEl) {
        if (activityStats.length > 0) {
            listEl.innerHTML = activityStats.map(item => `
                <article class="statistics-activity">
                    <span class="statistics-activity__color" style="--activity-color: #4f9ea5"></span>
                    <div class="statistics-activity__info">
                        <strong>${item.title}</strong>
                        <span>${toPersianDigits(item.done)} از ${toPersianDigits(item.target)} مورد</span>
                    </div>
                    <strong class="statistics-activity__percent">${toPersianDigits(item.percent)}٪</strong>
                </article>
            `).join("");
        } else {
            listEl.innerHTML = `<p class="statistics-activity statistics-activity--empty">داده‌ای ثبت نشده است.</p>`;
        }
    }

    const bestEl = document.getElementById("bestUntimed");
    const rateEl = document.getElementById("completionRate");
    const targetsEl = document.getElementById("totalTargets");

    if (bestEl) bestEl.textContent = activityStats.length > 0 ? activityStats[0].title : "—";
    if (rateEl) rateEl.textContent = `${toPersianDigits(totalTargets > 0 ? Math.round((totalDone / totalTargets) * 100) : 0)}٪`;
    if (targetsEl) targetsEl.textContent = toPersianDigits(totalTargets);

    renderUntimedBar(activityStats);
}

/**
 * Render bar chart for untimed activities
 */
function renderUntimedBar(activityStats) {
    const canvas = document.getElementById("untimedBarChart");
    if (!canvas) return;

    if (barChartInstance) {
        barChartInstance.destroy();
        barChartInstance = null;
    }

    if (activityStats.length === 0) {
        barChartInstance = new Chart(canvas, {
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
                cutout: "70%",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
        return;
    }

    barChartInstance = new Chart(canvas, {
        type: "bar",
        data: {
            labels: activityStats.map(item => item.title),
            datasets: [
                {
                    label: "انجام‌شده",
                    data: activityStats.map(item => item.done),
                    backgroundColor: "#4f9ea5",
                    borderRadius: 5,
                    borderSkipped: false,
                    barThickness: 14
                },
                {
                    label: "هدف",
                    data: activityStats.map(item => item.target),
                    backgroundColor: "rgba(79, 158, 165, 0.15)",
                    borderRadius: 5,
                    borderSkipped: false,
                    barThickness: 14
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            scales: {
                x: { beginAtZero: true, grid: { display: false } },
                y: { grid: { display: false } }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    rtl: true,
                    callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}` }
                }
            }
        }
    });
}

// ============================================================
// Initialization
// ============================================================

export function initReportsPage() {
    loadUntimedData();
    renderTimedStatistics();
}