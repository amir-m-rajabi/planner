import { sessions } from "../sessions/sessions.js";

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

    // ====== محاسبه درجه‌ها برای ۲۴ ساعت ======
    const hourDeg = ((hours % 24) / 24) * 360 + (minutes / 60) * 15 + (seconds / 3600) * 15;
    const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
    const secondDeg = (seconds / 60) * 360;

    // دریافت استان از localStorage برای نمایش دما
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
                        <div class="clock__hand clock__hand--hour" id="hourHand" style="transform: translateX(-50%) rotate(${hourDeg}deg)"></div>
                        <div class="clock__hand clock__hand--minute" id="minuteHand" style="transform: translateX(-50%) rotate(${minuteDeg}deg)"></div>
                        <div class="clock__hand clock__hand--second" id="secondHand" style="transform: translateX(-50%) rotate(${secondDeg}deg)"></div>
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
        // تبدیل نام استان به انگلیسی
        const cityEnglish = getProvinceEnglish(city);
        console.log(`دریافت دما برای: ${city} -> ${cityEnglish}`);
        
        const url = `${API_URL}?q=${encodeURIComponent(cityEnglish)}&appid=${API_KEY}&units=metric&lang=fa`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`خطا در دریافت دما: ${response.status}`);
        }
        
        const data = await response.json();
        const temp = Math.round(data.main.temp);
        
        // به‌روزرسانی دما در عنصر
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

// ========================================
// تابع بروزرسانی دما (برای استفاده از بیرون)
// ========================================

export function updateWeatherForCity(city) {
    return fetchWeather(city);
}

// ========================================
// Clock Logic - Complete
// ========================================

let clockInterval = null;
let sessionsOverride = null;

function getActiveSessions() {
    return sessionsOverride !== null ? sessionsOverride : sessions;
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

function renderSessionRing() {
    const ring = document.getElementById('sessionRing');
    if (!ring) return;

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

    if (lastEndDeg < nowDeg) {
        gradientParts.push(`#e8edec ${lastEndDeg}deg ${nowDeg}deg`);
    }

    gradientParts.push(`transparent ${nowDeg}deg 360deg`);

    ring.style.background = `conic-gradient(from 0deg, ${gradientParts.join(', ')})`;
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

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

export function startClock(sessionsForDay = null) {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }

    sessionsOverride = sessionsForDay;
    renderSessionRing();
    updateClock();

    // دریافت دما برای استان کاربر
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
// قرار دادن توابع در دسترس global
// ========================================

if (typeof window !== 'undefined') {
    window.updateWeatherForCity = updateWeatherForCity;
    window.fetchWeather = fetchWeather;
    window.getProvinceEnglish = getProvinceEnglish;
}