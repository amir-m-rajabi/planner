// فایل: Components/dashboard/clock/clock.js

import { sessions } from "../sessions/sessions.js";
import { getActiveActivity } from "../timed-activities/timed-activities.js";

// ========================================
// Mapping استان‌های فارسی به انگلیسی برای API
// ========================================

const provinceMapping = {
    'البرز': 'Alborz',
    'اردبیل': 'Ardabil',
    'آذربایجان شرقی': 'East Azerbaijan',
    'آذربایجان غربی': 'West Azerbaijan',
    'بوشهر': 'Bushehr',
    'تهران': 'Tehran',
    'چهارمحال و بختیاری': 'Chaharmahal and Bakhtiari',
    'خراسان جنوبی': 'South Khorasan',
    'خراسان رضوی': 'Razavi Khorasan',
    'خراسان شمالی': 'North Khorasan',
    'خوزستان': 'Khuzestan',
    'زنجان': 'Zanjan',
    'سمنان': 'Semnan',
    'سیستان و بلوچستان': 'Sistan and Baluchestan',
    'فارس': 'Fars',
    'قزوین': 'Qazvin',
    'قم': 'Qom',
    'کردستان': 'Kurdistan',
    'کرمان': 'Kerman',
    'کرمانشاه': 'Kermanshah',
    'کهگیلویه و بویراحمد': 'Kohgiluyeh and Boyer-Ahmad',
    'گلستان': 'Golestan',
    'گیلان': 'Gilan',
    'لرستان': 'Lorestan',
    'مازندران': 'Mazandaran',
    'مرکزی': 'Markazi',
    'هرمزگان': 'Hormozgan',
    'همدان': 'Hamedan',
    'یزد': 'Yazd'
};

// ========================================
// تابع تبدیل استان فارسی به انگلیسی
// ========================================

function getProvinceEnglish(province) {
    return provinceMapping[province] || province;
}

// ========================================
// تابع رندر HTML (برای استفاده در صفحه)
// ========================================

export function Clock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourDeg = ((hours % 24) / 24) * 360 + (minutes / 60) * 15 + (seconds / 3600) * 15;
    const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
    const secondDeg = (seconds / 60) * 360;

    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    const province = savedProfile.province || '';
    const initialTemp = province ? 'در حال دریافت...' : '--°C';

    return `
        <section class="clock">
            <div class="clock__container">
                <!-- Session Ring -->
                <div class="clock__ring" id="sessionRing">
                    <div class="clock__ring-inner"></div>
                </div>

                <!-- Clock Face -->
                <div class="clock__face">
                    <!-- 24-Hour Numbers -->
                    <div class="clock__numbers">
                        ${Array.from({ length: 24 }, (_, i) => `
                            <span class="clock__number ${i === hours % 24 ? 'clock__number--active' : ''}" style="--index: ${i}">
                                <span class="clock__number-text">${String(i).padStart(2, '0')}</span>
                            </span>
                        `).join('')}
                    </div>

                    <!-- Minute Markers -->
                    <div class="clock__minutes">
                        ${Array.from({ length: 12 }, (_, i) => {
                            const val = i * 5;
                            const valStr = String(val).padStart(2, '0');
                            const isActive = Math.floor(minutes / 5) === i;
                            return `
                                <span class="clock__minute ${isActive ? 'clock__minute--active' : ''}" style="--index: ${i}">
                                    <span class="clock__minute-dot"></span>
                                    <span class="clock__minute-text">${valStr}</span>
                                </span>
                            `;
                        }).join('')}
                    </div>

                    <!-- Ticks -->
                    <div class="clock__ticks">
                        ${Array.from({ length: 24 }, (_, i) => `
                            <span class="clock__tick" style="--index: ${i}"></span>
                        `).join('')}
                    </div>

                    <!-- Hands -->
                    <div class="clock__hands">
                        <div class="clock__hand clock__hand--hour" id="hourHand"></div>
                        <div class="clock__hand clock__hand--minute" id="minuteHand"></div>
                        <div class="clock__hand clock__hand--second" id="secondHand"></div>
                    </div>

                    <!-- Center -->
                    <div class="clock__center">
                        <div class="clock__center-dot"></div>
                    </div>
                </div>

                <!-- Bottom Info -->
                <div class="clock__bottom">
                    <div class="clock__bottom-right">
                        <span class="clock__digital-hours" id="digitalHours">${String(hours).padStart(2, '0')}</span>
                        <span class="clock__digital-separator">:</span>
                        <span class="clock__digital-minutes" id="digitalMinutes">${String(minutes).padStart(2, '0')}</span>
                        <span class="clock__digital-separator">:</span>
                        <span class="clock__digital-seconds" id="digitalSeconds">${String(seconds).padStart(2, '0')}</span>
                    </div>

                    <div class="clock__bottom-left">
                        <svg class="clock__temp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M14 4a2 2 0 1 0-4 0v9.5a4 4 0 1 0 4 0V4Z"></path>
                            <line x1="12" y1="8" x2="12" y2="14"></line>
                        </svg>
                        <span class="clock__temp" id="clockTemp">${initialTemp}</span>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ========================================
// تابع دریافت دما از API
// ========================================

const API_KEY = 'eee92f52e92fcf64a3bcb6b1c9b73d22';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeather(city) {
    if (!city) {
        console.log('شهری برای دریافت دما مشخص نشده');
        return null;
    }

    try {
        const cityEnglish = getProvinceEnglish(city);
        console.log(`دریافت دما برای: ${city} -> ${cityEnglish}`);

        const url = `${API_URL}?q=${encodeURIComponent(cityEnglish)}&appid=${API_KEY}&units=metric&lang=fa`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`خطا در دریافت دما: ${response.status}`);
        }

        const data = await response.json();
        const temp = Math.round(data.main.temp);

        const tempElement = document.getElementById('clockTemp');
        if (tempElement) {
            tempElement.textContent = `${temp}°C`;
        }

        console.log(`دمای ${city}: ${temp}°C`);
        return temp;
    } catch (error) {
        console.error('خطا در دریافت دما:', error.message);
        const tempElement = document.getElementById('clockTemp');
        if (tempElement) {
            tempElement.textContent = '--°C';
        }
        return null;
    }
}

export function updateWeatherForCity(city) {
    return fetchWeather(city);
}

// ========================================
// Clock Logic - Complete
// ========================================

let clockInterval = null;
let sessionsOverride = null;
let isFrozen = false;
let currentSelectedDate = null;

function getActiveSessions() {
    return sessionsOverride !== null ? sessionsOverride : sessions;
}

function getSessionsForDate(date) {
    if (!date) return getActiveSessions();

    const dateStr = date.toDateString();
    return sessions.filter(s => {
        if (s.date) {
            const sessionDate = new Date(s.date);
            return sessionDate.toDateString() === dateStr;
        }
        return false;
    });
}

function getTodaySessions(sessionsList) {
    if (!sessionsList || sessionsList.length === 0) return [];
    const today = new Date().toDateString();
    return sessionsList.filter(s => {
        if (s.date) {
            const d = new Date(s.date);
            return d.toDateString() === today;
        }
        return true;
    });
}

function getNowDeg() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return ((hours % 24) / 24) * 360 + (minutes / 60) * 15 + (seconds / 3600) * 15;
}

// ========================================
// رندر حلقه سشن‌ها - با پشتیبانی از تاریخ‌های مختلف
// ========================================

function renderSessionRing() {
    const ring = document.getElementById('sessionRing');
    if (!ring) return;

    // اگر تاریخ انتخاب شده وجود نداره یا امروز هست، از منطق عادی استفاده کن
    if (!currentSelectedDate || isToday(currentSelectedDate)) {
        renderNormalRing(ring);
    } else {
        // برای روزهای دیگر، بر اساس تاریخ انتخاب شده رندر کن
        renderDateRing(ring, currentSelectedDate);
    }
}

function isToday(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
}

function isDateInPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
}

function isDateInFuture(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
}

// ========================================
// رندر حلقه عادی (امروز)
// ========================================

function renderNormalRing(ring) {
    const todaySessions = getTodaySessions(getActiveSessions());
    const nowDeg = getNowDeg();

    const sorted = [...todaySessions].sort((a, b) => {
        const aStart = parseFloat(a.startTime.split(':')[0]) + (parseFloat(a.startTime.split(':')[1]) / 60);
        const bStart = parseFloat(b.startTime.split(':')[0]) + (parseFloat(b.startTime.split(':')[1]) / 60);
        return aStart - bStart;
    });

    let gradientParts = [];
    let lastEndDeg = 0;

    for (const session of sorted) {
        const [sH, sM] = session.startTime.split(':').map(Number);
        const [eH, eM] = session.endTime.split(':').map(Number);
        let startHour = sH + (sM / 60);
        let endHour = eH + (eM / 60);
        if (endHour < startHour) endHour += 24;

        let startDeg = (startHour / 24) * 360;
        let endDeg = (endHour / 24) * 360;

        if (startDeg >= nowDeg) break;

        if (endDeg > nowDeg) endDeg = nowDeg;

        if (startDeg > lastEndDeg) {
            gradientParts.push(`#e8edec ${lastEndDeg}deg ${startDeg}deg`);
        }

        gradientParts.push(`${session.color} ${startDeg}deg ${endDeg}deg`);
        lastEndDeg = Math.max(lastEndDeg, endDeg);
    }

    // ========================================
    // فعالیتِ در حال اجرا (اگه باشه) — به‌عنوان یه بازه‌ی
    // «زنده» از لحظه‌ی شروعش تا همین الان، با رنگ خودش.
    // این‌طوری منتظر ثبت‌شدن سشن (پایان فعالیت) نمی‌مونیم؛
    // همون لحظه‌ی «شروع» رنگ روی حلقه ظاهر می‌شه و هر ثانیه
    // (چون timed-activities.js رویداد sessions:changed رو هر
    // ثانیه پخش می‌کنه) بزرگ‌تر می‌شه.
    // ========================================
    const runningActivity = getActiveActivity();
    if (runningActivity && runningActivity.startTime) {
        const start = runningActivity.startTime;
        const startHour = start.getHours() + (start.getMinutes() / 60) + (start.getSeconds() / 3600);
        let runningStartDeg = (startHour / 24) * 360;

        // اگه به هر دلیلی قبل از آخرین بازه‌ی ثبت‌شده باشه (نباید
        // پیش بیاد، ولی برای اطمینان)، از همون‌جا ادامه بده تا
        // تداخل رنگی ایجاد نشه.
        if (runningStartDeg < lastEndDeg) runningStartDeg = lastEndDeg;

        if (runningStartDeg > lastEndDeg) {
            gradientParts.push(`#e8edec ${lastEndDeg}deg ${runningStartDeg}deg`);
        }

        if (nowDeg > runningStartDeg) {
            gradientParts.push(`${runningActivity.color} ${runningStartDeg}deg ${nowDeg}deg`);
            lastEndDeg = nowDeg;
        }
    }

    if (lastEndDeg < nowDeg) {
        gradientParts.push(`#e8edec ${lastEndDeg}deg ${nowDeg}deg`);
    }

    gradientParts.push(`transparent ${nowDeg}deg 360deg`);

    ring.style.background = `conic-gradient(from 0deg, ${gradientParts.join(', ')})`;
}

// ========================================
// رندر حلقه برای یک تاریخ خاص
// ========================================

function renderDateRing(ring, date) {
    const daySessions = getSessionsForDate(date);
    const isPast = isDateInPast(date);
    const isFuture = isDateInFuture(date);

    // اگر روز گذشته است، حلقه کامل پر شده
    if (isPast) {
        if (daySessions.length === 0) {
            ring.style.background = '#e8edec';
            return;
        }

        const sorted = [...daySessions].sort((a, b) => {
            const aStart = parseFloat(a.startTime.split(':')[0]) + (parseFloat(a.startTime.split(':')[1]) / 60);
            const bStart = parseFloat(b.startTime.split(':')[0]) + (parseFloat(b.startTime.split(':')[1]) / 60);
            return aStart - bStart;
        });

        let gradientParts = [];
        let lastEndDeg = 0;

        for (const session of sorted) {
            const [sH, sM] = session.startTime.split(':').map(Number);
            const [eH, eM] = session.endTime.split(':').map(Number);
            let startHour = sH + (sM / 60);
            let endHour = eH + (eM / 60);
            if (endHour < startHour) endHour += 24;

            let startDeg = (startHour / 24) * 360;
            let endDeg = (endHour / 24) * 360;

            if (startDeg > lastEndDeg) {
                gradientParts.push(`#e8edec ${lastEndDeg}deg ${startDeg}deg`);
            }

            gradientParts.push(`${session.color} ${startDeg}deg ${endDeg}deg`);
            lastEndDeg = Math.max(lastEndDeg, endDeg);
        }

        if (lastEndDeg < 360) {
            gradientParts.push(`#e8edec ${lastEndDeg}deg 360deg`);
        }

        ring.style.background = `conic-gradient(from 0deg, ${gradientParts.join(', ')})`;
        return;
    }

    if (isFuture) {
        ring.style.background = 'transparent';
        return;
    }
}

// ========================================
// حلقه منجمد
// ========================================

function renderFrozenRing() {
    const ring = document.getElementById('sessionRing');
    if (!ring) return;

    if (currentSelectedDate && isDateInPast(currentSelectedDate)) {
        ring.style.background = '#e8edec';
        return;
    }

    if (currentSelectedDate && isDateInFuture(currentSelectedDate)) {
        ring.style.background = 'transparent';
        return;
    }

    ring.style.background = '#e8edec';
}

// ========================================
// بروزرسانی عقربه‌ها و دیجیتال
// ========================================

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // اگر روز انتخاب شده با امروز متفاوت است، عقربه‌ها رو ۰۰:۰۰ نگه دار
    if (currentSelectedDate && !isToday(currentSelectedDate)) {
        const hourHand = document.getElementById('hourHand');
        const minuteHand = document.getElementById('minuteHand');
        const secondHand = document.getElementById('secondHand');

        if (hourHand) hourHand.style.transform = 'translateX(-50%) rotate(0deg)';
        if (minuteHand) minuteHand.style.transform = 'translateX(-50%) rotate(0deg)';
        if (secondHand) secondHand.style.transform = 'translateX(-50%) rotate(0deg)';

        const hoursEl = document.getElementById('digitalHours');
        const minutesEl = document.getElementById('digitalMinutes');
        const secondsEl = document.getElementById('digitalSeconds');
        if (hoursEl) hoursEl.textContent = '-';
        if (minutesEl) minutesEl.textContent = '-';
        if (secondsEl) secondsEl.textContent = '-';

        const tempElement = document.getElementById('clockTemp');
        if (tempElement) {
            tempElement.textContent = '--°C';
        }

        renderSessionRing();
        return;
    }

    // برای امروز، عادی کار کن
    const hourDeg = ((hours % 24) / 24) * 360 + (minutes / 60) * 15 + (seconds / 3600) * 15;
    const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
    const secondDeg = (seconds / 60) * 360;

    const hourHand = document.getElementById('hourHand');
    const minuteHand = document.getElementById('minuteHand');
    const secondHand = document.getElementById('secondHand');

    if (hourHand) {
        hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    }
    if (minuteHand) {
        minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    }
    if (secondHand) {
        secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
    }

    document.querySelectorAll('.clock__number').forEach(el => {
        el.classList.remove('clock__number--active');
        const index = parseInt(el.style.getPropertyValue('--index'));
        if (index === hours % 24) {
            el.classList.add('clock__number--active');
        }
    });

    const currentMinuteGroup = Math.floor(minutes / 5);
    document.querySelectorAll('.clock__minute').forEach(el => {
        el.classList.remove('clock__minute--active');
        const index = parseInt(el.style.getPropertyValue('--index'));
        if (index === currentMinuteGroup) {
            el.classList.add('clock__minute--active');
        }
    });

    const hoursEl = document.getElementById('digitalHours');
    const minutesEl = document.getElementById('digitalMinutes');
    const secondsEl = document.getElementById('digitalSeconds');

    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

    renderSessionRing();
}

// ========================================
// شروع و توقف ساعت
// ========================================

export function startClock(sessionsForDay = null) {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }

    isFrozen = false;
    sessionsOverride = sessionsForDay;
    currentSelectedDate = null;

    // بروزرسانی اولیه
    renderSessionRing();
    updateClock();

    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    if (savedProfile.province) {
        setTimeout(() => {
            fetchWeather(savedProfile.province);
        }, 300);
    }

    clockInterval = setInterval(updateClock, 1000);
}

export function stopClock() {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }
}

export function updateClockSessions(sessionsForDay) {
    sessionsOverride = sessionsForDay;
    renderSessionRing();
}

export function initClock(sessionsForDay = null) {
    startClock(sessionsForDay);
}

// ========================================
// حالت «روز دیگر» - متوقف کردن ساعت
// ========================================

function freezeClockForDay(date) {
    stopClock();
    isFrozen = true;
    currentSelectedDate = date;

    const hourHand = document.getElementById('hourHand');
    const minuteHand = document.getElementById('minuteHand');
    const secondHand = document.getElementById('secondHand');

    if (hourHand) hourHand.style.transform = 'translateX(-50%) rotate(0deg)';
    if (minuteHand) minuteHand.style.transform = 'translateX(-50%) rotate(0deg)';
    if (secondHand) secondHand.style.transform = 'translateX(-50%) rotate(0deg)';

    document.querySelectorAll('.clock__number').forEach(el => {
        el.classList.remove('clock__number--active');
        const index = parseInt(el.style.getPropertyValue('--index'));
        if (index === 0) el.classList.add('clock__number--active');
    });

    document.querySelectorAll('.clock__minute').forEach(el => {
        el.classList.remove('clock__minute--active');
        const index = parseInt(el.style.getPropertyValue('--index'));
        if (index === 0) el.classList.add('clock__minute--active');
    });

    const hoursEl = document.getElementById('digitalHours');
    const minutesEl = document.getElementById('digitalMinutes');
    const secondsEl = document.getElementById('digitalSeconds');

    if (hoursEl) hoursEl.textContent = '-';
    if (minutesEl) minutesEl.textContent = '-';
    if (secondsEl) secondsEl.textContent = '-';

    const tempElement = document.getElementById('clockTemp');
    if (tempElement) {
        tempElement.textContent = '--°C';
    }

    renderSessionRing();
}

// ========================================
// گوش دادن به انتخاب روز از تقویم
// ========================================

document.addEventListener('day:selected', (event) => {
    const { isToday, gy, gm, gd } = event.detail;

    if (isToday) {
        currentSelectedDate = null;
        if (isFrozen || !clockInterval) {
            startClock();
        }
    } else {
        const selectedDate = new Date(gy, gm - 1, gd);
        freezeClockForDay(selectedDate);
    }
});

// ========================================
// گوش دادن به تغییرات سشن‌ها برای بروزرسانی حلقه
// ========================================

document.addEventListener('sessions:changed', () => {
    console.log('🔄 ساعت: تغییرات سشن‌ها دریافت شد، حلقه بروزرسانی میشود');
    // اگر ساعت فعال هست یا منجمد شده، حلقه رو بروزرسانی کن
    if (clockInterval) {
        renderSessionRing();
    } else if (isFrozen) {
        renderSessionRing();
    }
});

// ========================================
// قرار دادن توابع در دسترس global
// ========================================

if (typeof window !== 'undefined') {
    window.updateWeatherForCity = updateWeatherForCity;
    window.fetchWeather = fetchWeather;
    window.getProvinceEnglish = getProvinceEnglish;
}