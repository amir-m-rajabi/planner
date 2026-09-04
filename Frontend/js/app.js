// File: Frontend/js/app.js

import { Header } from "../Components/header/header.js";
import { router } from "./router.js";
import { setupNavigation } from "./navigation.js";
import { isLoggedIn, AuthView, initAuthPage } from "../pages/login_register/auth.js";
import { startHeaderTimer, stopHeaderTimer, refreshHeaderTimerUI } from "../Components/header/header-timer.js";
import { updateActiveNav } from "../Components/header/header.js";

const app = document.querySelector("#app");

// ============================================================
// Auth Path Detection
// ============================================================

function isAuthPath(path) {
    return path === '/login' || path === '/register' || path === '/auth' || 
           path === '/Frontend/login' || path === '/Frontend/register' || path === '/Frontend/auth';
}

// ============================================================
// Update Header Avatar
// ============================================================

function updateHeaderAvatar() {
    const headerAvatar = document.getElementById('headerProfileImage');
    if (!headerAvatar) return;

    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    const gender = userProfile.gender || 'male';
    const defaultAvatar = gender === 'female'
        ? '/Frontend/assets/images/profile-default-female.png'
        : '/Frontend/assets/images/profile-default-male.png';

    if (userProfile.avatar) {
        if (userProfile.avatar.startsWith('/uploads/')) {
            headerAvatar.src = `http://localhost:3000${userProfile.avatar}`;
        } else {
            headerAvatar.src = userProfile.avatar;
        }
    } else {
        headerAvatar.src = defaultAvatar;
    }
}

// ============================================================
// Update Header Auth Buttons
// ============================================================

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

// ============================================================
// Restore Header Timer
// ============================================================

function restoreHeaderTimer() {
    const savedActivity = localStorage.getItem('activeActivity');

    if (savedActivity) {
        try {
            const activity = JSON.parse(savedActivity);

            if (!activity.startTime) {
                localStorage.removeItem('activeActivity');
                return;
            }

            const startTime = new Date(activity.startTime);

            if (isNaN(startTime.getTime())) {
                localStorage.removeItem('activeActivity');
                return;
            }

            const now = new Date();
            const diff = (now - startTime) / (1000 * 60 * 60);

            if (diff < 24 && diff > 0) {
                startHeaderTimer({
                    id: Number(activity.id),
                    title: activity.title,
                    color: activity.color,
                    startTime: startTime,
                    sessionId: Number(activity.sessionId)
                });
            } else {
                localStorage.removeItem('activeActivity');
            }
        } catch (e) {
            localStorage.removeItem('activeActivity');
        }
    } else {
        const timer = document.querySelector("#headerTimer");
        if (timer) timer.hidden = true;
    }
}

// ============================================================
// Render App
// ============================================================

function renderApp() {
    const path = window.location.pathname;
    const isAuth = isAuthPath(path);

    app.innerHTML = '';

    if (isAuth) {
        // Auth pages - without header
        app.innerHTML = `
            <main id="page-content" class="auth-page-content"></main>
        `;
        router();
    } else {
        // Other pages - with header
        app.innerHTML = `
            ${Header()}
            <main id="page-content"></main>
        `;

        setupNavigation();
        router();

        setTimeout(() => {
            updateHeaderAvatar();
            updateHeaderAuthButtons();
            restoreHeaderTimer();

            let activePath = path;
            if (path === '' || path === '/' || path === '/Frontend/index.html') {
                activePath = '/';
            }
            updateActiveNav(activePath);

            setTimeout(() => {
                refreshHeaderTimerUI();
            }, 100);
        }, 150);
    }
}

// ============================================================
// Auth Changed Event
// ============================================================

document.addEventListener('auth:changed', () => {
    renderApp();

    if (isLoggedIn()) {
        const path = window.location.pathname;
        if (isAuthPath(path)) {
            window.location.href = '/Frontend/index.html';
        }
    }
});

// ============================================================
// Navigation Click Handler
// ============================================================

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

// ============================================================
// Popstate Handler
// ============================================================

window.addEventListener('popstate', () => {
    renderApp();
});

// ============================================================
// Initial Render
// ============================================================

renderApp();

// ============================================================
// Exports
// ============================================================

export { updateHeaderAuthButtons, renderApp, updateHeaderAvatar };