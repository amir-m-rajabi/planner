import { sessions } from "../sessions/sessions.js";

// ========================================
// دیتابیس کامل تعطیلات رسمی ایران (همه سال‌ها)
// ========================================

const HOLIDAYS_DB = {
    1400: {
        1: [1, 2, 3, 12, 13],
        2: [],
        3: [14, 15],
        4: [4, 5],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [29]
    },
    1401: {
        1: [1, 2, 3, 12, 13],
        2: [],
        3: [14, 15],
        4: [4, 5],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [29]
    },
    1402: {
        1: [1, 2, 3, 12, 13],
        2: [],
        3: [14, 15],
        4: [4, 5],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [29]
    },
    1403: {
        1: [1, 2, 3, 12, 13],
        2: [],
        3: [14, 15],
        4: [4, 5],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [29]
    },
    1404: {
        1: [1, 2, 3, 12, 13],
        2: [],
        3: [14, 15],
        4: [4, 5],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [29]
    },
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
    1406: {
        1: [1, 2, 3, 4, 12, 13, 14],
        2: [28],
        3: [5, 14, 15, 25, 26],
        4: [4, 5],
        5: [4, 12, 13, 21, 30],
        6: [],
        7: [],
        8: [13],
        9: [23],
        10: [7],
        11: [],
        12: [9, 10, 29]
    },
    1407: {
        1: [1, 2, 3, 12, 13],
        2: [],
        3: [14, 15],
        4: [4, 5],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [29]
    },
    1408: {
        1: [1, 2, 3, 12, 13],
        2: [],
        3: [14, 15],
        4: [4, 5],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [29]
    },
    1409: {
        1: [1, 2, 3, 12, 13],
        2: [],
        3: [14, 15],
        4: [4, 5],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [29]
    },
    1410: {
        1: [1, 2, 3, 12, 13],
        2: [],
        3: [14, 15],
        4: [4, 5],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [29]
    }
};

// ========================================
// Jalali <-> Gregorian Conversion
// ========================================

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

// ========================================
// نام‌ها و ابزارهای کمکی
// ========================================

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

// ========================================
// وضعیت فعلی
// ========================================

const now = new Date();
const todayJalali = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());

let currentJalaaliYear = todayJalali.jy;
let currentJalaaliMonth = todayJalali.jm;

// ========================================
// زمان مفید امروز
// ========================================

function getTodayUsefulTimeLabel() {
    const totalMinutes = sessions.reduce((sum, session) => {
        const [sh, sm] = session.startTime.split(":").map(Number);
        const [eh, em] = session.endTime.split(":").map(Number);

        let start = sh * 60 + sm;
        let end = eh * 60 + em;
        if (end < start) end += 24 * 60;

        return sum + (end - start);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// ========================================
// تشخیص تعطیلی از دیتابیس
// ========================================

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

// ========================================
// ساخت داده‌ی یک روز
// ========================================

function buildDayData(jy, jm, jd) {
    const g = toGregorian(jy, jm, jd);
    const weekdayIndex = new Date(g.gy, g.gm - 1, g.gd).getDay();

    const islamicDay = ((jd + 9) % 30) || 30;
    const islamicMonth = ((jm + 3) % 12) || 12;

    const holiday = isHoliday(jy, jm, jd);

    return {
        solar: { day: jd, month: jm, year: jy },
        gregorian: { day: g.gd, month: g.gm, year: g.gy, dayWeek: WEEKDAY_EN[weekdayIndex] },
        moon: { day: islamicDay, month: islamicMonth, year: 1446 },
        holiday: holiday,
        weekdayIndex: weekdayIndex
    };
}

// ========================================
// ساخت HTML یک روز
// ========================================

function createDayHTML(dayData, todayGregorian) {
    const { solar, gregorian, moon, holiday, weekdayIndex } = dayData;

    const weekdayFa = WEEKDAY_FA[weekdayIndex];

    const isToday = gregorian.year === todayGregorian.gy &&
        gregorian.month === todayGregorian.gm &&
        gregorian.day === todayGregorian.gd;

    const thisDayValue = gregorian.year * 10000 + gregorian.month * 100 + gregorian.day;
    const todayValue = todayGregorian.gy * 10000 + todayGregorian.gm * 100 + todayGregorian.gd;

    let usefulTimeHTML;
    if (thisDayValue < todayValue) {
        usefulTimeHTML = `<div class="calendar__day-useful-time">00:00</div>`;
    } else if (thisDayValue === todayValue) {
        usefulTimeHTML = `<div class="calendar__day-useful-time">${getTodayUsefulTimeLabel()}</div>`;
    } else {
        usefulTimeHTML = `<div aria-hidden="true"></div>`;
    }

    const islamicDay = moon.day ? moon.day : "—";

    let holidayClass = '';
    if (holiday) {
        holidayClass = 'calendar__day--holiday';
    }

    return `
        <article
            class="calendar__day ${isToday ? "calendar__day--today" : ""} ${holidayClass}"
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

// ========================================
// آپدیت هدر
// ========================================

function updateCalendarHeader(firstDay, lastDay) {
    const header = document.querySelector(".calendar__header");
    if (!header) return;

    const gregorianMonthEls = header.querySelectorAll(".calendar__gregorian-month");
    if (gregorianMonthEls[0]) gregorianMonthEls[0].textContent = GREGORIAN_MONTHS[firstDay.gregorian.month - 1];
    if (gregorianMonthEls[1]) gregorianMonthEls[1].textContent = GREGORIAN_MONTHS[lastDay.gregorian.month - 1];

    const gregorianYearEl = header.querySelector(".calendar__gregorian-year");
    if (gregorianYearEl) gregorianYearEl.textContent = firstDay.gregorian.year;

    const yearEl = header.querySelector(".calendar__year");
    if (yearEl) yearEl.textContent = toPersianDigits(currentJalaaliYear);

    const monthEl = header.querySelector(".calendar__month");
    if (monthEl) monthEl.textContent = PERSIAN_MONTHS[currentJalaaliMonth - 1];

    const islamicMonthEls = header.querySelectorAll(".calendar__islamic-month");
    if (islamicMonthEls[0]) islamicMonthEls[0].textContent = ISLAMIC_MONTHS[Math.max(firstDay.moon.month, 1) - 1];
    if (islamicMonthEls[1]) islamicMonthEls[1].textContent = ISLAMIC_MONTHS[Math.max(lastDay.moon.month, 1) - 1];

    const islamicYearEl = header.querySelector(".calendar__islamic-year");
    if (islamicYearEl) islamicYearEl.textContent = firstDay.moon.year || "1446";
}

// ========================================
// اسکرول خودکار به روز جاری یا نزدیک‌ترین روز
// ========================================

function scrollToToday() {
    const wrapper = document.querySelector('.calendar__days-wrapper');
    if (!wrapper) return;

    // پیدا کردن روز جاری
    const todayEl = document.querySelector('.calendar__day--today');
    
    if (todayEl) {
        // اگر روز جاری وجود داره، بهش اسکرول کن
        const wrapperRect = wrapper.getBoundingClientRect();
        const todayRect = todayEl.getBoundingClientRect();
        const offset = todayRect.top - wrapperRect.top - (wrapperRect.height / 2) + (todayRect.height / 2);
        
        wrapper.scrollTo({
            top: wrapper.scrollTop + offset,
            behavior: 'smooth'
        });
    } else {
        // اگر روز جاری در این ماه نیست، به نزدیک‌ترین روز اسکرول کن
        const allDays = wrapper.querySelectorAll('.calendar__day');
        if (allDays.length === 0) return;
        
        // پیدا کردن روزی که به امروز نزدیک‌تره
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        
        let closestDay = null;
        let closestDiff = Infinity;
        
        allDays.forEach(day => {
            const dateStr = day.dataset.date;
            if (dateStr) {
                const parts = dateStr.split('-').map(Number);
                const dayDate = new Date(parts[0], parts[1] - 1, parts[2]);
                const diff = Math.abs(dayDate - todayDate);
                if (diff < closestDiff) {
                    closestDiff = diff;
                    closestDay = day;
                }
            }
        });
        
        if (closestDay) {
            const wrapperRect = wrapper.getBoundingClientRect();
            const dayRect = closestDay.getBoundingClientRect();
            const offset = dayRect.top - wrapperRect.top - (wrapperRect.height / 2) + (dayRect.height / 2);
            
            wrapper.scrollTo({
                top: wrapper.scrollTop + offset,
                behavior: 'smooth'
            });
        }
    }
}

// ========================================
// تابع رندر اصلی
// ========================================

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

    // ====== اسکرول خودکار به روز جاری ======
    // با تاخیر انجام میشه تا DOM کامل رندر بشه
    setTimeout(() => {
        scrollToToday();
    }, 150);
}

function handleDayClick() {
    const dateStr = this.dataset.date;
    if (dateStr) {
        const parts = dateStr.split('-').map(Number);
        const clickedDate = new Date(parts[0], parts[1] - 1, parts[2]);
        document.dispatchEvent(new CustomEvent('day-selected', {
            detail: { date: clickedDate }
        }));
    }
}

// ========================================
// ناوبری ماه قبل/بعد
// ========================================

function navigateMonth(direction) {
    currentJalaaliMonth += direction;

    if (currentJalaaliMonth > 12) {
        currentJalaaliMonth = 1;
        currentJalaaliYear += 1;
    } else if (currentJalaaliMonth < 1) {
        currentJalaaliMonth = 12;
        currentJalaaliYear -= 1;
    }

    renderCalendarToDOM();
}

// ========================================
// رویدادهای ناوبری
// ========================================

document.addEventListener("click", (event) => {
    if (event.target.closest(".calendar__navigation--previous")) {
        navigateMonth(-1);
        return;
    }

    if (event.target.closest(".calendar__navigation--next")) {
        navigateMonth(1);
    }
});

// ========================================
// تابع اصلی Calendar
// ========================================

export function Calendar() {
    const todayJalaliNow = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    
    setTimeout(() => {
        renderCalendarToDOM();
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
          <span class="calendar__gregorian-month">${GREGORIAN_MONTHS[now.getMonth()]}</span>
          <span class="calendar__gregorian-month">${GREGORIAN_MONTHS[(now.getMonth() + 1) % 12]}</span>
          <span class="calendar__gregorian-year">${now.getFullYear()}</span>
        </div>

        <div class="calendar__persian-date">
          <strong class="calendar__year">${toPersianDigits(todayJalaliNow.jy)}</strong>
          <span class="calendar__month">${PERSIAN_MONTHS[todayJalaliNow.jm - 1]}</span>
        </div>

        <div class="calendar__islamic">
          <span class="calendar__islamic-month">${ISLAMIC_MONTHS[(todayJalaliNow.jm + 3) % 12]}</span>
          <span class="calendar__islamic-month">${ISLAMIC_MONTHS[(todayJalaliNow.jm + 4) % 12]}</span>
          <span class="calendar__islamic-year">1446</span>
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

// ========================================
// تابع init
// ========================================

export function initCalendar() {
    renderCalendarToDOM();
}

// ========================================
// گوش دادن به تغییرات سشن‌ها
// ========================================

document.addEventListener('sessions:changed', () => {
    renderCalendarToDOM();
});