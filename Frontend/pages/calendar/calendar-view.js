import { 
    sessions, 
    openSessionModal,
    openDeleteSessionModal
} from "../../Components/dashboard/sessions/sessions.js";

import { untimedActivities, untimedActivityRecords, getActivityRecord, toggleUntimedCheck } from "../../Components/dashboard/untimed-activities/untimed-activities.js";

// ============================================================
// Iranian Official Holidays Database (All Years)
// ============================================================

const HOLIDAYS_DB = {
    1400: { 1: [1, 2, 3, 12, 13], 2: [], 3: [14, 15], 4: [4, 5], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [29] },
    1401: { 1: [1, 2, 3, 12, 13], 2: [], 3: [14, 15], 4: [4, 5], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [29] },
    1402: { 1: [1, 2, 3, 12, 13], 2: [], 3: [14, 15], 4: [4, 5], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [29] },
    1403: { 1: [1, 2, 3, 12, 13], 2: [], 3: [14, 15], 4: [4, 5], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [29] },
    1404: { 1: [1, 2, 3, 12, 13], 2: [], 3: [14, 15], 4: [4, 5], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [29] },
    1405: { 
        1: [1, 2, 3, 4, 12, 13, 25],
        2: [],
        3: [6, 14, 15],
        4: [3, 4, 5],
        5: [13, 21, 22],
        6: [8],
        7: [],
        8: [],
        9: [],
        10: [2, 16],
        11: [4, 22],
        12: [9, 19, 20, 29]
    },
    1406: { 1: [1, 2, 3, 4, 12, 13, 14], 2: [28], 3: [5, 14, 15, 25, 26], 4: [4, 5], 5: [4, 12, 13, 21, 30], 6: [], 7: [], 8: [13], 9: [23], 10: [7], 11: [], 12: [9, 10, 29] },
    1407: { 1: [1, 2, 3, 12, 13], 2: [], 3: [14, 15], 4: [4, 5], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [29] },
    1408: { 1: [1, 2, 3, 12, 13], 2: [], 3: [14, 15], 4: [4, 5], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [29] },
    1409: { 1: [1, 2, 3, 12, 13], 2: [], 3: [14, 15], 4: [4, 5], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [29] },
    1410: { 1: [1, 2, 3, 12, 13], 2: [], 3: [14, 15], 4: [4, 5], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [29] }
};

// ============================================================
// Jalali <-> Gregorian Conversion
// ============================================================

function div(a, b) { return ~~(a / b); }
function mod(a, b) { return a - ~~(a / b) * b; }

const BREAKS = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210,
    1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

function jalCal(jy) {
    const bl = BREAKS.length;
    const gy = jy + 621;
    let leapJ = -14;
    let jp = BREAKS[0];
    let jm;
    let jump = 0;

    for (let i = 1; i < bl; i += 1) {
        jm = BREAKS[i];
        jump = jm - jp;
        if (jy < jm) break;
        leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
        jp = jm;
    }

    let n = jy - jp;
    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;

    const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    const march = 20 + leapJ - leapG;

    if (jump - n < 6) n = n - jump + div(jump, 33) * 33;

    let leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;

    return { leap, gy, march };
}

function isLeapJalaaliYear(jy) {
    return jalCal(jy).leap === 0;
}

function g2d(gy, gm, gd) {
    let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
        + div(153 * mod(gm + 9, 12) + 2, 5)
        + gd - 34840408;
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    return d;
}

function d2g(jdn) {
    let j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    const i = div(mod(j, 1461), 4) * 5 + 308;
    const gd = div(mod(i, 153), 5) + 1;
    const gm = mod(div(i, 153), 12) + 1;
    const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
    return { gy, gm, gd };
}

function j2d(jy, jm, jd) {
    const r = jalCal(jy);
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(jdn) {
    const gy = d2g(jdn).gy;
    let jy = gy - 621;
    const r = jalCal(jy);
    const jdn1f = g2d(gy, 3, r.march);
    let jd;
    let jm;
    let k = jdn - jdn1f;

    if (k >= 0) {
        if (k <= 185) {
            jm = 1 + div(k, 31);
            jd = mod(k, 31) + 1;
            return { jy, jm, jd };
        }
        k -= 186;
    } else {
        jy -= 1;
        k += 179;
        if (r.leap === 1) k += 1;
    }

    jm = 7 + div(k, 30);
    jd = mod(k, 30) + 1;
    return { jy, jm, jd };
}

function toJalaali(gy, gm, gd) {
    return d2j(g2d(gy, gm, gd));
}

function toGregorian(jy, jm, jd) {
    return d2g(j2d(jy, jm, jd));
}

function jalaaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJalaaliYear(jy) ? 30 : 29;
}

// ============================================================
// Gregorian <-> Islamic (Hijri) Conversion
// ============================================================

const ISLAMIC_EPOCH = 1948439.5;

function gregorianToJulianDay(gy, gm, gd) {
    const a = Math.floor((14 - gm) / 12);
    const y = gy + 4800 - a;
    const m = gm + 12 * a - 3;
    return gd
        + Math.floor((153 * m + 2) / 5)
        + 365 * y
        + Math.floor(y / 4)
        - Math.floor(y / 100)
        + Math.floor(y / 400)
        - 32045;
}

function julianDayToIslamic(jdRaw) {
    const jd = Math.floor(jdRaw) + 0.5;
    let l = jd - ISLAMIC_EPOCH + 10632;
    const n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;

    const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)
        + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);

    l = l
        - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
        - Math.floor(j / 16) * Math.floor((15238 * j) / 43)
        + 29;

    const month = Math.floor((24 * l) / 709);
    const day = l - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;

    return { year, month, day };
}

function gregorianToIslamic(gy, gm, gd) {
    return julianDayToIslamic(gregorianToJulianDay(gy, gm, gd));
}

// ============================================================
// Names and Helpers
// ============================================================

const PERSIAN_MONTHS = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

const ISLAMIC_MONTHS = [
    "محرم", "صفر", "ربیع الاول", "ربیع الثانی", "جمادی الاول", "جمادی الثانی",
    "رجب", "شعبان", "رمضان", "شوال", "ذوالقعده", "ذوالحجه"
];

const GREGORIAN_MONTHS_EN = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const GREGORIAN_MONTHS_EN_FULL = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_FA = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

function toPersianDigits(value) {
    const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(value).replace(/[0-9]/g, (d) => digits[d]);
}

function toISODate(gy, gm, gd) {
    return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

function saturdayFirstWeekday(jsWeekday) {
    return (jsWeekday + 1) % 7;
}

function formatDisplayTime(time) {
    if (!time) return "";
    return time.split(":").slice(0, 2).join(":");
}

// ============================================================
// Time Calculation Helpers (same as statistics.js)
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

function calculateDayUsefulTime(timedSessions) {
    let totalSeconds = 0;
    timedSessions.forEach(session => {
        if (session.startTime && session.endTime) {
            const startSeconds = timeToSeconds(session.startTime);
            const endSeconds = timeToSeconds(session.endTime);
            totalSeconds += Math.max(0, endSeconds - startSeconds);
        }
    });
    return totalSeconds;
}

// ============================================================
// Holidays Dataset from API
// ============================================================

const HOLIDAYS_API_URL = "https://raw.githubusercontent.com/BaseMax/persian-holidays-api/main/holidays.json";

const shamsiHolidayMap = new Map();
const gregorianHolidayMap = new Map();
const hijriHolidayMap = new Map();
let holidaysReady = false;
let holidaysPromise = null;

function addToMap(map, key, entry) {
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(entry);
}

function loadHolidaysData() {
    if (holidaysPromise) return holidaysPromise;

    holidaysPromise = fetch(HOLIDAYS_API_URL)
        .then((res) => {
            if (!res.ok) throw new Error(`holidays dataset status ${res.status}`);
            return res.json();
        })
        .then((list) => {
            if (!Array.isArray(list)) throw new Error("holidays dataset: unexpected shape");

            list.forEach((item) => {
                const dateInfo = item?.date;
                const parts = dateInfo?.date;
                if (!Array.isArray(parts) || parts.length < 2) return;

                const day = Number(parts[0]);
                const monthName = parts[1];
                if (!day || !monthName) return;

                const entry = {
                    is_holiday: Boolean(item.is_holiday),
                    event_name: item.event_name || "",
                };

                if (dateInfo.type === "shamsi") {
                    const monthIndex = PERSIAN_MONTHS.indexOf(monthName);
                    if (monthIndex === -1) return;
                    addToMap(shamsiHolidayMap, `${monthIndex + 1}-${day}`, entry);
                } else if (dateInfo.type === "gregorian") {
                    const monthIndex = GREGORIAN_MONTHS_EN_FULL.indexOf(monthName);
                    if (monthIndex === -1) return;
                    addToMap(gregorianHolidayMap, `${monthIndex + 1}-${day}`, entry);
                } else if (dateInfo.type === "hijri") {
                    const monthIndex = ISLAMIC_MONTHS.indexOf(monthName);
                    if (monthIndex === -1) return;
                    addToMap(hijriHolidayMap, `${monthIndex + 1}-${day}`, entry);
                }
            });

            holidaysReady = true;
        })
        .catch((error) => {
            holidaysReady = false;
        });

    return holidaysPromise;
}

// ============================================================
// Holiday Detection - Combined API and Database
// ============================================================

function getHolidayInfo(jy, jm, jd, gy, gm, gd, weekdayIndex) {
    const events = [];
    let isHoliday = weekdayIndex === 5;

    const collect = (list) => {
        list.forEach((entry) => {
            if (entry.event_name) events.push({ text: entry.event_name, isHoliday: entry.is_holiday });
            if (entry.is_holiday) isHoliday = true;
        });
    };

    collect(shamsiHolidayMap.get(`${jm}-${jd}`) || []);
    collect(gregorianHolidayMap.get(`${gm}-${gd}`) || []);

    const islamic = gregorianToIslamic(gy, gm, gd);
    collect(hijriHolidayMap.get(`${islamic.month}-${islamic.day}`) || []);

    const dbHoliday = HOLIDAYS_DB[jy]?.[jm]?.includes(jd) || false;
    if (dbHoliday) {
        isHoliday = true;
        if (events.length === 0) {
            events.push({ text: "تعطیل رسمی", isHoliday: true });
        }
    }

    return {
        isHoliday,
        events,
        islamicDay: islamic.day,
        islamicMonth: islamic.month,
        islamicYear: islamic.year,
    };
}

function buildRelativeDayLabel(gy, gm, gd) {
    const target = new Date(gy, gm - 1, gd);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

    if (diffDays === 0) return "امروز";
    if (diffDays === 1) return "فردا";
    if (diffDays === -1) return "دیروز";
    return WEEKDAY_FA[target.getDay()];
}

function buildOccasionSentence(jy, jm, jd, gy, gm, gd, weekdayIndex) {
    const relativeLabel = buildRelativeDayLabel(gy, gm, gd);
    const dateFa = `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
    const info = getHolidayInfo(jy, jm, jd, gy, gm, gd, weekdayIndex);

    if (!info.events.length) {
        return { text: `${relativeLabel} ${dateFa} - مناسبت خاصی ثبت نشده`, isHoliday: info.isHoliday };
    }

    const holidayEvents = info.events.filter((e) => e.isHoliday).map((e) => e.text);
    const otherEvents = info.events.filter((e) => !e.isHoliday).map((e) => e.text);

    let sentence = `${relativeLabel} ${dateFa}`;
    if (holidayEvents.length) {
        sentence += `، ${holidayEvents.join("، ")}`;
    }
    if (otherEvents.length) {
        sentence += `، ${otherEvents.join("، ")}`;
    }
    sentence += ".";

    return { text: sentence, isHoliday: info.isHoliday };
}

// ============================================================
// State Management
// ============================================================

const now = new Date();
const todayJalali = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());

let currentJalaaliYear = todayJalali.jy;
let currentJalaaliMonth = todayJalali.jm;
let currentModalDate = null;
let selectedDayElement = null;

// ============================================================
// Day Data Helpers
// ============================================================

function isRealToday(gy, gm, gd) {
    return gy === now.getFullYear() && gm === now.getMonth() + 1 && gd === now.getDate();
}

function isFutureDate(gy, gm, gd) {
    const targetDate = new Date(gy, gm - 1, gd);
    targetDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate > today;
}

function getDayActivityData(gy, gm, gd) {
    const isoDate = toISODate(gy, gm, gd);
    const isToday = isRealToday(gy, gm, gd);
    const isFuture = isFutureDate(gy, gm, gd);

    const untimedEntries = untimedActivities
        .filter((activity) => activity.is_active === true)
        .map((activity) => {
            const record = getActivityRecord(activity.id, isoDate);
            return { 
                activity, 
                record: record || { 
                    completed_count: 0, 
                    completed_checks: [],
                    activity_id: activity.id,
                    record_date: isoDate
                }
            };
        });

    const timedSessions = sessions.filter(session => {
        if (session.date) {
            const sessionDate = new Date(session.date);
            return sessionDate.getFullYear() === gy && 
                   sessionDate.getMonth() === gm - 1 && 
                   sessionDate.getDate() === gd;
        }
        return isToday;
    });

    const sortedSessions = [...timedSessions].sort((a, b) => {
        const aStart = a.startTime.split(':').map(Number);
        const bStart = b.startTime.split(':').map(Number);
        const aMinutes = aStart[0] * 60 + aStart[1];
        const bMinutes = bStart[0] * 60 + bStart[1];
        
        if (aMinutes !== bMinutes) {
            return aMinutes - bMinutes;
        }
        
        const aEnd = a.endTime.split(':').map(Number);
        const bEnd = b.endTime.split(':').map(Number);
        return (aEnd[0] * 60 + aEnd[1]) - (bEnd[0] * 60 + bEnd[1]);
    });

    return { untimedEntries, timedSessions: sortedSessions, isoDate, isToday, isFuture };
}

// ============================================================
// Day Cell Builder
// ============================================================

function buildDayCellHTML(jy, jm, jd) {
    const g = toGregorian(jy, jm, jd);
    const weekdayIndex = new Date(g.gy, g.gm - 1, g.gd).getDay();
    const holidayInfo = getHolidayInfo(jy, jm, jd, g.gy, g.gm, g.gd, weekdayIndex);
    const isToday = isRealToday(g.gy, g.gm, g.gd);

    const dayOnly = new Date(g.gy, g.gm - 1, g.gd).getTime();
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const isFuture = dayOnly > todayOnly;

    const { untimedEntries, timedSessions } = getDayActivityData(g.gy, g.gm, g.gd);

    const usefulSeconds = calculateDayUsefulTime(timedSessions);
    const totalMinutes = Math.round(usefulSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const usefulTimeFormatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    const hasUsefulTime = usefulSeconds > 0;

    const classNames = ["calendar-day"];
    if (isToday) classNames.push("calendar-day--today");
    if (holidayInfo.isHoliday) classNames.push("calendar-day--holiday");

    const todayLabelHTML = isToday ? `<span class="calendar-day__today-label">امروز</span>` : "";

    let bodyHTML;
    let durationHTML;

    if (isFuture) {
        bodyHTML = `<span class="calendar-day__empty">هنوز نرسیده</span>`;
        durationHTML = "";
    } else {
        const hasAnyData = untimedEntries.length > 0 || timedSessions.length > 0;

        if (hasAnyData) {
            const totalCompleted = untimedEntries.reduce((sum, e) => sum + (e.record.completed_count || 0), 0);
            const totalTarget = untimedEntries.reduce((sum, e) => sum + (e.activity.target_count || 0), 0);
            const progressHTML = totalTarget > 0
                ? `<div class="calendar-day__activity-progress">${totalCompleted} از ${totalTarget}</div>`
                : "";

            const sessionColors = [...new Set(timedSessions.map((s) => s.color))];
            const sessionsHTML = sessionColors.length
                ? `<div class="calendar-day__sessions">${sessionColors
                    .map((color) => `<span class="calendar-day__session" style="--activity-color: ${color}"></span>`)
                    .join("")}</div>`
                : "";

            bodyHTML = `${progressHTML}${sessionsHTML}`;

            durationHTML = `<span class="calendar-day__duration ${hasUsefulTime ? 'calendar-day__duration--has-time' : ''}">${usefulTimeFormatted}</span>`;
        } else {
            bodyHTML = `<span class="calendar-day__empty">بدون فعالیت</span>`;
            durationHTML = `<span class="calendar-day__duration">00:00</span>`;
        }
    }

    return `
        <article
            class="${classNames.join(" ")}"
            data-date="${toISODate(g.gy, g.gm, g.gd)}"
            data-jalali="${jy}-${jm}-${jd}"
        >
            <div class="calendar-day__top">
                <span class="calendar-day__number">${toPersianDigits(jd)}</span>
                ${todayLabelHTML}
                <div class="calendar-day__dates">
                    <span class="calendar-day__gregorian">${g.gd} ${GREGORIAN_MONTHS_EN[g.gm - 1]}</span>
                    <span class="calendar-day__hijri">${toPersianDigits(holidayInfo.islamicDay)} ${ISLAMIC_MONTHS[holidayInfo.islamicMonth - 1]}</span>
                </div>
            </div>
            ${bodyHTML}
            ${durationHTML}
        </article>
    `;
}

// ============================================================
// Month Grid Builder
// ============================================================

function buildMonthGridHTML() {
    const monthLength = jalaaliMonthLength(currentJalaaliYear, currentJalaaliMonth);
    const firstDayGregorian = toGregorian(currentJalaaliYear, currentJalaaliMonth, 1);
    const firstWeekday = saturdayFirstWeekday(
        new Date(firstDayGregorian.gy, firstDayGregorian.gm - 1, firstDayGregorian.gd).getDay()
    );

    const placeholders = Array.from(
        { length: firstWeekday },
        () => `<div class="calendar-day calendar-day--placeholder" aria-hidden="true"></div>`
    ).join("");

    const days = Array.from({ length: monthLength }, (_, i) =>
        buildDayCellHTML(currentJalaaliYear, currentJalaaliMonth, i + 1)
    ).join("");

    return placeholders + days;
}

function updateCalendarPageHeader() {
    const monthEl = document.querySelector(".calendar-page__month");
    const yearEl = document.querySelector(".calendar-page__year");
    if (monthEl) monthEl.textContent = PERSIAN_MONTHS[currentJalaaliMonth - 1];
    if (yearEl) yearEl.textContent = toPersianDigits(currentJalaaliYear);
}

function renderCalendarPageToDOM() {
    const daysContainer = document.querySelector(".calendar-page__days");
    if (!daysContainer) {
        setTimeout(renderCalendarPageToDOM, 50);
        return;
    }

    updateCalendarPageHeader();
    daysContainer.innerHTML = buildMonthGridHTML();

    if (!holidaysReady) {
        const requestedYear = currentJalaaliYear;
        const requestedMonth = currentJalaaliMonth;
        loadHolidaysData().then(() => {
            if (currentJalaaliYear === requestedYear && currentJalaaliMonth === requestedMonth) {
                renderCalendarPageToDOM();
            }
        });
    }
}

// ============================================================
// Navigation
// ============================================================

function goToPreviousMonth() {
    currentJalaaliMonth -= 1;
    if (currentJalaaliMonth < 1) {
        currentJalaaliMonth = 12;
        currentJalaaliYear -= 1;
    }
    renderCalendarPageToDOM();
}

function goToNextMonth() {
    currentJalaaliMonth += 1;
    if (currentJalaaliMonth > 12) {
        currentJalaaliMonth = 1;
        currentJalaaliYear += 1;
    }
    renderCalendarPageToDOM();
}

function goToToday() {
    currentJalaaliYear = todayJalali.jy;
    currentJalaaliMonth = todayJalali.jm;
    renderCalendarPageToDOM();
}

// ============================================================
// Day Detail Modal
// ============================================================

function buildSessionCardHTML(session) {
    const hasNote = Boolean(session.note);
    return `
        <article class="day-session-card" style="--activity-color: ${session.color}">
            <span class="day-session-card__color" aria-hidden="true"></span>
            <div class="day-session-card__info">
                <strong class="day-session-card__title">${session.title}</strong>
                <div class="day-session-card__time">
                    <span>${formatDisplayTime(session.startTime)}</span>
                    <span class="day-session-card__time-separator">←</span>
                    <span>${formatDisplayTime(session.endTime)}</span>
                </div>
            </div>
            <span class="day-session-card__duration">${session.duration}</span>
            <div class="day-session-card__actions">
                <button class="day-session-card__edit" data-action="edit-session-from-calendar" data-session-id="${session.id}" title="ویرایش">✎</button>
                <button class="day-session-card__delete" data-action="delete-session-from-calendar" data-session-id="${session.id}" title="حذف">🗑</button>
            </div>
            <button type="button" class="recent-activity__note ${hasNote ? "recent-activity__note--has-note" : ""}" data-action="session-note" data-session-id="${session.id}" aria-label="${hasNote ? "مشاهده یادداشت" : "افزودن یادداشت"}" title="${hasNote ? "مشاهده یادداشت" : "افزودن یادداشت"}">${hasNote ? "📖" : "+"}</button>
        </article>
    `;
}

function buildUntimedCardHTML(activity, record, date, isFuture) {
    const disabledAttr = isFuture ? 'disabled' : '';
    const disabledClass = isFuture ? 'day-untimed-card__check--disabled' : '';
    
    const checks = record.completed_checks || [];
    
    const checksHTML = Array.from({ length: activity.target_count }, (_, index) => {
        const isChecked = checks.includes(index) || false;
        return `
            <button
                class="day-untimed-card__check ${isChecked ? 'day-untimed-card__check--done' : ''} ${disabledClass}"
                data-check-index="${index}"
                data-activity-id="${activity.id}"
                data-date="${date}"
                aria-label="${isChecked ? 'انجام شده' : 'انجام نشده'}"
                ${disabledAttr}
            ></button>
        `;
    }).join("");

    return `
        <article class="day-untimed-card ${isFuture ? 'day-untimed-card--future' : ''}" data-activity-id="${activity.id}" data-date="${date}">
            <div class="day-untimed-card__header">
                <strong class="day-untimed-card__title">${activity.title}</strong>
                <span class="day-untimed-card__progress">${record.completed_count || 0}/${activity.target_count}</span>
            </div>
            <div class="day-untimed-card__checks">${checksHTML}</div>
        </article>
    `;
}

function DayDetailModal() {
    return `
        <div class="day-detail-modal" id="dayDetailModal" aria-hidden="true">
            <div class="day-detail-modal__overlay" data-action="close-day-detail"></div>
            <div class="day-detail-modal__box" role="dialog" aria-modal="true" aria-labelledby="dayDetailModalTitle">
                <header class="day-detail-modal__header">
                    <div>
                        <span class="day-detail-modal__eyebrow">جزئیات روز</span>
                        <h2 class="day-detail-modal__title" id="dayDetailModalTitle">—</h2>
                        <span class="day-detail-modal__subtitle" id="dayDetailModalSubtitle"></span>
                    </div>
                    <button type="button" class="day-detail-modal__close" data-action="close-day-detail" aria-label="بستن">×</button>
                </header>

                <div class="day-detail-modal__columns">
                    <section class="day-detail-modal__column">
                        <div class="day-detail-modal__column-header">
                            <h3 class="day-detail-modal__column-title">
                                <span>سشن‌های زمان‌دار</span>
                                <span class="day-detail-modal__column-count" id="sessionsCount">0</span>
                            </h3>
                            <button type="button" class="day-detail-modal__add-session" data-action="add-session-from-calendar" title="افزودن سشن" id="addSessionFromCalendarBtn">
                                +
                            </button>
                        </div>
                        <div class="day-detail-modal__list" id="dayDetailSessionsList"></div>
                    </section>
                    <section class="day-detail-modal__column">
                        <h3 class="day-detail-modal__column-title">
                            فعالیت‌های بدون زمان
                            <span class="day-detail-modal__column-count" id="untimedCount">0</span>
                        </h3>
                        <div class="day-detail-modal__list" id="dayDetailUntimedList"></div>
                    </section>
                </div>

                <div class="day-detail-modal__occasion" id="dayDetailOccasion"></div>
            </div>
        </div>
    `;
}

function injectDayDetailModal() {
    if (document.getElementById("dayDetailModal")) return;
    document.body.insertAdjacentHTML("beforeend", DayDetailModal());
}

function openDayDetailModal(dayEl) {
    const modal = document.getElementById("dayDetailModal");
    if (!modal) return;

    const [jy, jm, jd] = dayEl.dataset.jalali.split("-").map(Number);
    const g = toGregorian(jy, jm, jd);
    const weekdayIndex = new Date(g.gy, g.gm - 1, g.gd).getDay();
    const dateKey = toISODate(g.gy, g.gm, g.gd);
    currentModalDate = dateKey;
    selectedDayElement = dayEl;

    const isFuture = isFutureDate(g.gy, g.gm, g.gd);

    const titleEl = document.getElementById("dayDetailModalTitle");
    if (titleEl) {
        titleEl.textContent = `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
    }

    const subtitleEl = document.getElementById("dayDetailModalSubtitle");
    if (subtitleEl) {
        const weekdayName = WEEKDAY_FA[weekdayIndex];
        const isToday = isRealToday(g.gy, g.gm, g.gd);
        subtitleEl.textContent = isToday ? `${weekdayName} • امروز` : weekdayName;
    }

    const addSessionBtn = document.getElementById("addSessionFromCalendarBtn");
    if (addSessionBtn) {
        if (isFuture) {
            addSessionBtn.disabled = true;
            addSessionBtn.classList.add('day-detail-modal__add-session--disabled');
        } else {
            addSessionBtn.disabled = false;
            addSessionBtn.classList.remove('day-detail-modal__add-session--disabled');
        }
    }

    const { untimedEntries, timedSessions } = getDayActivityData(g.gy, g.gm, g.gd);

    const sessionsListEl = document.getElementById("dayDetailSessionsList");
    const sessionsCountEl = document.getElementById("sessionsCount");
    if (sessionsListEl) {
        if (timedSessions.length > 0) {
            sessionsListEl.innerHTML = timedSessions.map(buildSessionCardHTML).join("");
            if (sessionsCountEl) sessionsCountEl.textContent = timedSessions.length;
        } else {
            sessionsListEl.innerHTML = `<p class="day-detail-modal__empty">هیچ سشن‌ای برای این روز ثبت نشده است.</p>`;
            if (sessionsCountEl) sessionsCountEl.textContent = "0";
        }
    }

    const untimedListEl = document.getElementById("dayDetailUntimedList");
    const untimedCountEl = document.getElementById("untimedCount");
    if (untimedListEl) {
        if (untimedEntries.length > 0) {
            untimedListEl.innerHTML = untimedEntries
                .map((e) => buildUntimedCardHTML(e.activity, e.record, dateKey, isFuture))
                .join("");
            
            if (untimedCountEl) untimedCountEl.textContent = untimedEntries.length;
            
            if (!isFuture) {
                untimedListEl.querySelectorAll('.day-untimed-card__check').forEach(check => {
                    check.removeEventListener('click', handleUntimedCheckClick);
                    check.addEventListener('click', handleUntimedCheckClick);
                });
            }
        } else {
            untimedListEl.innerHTML = `<p class="day-detail-modal__empty">هیچ فعالیت بدون زمانی ثبت نشده است.</p>`;
            if (untimedCountEl) untimedCountEl.textContent = "0";
        }
    }

    const occasionEl = document.getElementById("dayDetailOccasion");
    if (occasionEl) {
        const occasion = buildOccasionSentence(jy, jm, jd, g.gy, g.gm, g.gd, weekdayIndex);
        occasionEl.textContent = occasion.text;
        occasionEl.classList.toggle("day-detail-modal__occasion--holiday", occasion.isHoliday);
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
}

function closeDayDetailModal() {
    const modal = document.getElementById("dayDetailModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    currentModalDate = null;
    selectedDayElement = null;
}

// ============================================================
// Untimed Check Handler (Updated)
// ============================================================

async function handleUntimedCheckClick(event) {
    const check = event.currentTarget;
    const card = check.closest('.day-untimed-card');
    if (!card) return;

    const activityId = Number(card.dataset.activityId);
    const date = card.dataset.date || currentModalDate;
    const checkIndex = Number(check.dataset.checkIndex);

    check.disabled = true;

    try {
        const result = await toggleUntimedCheck(activityId, checkIndex, date);
        
        if (result) {
            const isChecked = result.completed_checks?.includes(checkIndex) || false;
            check.classList.toggle('day-untimed-card__check--done', isChecked);
            check.setAttribute('aria-label', isChecked ? 'انجام شده' : 'انجام نشده');

            const progressEl = card.querySelector('.day-untimed-card__progress');
            if (progressEl) {
                const completed = result.completed_count || 0;
                const activity = untimedActivities.find(a => Number(a.id) === activityId);
                const target = activity?.target_count || 0;
                progressEl.textContent = `${completed}/${target}`;
            }

            const existingIndex = untimedActivityRecords.findIndex(r => r.id === result.id);
            if (existingIndex !== -1) {
                untimedActivityRecords[existingIndex] = result;
            } else {
                untimedActivityRecords.push(result);
            }

            renderCalendarPageToDOM();
            document.dispatchEvent(new CustomEvent('untimed-activities:changed'));
        }
    } catch (error) {
        // Silently handle errors
    } finally {
        check.disabled = false;
    }
}

// ============================================================
// Event Listeners
// ============================================================

document.addEventListener("click", (event) => {
    if (event.target.closest('.calendar-page__nav-btn[aria-label="ماه قبل"]')) {
        goToPreviousMonth();
        return;
    }

    if (event.target.closest('.calendar-page__nav-btn[aria-label="ماه بعد"]')) {
        goToNextMonth();
        return;
    }

    if (event.target.closest(".calendar-page__today-btn")) {
        goToToday();
        return;
    }

    const dayEl = event.target.closest(".calendar-day:not(.calendar-day--placeholder)");
    if (dayEl && dayEl.closest(".calendar-page")) {
        document.querySelectorAll('.calendar-day--selected').forEach(el => {
            el.classList.remove('calendar-day--selected');
        });
        dayEl.classList.add('calendar-day--selected');
        openDayDetailModal(dayEl);
        return;
    }

    if (event.target.closest('[data-action="close-day-detail"]')) {
        closeDayDetailModal();
        return;
    }

    if (event.target.closest('[data-action="add-session-from-calendar"]')) {
        const addBtn = event.target.closest('[data-action="add-session-from-calendar"]');
        if (addBtn && addBtn.disabled) return;
        
        if (currentModalDate) {
            const dateObj = new Date(currentModalDate);
            const customEvent = new CustomEvent('day:selected', {
                detail: {
                    gy: dateObj.getFullYear(),
                    gm: dateObj.getMonth() + 1,
                    gd: dateObj.getDate(),
                    isToday: isRealToday(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()),
                    label: currentModalDate
                }
            });
            document.dispatchEvent(customEvent);
            
            openSessionModal('add');
        }
        return;
    }

    const editBtn = event.target.closest('.day-session-card__edit, [data-action="edit-session-from-calendar"]');
    if (editBtn) {
        const sessionId = Number(editBtn.dataset.sessionId);
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            closeDayDetailModal();
            setTimeout(() => {
                openSessionModal('edit', session);
            }, 100);
        }
        return;
    }

    const deleteBtn = event.target.closest('.day-session-card__delete, [data-action="delete-session-from-calendar"]');
    if (deleteBtn) {
        const sessionId = Number(deleteBtn.dataset.sessionId);
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            closeDayDetailModal();
            setTimeout(() => {
                openDeleteSessionModal(session);
            }, 100);
        }
        return;
    }

    const noteBtn = event.target.closest('.recent-activity__note, [data-action="session-note"]');
    if (noteBtn) {
        const sessionId = Number(noteBtn.dataset.sessionId);
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            const noteEvent = new CustomEvent('calendar:session-note', {
                detail: { sessionId: session.id }
            });
            document.dispatchEvent(noteEvent);
        }
        return;
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeDayDetailModal();
    }
});

document.addEventListener('sessions:changed', () => {
    const modal = document.getElementById("dayDetailModal");
    if (modal && modal.classList.contains('is-open') && selectedDayElement) {
        openDayDetailModal(selectedDayElement);
    }
    renderCalendarPageToDOM();
});

document.addEventListener('timed-activities:changed', () => {
    renderCalendarPageToDOM();
});

document.addEventListener('session-note-saved', () => {
    const modal = document.getElementById("dayDetailModal");
    if (modal && modal.classList.contains('is-open') && selectedDayElement) {
        openDayDetailModal(selectedDayElement);
    }
});

document.addEventListener('untimed-activities:changed', () => {
    const modal = document.getElementById("dayDetailModal");
    if (modal && modal.classList.contains('is-open') && selectedDayElement) {
        openDayDetailModal(selectedDayElement);
    }
    renderCalendarPageToDOM();
});

// ============================================================
// Main Calendar Page Function
// ============================================================

export function CalendarView() {
    injectDayDetailModal();

    setTimeout(() => {
        renderCalendarPageToDOM();
    }, 0);

    return `
        <section class="calendar-page">
          <header class="calendar-page__header">
            <div class="calendar-page__navigation">
              <button type="button" class="calendar-page__nav-btn" aria-label="ماه قبل">‹</button>
              <div class="calendar-page__current-date">
                <span class="calendar-page__month"></span>
                <span class="calendar-page__year"></span>
              </div>
              <button type="button" class="calendar-page__nav-btn" aria-label="ماه بعد">›</button>
            </div>
            <button type="button" class="calendar-page__today-btn">امروز</button>
          </header>

          <div class="calendar-page__calendar">
            <div class="calendar-page__weekdays">
              <span>شنبه</span>
              <span>یکشنبه</span>
              <span>دوشنبه</span>
              <span>سه‌شنبه</span>
              <span>چهارشنبه</span>
              <span>پنجشنبه</span>
              <span>جمعه</span>
            </div>
            <div class="calendar-page__days"></div>
          </div>
        </section>
    `;
}