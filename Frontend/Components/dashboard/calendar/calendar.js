// File: Components/dashboard/calendar/calendar.js

import { sessions } from "../sessions/sessions.js";

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

const GREGORIAN_MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_FA = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
const WEEKDAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toPersianDigits(value) {
    const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(value).replace(/[0-9]/g, d => digits[d]);
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

// ============================================================
// Calculate Day Useful Time from Database
// ============================================================

function getDayUsefulTime(jy, jm, jd) {
    const g = toGregorian(jy, jm, jd);
    const targetDate = new Date(g.gy, g.gm - 1, g.gd);
    
    const daySessions = sessions.filter(s => {
        const sessionDate = s.date ? new Date(s.date) : new Date();
        return isSameDay(sessionDate, targetDate);
    });
    
    let totalMinutes = 0;
    daySessions.forEach(session => {
        if (session.startTime && session.endTime) {
            const startSeconds = timeToSeconds(session.startTime);
            const endSeconds = timeToSeconds(session.endTime);
            const durationSeconds = Math.max(0, endSeconds - startSeconds);
            totalMinutes += durationSeconds / 60;
        }
    });
    
    const roundedMinutes = Math.round(totalMinutes);
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// ============================================================
// Holiday Detection from Database
// ============================================================

function isHoliday(jy, jm, jd) {
    const g = toGregorian(jy, jm, jd);
    const weekdayIndex = new Date(g.gy, g.gm - 1, g.gd).getDay();
    if (weekdayIndex === 5) return true;

    const yearHolidays = HOLIDAYS_DB[jy];
    if (!yearHolidays) return false;

    const monthHolidays = yearHolidays[jm];
    if (!monthHolidays) return false;

    return monthHolidays.includes(jd);
}

// ============================================================
// Reference Date for Active Month in Header
// ============================================================

function getReferenceDate() {
    if (selectedDate) {
        return selectedDate;
    }
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// ============================================================
// State Management
// ============================================================

const now = new Date();
const todayJalali = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());

let currentJalaaliYear = todayJalali.jy;
let currentJalaaliMonth = todayJalali.jm;
let selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
let calendarInitialized = false;

// ============================================================
// Build Day Data
// ============================================================

function buildDayData(jy, jm, jd) {
    const g = toGregorian(jy, jm, jd);
    const weekdayIndex = new Date(g.gy, g.gm - 1, g.gd).getDay();
    const islamic = gregorianToIslamic(g.gy, g.gm, g.gd);

    const holiday = isHoliday(jy, jm, jd);
    const usefulTime = getDayUsefulTime(jy, jm, jd);

    const isSelected = selectedDate &&
        g.gy === selectedDate.getFullYear() &&
        g.gm === selectedDate.getMonth() + 1 &&
        g.gd === selectedDate.getDate();

    return {
        solar: { day: jd, month: jm, year: jy },
        gregorian: { day: g.gd, month: g.gm, year: g.gy, dayWeek: WEEKDAY_EN[weekdayIndex] },
        moon: { day: islamic.day, month: islamic.month, year: islamic.year },
        holiday: holiday,
        usefulTime: usefulTime,
        weekdayIndex: weekdayIndex,
        isSelected: isSelected
    };
}

// ============================================================
// Create Day HTML
// ============================================================

function createDayHTML(dayData, todayGregorian) {
    const { solar, gregorian, moon, holiday, usefulTime, weekdayIndex, isSelected } = dayData;

    const weekdayFa = WEEKDAY_FA[weekdayIndex];

    const isToday = gregorian.year === todayGregorian.gy &&
        gregorian.month === todayGregorian.gm &&
        gregorian.day === todayGregorian.gd;

    const thisDayValue = gregorian.year * 10000 + gregorian.month * 100 + gregorian.day;
    const todayValue = todayGregorian.gy * 10000 + todayGregorian.gm * 100 + todayGregorian.gd;

    const hasUsefulTime = usefulTime !== '00:00';
    
    let usefulTimeClass = 'calendar__day-useful-time';
    if (hasUsefulTime) {
        usefulTimeClass += ' calendar__day-useful-time--has-time';
    }

    let usefulTimeHTML;
    if (thisDayValue < todayValue || thisDayValue === todayValue) {
        usefulTimeHTML = `<div class="${usefulTimeClass}">${usefulTime}</div>`;
    } else {
        usefulTimeHTML = `<div aria-hidden="true"></div>`;
    }

    const islamicDay = moon.day ? toPersianDigits(moon.day) : "—";

    let holidayClass = '';
    if (holiday) {
        holidayClass = 'calendar__day--holiday';
    }

    let selectedClass = '';
    if (isSelected) {
        selectedClass = 'calendar__day--selected';
    }

    return `
        <article
            class="calendar__day ${isToday ? "calendar__day--today" : ""} ${holidayClass} ${selectedClass}"
            data-date="${gregorian.year}-${String(gregorian.month).padStart(2, '0')}-${String(gregorian.day).padStart(2, '0')}"
            data-persian="${solar.year}-${solar.month}-${solar.day}"
        >
            <div class="calendar__day-info">
                <span class="calendar__day-week">${weekdayFa}</span>

                <div class="calendar__day-subinfo">
                    <span class="calendar__day-islamic">${islamicDay}</span>
                    <span class="calendar__day-week-en">${gregorian.dayWeek}</span>
                    <span class="calendar__day-gregorian">${gregorian.day}</span>
                </div>
            </div>

            ${usefulTimeHTML}

            <div class="calendar__day-number">${toPersianDigits(solar.day)}</div>
        </article>
    `;
}

// ============================================================
// Update Calendar Header
// ============================================================

function updateCalendarHeader(firstDay, lastDay) {
    const header = document.querySelector(".calendar__header");
    if (!header) return;

    const referenceDate = getReferenceDate();
    const refGregorian = {
        gy: referenceDate.getFullYear(),
        gm: referenceDate.getMonth() + 1,
        gd: referenceDate.getDate()
    };
    const refIslamic = gregorianToIslamic(refGregorian.gy, refGregorian.gm, refGregorian.gd);

    const gregorianMonthEls = header.querySelectorAll(".calendar__gregorian-month");
    const gregMonths = [firstDay.gregorian.month, lastDay.gregorian.month];

    gregMonths.forEach((m, idx) => {
        const el = gregorianMonthEls[idx];
        if (!el) return;
        el.textContent = GREGORIAN_MONTHS[m - 1];
        el.classList.toggle("calendar__gregorian-month--active", m === refGregorian.gm);
    });

    const gregorianYearEl = header.querySelector(".calendar__gregorian-year");
    if (gregorianYearEl) {
        const years = [...new Set([firstDay.gregorian.year, lastDay.gregorian.year])];
        if (years.length > 1) {
            gregorianYearEl.innerHTML = years.join(' <span class="calendar__year-separator">/</span> ');
            gregorianYearEl.classList.add("calendar__gregorian-year--dual");
        } else {
            gregorianYearEl.textContent = years[0];
            gregorianYearEl.classList.remove("calendar__gregorian-year--dual");
        }
    }

    const yearEl = header.querySelector(".calendar__year");
    if (yearEl) yearEl.textContent = toPersianDigits(currentJalaaliYear);

    const monthEl = header.querySelector(".calendar__month");
    if (monthEl) monthEl.textContent = PERSIAN_MONTHS[currentJalaaliMonth - 1];

    const islamicMonthEls = header.querySelectorAll(".calendar__islamic-month");
    const islamicMonths = [firstDay.moon.month, lastDay.moon.month];

    islamicMonths.forEach((m, idx) => {
        const el = islamicMonthEls[idx];
        if (!el) return;
        el.textContent = ISLAMIC_MONTHS[m - 1];
        el.classList.toggle("calendar__islamic-month--active", m === refIslamic.month);
    });

    const islamicYearEl = header.querySelector(".calendar__islamic-year");
    if (islamicYearEl) {
        const years = [...new Set([firstDay.moon.year, lastDay.moon.year])];
        if (years.length > 1) {
            islamicYearEl.innerHTML = years.join(' <span class="calendar__year-separator">/</span> ');
            islamicYearEl.classList.add("calendar__islamic-year--dual");
        } else {
            islamicYearEl.textContent = years[0];
            islamicYearEl.classList.remove("calendar__islamic-year--dual");
        }
    }
}

// ============================================================
// Auto-scroll to Today
// ============================================================

function scrollToToday() {
    const wrapper = document.querySelector('.calendar__days-wrapper');
    if (!wrapper) return;

    const todayEl = document.querySelector('.calendar__day--today');

    if (todayEl) {
        const wrapperRect = wrapper.getBoundingClientRect();
        const todayRect = todayEl.getBoundingClientRect();
        const offset = todayRect.top - wrapperRect.top - (wrapperRect.height / 2) + (todayRect.height / 2);

        wrapper.scrollTo({
            top: wrapper.scrollTop + offset,
            behavior: 'smooth'
        });
    }
}

// ============================================================
// Dispatch Today Selected Event to Other Modules
// ============================================================

function dispatchTodaySelected() {
    const todayG = { gy: now.getFullYear(), gm: now.getMonth() + 1, gd: now.getDate() };
    const todayJ = toJalaali(todayG.gy, todayG.gm, todayG.gd);
    
    document.dispatchEvent(new CustomEvent('day:selected', {
        detail: {
            gy: todayG.gy,
            gm: todayG.gm,
            gd: todayG.gd,
            jy: todayJ.jy,
            jm: todayJ.jm,
            jd: todayJ.jd,
            isToday: true,
            label: 'امروز'
        }
    }));
}

// ============================================================
// Main Render Function
// ============================================================

function renderCalendarToDOM() {
    const daysWrapper = document.querySelector(".calendar__days");
    if (!daysWrapper) {
        setTimeout(renderCalendarToDOM, 50);
        return;
    }

    const dayNumbers = Array.from(
        { length: jalaaliMonthLength(currentJalaaliYear, currentJalaaliMonth) },
        (_, i) => i + 1
    );

    const todayGregorian = {
        gy: now.getFullYear(),
        gm: now.getMonth() + 1,
        gd: now.getDate()
    };

    const dayDataList = dayNumbers.map(dayNum =>
        buildDayData(currentJalaaliYear, currentJalaaliMonth, dayNum)
    );

    updateCalendarHeader(dayDataList[0], dayDataList[dayDataList.length - 1]);

    daysWrapper.innerHTML = dayDataList
        .map(dayData => createDayHTML(dayData, todayGregorian))
        .join("");

    document.querySelectorAll('.calendar__day').forEach(dayEl => {
        dayEl.removeEventListener('click', handleDayClick);
        dayEl.addEventListener('click', handleDayClick);
    });

    setTimeout(() => {
        scrollToToday();
    }, 150);
}

// ============================================================
// Day Click Handler
// ============================================================

function handleDayClick() {
    const dateStr = this.dataset.date;
    if (!dateStr) return;

    const parts = dateStr.split('-').map(Number);
    const clickedDate = new Date(parts[0], parts[1] - 1, parts[2]);

    selectedDate = clickedDate;

    document.querySelectorAll('.calendar__day--selected').forEach(el => {
        el.classList.remove('calendar__day--selected');
    });
    this.classList.add('calendar__day--selected');

    const dayNumbers = Array.from(
        { length: jalaaliMonthLength(currentJalaaliYear, currentJalaaliMonth) },
        (_, i) => i + 1
    );
    const dayDataList = dayNumbers.map(dayNum =>
        buildDayData(currentJalaaliYear, currentJalaaliMonth, dayNum)
    );
    updateCalendarHeader(dayDataList[0], dayDataList[dayDataList.length - 1]);

    const persianParts = this.dataset.persian.split('-').map(Number);
    const isToday = clickedDate.toDateString() === new Date().toDateString();
    const persianLabel = isToday 
        ? 'امروز' 
        : `${WEEKDAY_FA[clickedDate.getDay()]}، ${toPersianDigits(persianParts[2])} ${PERSIAN_MONTHS[persianParts[1] - 1]} ${toPersianDigits(persianParts[0])}`;
    
    document.dispatchEvent(new CustomEvent('day:selected', {
        detail: {
            gy: clickedDate.getFullYear(),
            gm: clickedDate.getMonth() + 1,
            gd: clickedDate.getDate(),
            jy: persianParts[0],
            jm: persianParts[1],
            jd: persianParts[2],
            isToday: isToday,
            label: persianLabel
        }
    }));
}

// ============================================================
// Month Navigation
// ============================================================

function navigateMonth(direction) {
    currentJalaaliMonth += direction;

    if (currentJalaaliMonth > 12) {
        currentJalaaliMonth = 1;
        currentJalaaliYear += 1;
    } else if (currentJalaaliMonth < 1) {
        currentJalaaliMonth = 12;
        currentJalaaliYear -= 1;
    }

    selectedDate = null;
    renderCalendarToDOM();
    
    setTimeout(() => {
        dispatchTodaySelected();
    }, 100);
}

// ============================================================
// Navigation Events
// ============================================================

document.addEventListener("click", (event) => {
    if (event.target.closest(".calendar__navigation--previous")) {
        navigateMonth(-1);
        return;
    }

    if (event.target.closest(".calendar__navigation--next")) {
        navigateMonth(1);
    }
});

// ============================================================
// Main Calendar Function
// ============================================================

export function Calendar() {
    selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    setTimeout(() => {
        renderCalendarToDOM();
        
        setTimeout(() => {
            dispatchTodaySelected();
        }, 100);
    }, 0);

    return `
    <section class="calendar">
      <header class="calendar__header">
        <button
          type="button"
          class="calendar__navigation calendar__navigation--previous"
          aria-label="ماه قبل"
        >
          ‹
        </button>

        <div class="calendar__gregorian">
          <span class="calendar__gregorian-month"></span>
          <span class="calendar__gregorian-month"></span>
          <span class="calendar__gregorian-year"></span>
        </div>

        <div class="calendar__persian-date">
          <strong class="calendar__year"></strong>
          <span class="calendar__month"></span>
        </div>

        <div class="calendar__islamic">
          <span class="calendar__islamic-month"></span>
          <span class="calendar__islamic-month"></span>
          <span class="calendar__islamic-year"></span>
        </div>

        <button
          type="button"
          class="calendar__navigation calendar__navigation--next"
          aria-label="ماه بعد"
        >
          ›
        </button>
      </header>

      <div class="calendar__days-wrapper">
        <div class="calendar__days"></div>
      </div>
    </section>
    `;
}

// ============================================================
// Init Function
// ============================================================

export function initCalendar() {
    if (calendarInitialized) return;
    calendarInitialized = true;
    
    selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    renderCalendarToDOM();
    
    setTimeout(() => {
        dispatchTodaySelected();
    }, 100);
}

// ============================================================
// Listen to Session Changes
// ============================================================

document.addEventListener('sessions:changed', () => {
    renderCalendarToDOM();
});
document.addEventListener('timed-activities:changed', () => {
    renderCalendarToDOM();
});

// ============================================================
// Exports
// ============================================================

export { selectedDate };