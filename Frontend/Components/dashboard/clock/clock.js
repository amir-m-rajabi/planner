// File: Components/dashboard/clock/clock.js

import { sessions } from "../sessions/sessions.js";
import { getActiveActivity } from "../timed-activities/timed-activities.js";

// ============================================================
// Province Mapping (Persian to English)
// ============================================================

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

function getProvinceEnglish(province) {
    return provinceMapping[province] || province;
}

// ============================================================
// Render HTML
// ============================================================

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

// ============================================================
// Weather API
// ============================================================

const API_KEY = 'eee92f52e92fcf64a3bcb6b1c9b73d22';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeather(city) {
    if (!city) return null;

    try {
        const cityEnglish = getProvinceEnglish(city);
        const url = `${API_URL}?q=${encodeURIComponent(cityEnglish)}&appid=${API_KEY}&units=metric&lang=fa`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();
        const temp = Math.round(data.main.temp);

        const tempElement = document.getElementById('clockTemp');
        if (tempElement) {
            tempElement.textContent = `${temp}°C`;
        }

        return temp;
    } catch (error) {
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

// ============================================================
// Clock Logic
// ============================================================

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

// ============================================================
// Date Helpers
// ============================================================

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

// ============================================================
// Session Ring Renderer - Today
// ============================================================

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

    // Active running activity (live)
    const runningActivity = getActiveActivity();
    if (runningActivity && runningActivity.startTime) {
        const start = runningActivity.startTime;
        const startHour = start.getHours() + (start.getMinutes() / 60) + (start.getSeconds() / 3600);
        let runningStartDeg = (startHour / 24) * 360;

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

// ============================================================
// Session Ring Renderer - Specific Date
// ============================================================

function renderDateRing(ring, date) {
    const daySessions = getSessionsForDate(date);
    const isPast = isDateInPast(date);
    const isFuture = isDateInFuture(date);

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

// ============================================================
// Session Ring Renderer - Main
// ============================================================

function renderSessionRing() {
    const ring = document.getElementById('sessionRing');
    if (!ring) return;

    if (!currentSelectedDate || isToday(currentSelectedDate)) {
        renderNormalRing(ring);
    } else {
        renderDateRing(ring, currentSelectedDate);
    }
}

// ============================================================
// Update Clock Hands & Digital Display
// ============================================================

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // If selected date is not today, freeze at 00:00
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

    // Normal update for today
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

// ============================================================
// Start / Stop Clock
// ============================================================

export function startClock(sessionsForDay = null) {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }

    isFrozen = false;
    sessionsOverride = sessionsForDay;
    currentSelectedDate = null;

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

// ============================================================
// Freeze Clock for a Specific Day
// ============================================================

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

// ============================================================
// Listen for Day Selection from Calendar
// ============================================================

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

// ============================================================
// Listen for Session Changes
// ============================================================

document.addEventListener('sessions:changed', () => {
    if (clockInterval) {
        renderSessionRing();
    } else if (isFrozen) {
        renderSessionRing();
    }
});

document.addEventListener('timed-activities:changed', () => {
    if (clockInterval) {
        renderSessionRing();
    } else if (isFrozen) {
        renderSessionRing();
    }
});

// ============================================================
// Global Exports for Window
// ============================================================

if (typeof window !== 'undefined') {
    window.updateWeatherForCity = updateWeatherForCity;
    window.fetchWeather = fetchWeather;
    window.getProvinceEnglish = getProvinceEnglish;
}