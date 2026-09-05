// File: Frontend/Components/header/header.js

const HEADER_STORAGE_KEYS = {
    avatar: "profile:avatarSrc",
    theme: "profile:theme",
};

const HEADER_DEFAULT_AVATAR_MALE = "/Frontend/assets/images/profile-default-male.png";
const HEADER_DEFAULT_AVATAR_FEMALE = "/Frontend/assets/images/profile-default-female.png";

// Apply saved theme immediately
(function initHeaderTheme() {
    const theme = localStorage.getItem(HEADER_STORAGE_KEYS.theme) || "light";
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
})();

// ============================================================
// Get Default Avatar by Gender
// ============================================================

function getDefaultAvatar(gender) {
    if (gender === 'female') {
        return HEADER_DEFAULT_AVATAR_FEMALE;
    }
    return HEADER_DEFAULT_AVATAR_MALE;
}

// ============================================================
// Get Header Avatar from localStorage
// ============================================================

function getHeaderAvatar() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    const gender = userProfile.gender || 'male';
    const defaultAvatar = gender === 'female'
        ? '/Frontend/assets/images/profile-default-female.png'
        : '/Frontend/assets/images/profile-default-male.png';

    if (userProfile.avatar) {
        return `https://planner-api-jw63.onrender.com${userProfile.avatar}`;
    }

    return defaultAvatar;
}

// ============================================================
// Update Online Status
// ============================================================

function updateOnlineStatus() {
    const statusIndicator = document.getElementById('headerProfileStatus');
    if (!statusIndicator) return;

    if (navigator.onLine) {
        statusIndicator.classList.remove('profile-status--offline');
        statusIndicator.setAttribute('title', 'آنلاین');
    } else {
        statusIndicator.classList.add('profile-status--offline');
        statusIndicator.setAttribute('title', 'آفلاین');
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// ============================================================
// Update Active Navigation Link
// ============================================================

export function updateActiveNav(path) {
    document.querySelectorAll('.navigation__link').forEach(link => {
        link.classList.remove('navigation__link--active');
    });

    document.querySelector('.profile')?.classList.remove('profile--active');

    if (path === '/profile') {
        document.querySelector('.profile')?.classList.add('profile--active');
        return;
    }

    const targetLink = document.querySelector(`.navigation__link[data-route="${path}"]`);
    if (targetLink) {
        targetLink.classList.add('navigation__link--active');
    } else {
        const dashboardLink = document.querySelector(`.navigation__link[data-route="/"]`);
        if (dashboardLink) {
            dashboardLink.classList.add('navigation__link--active');
        }
    }
}

// ============================================================
// Header Component
// ============================================================

export function Header() {
    const avatarSrc = getHeaderAvatar();
    const isOnline = navigator.onLine;
    const isLoggedIn = localStorage.getItem('auth:session') ? true : false;

    const authButtons = `
        <div class="auth-buttons" style="${isLoggedIn ? 'display: none;' : ''}">
            <a href="/login" data-route="/login" class="auth-button auth-button--login">ورود</a>
            <a href="/register" data-route="/register" class="auth-button auth-button--register">ثبت‌نام</a>
        </div>
    `;

    const profileWrapper = `
        <div class="profile-wrapper" style="${!isLoggedIn ? 'display: none;' : ''}">
            <a href="/profile" data-route="/profile" class="profile">
                <img
                    src="${avatarSrc}"
                    alt="پروفایل کاربر"
                    class="profile__image"
                    id="headerProfileImage"
                />
            </a>
            <span
                class="profile-status ${!isOnline ? 'profile-status--offline' : ''}"
                id="headerProfileStatus"
                title="${isOnline ? 'آنلاین' : 'آفلاین'}"
            ></span>
        </div>
    `;

    return `
        <header class="header">
            <div class="header__container">
                <a href="/" data-route="/" class="logo">
                    <img src="/Frontend/assets/images/logo.png" alt="Planner" class="logo__image" />
                </a>

                <div
                    class="header-timer"
                    id="headerTimer"
                    hidden
                    aria-live="polite"
                >
                    <div class="header-timer__activity">
                        <span
                            class="header-timer__indicator"
                            id="headerTimerIndicator"
                        ></span>

                        <span
                            class="header-timer__activity-name"
                            id="headerTimerActivity"
                        >
                            مطالعه ریاضی
                        </span>
                    </div>

                    <div
                        class="header-timer__time"
                        id="headerTimerTime"
                    >
                        00:00:00
                    </div>

                    <button
                        type="button"
                        class="header-timer__stop"
                        id="headerTimerStop"
                    >
                        پایان
                    </button>
                </div>

                <nav class="navigation" aria-label="منوی اصلی">
                    <ul class="navigation__list">
                        <li class="navigation__item">
                            <a href="/" data-route="/" class="navigation__link navigation__link--active">
                                داشبورد
                            </a>
                        </li>

                        <li class="navigation__item">
                            <a href="/activities" data-route="/activities" class="navigation__link"> فعالیت‌ها </a>
                        </li>

                        <li class="navigation__item">
                            <a href="/reports" data-route="/reports" class="navigation__link"> گزارشات </a>
                        </li>

                        <li class="navigation__item">
                            <a href="/calendar" data-route="/calendar" class="navigation__link"> تقویم </a>
                        </li>
                    </ul>
                </nav>

                ${authButtons}
                ${profileWrapper}
            </div>
        </header>
    `;
}

// ============================================================
// Click Events
// ============================================================

document.addEventListener('click', (event) => {
    const navLink = event.target.closest('.navigation__link');

    if (navLink) {
        document.querySelectorAll('.navigation__link').forEach(link => {
            link.classList.remove('navigation__link--active');
        });
        navLink.classList.add('navigation__link--active');
        document.querySelector('.profile')?.classList.remove('profile--active');
        return;
    }

    if (event.target.closest('.logo')) {
        document.querySelectorAll('.navigation__link').forEach(link => {
            link.classList.remove('navigation__link--active');
        });
        document.querySelector('.navigation__link[data-route="/"]')?.classList.add('navigation__link--active');
        document.querySelector('.profile')?.classList.remove('profile--active');
        return;
    }

    if (event.target.closest('.profile')) {
        document.querySelectorAll('.navigation__link').forEach(link => {
            link.classList.remove('navigation__link--active');
        });
        document.querySelector('.profile')?.classList.add('profile--active');
        return;
    }
});

// ============================================================
// Update Header Avatar
// ============================================================

export function updateHeaderAvatar(avatarSrc) {
    const headerAvatar = document.getElementById('headerProfileImage');

    if (headerAvatar && avatarSrc) {
        headerAvatar.src = avatarSrc;
    }

    localStorage.setItem(HEADER_STORAGE_KEYS.avatar, avatarSrc);

    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    userProfile.avatar = avatarSrc;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// ============================================================
// Sync Header with Profile
// ============================================================

export function syncHeaderWithProfile() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    const gender = userProfile.gender || 'male';
    const defaultAvatar = getDefaultAvatar(gender);

    let avatar = userProfile.avatar || defaultAvatar;

    const defaultMale = '/Frontend/assets/images/profile-default-male.png';
    const defaultFemale = '/Frontend/assets/images/profile-default-female.png';

    if (avatar === defaultMale || avatar === defaultFemale) {
        const correctDefault = getDefaultAvatar(gender);
        if (avatar !== correctDefault) {
            avatar = correctDefault;
            userProfile.avatar = avatar;
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }
    }

    const headerAvatar = document.getElementById('headerProfileImage');
    if (headerAvatar) {
        headerAvatar.src = avatar;
    }

    localStorage.setItem(HEADER_STORAGE_KEYS.avatar, avatar);

    updateOnlineStatus();
}

// ============================================================
// Avatar Updated Event Listener
// ============================================================

document.addEventListener('profile:avatar-updated', (event) => {
    const avatarSrc = event.detail?.src;
    if (avatarSrc) {
        const headerAvatar = document.getElementById('headerProfileImage');
        if (headerAvatar) {
            headerAvatar.src = avatarSrc;
        }
        localStorage.setItem(HEADER_STORAGE_KEYS.avatar, avatarSrc);
    }
});

// ============================================================
// Storage Change Listener
// ============================================================

window.addEventListener('storage', (e) => {
    if (e.key === 'userProfile') {
        try {
            const newProfile = JSON.parse(e.newValue);
            if (newProfile) {
                const gender = newProfile.gender || 'male';
                const defaultAvatar = getDefaultAvatar(gender);
                let avatar = newProfile.avatar || defaultAvatar;

                const defaultMale = '/Frontend/assets/images/profile-default-male.png';
                const defaultFemale = '/Frontend/assets/images/profile-default-female.png';

                if (avatar === defaultMale || avatar === defaultFemale) {
                    const correctDefault = getDefaultAvatar(gender);
                    if (avatar !== correctDefault) {
                        avatar = correctDefault;
                        newProfile.avatar = avatar;
                        localStorage.setItem('userProfile', JSON.stringify(newProfile));
                    }
                }

                const headerAvatar = document.getElementById('headerProfileImage');
                if (headerAvatar) {
                    headerAvatar.src = avatar;
                }
                localStorage.setItem(HEADER_STORAGE_KEYS.avatar, avatar);
            }
        } catch (error) {
            console.error('خطا در همگام‌سازی هدر:', error);
        }
    }
});

// ============================================================
// DOM Ready
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    syncHeaderWithProfile();
});

// ============================================================
// Update Header Buttons
// ============================================================

export function updateHeaderButtons() {
    const isLoggedIn = localStorage.getItem('auth:session') ? true : false;

    const authButtons = document.querySelector('.auth-buttons');
    const profileWrapper = document.querySelector('.profile-wrapper');

    if (authButtons) {
        authButtons.style.display = isLoggedIn ? 'none' : '';
    }
    if (profileWrapper) {
        profileWrapper.style.display = isLoggedIn ? '' : 'none';
    }
}