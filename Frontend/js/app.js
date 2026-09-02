import { Header } from "../Components/header/header.js";
import { router } from "./router.js";
import { setupNavigation } from "./navigation.js";
import { isLoggedIn, AuthView, initAuthPage } from "../pages/login_register/auth.js";

const app = document.querySelector("#app");

// ========================================
// تابع تشخیص مسیرهای auth
// ========================================

function isAuthPath(path) {
    return path === '/login' || path === '/register' || path === '/auth' || 
           path === '/Frontend/login' || path === '/Frontend/register' || path === '/Frontend/auth';
}

// ========================================
// تابع رندر کردن صفحه بر اساس مسیر
// ========================================

function renderApp() {
    const path = window.location.pathname;
    const isAuth = isAuthPath(path);
    
    // پاک کردن کامل app
    app.innerHTML = '';
    
    if (isAuth) {
        // اگر در صفحه auth هستیم، فقط محتوای اصلی رو نمایش بده (بدون هدر)
        app.innerHTML = `
            <main id="page-content" class="auth-page-content"></main>
        `;
    } else {
        // در سایر صفحات، هدر رو نمایش بده
        app.innerHTML = `
            ${Header()}
            <main id="page-content"></main>
        `;
        
        // تنظیم ناوبری (فقط وقتی هدر وجود داره)
        setupNavigation();
    }
    
    // اجرای روتینگ (محتوای صفحه رو پر میکنه)
    router();
    
    // به‌روزرسانی دکمه‌های هدر (اگه هدر وجود داشته باشه)
    setTimeout(() => {
        updateHeaderAuthButtons();
    }, 50);
}

// ========================================
// به‌روزرسانی دکمه‌های ورود/ثبت‌نام در هدر
// ========================================

function updateHeaderAuthButtons() {
    const loggedIn = isLoggedIn();
    
    const authButtons = document.querySelector('.auth-buttons');
    const profileWrapper = document.querySelector('.profile-wrapper');
    
    if (authButtons) {
        authButtons.style.display = loggedIn ? 'none' : '';
    }
    if (profileWrapper) {
        profileWrapper.style.display = loggedIn ? '' : 'none';
    }
}

// ========================================
// گوش دادن به تغییرات ورود/خروج
// ========================================

document.addEventListener('auth:changed', () => {
    // رندر مجدد کل اپ
    renderApp();
    
    // اگر کاربر لاگین کرد و در صفحه auth هست، به داشبورد برو
    if (isLoggedIn()) {
        const path = window.location.pathname;
        if (isAuthPath(path)) {
            window.location.href = '/';
        }
    }
});

// ========================================
// گوش دادن به کلیک روی لینک‌های هدر برای ناوبری
// ========================================

document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-route]');
    if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
            event.preventDefault();
            window.history.pushState({}, '', href);
            renderApp();
        }
    }
});

// ========================================
// گوش دادن به تغییرات مسیر (back/forward)
// ========================================

window.addEventListener('popstate', () => {
    renderApp();
});

// ========================================
// اجرای اولیه
// ========================================

renderApp();

// صادر کردن تابع برای استفاده در router
export { updateHeaderAuthButtons, renderApp };