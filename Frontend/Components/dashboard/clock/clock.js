import { sessions } from "../sessions/sessions.js";

// ========================================
// تابع رندر HTML (برای استفاده در صفحه)
// ========================================
export function Clock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // ====== محاسبه درجه‌ها برای ۲۴ ساعت ======
    // نکته: صفر درجه = رو به بالا (۱۲/۰۰) چون transform-origin عقربه‌ها bottom است
    // و اعداد صفحه هم با همین مرجع (بدون آفست) چیده شده‌اند.
    const hourDeg = ((hours % 24) / 24) * 360 + (minutes / 60) * 15 + (seconds / 3600) * 15;
    const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
    const secondDeg = (seconds / 60) * 360;

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
                        <span class="clock__temp" id="clockTemp">۲۲°C</span>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// ========================================
// Clock Logic - Complete
// ========================================

let clockInterval = null;

// اگه یه روز خاص از تقویم انتخاب شده باشه (برای بعداً)، سشن‌های همون روز اینجا ذخیره می‌شه.
// وقتی null باشه، یعنی "امروز" و از دیتای زنده‌ی sessions.js استفاده می‌کنیم.
let sessionsOverride = null;

// همیشه لیست سشنی که باید نمایش داده بشه رو برمی‌گردونه:
// یا override دستی (روز انتخاب‌شده از تقویم)، یا دیتای زنده‌ی امروز.
function getActiveSessions() {
    return sessionsOverride !== null ? sessionsOverride : sessions;
}

// ========================================
// توابع کمکی
// ========================================

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

// درجه‌ی لحظه‌ی الان روی حلقه‌ی ۲۴ ساعته (هم‌مبنا با عقربه‌ی ساعت)
function getNowDeg() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return ((hours % 24) / 24) * 360 + (minutes / 60) * 15 + (seconds / 3600) * 15;
}

// ========================================
// رندر حلقه سشن‌ها
// ========================================
// منطق:
// ۱) حلقه فقط تا لحظه‌ی الان "شکل می‌گیره" (پیشرفت روز) — از الان تا آخر روز شفافه.
// ۲) بازه‌هایی از روزِ سپری‌شده که سشنی توش ثبت نشده، رنگ خنثی می‌گیرن.
// ۳) بازه‌هایی که سشن دارن، با رنگ همون فعالیت نمایش داده می‌شن.
// ۴) با گذشت نیمه‌شب، nowDeg دوباره از ۰ شروع می‌شه و حلقه به‌طور طبیعی ریست می‌شه.
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
    let lastEndDeg = 0; // تا کجای حلقه تا الان "پر" شده (چه رنگی چه خنثی)

    for (const session of sorted) {
        const [sH, sM] = session.startTime.split(':').map(Number);
        const [eH, eM] = session.endTime.split(':').map(Number);
        let startHour = sH + (sM / 60);
        let endHour = eH + (eM / 60);
        if (endHour < startHour) endHour += 24;

        let startDeg = (startHour / 24) * 360;
        let endDeg = (endHour / 24) * 360;

        // سشن‌هایی که هنوز شروع نشدن (در آینده‌ی روزن) نمایش داده نمی‌شن
        if (startDeg >= nowDeg) break;

        // اگه سشن هنوز در حال اجراست (یا تا بعد از الان ادامه داره)، فقط تا لحظه‌ی الان کشیده بشه
        if (endDeg > nowDeg) endDeg = nowDeg;

        // فاصله‌ی بین آخرین نقطه‌ی پر شده و شروع این سشن = بدون فعالیت (رنگ خنثی)
        if (startDeg > lastEndDeg) {
            gradientParts.push(`#e8edec ${lastEndDeg}deg ${startDeg}deg`);
        }

        gradientParts.push(`${session.color} ${startDeg}deg ${endDeg}deg`);
        lastEndDeg = Math.max(lastEndDeg, endDeg);
    }

    // از آخرین سشن تا لحظه‌ی الان = بدون فعالیت (رنگ خنثی)
    if (lastEndDeg < nowDeg) {
        gradientParts.push(`#e8edec ${lastEndDeg}deg ${nowDeg}deg`);
    }

    // از الان تا آخر روز = هنوز اتفاق نیفتاده، پس شفاف بمونه (حلقه هنوز شکل نگرفته)
    gradientParts.push(`transparent ${nowDeg}deg 360deg`);

    ring.style.background = `conic-gradient(from 0deg, ${gradientParts.join(', ')})`;
}

// ========================================
// به‌روزرسانی عقربه‌ها و هایلایت‌ها
// ========================================

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // ====== محاسبه درجه‌ها (بدون آفست -90، چون ۱۲/۰۰ = بالا = صفر درجه) ======
    const hourDeg = ((hours % 24) / 24) * 360 + (minutes / 60) * 15 + (seconds / 3600) * 15;
    const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
    const secondDeg = (seconds / 60) * 360;

    // ====== به‌روزرسانی عقربه‌ها ======
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

    // ====== هایلایت‌ها ======
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

    // ====== ساعت دیجیتال ======
    const hoursEl = document.getElementById('digitalHours');
    const minutesEl = document.getElementById('digitalMinutes');
    const secondsEl = document.getElementById('digitalSeconds');

    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

    // ====== پیشرفت حلقه‌ی سشن‌ها با گذر زمان ======
    renderSessionRing();
}

// ========================================
// شروع/توقف
// ========================================

// sessionsForDay: اختیاری — وقتی بعداً از تقویم یه روز خاص انتخاب شد، سشن‌های همون روز رو بده.
// اگه چیزی ندی، خودکار از دیتای زنده‌ی امروز (sessions.js) استفاده می‌کنه.
export function startClock(sessionsForDay = null) {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }

    sessionsOverride = sessionsForDay;
    renderSessionRing();
    updateClock();

    clockInterval = setInterval(updateClock, 1000);
}

export function stopClock() {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }
}

// برای تغییر روز نمایش داده‌شده (مثلاً بعد از کلیک روی یه روز توی تقویم).
// sessionsForDay را null بده تا دوباره برگرده به دیتای زنده‌ی امروز.
export function updateClockSessions(sessionsForDay) {
    sessionsOverride = sessionsForDay;
    renderSessionRing();
}

export function initClock(sessionsForDay = null) {
    startClock(sessionsForDay);
}