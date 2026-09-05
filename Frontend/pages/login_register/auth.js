// File: /Frontend/pages/login_register/auth.js

// ============================================================
// Province Data
// ============================================================

const PROVINCE_NAMES = {
    "alborz": "البرز",
    "ardabil": "اردبیل",
    "azarbaijan-east": "آذربایجان شرقی",
    "azarbaijan-west": "آذربایجان غربی",
    "bushehr": "بوشهر",
    "tehran": "تهران",
    "chaharmahal": "چهارمحال و بختیاری",
    "south-khorasan": "خراسان جنوبی",
    "razavi-khorasan": "خراسان رضوی",
    "north-khorasan": "خراسان شمالی",
    "khuzestan": "خوزستان",
    "zanjan": "زنجان",
    "semnan": "سمنان",
    "sistan-baluchestan": "سیستان و بلوچستان",
    "fars": "فارس",
    "qazvin": "قزوین",
    "qom": "قم",
    "kurdistan": "کردستان",
    "kerman": "کرمان",
    "kermanshah": "کرمانشاه",
    "golestan": "گلستان",
    "gilan": "گیلان",
    "lorestan": "لرستان",
    "mazandaran": "مازندران",
    "markazi": "مرکزی",
    "hormozgan": "هرمزگان",
    "hamedan": "همدان",
    "yazd": "یزد"
};

// ============================================================
// State Management
// ============================================================

let currentMode = "login"; // "login" | "register"

// ============================================================
// Utility Functions
// ============================================================

/**
 * Validate username format (3-20 chars, alphanumeric and underscore)
 */
function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

/**
 * Validate password strength (min 8 chars, letters and numbers)
 */
function isValidPassword(password) {
    if (password.length < 8) return false;
    
    const validCharsRegex = /^[a-zA-Z0-9!@#$%^&*()_\-+=\[\]{}:;,.?~]+$/;
    if (!validCharsRegex.test(password)) return false;
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) return false;
    
    return true;
}

/**
 * Show error message for a specific field
 */
function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const existingError = input.parentElement.querySelector('.auth-field__error');
    if (existingError) existingError.remove();
    
    if (message) {
        const errorEl = document.createElement('span');
        errorEl.className = 'auth-field__error';
        errorEl.textContent = message;
        input.parentElement.appendChild(errorEl);
        input.style.borderColor = '#ef4444';
    } else {
        input.style.borderColor = '';
    }
}

/**
 * Clear all error messages from the form
 */
function clearAllErrors() {
    document.querySelectorAll('.auth-field__error').forEach(el => el.remove());
    document.querySelectorAll('.auth-field input, .auth-field select').forEach(el => {
        el.style.borderColor = '';
    });
}

// ============================================================
// Component - Full Auth Page
// ============================================================

export function AuthView() {
    return `
        <main class="auth-page">
            <!-- Brand Side -->
            <section class="auth-brand">
                <div class="auth-brand__content">
                    <div class="auth-brand__logo">Planner</div>

                    <h1 class="auth-brand__title">زمانت را بهتر مدیریت کن.</h1>

                    <p class="auth-brand__description">
                        فعالیت‌ها، زمان و برنامه روزانه‌ات را در یک فضای ساده و منظم مدیریت کن.
                    </p>

                    <!-- Decorative Clock -->
                    <div class="auth-brand__clock">
                        <div class="auth-clock__numbers">
                            <span>00</span>
                            <span>06</span>
                            <span>12</span>
                            <span>18</span>
                        </div>

                        <div class="auth-clock__center"></div>

                        <div class="auth-clock__hand auth-clock__hand--hour"></div>
                        <div class="auth-clock__hand auth-clock__hand--minute"></div>
                    </div>
                </div>
            </section>

            <!-- Auth Form Side -->
            <section class="auth-panel">
                <div class="auth-card">
                    <!-- Header -->
                    <div class="auth-card__header">
                        <h2 class="auth-card__title" id="authCardTitle">خوش آمدی 👋</h2>
                        <p class="auth-card__subtitle" id="authCardSubtitle">وارد حساب Planner خودت شو.</p>
                    </div>

                    <!-- Mode Switch -->
                    <div class="auth-switch">
                        <button
                            type="button"
                            class="auth-switch__button auth-switch__button--active"
                            data-auth-mode="login"
                            id="loginTabBtn"
                        >
                            ورود
                        </button>

                        <button
                            type="button"
                            class="auth-switch__button"
                            data-auth-mode="register"
                            id="registerTabBtn"
                        >
                            ثبت‌نام
                        </button>
                    </div>

                    <!-- Login Form -->
                    <form class="auth-form auth-form--login" id="login-form" novalidate>
                        <div class="auth-field">
                            <label for="login-identity"> نام کاربری </label>
                            <input
                                type="text"
                                id="login-identity"
                                name="identity"
                                placeholder="username"
                                autocomplete="off"
                            />
                        </div>

                        <div class="auth-field">
                            <div class="auth-field__label-row">
                                <label for="login-password"> رمز عبور </label>
                                <button type="button" class="auth-field__forgot" id="forgotPasswordBtn">
                                    فراموشی رمز؟
                                </button>
                            </div>
                            <div class="auth-field__password-wrapper">
                                <input
                                    type="password"
                                    id="login-password"
                                    name="password"
                                    placeholder="رمز عبور خود را وارد کنید"
                                    autocomplete="off"
                                />
                                <button type="button" class="auth-field__toggle-password" data-target="login-password" aria-label="نمایش رمز عبور">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button type="submit" class="auth-submit">ورود به Planner</button>
                    </form>
                    
                    <!-- Register Form -->
                    <form class="auth-form auth-form--register" id="register-form" hidden novalidate>
                        <div class="auth-form__row">
                            <div class="auth-field">
                                <label for="register-first-name"> نام </label>
                                <input
                                    type="text"
                                    id="register-first-name"
                                    name="firstName"
                                    placeholder="نام"
                                    autocomplete="off"
                                />
                            </div>
                    
                            <div class="auth-field">
                                <label for="register-last-name"> نام خانوادگی </label>
                                <input
                                    type="text"
                                    id="register-last-name"
                                    name="lastName"
                                    placeholder="نام خانوادگی"
                                    autocomplete="off"
                                />
                            </div>
                        </div>
                    
                        <div class="auth-field">
                            <label for="register-username"> نام کاربری </label>
                            <input
                                type="text"
                                id="register-username"
                                name="username"
                                placeholder="حداقل ۳ کاراکتر (انگلیسی)"
                                autocomplete="off"
                            />
                        </div>
                    
                        <div class="auth-form__row">
                            <div class="auth-field">
                                <label for="register-province"> استان </label>
                                <select id="register-province" name="province">
                                    <option value="">انتخاب استان</option>
                                    ${Object.entries(PROVINCE_NAMES).map(([key, value]) => `
                                        <option value="${key}">${value}</option>
                                    `).join('')}
                                </select>
                            </div>
                                    
                            <div class="auth-field">
                                <label for="register-gender"> جنسیت </label>
                                <select id="register-gender" name="gender">
                                    <option value="">انتخاب جنسیت</option>
                                    <option value="male">آقا</option>
                                    <option value="female">خانم</option>
                                </select>
                            </div>
                        </div>
                                    
                        <div class="auth-field">
                            <label for="register-password"> رمز عبور </label>
                            <div class="auth-field__password-wrapper">
                                <input
                                    type="password"
                                    id="register-password"
                                    name="password"
                                    placeholder="حداقل ۸ کاراکتر (حروف و عدد)"
                                    autocomplete="off"
                                />
                                <button type="button" class="auth-field__toggle-password" data-target="register-password" aria-label="نمایش رمز عبور">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                            </div>
                        </div>
                                    
                        <div class="auth-field">
                            <label for="register-password-confirm"> تکرار رمز عبور </label>
                            <div class="auth-field__password-wrapper">
                                <input
                                    type="password"
                                    id="register-password-confirm"
                                    name="passwordConfirm"
                                    placeholder="رمز عبور را دوباره وارد کنید"
                                    autocomplete="off"
                                />
                                <button type="button" class="auth-field__toggle-password" data-target="register-password-confirm" aria-label="نمایش رمز عبور">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                            </div>
                        </div>
                                    
                        <label class="auth-checkbox">
                            <input type="checkbox" name="terms" id="termsCheckbox" />
                            <span> قوانین و شرایط استفاده را می‌پذیرم. </span>
                        </label>
                                    
                        <button type="submit" class="auth-submit">ساخت حساب</button>
                    </form>

                    <!-- Footer -->
                    <p class="auth-card__footer">
                        با استفاده از Planner، مدیریت زمانت را ساده‌تر کن.
                    </p>
                </div>
            </section>
        </main>
    `;
}

// ============================================================
// Password Toggle Handler
// ============================================================

function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.auth-field__toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            
            if (!input) return;
            
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `;
                this.setAttribute('aria-label', 'مخفی کردن رمز عبور');
            } else {
                input.type = 'password';
                this.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
                this.setAttribute('aria-label', 'نمایش رمز عبور');
            }
        });
    });
}

// ============================================================
// Auth Mode Switch Handler
// ============================================================

function setupAuthSwitch() {
    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const cardTitle = document.getElementById('authCardTitle');
    const cardSubtitle = document.getElementById('authCardSubtitle');
    
    if (!loginTabBtn || !registerTabBtn || !loginForm || !registerForm) return;
    
    function switchMode(mode) {
        currentMode = mode;
        clearAllErrors();
        
        if (mode === 'login') {
            loginTabBtn.classList.add('auth-switch__button--active');
            registerTabBtn.classList.remove('auth-switch__button--active');
            loginForm.hidden = false;
            registerForm.hidden = true;
            cardTitle.textContent = 'خوش آمدی 👋';
            cardSubtitle.textContent = 'وارد حساب Planner خودت شو.';
        } else {
            registerTabBtn.classList.add('auth-switch__button--active');
            loginTabBtn.classList.remove('auth-switch__button--active');
            registerForm.hidden = false;
            loginForm.hidden = true;
            cardTitle.textContent = 'ثبت‌نام در Planner';
            cardSubtitle.textContent = 'حساب جدید بساز و شروع کن.';
        }
    }
    
    loginTabBtn.addEventListener('click', () => switchMode('login'));
    registerTabBtn.addEventListener('click', () => switchMode('register'));
}

// ============================================================
// Login Form Handler
// ============================================================

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearAllErrors();
        
        const identity = document.getElementById('login-identity').value.trim();
        const password = document.getElementById('login-password').value;
        
        let hasError = false;
        
        if (!identity) {
            showFieldError('login-identity', 'لطفا نام کاربری را وارد کنید');
            hasError = true;
        }
        
        if (!password) {
            showFieldError('login-password', 'لطفا رمز عبور را وارد کنید');
            hasError = true;
        }
        
        if (hasError) return;
        
        try {
            const response = await fetch('https://planner-api-jw63.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: identity,
                    password: password
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'خطا در ورود');
            }
            
            const user = result.user;
            
            const userProfile = {
                id: user.id,
                username: user.username,
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                province: user.province || '',
                gender: user.gender || '',
                email: user.email || '',
                avatar: user.avatar || '',
                emailVerified: user.email_verified || false,
                isAdmin: user.isAdmin || false
            };
            
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            
            localStorage.setItem('auth:session', JSON.stringify({
                userId: user.id,
                username: user.username,
                isLoggedIn: true,
                isAdmin: user.isAdmin || false,
                loginTime: new Date().toISOString()
            }));
            
            document.dispatchEvent(new CustomEvent('auth:changed'));
            
            window.location.href = '/Frontend/index.html';
            
        } catch (error) {
            if (error.message.includes('Invalid username or password')) {
                showFieldError('login-identity', '❌ نام کاربری یا رمز عبور اشتباه است');
                showFieldError('login-password', '');
            } else {
                alert('خطا: ' + error.message);
            }
        }
    });
}

// ============================================================
// Register Form Handler
// ============================================================

function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearAllErrors();
        
        const firstName = document.getElementById('register-first-name').value.trim();
        const lastName = document.getElementById('register-last-name').value.trim();
        const username = document.getElementById('register-username').value.trim();
        const province = document.getElementById('register-province').value;
        const gender = document.getElementById('register-gender').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        const terms = document.getElementById('termsCheckbox').checked;
        
        let hasError = false;
        
        if (!firstName) {
            showFieldError('register-first-name', 'نام را وارد کنید');
            hasError = true;
        }
        
        if (!lastName) {
            showFieldError('register-last-name', 'نام خانوادگی را وارد کنید');
            hasError = true;
        }
        
        if (!username) {
            showFieldError('register-username', 'نام کاربری را وارد کنید');
            hasError = true;
        } else if (!isValidUsername(username)) {
            showFieldError('register-username', 'نام کاربری باید ۳ تا ۲۰ کاراکتر انگلیسی، عدد یا _ باشد');
            hasError = true;
        }
        
        if (!province) {
            showFieldError('register-province', 'استان را انتخاب کنید');
            hasError = true;
        }
        
        if (!gender) {
            showFieldError('register-gender', 'جنسیت را انتخاب کنید');
            hasError = true;
        }
        
        if (!password) {
            showFieldError('register-password', 'رمز عبور را وارد کنید');
            hasError = true;
        } else if (!isValidPassword(password)) {
            showFieldError('register-password', 'رمز عبور باید حداقل ۸ کاراکتر شامل حروف و اعداد باشد');
            hasError = true;
        }
        
        if (password && password !== passwordConfirm) {
            showFieldError('register-password-confirm', 'رمز عبور و تکرار آن مطابقت ندارند');
            hasError = true;
        }
        
        if (!terms) {
            alert('لطفا قوانین و شرایط استفاده را بپذیرید');
            hasError = true;
        }
        
        if (hasError) return;
        
        try {
            const userData = {
                username: username,
                password_hash: password,
                first_name: firstName,
                last_name: lastName,
                province: province,
                gender: gender
            };
            
            const response = await fetch('https://planner-api-jw63.onrender.com/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'خطا در ثبت‌نام');
            }
            
            const userProfile = {
                id: result.id,
                username: result.username,
                firstName: result.first_name,
                lastName: result.last_name,
                province: result.province,
                gender: result.gender,
                email: result.email || '',
                avatar: result.avatar || '',
                emailVerified: result.email_verified || false
            };
            
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            
            localStorage.setItem('auth:session', JSON.stringify({
                userId: result.id,
                username: result.username,
                isLoggedIn: true,
                loginTime: new Date().toISOString()
            }));
            
            document.dispatchEvent(new CustomEvent('auth:changed'));
            
            window.location.href = '/Frontend/index.html';
            
        } catch (error) {
            alert(error.message || 'خطا در ارتباط با سرور');
        }
    });
}

// ============================================================
// Forgot Password Handler
// ============================================================

function setupForgotPassword() {
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    if (!forgotBtn) return;
    
    forgotBtn.addEventListener('click', function() {
        alert('لینک بازیابی رمز عبور به ایمیل شما ارسال خواهد شد.');
    });
}

// ============================================================
// Live Clock
// ============================================================

function setupLiveClock() {
    const hourHand = document.querySelector('.auth-clock__hand--hour');
    const minuteHand = document.querySelector('.auth-clock__hand--minute');
    
    if (!hourHand || !minuteHand) return;
    
    function updateClock() {
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        const hourDeg = (hours + minutes / 60) * 30;
        const minuteDeg = (minutes + seconds / 60) * 6;
        
        hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
        minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// ============================================================
// Page Initialization
// ============================================================

export function initAuthPage() {
    setupPasswordToggles();
    setupAuthSwitch();
    setupLoginForm();
    setupRegisterForm();
    setupForgotPassword();
    setupLiveClock();
}

// ============================================================
// Public API
// ============================================================

export function logout() {
    localStorage.removeItem('auth:session');
    localStorage.removeItem('userProfile');
    
    document.dispatchEvent(new CustomEvent('auth:changed'));
    
    window.location.href = '/Frontend/index.html';
}

export function isLoggedIn() {
    const session = JSON.parse(localStorage.getItem('auth:session')) || {};
    return Boolean(session.isLoggedIn);
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('auth:user')) || null;
}