// File: Frontend/pages/profile/profile.js

import { logout } from "../login_register/auth.js";
import { UsersAPI } from "../../js/api.js";

// ============================================================
// Province Data (31 Provinces)
// ============================================================

const PROVINCES = {
    "azarbaijan-east": "آذربایجان شرقی",
    "azarbaijan-west": "آذربایجان غربی",
    "ardabil": "اردبیل",
    "isfahan": "اصفهان",
    "alborz": "البرز",
    "ilam": "ایلام",
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
    "kohgiluyeh": "کهگیلویه و بویراحمد",
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
// Utility Functions
// ============================================================

function getProvinceKey(value) {
    for (const [key, persian] of Object.entries(PROVINCES)) {
        if (persian === value) {
            return key;
        }
    }
    return value;
}

function openModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (modal.id === 'avatarModal') {
        resetAvatarModal();
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

// ============================================================
// Update Password Last Change
// ============================================================

function updatePasswordLastChange(date) {
    const settingItems = document.querySelectorAll('.setting-item');
    let passwordValueEl = null;

    settingItems.forEach(item => {
        const titleEl = item.querySelector('.setting-item__title');
        if (titleEl && titleEl.textContent.trim() === 'رمز عبور') {
            passwordValueEl = item.querySelector('.setting-item__value');
        }
    });

    if (!passwordValueEl) return;

    if (!date) {
        passwordValueEl.textContent = 'هنوز تغییری نداشته';
        return;
    }

    const dateObj = new Date(date);
    const now = new Date();
    const diffMs = now - dateObj;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    let text = '';
    if (diffYears >= 1) {
        text = `${diffYears} سال پیش`;
    } else if (diffMonths >= 1) {
        text = `${diffMonths} ماه پیش`;
    } else if (diffWeeks >= 1) {
        text = `${diffWeeks} هفته پیش`;
    } else if (diffDays >= 1) {
        text = `${diffDays} روز پیش`;
    } else if (diffHours >= 1) {
        text = `${diffHours} ساعت پیش`;
    } else if (diffMinutes >= 1) {
        text = `${diffMinutes} دقیقه پیش`;
    } else {
        text = 'چند لحظه پیش';
    }

    passwordValueEl.textContent = `آخرین تغییر: ${text}`;
}

// ============================================================
// Update Header Avatar
// ============================================================

function updateHeaderAvatar(avatarSrc) {
    const headerAvatar = document.getElementById('headerProfileImage');
    if (headerAvatar && avatarSrc) {
        headerAvatar.src = avatarSrc;
    }
}

// ============================================================
// Show Success Modal
// ============================================================

function showSuccessModal(title, message) {
    const modal = document.getElementById('successModal');
    const titleEl = document.getElementById('successModalTitle');
    const messageEl = document.getElementById('successModalMessage');

    if (!modal) return;

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    openModal(modal);
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        closeModal(modal);
    }
}

// ============================================================
// Load User Profile
// ============================================================

async function loadUserProfile() {
    try {
        const session = JSON.parse(localStorage.getItem('auth:session')) || {};
        const userId = session.userId;

        if (!userId) {
            return;
        }

        const result = await UsersAPI.get(userId);
        const user = Array.isArray(result) ? result[0] : result;

        if (user && user.id) {
            const profileData = {
                id: user.id,
                username: user.username || '',
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                province: user.province || '',
                gender: user.gender || '',
                email: user.email || '',
                avatar: user.avatar || '',
                emailVerified: user.email_verified || false,
                passwordChangedAt: user.password_changed_at || null
            };

            localStorage.setItem('userProfile', JSON.stringify(profileData));
            fillProfileForm(profileData);

            if (profileData.passwordChangedAt) {
                updatePasswordLastChange(profileData.passwordChangedAt);
            }

            return profileData;
        }

    } catch (error) {
        const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
        fillProfileForm(savedProfile);
    }
}

// ============================================================
// Save User Profile
// ============================================================

async function saveUserProfile(data) {
    try {
        const session = JSON.parse(localStorage.getItem('auth:session')) || {};
        const userId = session.userId;

        if (!userId) {
            throw new Error('کاربر لاگین نیست');
        }

        const result = await UsersAPI.update(userId, data);

        const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
        const updatedProfile = {
            ...savedProfile,
            firstName: data.first_name || savedProfile.firstName,
            lastName: data.last_name || savedProfile.lastName,
            province: data.province || savedProfile.province,
            gender: data.gender || savedProfile.gender,
        };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

        fillProfileForm(updatedProfile);

        return result;

    } catch (error) {
        throw error;
    }
}

// ============================================================
// Upload Avatar
// ============================================================

async function uploadUserAvatar(file) {
    try {
        const session = JSON.parse(localStorage.getItem('auth:session')) || {};
        const userId = session.userId;

        if (!userId) {
            throw new Error('کاربر لاگین نیست');
        }

        const result = await UsersAPI.uploadAvatar(userId, file);

        const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
        savedProfile.avatar = result.user.avatar;
        localStorage.setItem('userProfile', JSON.stringify(savedProfile));

        fillProfileForm(savedProfile);

        document.dispatchEvent(new CustomEvent('profile:avatar-updated', {
            detail: { src: `http://localhost:3000${result.user.avatar}` }
        }));

        window.location.href = '/Frontend/index.html';

        return result;

    } catch (error) {
        throw error;
    }
}

// ============================================================
// Delete Avatar
// ============================================================

async function deleteUserAvatar() {
    try {
        const session = JSON.parse(localStorage.getItem('auth:session')) || {};
        const userId = session.userId;

        if (!userId) {
            throw new Error('کاربر لاگین نیست');
        }

        const result = await UsersAPI.deleteAvatar(userId);

        const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
        savedProfile.avatar = '';
        localStorage.setItem('userProfile', JSON.stringify(savedProfile));

        fillProfileForm(savedProfile);

        window.location.href = '/Frontend/index.html';

        return result;

    } catch (error) {
        throw error;
    }
}

// ============================================================
// Set Email
// ============================================================

async function setUserEmail(email) {
    try {
        const session = JSON.parse(localStorage.getItem('auth:session')) || {};
        const userId = session.userId;

        if (!userId) {
            throw new Error('کاربر لاگین نیست');
        }

        const result = await UsersAPI.setEmail(userId, email);

        const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
        savedProfile.email = result.user.email;
        savedProfile.emailVerified = result.user.email_verified;
        localStorage.setItem('userProfile', JSON.stringify(savedProfile));

        fillProfileForm(savedProfile);

        return result;

    } catch (error) {
        throw error;
    }
}

// ============================================================
// Update Username in UI
// ============================================================

function updateUsernameInUI(newUsername) {
    const usernameEl = document.getElementById('userUsername');
    if (usernameEl) {
        usernameEl.textContent = newUsername;
    }

    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    savedProfile.username = newUsername;
    localStorage.setItem('userProfile', JSON.stringify(savedProfile));
}

// ============================================================
// Fill Profile Form
// ============================================================

function fillProfileForm(profile) {
    const nameEl = document.getElementById('profileName');
    if (nameEl) {
        const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        nameEl.textContent = fullName || 'کاربر';
    }

    const cityEl = document.getElementById('profileCity');
    if (cityEl) {
        const provinceName = PROVINCES[profile.province] || profile.province || 'استان نامشخص';
        cityEl.textContent = provinceName;
    }

    const avatarImg = document.getElementById('profileAvatarImage');
    if (avatarImg) {
        if (profile.avatar) {
            if (profile.avatar.startsWith('/uploads/')) {
                avatarImg.src = `http://localhost:3000${profile.avatar}`;
            } else {
                avatarImg.src = profile.avatar;
            }
        } else {
            const defaultAvatar = profile.gender === 'female'
                ? '/Frontend/assets/images/profile-default-female.png'
                : '/Frontend/assets/images/profile-default-male.png';
            avatarImg.src = defaultAvatar;
        }
    }

    const headerAvatar = document.getElementById('headerProfileImage');
    if (headerAvatar) {
        if (profile.avatar) {
            if (profile.avatar.startsWith('/uploads/')) {
                headerAvatar.src = `http://localhost:3000${profile.avatar}`;
            } else {
                headerAvatar.src = profile.avatar;
            }
        } else {
            const defaultAvatar = profile.gender === 'female'
                ? '/Frontend/assets/images/profile-default-female.png'
                : '/Frontend/assets/images/profile-default-male.png';
            headerAvatar.src = defaultAvatar;
        }
    }

    const firstNameInput = document.getElementById('first-name');
    if (firstNameInput) firstNameInput.value = profile.firstName || '';

    const lastNameInput = document.getElementById('last-name');
    if (lastNameInput) lastNameInput.value = profile.lastName || '';

    const provinceSelect = document.getElementById('province');
    if (provinceSelect) {
        if (profile.province) {
            const provinceKey = getProvinceKey(profile.province);
            provinceSelect.value = provinceKey;
        } else {
            provinceSelect.value = '';
        }
    }

    const genderSelect = document.getElementById('gender');
    if (genderSelect) {
        if (profile.gender) {
            genderSelect.value = profile.gender;
        } else {
            genderSelect.value = '';
        }
    }

    const usernameEl = document.getElementById('userUsername');
    if (usernameEl) usernameEl.textContent = profile.username || '';

    const emailEl = document.getElementById('userEmail');
    if (emailEl) {
        if (profile.email) {
            emailEl.textContent = profile.email;
            emailEl.classList.remove('setting-item__value--empty');
        } else {
            emailEl.textContent = 'ایمیل ثبت نشده است';
            emailEl.classList.add('setting-item__value--empty');
        }
    }

    if (profile.passwordChangedAt) {
        updatePasswordLastChange(profile.passwordChangedAt);
    }

    localStorage.setItem('userProfile', JSON.stringify(profile));
}

// ============================================================
// Reset Avatar Modal
// ============================================================

function resetAvatarModal() {
    const fileInput = document.getElementById('profile-image');
    const previewWrapper = document.getElementById('previewWrapper');
    const previewImage = document.getElementById('previewImage');
    const submitBtn = document.getElementById('submitImageBtn');
    const errorEl = document.getElementById('modalError');

    if (fileInput) {
        fileInput.value = '';
        fileInput.type = 'text';
        fileInput.type = 'file';
    }
    if (previewWrapper) previewWrapper.style.display = 'none';
    if (previewImage) previewImage.src = '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'انتخاب تصویر';
    }
    if (errorEl) errorEl.textContent = '';
}

// ============================================================
// Toggle Password Visibility
// ============================================================

function togglePasswordVisibility(inputId, toggleBtnId) {
    const input = document.getElementById(inputId);
    const toggleBtn = document.getElementById(toggleBtnId);

    if (!input || !toggleBtn) return;

    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

    // Set initial state
    const isPassword = input.type === 'password';
    newToggleBtn.innerHTML = isPassword ? getEyeIcon(false) : getEyeIcon(true);
    newToggleBtn.setAttribute('aria-label', isPassword ? 'نمایش رمز' : 'مخفی کردن رمز');

    newToggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (input.type === 'password') {
            input.type = 'text';
            this.innerHTML = getEyeIcon(true);
            this.setAttribute('aria-label', 'مخفی کردن رمز');
            this.classList.add('is-visible');
        } else {
            input.type = 'password';
            this.innerHTML = getEyeIcon(false);
            this.setAttribute('aria-label', 'نمایش رمز');
            this.classList.remove('is-visible');
        }
        return false;
    });
}

// ============================================================
// Eye Icon SVG Generator
// ============================================================

function getEyeIcon(isVisible) {
    if (isVisible) {
        // Eye with slash (hidden)
        return `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
        `;
    } else {
        // Eye (visible)
        return `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        `;
    }
}

// ============================================================
// Setup Image Upload
// ============================================================

function setupImageUpload() {
    const fileInput = document.getElementById('profile-image');
    const previewWrapper = document.getElementById('previewWrapper');
    const previewImage = document.getElementById('previewImage');
    const errorEl = document.getElementById('modalError');
    const avatarModal = document.getElementById('avatarModal');
    const removeBtn = document.getElementById('removeImageBtn');
    const submitBtn = document.getElementById('submitImageBtn');

    let selectedFile = null;

    if (!fileInput) return;

    // File Selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            if (errorEl) errorEl.textContent = 'حجم تصویر نباید بیشتر از ۲ مگابایت باشد';
            return;
        }

        if (!file.type.match(/image\/(jpeg|png|webp)/)) {
            if (errorEl) errorEl.textContent = 'فقط تصاویر با فرمت JPEG، PNG و WebP مجاز هستند';
            return;
        }

        if (errorEl) errorEl.textContent = '';
        selectedFile = file;

        const reader = new FileReader();
        reader.onload = function(ev) {
            if (previewImage) previewImage.src = ev.target.result;
            if (previewWrapper) previewWrapper.style.display = 'block';
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '✅ انتخاب تصویر';
            }
        };
        reader.readAsDataURL(file);
    });

    // Remove Image
    if (removeBtn) {
        removeBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();

            const confirmModal = document.getElementById('confirmLogoutModal');
            if (!confirmModal) {
                if (!confirm('آیا از حذف تصویر پروفایل مطمئن هستید؟')) return;

                deleteUserAvatar()
                    .then(() => {
                        if (avatarModal) {
                            avatarModal.style.display = 'none';
                            avatarModal.setAttribute('aria-hidden', 'true');
                            document.body.style.overflow = '';
                        }
                        window.location.href = '/Frontend/index.html';
                    })
                    .catch(error => {
                        alert(error.message || 'خطا در حذف تصویر');
                    });
                return false;
            }

            const title = document.getElementById('confirmLogoutTitle');
            const message = document.getElementById('confirmLogoutMessage');
            const confirmBtn = document.getElementById('confirmLogoutBtn');
            const cancelBtn = document.getElementById('cancelLogoutBtn');
            const closeBtn = document.getElementById('closeLogoutModal');

            if (title) title.textContent = '🗑 حذف تصویر';
            if (message) message.textContent = 'آیا از حذف تصویر پروفایل مطمئن هستید؟';
            if (confirmBtn) {
                confirmBtn.textContent = 'حذف تصویر';
                confirmBtn.style.background = '#ef4444';

                const newConfirmBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

                newConfirmBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (confirmModal) {
                        confirmModal.style.display = 'none';
                        confirmModal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                    }

                    removeBtn.textContent = '⏳ در حال حذف...';
                    removeBtn.disabled = true;

                    deleteUserAvatar()
                        .then(() => {
                            if (avatarModal) {
                                avatarModal.style.display = 'none';
                                avatarModal.setAttribute('aria-hidden', 'true');
                                document.body.style.overflow = '';
                            }
                            window.location.href = '/Frontend/index.html';
                        })
                        .catch(error => {
                            alert(error.message || 'خطا در حذف تصویر');
                            removeBtn.textContent = '🗑 حذف تصویر';
                            removeBtn.disabled = false;
                        });

                    return false;
                };
            }

            if (cancelBtn) {
                const newCancelBtn = cancelBtn.cloneNode(true);
                cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

                newCancelBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (confirmModal) {
                        confirmModal.style.display = 'none';
                        confirmModal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                    }

                    return false;
                };
            }

            if (closeBtn) {
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

                newCloseBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (confirmModal) {
                        confirmModal.style.display = 'none';
                        confirmModal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                    }

                    return false;
                };
            }

            const overlay = confirmModal.querySelector('.profile-modal__overlay');
            if (overlay) {
                const newOverlay = overlay.cloneNode(true);
                overlay.parentNode.replaceChild(newOverlay, overlay);

                newOverlay.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (confirmModal) {
                        confirmModal.style.display = 'none';
                        confirmModal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                    }

                    return false;
                };
            }

            confirmModal.style.display = 'flex';
            confirmModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            return false;
        };
    }

    // Upload Button
    if (submitBtn) {
        submitBtn.type = 'button';
        submitBtn.removeAttribute('data-route');

        submitBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (!selectedFile) {
                alert('لطفاً ابتدا یک تصویر انتخاب کنید.');
                return false;
            }

            this.textContent = '⏳ در حال آپلود...';
            this.disabled = true;

            uploadUserAvatar(selectedFile)
                .then(() => {
                    if (avatarModal) {
                        avatarModal.style.display = 'none';
                        avatarModal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                    }
                    window.location.href = '/Frontend/index.html';
                })
                .catch(error => {
                    alert(error.message || 'خطا در آپلود تصویر');
                    this.textContent = '✅ انتخاب تصویر';
                    this.disabled = false;
                });

            return false;
        };
    }
}

// ============================================================
// Profile View Component
// ============================================================

export function ProfileView() {
    const cachedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};

    const defaultAvatar = cachedProfile.gender === 'female'
        ? '/Frontend/assets/images/profile-default-female.png'
        : '/Frontend/assets/images/profile-default-male.png';

    let avatar = cachedProfile.avatar || defaultAvatar;
    const defaultMale = '/Frontend/assets/images/profile-default-male.png';
    const defaultFemale = '/Frontend/assets/images/profile-default-female.png';

    if (!avatar || avatar === defaultMale || avatar === defaultFemale) {
        avatar = defaultAvatar;
    }

    const hasEmail = Boolean(cachedProfile.email);

    const provinceOptions = Object.entries(PROVINCES).map(([key, value]) => {
        const isSelected = (cachedProfile.province === key || cachedProfile.province === value) ? 'selected' : '';
        return `<option value="${key}" ${isSelected}>${value}</option>`;
    }).join('');

    return `
        <main class="profile-page">
            <!-- Left Column - Profile Card -->
            <section class="profile-card">
                <div class="profile-card__top">
                    <div class="profile-avatar">
                        <img src="${avatar}" alt="تصویر پروفایل" class="profile-avatar__image" id="profileAvatarImage" />
                        <button type="button" class="profile-avatar__edit" aria-label="تغییر تصویر پروفایل" title="تغییر تصویر پروفایل" id="editAvatarBtn">✎</button>
                    </div>
                    <div class="profile-card__identity">
                        <h1 class="profile-card__name" id="profileName">${cachedProfile.firstName || 'کاربر'} ${cachedProfile.lastName || ''}</h1>
                        <p class="profile-card__city" id="profileCity">${cachedProfile.province || 'استان نامشخص'}</p>
                    </div>
                </div>

                <div class="profile-form" id="profileForm">
                    <div class="profile-form__field">
                        <label for="first-name">نام</label>
                        <input type="text" id="first-name" name="firstName" value="${cachedProfile.firstName || ''}" placeholder="نام خود را وارد کنید" />
                    </div>
                    <div class="profile-form__field">
                        <label for="last-name">نام خانوادگی</label>
                        <input type="text" id="last-name" name="lastName" value="${cachedProfile.lastName || ''}" placeholder="نام خانوادگی خود را وارد کنید" />
                    </div>
                    <div class="profile-form__field">
                        <label for="province">استان</label>
                        <select id="province" name="province">
                            <option value="">انتخاب استان</option>
                            ${provinceOptions}
                        </select>
                    </div>
                    <div class="profile-form__field">
                        <label for="gender">جنسیت</label>
                        <select id="gender" name="gender">
                            <option value="">انتخاب جنسیت</option>
                            <option value="male" ${cachedProfile.gender === 'male' ? 'selected' : ''}>آقا</option>
                            <option value="female" ${cachedProfile.gender === 'female' ? 'selected' : ''}>خانم</option>
                        </select>
                    </div>
                </div>

                <button type="button" class="profile-card__save" id="saveProfileBtn">ذخیره تغییرات</button>
            </section>

            <!-- Right Column - Settings Card -->
            <section class="settings-card">
                <div class="settings-card__header">
                    <h2 class="settings-card__title">تنظیمات حساب</h2>
                    <p class="settings-card__subtitle">اطلاعات ورود و حساب کاربری خود را مدیریت کنید.</p>
                </div>

                <div class="settings-list">
                    <div class="setting-item">
                        <div class="setting-item__content">
                            <span class="setting-item__title">نام کاربری</span>
                            <span class="setting-item__value" id="userUsername">${cachedProfile.username || ''}</span>
                        </div>
                        <button type="button" class="setting-item__action" id="changeUsernameBtn">تغییر</button>
                    </div>

                    <div class="setting-item">
                        <div class="setting-item__content">
                            <span class="setting-item__title">ایمیل</span>
                            ${hasEmail
                                ? `<span class="setting-item__value" id="userEmail">${cachedProfile.email}</span>`
                                : `<span class="setting-item__value setting-item__value--empty" id="userEmail">ایمیل ثبت نشده است</span>`
                            }
                        </div>
                        <button type="button" class="setting-item__action" id="changeEmailBtn">${hasEmail ? 'تغییر' : 'ثبت'}</button>
                    </div>

                    <div class="setting-item">
                        <div class="setting-item__content">
                            <span class="setting-item__title">رمز عبور</span>
                            <span class="setting-item__value" id="passwordLastChange">هنوز تغییری نداشته</span>
                        </div>
                        <button type="button" class="setting-item__action" id="changePasswordBtn">تغییر</button>
                    </div>

                    <div class="setting-item setting-item--appearance">
                        <div class="setting-item__content">
                            <span class="setting-item__title">ظاهر برنامه</span>
                            <span class="setting-item__value" id="themeStatus">حالت روشن</span>
                        </div>
                        <button type="button" class="theme-toggle" aria-label="تغییر حالت نمایش" aria-pressed="false" id="themeToggle">
                            <span class="theme-toggle__icon theme-toggle__icon--light">☀</span>
                            <span class="theme-toggle__slider"></span>
                            <span class="theme-toggle__icon theme-toggle__icon--dark">☾</span>
                        </button>
                    </div>
                </div>

                <div class="profile-danger">
                    <button type="button" class="logout-btn" id="logoutBtn">خروج از حساب</button>
                </div>
            </section>

            <!-- Profile Image Modal -->
            <div class="profile-modal" aria-hidden="true" id="avatarModal" style="display: none;">
                <div class="profile-modal__overlay"></div>
                <div class="profile-modal__box" role="dialog" aria-modal="true" aria-labelledby="profile-image-modal-title">
                    <div class="profile-modal__header">
                        <div>
                            <h2 id="profile-image-modal-title" class="profile-modal__title">تصویر پروفایل</h2>
                            <p class="profile-modal__subtitle">تصویر موردنظر خود را انتخاب کنید.</p>
                        </div>
                        <button type="button" class="profile-modal__close" aria-label="بستن" id="closeAvatarModal">×</button>
                    </div>

                    <div class="profile-modal__body">
                        <div class="profile-modal__field">
                            <label for="profile-image">انتخاب تصویر</label>
                            <input type="file" id="profile-image" name="profileImage" accept="image/jpeg,image/png,image/webp" />
                        </div>

                        <p class="profile-modal__error" role="alert" id="modalError"></p>

                        <div class="profile-modal__preview-wrapper" id="previewWrapper" style="display: none;">
                            <span class="profile-modal__preview-label">پیش‌نمایش</span>
                            <img src="" alt="پیش‌نمایش تصویر پروفایل" class="profile-modal__preview" id="previewImage" />
                        </div>

                        <button type="button" class="profile-modal__remove" id="removeImageBtn">🗑 حذف تصویر و استفاده از تصویر پیش‌فرض</button>
                        <span class="profile-modal__hint">حداکثر حجم تصویر: ۲ مگابایت</span>
                    </div>

                    <div class="profile-modal__footer">
                        <button type="button" class="profile-modal__cancel" id="cancelAvatarModal">انصراف</button>
                        <button type="button" class="profile-modal__submit" id="submitImageBtn" disabled>انتخاب تصویر</button>
                    </div>
                </div>
            </div>

            <!-- Change Username Modal -->
            <div class="profile-modal" aria-hidden="true" id="usernameModal" style="display: none;">
                <div class="profile-modal__overlay"></div>
                <div class="profile-modal__box" role="dialog" aria-modal="true">
                    <div class="profile-modal__header">
                        <div>
                            <h2 class="profile-modal__title">تغییر نام کاربری</h2>
                            <p class="profile-modal__subtitle">نام کاربری جدید خود را وارد کنید.</p>
                        </div>
                        <button type="button" class="profile-modal__close" id="closeUsernameModal">×</button>
                    </div>

                    <div class="profile-modal__body">
                        <div class="profile-modal__field">
                            <label for="new-username">نام کاربری جدید</label>
                            <input type="text" id="new-username" placeholder="example_user" />
                        </div>
                        <p class="profile-modal__error" id="usernameError" role="alert"></p>
                    </div>

                    <div class="profile-modal__footer">
                        <button type="button" class="profile-modal__cancel" id="cancelUsernameModal">انصراف</button>
                        <button type="button" class="profile-modal__submit" id="saveUsernameBtn">ذخیره نام کاربری</button>
                    </div>
                </div>
            </div>

            <!-- Change Email Modal -->
            <div class="profile-modal" aria-hidden="true" id="emailModal" style="display: none;">
                <div class="profile-modal__overlay"></div>
                <div class="profile-modal__box" role="dialog" aria-modal="true">
                    <div class="profile-modal__header">
                        <div>
                            <h2 class="profile-modal__title" id="emailModalTitle">ثبت ایمیل</h2>
                            <p class="profile-modal__subtitle" id="emailModalSubtitle">برای افزایش امنیت حساب، ایمیل خود را ثبت کنید.</p>
                        </div>
                        <button type="button" class="profile-modal__close" id="closeEmailModal">×</button>
                    </div>

                    <div class="profile-modal__body">
                        <div class="profile-modal__field">
                            <label for="new-email">ایمیل</label>
                            <input type="email" id="new-email" placeholder="example@email.com" />
                        </div>
                        <p class="profile-modal__error" id="emailError" role="alert"></p>
                    </div>

                    <div class="profile-modal__footer">
                        <button type="button" class="profile-modal__cancel" id="cancelEmailModal">انصراف</button>
                        <button type="button" class="profile-modal__submit" id="saveEmailBtn">ثبت ایمیل</button>
                    </div>
                </div>
            </div>

            <!-- Change Password Modal -->
            <div class="profile-modal" aria-hidden="true" id="passwordModal" style="display: none;">
                <div class="profile-modal__overlay"></div>
                <div class="profile-modal__box" role="dialog" aria-modal="true">
                    <div class="profile-modal__header">
                        <div>
                            <h2 class="profile-modal__title">تغییر رمز عبور</h2>
                            <p class="profile-modal__subtitle">رمز عبور جدید خود را وارد کنید.</p>
                        </div>
                        <button type="button" class="profile-modal__close" id="closePasswordModal">×</button>
                    </div>

                    <div class="profile-modal__body">
                        <div class="profile-modal__field profile-modal__field--password">
                            <label for="current-password">رمز عبور فعلی</label>
                            <div class="profile-modal__password-wrapper">
                                <input type="password" id="current-password" placeholder="رمز عبور فعلی" />
                                <button type="button" class="profile-modal__password-toggle" id="toggleCurrentPassword" aria-label="نمایش رمز">👁️</button>
                            </div>
                        </div>

                        <div class="profile-modal__field profile-modal__field--password">
                            <label for="new-password">رمز عبور جدید</label>
                            <div class="profile-modal__password-wrapper">
                                <input type="password" id="new-password" placeholder="رمز عبور جدید (حداقل ۸ کاراکتر)" />
                                <button type="button" class="profile-modal__password-toggle" id="toggleNewPassword" aria-label="نمایش رمز">👁️</button>
                            </div>
                        </div>

                        <div class="profile-modal__field profile-modal__field--password">
                            <label for="confirm-password">تکرار رمز عبور جدید</label>
                            <div class="profile-modal__password-wrapper">
                                <input type="password" id="confirm-password" placeholder="تکرار رمز عبور جدید" />
                                <button type="button" class="profile-modal__password-toggle" id="toggleConfirmPassword" aria-label="نمایش رمز">👁️</button>
                            </div>
                        </div>
                        <p class="profile-modal__error" id="passwordError" role="alert"></p>
                    </div>

                    <div class="profile-modal__footer">
                        <button type="button" class="profile-modal__cancel" id="cancelPasswordModal">انصراف</button>
                        <button type="button" class="profile-modal__submit" id="savePasswordBtn">تغییر رمز عبور</button>
                    </div>
                </div>
            </div>

            <!-- Success Modal -->
            <div class="profile-modal" aria-hidden="true" id="successModal" style="display: none;">
                <div class="profile-modal__overlay"></div>
                <div class="profile-modal__box" role="dialog" aria-modal="true" aria-labelledby="successModalTitle">
                    <div class="profile-modal__header">
                        <div>
                            <h2 class="profile-modal__title" id="successModalTitle">✅ موفق</h2>
                            <p class="profile-modal__subtitle" id="successModalMessage">عملیات با موفقیت انجام شد.</p>
                        </div>
                        <button type="button" class="profile-modal__close" id="closeSuccessModal" aria-label="بستن">×</button>
                    </div>
                    <div class="profile-modal__body" style="margin-bottom: 0;">
                        <button type="button" class="profile-modal__submit" id="successModalButton" style="width: 100%;">متوجه شدم</button>
                    </div>
                </div>
            </div>

            <!-- Confirm Logout Modal -->
            <div class="profile-modal" aria-hidden="true" id="confirmLogoutModal" style="display: none;">
                <div class="profile-modal__overlay"></div>
                <div class="profile-modal__box" role="dialog" aria-modal="true" aria-labelledby="confirmLogoutTitle">
                    <div class="profile-modal__header">
                        <div>
                            <h2 class="profile-modal__title" id="confirmLogoutTitle" style="color: #ef4444;">⚠️ خروج از حساب</h2>
                            <p class="profile-modal__subtitle" id="confirmLogoutMessage">آیا مطمئن هستید که می‌خواهید خارج شوید؟</p>
                        </div>
                        <button type="button" class="profile-modal__close" id="closeLogoutModal" aria-label="بستن">×</button>
                    </div>
                    <div class="profile-modal__footer">
                        <button type="button" class="profile-modal__cancel" id="cancelLogoutBtn">انصراف</button>
                        <button type="button" class="profile-modal__submit" id="confirmLogoutBtn" style="background: #ef4444;">خروج از حساب</button>
                    </div>
                </div>
            </div>
        </main>
    `;
}

// ============================================================
// Initialize Profile Page
// ============================================================

export function initProfilePage() {
    loadUserProfile();
    setupProfileEvents();
}

// ============================================================
// Setup Profile Events
// ============================================================

function setupProfileEvents() {
    // ============================================================
    // 1. Avatar Modal
    // ============================================================

    const avatarModal = document.getElementById('avatarModal');
    const editAvatarBtn = document.getElementById('editAvatarBtn');
    const closeAvatarModal = document.getElementById('closeAvatarModal');
    const cancelAvatarModal = document.getElementById('cancelAvatarModal');
    const avatarOverlay = avatarModal?.querySelector('.profile-modal__overlay');

    if (editAvatarBtn && avatarModal) {
        const newEditBtn = editAvatarBtn.cloneNode(true);
        editAvatarBtn.parentNode.replaceChild(newEditBtn, editAvatarBtn);

        newEditBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            resetAvatarModal();
            openModal(avatarModal);
            return false;
        });
    }

    const closeAvatar = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        closeModal(avatarModal);
        return false;
    };

    if (closeAvatarModal) {
        const newClose = closeAvatarModal.cloneNode(true);
        closeAvatarModal.parentNode.replaceChild(newClose, closeAvatarModal);
        newClose.addEventListener('click', closeAvatar);
    }

    if (cancelAvatarModal) {
        const newCancel = cancelAvatarModal.cloneNode(true);
        cancelAvatarModal.parentNode.replaceChild(newCancel, cancelAvatarModal);
        newCancel.addEventListener('click', closeAvatar);
    }

    if (avatarOverlay) {
        const newOverlay = avatarOverlay.cloneNode(true);
        avatarOverlay.parentNode.replaceChild(newOverlay, avatarOverlay);
        newOverlay.addEventListener('click', closeAvatar);
    }

    // ============================================================
    // 2. Username Modal
    // ============================================================

    const usernameModal = document.getElementById('usernameModal');
    const changeUsernameBtn = document.getElementById('changeUsernameBtn');
    const closeUsernameModal = document.getElementById('closeUsernameModal');
    const cancelUsernameModal = document.getElementById('cancelUsernameModal');
    const usernameOverlay = usernameModal?.querySelector('.profile-modal__overlay');

    if (changeUsernameBtn && usernameModal) {
        const newBtn = changeUsernameBtn.cloneNode(true);
        changeUsernameBtn.parentNode.replaceChild(newBtn, changeUsernameBtn);

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const currentUsername = document.getElementById('userUsername')?.textContent || '';
            const usernameInput = document.getElementById('new-username');
            if (usernameInput) usernameInput.value = currentUsername;
            const errorEl = document.getElementById('usernameError');
            if (errorEl) errorEl.textContent = '';
            openModal(usernameModal);
            return false;
        });
    }

    const closeUsername = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        closeModal(usernameModal);
        return false;
    };

    if (closeUsernameModal) {
        const newClose = closeUsernameModal.cloneNode(true);
        closeUsernameModal.parentNode.replaceChild(newClose, closeUsernameModal);
        newClose.addEventListener('click', closeUsername);
    }

    if (cancelUsernameModal) {
        const newCancel = cancelUsernameModal.cloneNode(true);
        cancelUsernameModal.parentNode.replaceChild(newCancel, cancelUsernameModal);
        newCancel.addEventListener('click', closeUsername);
    }

    if (usernameOverlay) {
        const newOverlay = usernameOverlay.cloneNode(true);
        usernameOverlay.parentNode.replaceChild(newOverlay, usernameOverlay);
        newOverlay.addEventListener('click', closeUsername);
    }

    // ============================================================
    // 3. Email Modal
    // ============================================================

    const emailModal = document.getElementById('emailModal');
    const changeEmailBtn = document.getElementById('changeEmailBtn');
    const closeEmailModal = document.getElementById('closeEmailModal');
    const cancelEmailModal = document.getElementById('cancelEmailModal');
    const emailOverlay = emailModal?.querySelector('.profile-modal__overlay');

    if (changeEmailBtn && emailModal) {
        const newBtn = changeEmailBtn.cloneNode(true);
        changeEmailBtn.parentNode.replaceChild(newBtn, changeEmailBtn);

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
            const currentEmail = savedProfile.email || '';
            const emailInput = document.getElementById('new-email');
            const modalTitle = document.getElementById('emailModalTitle');
            const modalSubtitle = document.getElementById('emailModalSubtitle');
            const saveBtn = document.getElementById('saveEmailBtn');

            if (emailInput) emailInput.value = currentEmail;

            const errorEl = document.getElementById('emailError');
            if (errorEl) errorEl.textContent = '';

            if (!currentEmail) {
                if (modalTitle) modalTitle.textContent = 'ثبت ایمیل';
                if (modalSubtitle) modalSubtitle.textContent = 'برای افزایش امنیت حساب، ایمیل خود را ثبت کنید.';
                if (saveBtn) saveBtn.textContent = 'ثبت ایمیل';
            } else {
                if (modalTitle) modalTitle.textContent = 'تغییر ایمیل';
                if (modalSubtitle) modalSubtitle.textContent = 'ایمیل جدید خود را وارد کنید.';
                if (saveBtn) saveBtn.textContent = 'ذخیره ایمیل';
            }

            openModal(emailModal);
            return false;
        });
    }

    const closeEmail = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        closeModal(emailModal);
        return false;
    };

    if (closeEmailModal) {
        const newClose = closeEmailModal.cloneNode(true);
        closeEmailModal.parentNode.replaceChild(newClose, closeEmailModal);
        newClose.addEventListener('click', closeEmail);
    }

    if (cancelEmailModal) {
        const newCancel = cancelEmailModal.cloneNode(true);
        cancelEmailModal.parentNode.replaceChild(newCancel, cancelEmailModal);
        newCancel.addEventListener('click', closeEmail);
    }

    if (emailOverlay) {
        const newOverlay = emailOverlay.cloneNode(true);
        emailOverlay.parentNode.replaceChild(newOverlay, emailOverlay);
        newOverlay.addEventListener('click', closeEmail);
    }

    // ============================================================
    // 4. Password Modal
    // ============================================================

    const passwordModal = document.getElementById('passwordModal');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelPasswordModal = document.getElementById('cancelPasswordModal');
    const passwordOverlay = passwordModal?.querySelector('.profile-modal__overlay');

    if (changePasswordBtn && passwordModal) {
        const newBtn = changePasswordBtn.cloneNode(true);
        changePasswordBtn.parentNode.replaceChild(newBtn, changePasswordBtn);

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            const errorEl = document.getElementById('passwordError');
            if (errorEl) errorEl.textContent = '';
            openModal(passwordModal);
            return false;
        });
    }

    const closePassword = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        closeModal(passwordModal);
        return false;
    };

    if (closePasswordModal) {
        const newClose = closePasswordModal.cloneNode(true);
        closePasswordModal.parentNode.replaceChild(newClose, closePasswordModal);
        newClose.addEventListener('click', closePassword);
    }

    if (cancelPasswordModal) {
        const newCancel = cancelPasswordModal.cloneNode(true);
        cancelPasswordModal.parentNode.replaceChild(newCancel, cancelPasswordModal);
        newCancel.addEventListener('click', closePassword);
    }

    if (passwordOverlay) {
        const newOverlay = passwordOverlay.cloneNode(true);
        passwordOverlay.parentNode.replaceChild(newOverlay, passwordOverlay);
        newOverlay.addEventListener('click', closePassword);
    }

    // ============================================================
    // 5. Password Toggle
    // ============================================================

    togglePasswordVisibility('current-password', 'toggleCurrentPassword');
    togglePasswordVisibility('new-password', 'toggleNewPassword');
    togglePasswordVisibility('confirm-password', 'toggleConfirmPassword');

    // ============================================================
    // 6. Save Profile
    // ============================================================

    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        const newBtn = saveProfileBtn.cloneNode(true);
        saveProfileBtn.parentNode.replaceChild(newBtn, saveProfileBtn);

        newBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const firstName = document.getElementById('first-name')?.value.trim() || '';
            const lastName = document.getElementById('last-name')?.value.trim() || '';
            const province = document.getElementById('province')?.value || '';
            const gender = document.getElementById('gender')?.value || '';

            try {
                await saveUserProfile({
                    first_name: firstName,
                    last_name: lastName,
                    province: province,
                    gender: gender
                });
                showSuccessModal('✅ اطلاعات ذخیره شد', 'اطلاعات پروفایل شما با موفقیت ذخیره شد.');
            } catch (error) {
                alert(error.message || 'خطا در ذخیره اطلاعات');
            }
            return false;
        });
    }

    // ============================================================
    // 7. Logout
    // ============================================================

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        const newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openConfirmLogoutModal();
            return false;
        });
    }

    // ============================================================
    // 8. Confirm Logout Modal
    // ============================================================

    const confirmLogoutModal = document.getElementById('confirmLogoutModal');
    const closeLogoutModal = document.getElementById('closeLogoutModal');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const logoutOverlay = confirmLogoutModal?.querySelector('.profile-modal__overlay');

    const closeLogout = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        closeConfirmLogoutModal();
        return false;
    };

    if (closeLogoutModal) {
        const newClose = closeLogoutModal.cloneNode(true);
        closeLogoutModal.parentNode.replaceChild(newClose, closeLogoutModal);
        newClose.addEventListener('click', closeLogout);
    }

    if (cancelLogoutBtn) {
        const newCancel = cancelLogoutBtn.cloneNode(true);
        cancelLogoutBtn.parentNode.replaceChild(newCancel, cancelLogoutBtn);
        newCancel.addEventListener('click', closeLogout);
    }

    if (logoutOverlay) {
        const newOverlay = logoutOverlay.cloneNode(true);
        logoutOverlay.parentNode.replaceChild(newOverlay, logoutOverlay);
        newOverlay.addEventListener('click', closeLogout);
    }

    if (confirmLogoutBtn) {
        const newBtn = confirmLogoutBtn.cloneNode(true);
        confirmLogoutBtn.parentNode.replaceChild(newBtn, confirmLogoutBtn);
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            performLogout();
            return false;
        });
    }

    // ============================================================
    // 9. Theme Toggle
    // ============================================================

    const themeToggle = document.getElementById('themeToggle');
    const themeStatus = document.getElementById('themeStatus');

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.setAttribute('aria-pressed', 'true');
        if (themeStatus) themeStatus.textContent = 'حالت تاریک';
    }

    if (themeToggle) {
        const newToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newToggle, themeToggle);

        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const isDark = this.getAttribute('aria-pressed') === 'true';

            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                this.setAttribute('aria-pressed', 'false');
                if (themeStatus) themeStatus.textContent = 'حالت روشن';
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                this.setAttribute('aria-pressed', 'true');
                if (themeStatus) themeStatus.textContent = 'حالت تاریک';
                localStorage.setItem('theme', 'dark');
            }
            return false;
        });
    }

    // ============================================================
    // 10. Image Upload
    // ============================================================

    setupImageUpload();

    // ============================================================
    // 11. Success Modal
    // ============================================================

    const closeSuccessBtn = document.getElementById('closeSuccessModal');
    const successButton = document.getElementById('successModalButton');
    const successOverlay = document.getElementById('successModal')?.querySelector('.profile-modal__overlay');

    const closeSuccess = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        closeSuccessModal();
        return false;
    };

    if (closeSuccessBtn) {
        const newClose = closeSuccessBtn.cloneNode(true);
        closeSuccessBtn.parentNode.replaceChild(newClose, closeSuccessBtn);
        newClose.addEventListener('click', closeSuccess);
    }

    if (successButton) {
        const newBtn = successButton.cloneNode(true);
        successButton.parentNode.replaceChild(newBtn, successButton);
        newBtn.addEventListener('click', closeSuccess);
    }

    if (successOverlay) {
        const newOverlay = successOverlay.cloneNode(true);
        successOverlay.parentNode.replaceChild(newOverlay, successOverlay);
        newOverlay.addEventListener('click', closeSuccess);
    }

    // ============================================================
    // 12. Save Buttons in Modals
    // ============================================================

    // Save Username
    const saveUsernameBtn = document.getElementById('saveUsernameBtn');
    if (saveUsernameBtn) {
        const newBtn = saveUsernameBtn.cloneNode(true);
        saveUsernameBtn.parentNode.replaceChild(newBtn, saveUsernameBtn);

        newBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const newUsername = document.getElementById('new-username')?.value.trim();
            const errorEl = document.getElementById('usernameError');

            if (!newUsername) {
                if (errorEl) errorEl.textContent = 'لطفا نام کاربری را وارد کنید';
                return;
            }

            if (!isValidUsername(newUsername)) {
                if (errorEl) errorEl.textContent = 'نام کاربری باید بین ۳ تا ۲۰ کاراکتر و شامل حروف انگلیسی، اعداد و _ باشد';
                return;
            }

            if (errorEl) errorEl.textContent = '';

            try {
                await saveUserProfile({ username: newUsername });
                updateUsernameInUI(newUsername);

                const session = JSON.parse(localStorage.getItem('auth:session')) || {};
                session.username = newUsername;
                localStorage.setItem('auth:session', JSON.stringify(session));

                closeModal(usernameModal);
                showSuccessModal('✅ نام کاربری تغییر کرد', 'نام کاربری شما با موفقیت تغییر یافت.');

            } catch (error) {
                alert(error.message || 'خطا در تغییر نام کاربری');
            }
            return false;
        });
    }

    // Save Email
    const saveEmailBtn = document.getElementById('saveEmailBtn');
    if (saveEmailBtn) {
        const newBtn = saveEmailBtn.cloneNode(true);
        saveEmailBtn.parentNode.replaceChild(newBtn, saveEmailBtn);

        newBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const newEmail = document.getElementById('new-email')?.value.trim();
            const errorEl = document.getElementById('emailError');

            if (!newEmail) {
                if (errorEl) errorEl.textContent = 'لطفا ایمیل را وارد کنید';
                return;
            }

            if (!isValidEmail(newEmail)) {
                if (errorEl) errorEl.textContent = 'لطفا یک ایمیل معتبر وارد کنید';
                return;
            }

            if (errorEl) errorEl.textContent = '';

            try {
                await setUserEmail(newEmail);
                closeModal(emailModal);
                showSuccessModal('✅ ایمیل ثبت شد', 'ایمیل شما با موفقیت ثبت شد.');

                const changeEmailBtn = document.getElementById('changeEmailBtn');
                if (changeEmailBtn) changeEmailBtn.textContent = 'تغییر';

            } catch (error) {
                alert(error.message || 'خطا در ثبت ایمیل');
            }
            return false;
        });
    }

    // Save Password
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    if (savePasswordBtn) {
        const newBtn = savePasswordBtn.cloneNode(true);
        savePasswordBtn.parentNode.replaceChild(newBtn, savePasswordBtn);

        newBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const currentPassword = document.getElementById('current-password')?.value;
            const newPassword = document.getElementById('new-password')?.value;
            const confirmPassword = document.getElementById('confirm-password')?.value;
            const errorEl = document.getElementById('passwordError');

            if (!currentPassword) {
                if (errorEl) errorEl.textContent = 'لطفا رمز عبور فعلی را وارد کنید';
                return;
            }

            if (!newPassword || newPassword.length < 8) {
                if (errorEl) errorEl.textContent = 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد';
                return;
            }

            if (newPassword !== confirmPassword) {
                if (errorEl) errorEl.textContent = 'رمز عبور جدید و تکرار آن مطابقت ندارند';
                return;
            }

            if (errorEl) errorEl.textContent = '';

            try {
                const session = JSON.parse(localStorage.getItem('auth:session')) || {};
                const userId = session.userId;

                if (!userId) {
                    alert('لطفاً وارد حساب کاربری خود شوید');
                    return;
                }

                const result = await UsersAPI.changePassword(userId, currentPassword, newPassword);

                if (result.password_changed_at) {
                    updatePasswordLastChange(result.password_changed_at);
                }

                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';

                closeModal(passwordModal);
                showSuccessModal('🔒 رمز عبور تغییر کرد', 'رمز عبور شما با موفقیت تغییر یافت.');

            } catch (error) {
                alert(error.message || 'خطا در تغییر رمز عبور');
            }
            return false;
        });
    }

    // ============================================================
    // 13. Close Modals with Escape
    // ============================================================

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.profile-modal[aria-hidden="false"]');
            modals.forEach(function(modal) {
                closeModal(modal);
            });
        }
    });
}

// ============================================================
// Logout Modal Functions
// ============================================================

function openConfirmLogoutModal() {
    const modal = document.getElementById('confirmLogoutModal');
    if (modal) {
        openModal(modal);
    }
}

function closeConfirmLogoutModal() {
    const modal = document.getElementById('confirmLogoutModal');
    if (modal) {
        closeModal(modal);
    }
}

function performLogout() {
    logout();
}

// ============================================================
// Public API
// ============================================================

export function getCurrentProvince() {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    return savedProfile.province || null;
}

export function getCurrentUserProfile() {
    return JSON.parse(localStorage.getItem('userProfile')) || null;
}