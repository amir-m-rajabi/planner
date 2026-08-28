export function ProfileView() {
    // بارگذاری داده‌های ذخیره‌شده از localStorage
    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    
    // تعیین تصویر پیش‌فرض بر اساس جنسیت
    const defaultAvatar = savedProfile.gender === 'female' 
        ? '/Frontend/assets/images/profile-default-female.png' 
        : '/Frontend/assets/images/profile-default-male.png';
    
    // اگر آواتار در localStorage نباشه یا تصویر پیش‌فرض باشه، از تصویر مناسب استفاده کن
    let avatar = savedProfile.avatar || defaultAvatar;
    const defaultMale = '/Frontend/assets/images/profile-default-male.png';
    const defaultFemale = '/Frontend/assets/images/profile-default-female.png';
    
    if (!avatar || avatar === defaultMale || avatar === defaultFemale) {
        avatar = defaultAvatar;
    }
    
    return `
        <main class="profile-page">

            <!-- ==================================================
                 Left Column - Profile Card
            ================================================== -->

            <section class="profile-card">

                <!-- Profile Header -->
                <div class="profile-card__top">

                    <!-- Avatar -->
                    <div class="profile-avatar">

                        <img
                            src="${avatar}"
                            alt="تصویر پروفایل"
                            class="profile-avatar__image"
                            id="profileAvatarImage"
                        />

                        <!-- Edit Profile Image -->
                        <button
                            type="button"
                            class="profile-avatar__edit"
                            aria-label="تغییر تصویر پروفایل"
                            title="تغییر تصویر پروفایل"
                            id="editAvatarBtn"
                        >
                            ✎
                        </button>

                    </div>


                    <!-- Identity -->
                    <div class="profile-card__identity">

                        <h1 class="profile-card__name" id="profileName">
                            ${savedProfile.firstName || 'امیرمحمد'} ${savedProfile.lastName || 'رجبی'}
                        </h1>

                        <p class="profile-card__city" id="profileCity">
                            ${savedProfile.city || 'قزوین، ایران'}
                        </p>

                    </div>

                </div>


                <!-- ==================================================
                     Personal Information
                ================================================== -->

                <div class="profile-form" id="profileForm">

                    <!-- First Name -->
                    <div class="profile-form__field">

                        <label for="first-name">
                            نام
                        </label>

                        <input
                            type="text"
                            id="first-name"
                            name="firstName"
                            value="${savedProfile.firstName || 'امیرمحمد'}"
                            placeholder="نام خود را وارد کنید"
                        />

                    </div>


                    <!-- Last Name -->
                    <div class="profile-form__field">

                        <label for="last-name">
                            نام خانوادگی
                        </label>

                        <input
                            type="text"
                            id="last-name"
                            name="lastName"
                            value="${savedProfile.lastName || 'رجبی'}"
                            placeholder="نام خانوادگی خود را وارد کنید"
                        />

                    </div>


                    <!-- Province -->
                    <div class="profile-form__field">

                        <label for="province">
                            استان
                        </label>

                        <select
                            id="province"
                            name="province"
                        >

                            <option value="">
                                انتخاب استان
                            </option>

                            <option value="البرز" ${savedProfile.province === 'البرز' ? 'selected' : ''}>
                                البرز
                            </option>

                            <option value="اردبیل" ${savedProfile.province === 'اردبیل' ? 'selected' : ''}>
                                اردبیل
                            </option>

                            <option value="آذربایجان شرقی" ${savedProfile.province === 'آذربایجان شرقی' ? 'selected' : ''}>
                                آذربایجان شرقی
                            </option>

                            <option value="آذربایجان غربی" ${savedProfile.province === 'آذربایجان غربی' ? 'selected' : ''}>
                                آذربایجان غربی
                            </option>

                            <option value="بوشهر" ${savedProfile.province === 'بوشهر' ? 'selected' : ''}>
                                بوشهر
                            </option>

                            <option value="تهران" ${savedProfile.province === 'تهران' ? 'selected' : ''}>
                                تهران
                            </option>

                            <option value="چهارمحال و بختیاری" ${savedProfile.province === 'چهارمحال و بختیاری' ? 'selected' : ''}>
                                چهارمحال و بختیاری
                            </option>

                            <option value="خراسان جنوبی" ${savedProfile.province === 'خراسان جنوبی' ? 'selected' : ''}>
                                خراسان جنوبی
                            </option>

                            <option value="خراسان رضوی" ${savedProfile.province === 'خراسان رضوی' ? 'selected' : ''}>
                                خراسان رضوی
                            </option>

                            <option value="خراسان شمالی" ${savedProfile.province === 'خراسان شمالی' ? 'selected' : ''}>
                                خراسان شمالی
                            </option>

                            <option value="خوزستان" ${savedProfile.province === 'خوزستان' ? 'selected' : ''}>
                                خوزستان
                            </option>

                            <option value="زنجان" ${savedProfile.province === 'زنجان' ? 'selected' : ''}>
                                زنجان
                            </option>

                            <option value="سمنان" ${savedProfile.province === 'سمنان' ? 'selected' : ''}>
                                سمنان
                            </option>

                            <option value="سیستان و بلوچستان" ${savedProfile.province === 'سیستان و بلوچستان' ? 'selected' : ''}>
                                سیستان و بلوچستان
                            </option>

                            <option value="فارس" ${savedProfile.province === 'فارس' ? 'selected' : ''}>
                                فارس
                            </option>

                            <option value="قزوین" ${savedProfile.province === 'قزوین' ? 'selected' : ''}>
                                قزوین
                            </option>

                            <option value="قم" ${savedProfile.province === 'قم' ? 'selected' : ''}>
                                قم
                            </option>

                            <option value="کردستان" ${savedProfile.province === 'کردستان' ? 'selected' : ''}>
                                کردستان
                            </option>

                            <option value="کرمان" ${savedProfile.province === 'کرمان' ? 'selected' : ''}>
                                کرمان
                            </option>

                            <option value="کرمانشاه" ${savedProfile.province === 'کرمانشاه' ? 'selected' : ''}>
                                کرمانشاه
                            </option>

                            <option value="کهگیلویه و بویراحمد" ${savedProfile.province === 'کهگیلویه و بویراحمد' ? 'selected' : ''}>
                                کهگیلویه و بویراحمد
                            </option>

                            <option value="گلستان" ${savedProfile.province === 'گلستان' ? 'selected' : ''}>
                                گلستان
                            </option>

                            <option value="گیلان" ${savedProfile.province === 'گیلان' ? 'selected' : ''}>
                                گیلان
                            </option>

                            <option value="لرستان" ${savedProfile.province === 'لرستان' ? 'selected' : ''}>
                                لرستان
                            </option>

                            <option value="مازندران" ${savedProfile.province === 'مازندران' ? 'selected' : ''}>
                                مازندران
                            </option>

                            <option value="مرکزی" ${savedProfile.province === 'مرکزی' ? 'selected' : ''}>
                                مرکزی
                            </option>

                            <option value="هرمزگان" ${savedProfile.province === 'هرمزگان' ? 'selected' : ''}>
                                هرمزگان
                            </option>

                            <option value="همدان" ${savedProfile.province === 'همدان' ? 'selected' : ''}>
                                همدان
                            </option>

                            <option value="یزد" ${savedProfile.province === 'یزد' ? 'selected' : ''}>
                                یزد
                            </option>

                        </select>

                    </div>


                    <!-- Gender -->
                    <div class="profile-form__field">

                        <label for="gender">
                            جنسیت
                        </label>

                        <select
                            id="gender"
                            name="gender"
                        >

                            <option value="">
                                انتخاب جنسیت
                            </option>

                            <option value="male" ${savedProfile.gender === 'male' ? 'selected' : ''}>
                                آقا
                            </option>

                            <option value="female" ${savedProfile.gender === 'female' ? 'selected' : ''}>
                                خانم
                            </option>

                        </select>

                    </div>

                </div>


                <!-- Save -->
                <button
                    type="button"
                    class="profile-card__save"
                    id="saveProfileBtn"
                >
                    ذخیره تغییرات
                </button>

            </section>



            <!-- ==================================================
                 Right Column - Settings Card
            ================================================== -->

            <section class="settings-card">

                <div class="settings-card__header">

                    <h2 class="settings-card__title">
                        تنظیمات حساب
                    </h2>

                    <p class="settings-card__subtitle">
                        اطلاعات ورود و حساب کاربری خود را مدیریت کنید.
                    </p>

                </div>


                <div class="settings-list">

                    <!-- Email -->
                    <div class="setting-item">

                        <div class="setting-item__content">

                            <span class="setting-item__title">
                                ایمیل
                            </span>

                            <span class="setting-item__value" id="userEmail">
                                ${savedProfile.email || 'amir.m.rajabi@gmail.com'}
                            </span>

                        </div>

                        <button
                            type="button"
                            class="setting-item__action"
                            id="changeEmailBtn"
                        >
                            تغییر
                        </button>

                    </div>


                    <!-- Password -->
                    <div class="setting-item">

                        <div class="setting-item__content">

                            <span class="setting-item__title">
                                رمز عبور
                            </span>

                            <span class="setting-item__value">
                                آخرین تغییر: ۲ ماه پیش
                            </span>

                        </div>

                        <button
                            type="button"
                            class="setting-item__action"
                            id="changePasswordBtn"
                        >
                            تغییر
                        </button>

                    </div>


                    <!-- Appearance -->
                    <div class="setting-item setting-item--appearance">

                        <div class="setting-item__content">

                            <span class="setting-item__title">
                                ظاهر برنامه
                            </span>

                            <span class="setting-item__value" id="themeStatus">
                                حالت روشن
                            </span>

                        </div>

                        <button
                            type="button"
                            class="theme-toggle"
                            aria-label="تغییر حالت نمایش"
                            aria-pressed="false"
                            id="themeToggle"
                        >

                            <span class="theme-toggle__icon theme-toggle__icon--light">
                                ☀
                            </span>

                            <span class="theme-toggle__slider"></span>

                            <span class="theme-toggle__icon theme-toggle__icon--dark">
                                ☾
                            </span>

                        </button>

                    </div>

                </div>


                <!-- Logout -->
                <div class="profile-danger">

                    <button
                        type="button"
                        class="logout-btn"
                        id="logoutBtn"
                    >
                        خروج از حساب
                    </button>

                </div>

            </section>



            <!-- ==================================================
                 Profile Image Modal
            ================================================== -->

            <div
                class="profile-modal"
                aria-hidden="true"
                id="avatarModal"
                style="display: none;"
            >

                <!-- Overlay -->
                <div class="profile-modal__overlay"></div>


                <!-- Modal Box -->
                <div
                    class="profile-modal__box"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="profile-image-modal-title"
                >

                    <!-- Header -->
                    <div class="profile-modal__header">

                        <div>

                            <h2
                                id="profile-image-modal-title"
                                class="profile-modal__title"
                            >
                                تصویر پروفایل
                            </h2>

                            <p class="profile-modal__subtitle">
                                تصویر موردنظر خود را انتخاب کنید.
                            </p>

                        </div>


                        <!-- Close -->
                        <button
                            type="button"
                            class="profile-modal__close"
                            aria-label="بستن"
                            id="closeAvatarModal"
                        >
                            ×
                        </button>

                    </div>


                    <!-- Body -->
                    <div class="profile-modal__body">

                        <!-- File Input -->
                        <div class="profile-modal__field">

                            <label for="profile-image">
                                انتخاب تصویر
                            </label>

                            <input
                                type="file"
                                id="profile-image"
                                name="profileImage"
                                accept="image/jpeg,image/png,image/webp"
                            />

                        </div>


                        <!-- Error -->
                        <p
                            class="profile-modal__error"
                            role="alert"
                            id="modalError"
                        ></p>


                        <!-- Preview -->
                        <div
                            class="profile-modal__preview-wrapper"
                            id="previewWrapper"
                            style="display: none;"
                        >

                            <span class="profile-modal__preview-label">
                                پیش‌نمایش
                            </span>

                            <img
                                src=""
                                alt="پیش‌نمایش تصویر پروفایل"
                                class="profile-modal__preview"
                                id="previewImage"
                            />

                        </div>


                        <!-- دکمه حذف تصویر -->
                        <button
                            type="button"
                            class="profile-modal__remove"
                            id="removeImageBtn"
                        >
                            🗑 حذف تصویر و استفاده از تصویر پیش‌فرض
                        </button>


                        <!-- Image Limit -->
                        <span class="profile-modal__hint">
                            حداکثر حجم تصویر: ۲ مگابایت
                        </span>

                    </div>


                    <!-- Footer -->
                    <div class="profile-modal__footer">

                        <button
                            type="button"
                            class="profile-modal__cancel"
                            id="cancelAvatarModal"
                        >
                            انصراف
                        </button>

                        <button
                            type="button"
                            class="profile-modal__submit"
                            id="submitImageBtn"
                            disabled
                        >
                            انتخاب تصویر
                        </button>

                    </div>

                </div>

            </div>

            <!-- ==================================================
                 Change Email Modal
            ================================================== -->

            <div
                class="profile-modal"
                aria-hidden="true"
                id="emailModal"
                style="display: none;"
            >
                <div class="profile-modal__overlay"></div>

                <div class="profile-modal__box" role="dialog" aria-modal="true">
                    <div class="profile-modal__header">
                        <div>
                            <h2 class="profile-modal__title">تغییر ایمیل</h2>

                            <p class="profile-modal__subtitle">ایمیل جدید خود را وارد کنید.</p>
                        </div>

                        <button type="button" class="profile-modal__close" id="closeEmailModal">×</button>
                    </div>

                    <div class="profile-modal__body">
                        <div class="profile-modal__field">
                            <label for="new-email"> ایمیل جدید </label>

                            <input type="email" id="new-email" placeholder="example@email.com" />
                        </div>
                        <p class="profile-modal__error" id="emailError" role="alert"></p>
                    </div>

                    <div class="profile-modal__footer">
                        <button type="button" class="profile-modal__cancel" id="cancelEmailModal">انصراف</button>

                        <button type="button" class="profile-modal__submit" id="saveEmailBtn">ذخیره ایمیل</button>
                    </div>
                </div>
            </div>


            <!-- ==================================================
                Change Password Modal
            ================================================== -->

            <div
                class="profile-modal"
                aria-hidden="true"
                id="passwordModal"
                style="display: none;"
            >
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
                        <div class="profile-modal__field">
                            <label for="current-password"> رمز عبور فعلی </label>

                            <input
                                type="password"
                                id="current-password"
                                placeholder="رمز عبور فعلی"
                            />
                        </div>

                        <div class="profile-modal__field">
                            <label for="new-password"> رمز عبور جدید </label>

                            <input type="password" id="new-password" placeholder="رمز عبور جدید" />
                        </div>

                        <div class="profile-modal__field">
                            <label for="confirm-password"> تکرار رمز عبور جدید </label>

                            <input
                                type="password"
                                id="confirm-password"
                                placeholder="تکرار رمز عبور جدید"
                            />
                        </div>
                        <p class="profile-modal__error" id="passwordError" role="alert"></p>
                    </div>

                    <div class="profile-modal__footer">
                        <button type="button" class="profile-modal__cancel" id="cancelPasswordModal">انصراف</button>

                        <button type="button" class="profile-modal__submit" id="savePasswordBtn">
                            تغییر رمز عبور
                        </button>
                    </div>
                </div>
            </div>

            <!-- ==================================================
                 Success Modal
            ================================================== -->

            <div
                class="profile-modal"
                aria-hidden="true"
                id="successModal"
                style="display: none;"
            >
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
                        <button type="button" class="profile-modal__submit" id="successModalButton" style="width: 100%;">
                            متوجه شدم
                        </button>
                    </div>
                </div>
            </div>

            <!-- ==================================================
                 Confirm Logout Modal
            ================================================== -->

            <div
                class="profile-modal"
                aria-hidden="true"
                id="confirmLogoutModal"
                style="display: none;"
            >
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

// ==================================================
// تابع کمکی برای دریافت تصویر پیش‌فرض بر اساس جنسیت
// ==================================================

function getDefaultAvatar(gender) {
    if (gender === 'female') {
        return '/Frontend/assets/images/profile-default-female.png';
    }
    return '/Frontend/assets/images/profile-default-male.png';
}

// ==================================================
// توابع کمکی مودال
// ==================================================

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
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==================================================
// تابع بروزرسانی هدر
// ==================================================

function updateHeaderAvatar(avatarSrc) {
    const headerAvatar = document.getElementById('headerProfileImage');
    if (headerAvatar && avatarSrc) {
        headerAvatar.src = avatarSrc;
    }
    localStorage.setItem('profile:avatarSrc', avatarSrc);
}

// ==================================================
// تابع نمایش مودال موفقیت
// ==================================================

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

// ==================================================
// تابع نمایش مودال تایید خروج
// ==================================================

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
    // پاک کردن اطلاعات کاربر (اختیاری)
    // localStorage.removeItem('userProfile');
    window.location.href = '/Frontend/index.html';
}

// ==================================================
// تابع اصلی برای راه‌اندازی صفحه پروفایل
// ==================================================

export function initProfilePage() {
    console.log('initProfilePage called');
    
    // =============================================
    // تنظیم آواتار بر اساس جنسیت
    // =============================================
    
    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    const avatarImg = document.getElementById('profileAvatarImage');
    const genderSelect = document.getElementById('gender');
    
    if (avatarImg) {
        const defaultMale = '/Frontend/assets/images/profile-default-male.png';
        const defaultFemale = '/Frontend/assets/images/profile-default-female.png';
        const currentAvatar = savedProfile.avatar || '';
        
        if (!currentAvatar || currentAvatar === defaultMale || currentAvatar === defaultFemale) {
            const gender = savedProfile.gender || 'male';
            avatarImg.src = getDefaultAvatar(gender);
        }
    }
    
    if (genderSelect) {
        genderSelect.addEventListener('change', function() {
            const avatarImg = document.getElementById('profileAvatarImage');
            if (!avatarImg) return;
            
            const currentSrc = avatarImg.src;
            
            if (currentSrc.includes('profile-default-male') || currentSrc.includes('profile-default-female')) {
                const gender = this.value;
                const newAvatar = getDefaultAvatar(gender);
                avatarImg.src = newAvatar;
                
                // بروزرسانی هدر
                updateHeaderAvatar(newAvatar);
            }
        });
    }
    
    // =============================================
    // ۱. مدیریت مودال تصویر پروفایل
    // =============================================
    
    const avatarModal = document.getElementById('avatarModal');
    const editAvatarBtn = document.getElementById('editAvatarBtn');
    const closeAvatarModal = document.getElementById('closeAvatarModal');
    const cancelAvatarModal = document.getElementById('cancelAvatarModal');
    const avatarOverlay = avatarModal?.querySelector('.profile-modal__overlay');
    
    if (editAvatarBtn && avatarModal) {
        editAvatarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Edit avatar button clicked');
            resetAvatarModal();
            openModal(avatarModal);
        });
    }
    
    const closeAvatar = () => closeModal(avatarModal);
    if (closeAvatarModal) closeAvatarModal.addEventListener('click', closeAvatar);
    if (cancelAvatarModal) cancelAvatarModal.addEventListener('click', closeAvatar);
    if (avatarOverlay) avatarOverlay.addEventListener('click', closeAvatar);
    
    // =============================================
    // ۲. مدیریت مودال تغییر ایمیل
    // =============================================
    
    const emailModal = document.getElementById('emailModal');
    const changeEmailBtn = document.getElementById('changeEmailBtn');
    const closeEmailModal = document.getElementById('closeEmailModal');
    const cancelEmailModal = document.getElementById('cancelEmailModal');
    const emailOverlay = emailModal?.querySelector('.profile-modal__overlay');
    
    if (changeEmailBtn && emailModal) {
        changeEmailBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Change email button clicked');
            const currentEmail = document.getElementById('userEmail')?.textContent || '';
            const emailInput = document.getElementById('new-email');
            if (emailInput) emailInput.value = currentEmail;
            const errorEl = document.getElementById('emailError');
            if (errorEl) errorEl.textContent = '';
            openModal(emailModal);
        });
    }
    
    const closeEmail = () => closeModal(emailModal);
    if (closeEmailModal) closeEmailModal.addEventListener('click', closeEmail);
    if (cancelEmailModal) cancelEmailModal.addEventListener('click', closeEmail);
    if (emailOverlay) emailOverlay.addEventListener('click', closeEmail);
    
    const saveEmailBtn = document.getElementById('saveEmailBtn');
    if (saveEmailBtn) {
        saveEmailBtn.addEventListener('click', function() {
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
            
            const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
            savedProfile.email = newEmail;
            localStorage.setItem('userProfile', JSON.stringify(savedProfile));
            
            const emailDisplay = document.getElementById('userEmail');
            if (emailDisplay) emailDisplay.textContent = newEmail;
            
            closeModal(emailModal);
            showSuccessModal('✅ ایمیل تغییر کرد', 'ایمیل شما با موفقیت تغییر یافت.');
        });
    }
    
    // =============================================
    // ۳. مدیریت مودال تغییر رمز عبور
    // =============================================
    
    const passwordModal = document.getElementById('passwordModal');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelPasswordModal = document.getElementById('cancelPasswordModal');
    const passwordOverlay = passwordModal?.querySelector('.profile-modal__overlay');
    
    if (changePasswordBtn && passwordModal) {
        changePasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Change password button clicked');
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            const errorEl = document.getElementById('passwordError');
            if (errorEl) errorEl.textContent = '';
            openModal(passwordModal);
        });
    }
    
    const closePassword = () => closeModal(passwordModal);
    if (closePasswordModal) closePasswordModal.addEventListener('click', closePassword);
    if (cancelPasswordModal) cancelPasswordModal.addEventListener('click', closePassword);
    if (passwordOverlay) passwordOverlay.addEventListener('click', closePassword);
    
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', function() {
            const currentPassword = document.getElementById('current-password')?.value;
            const newPassword = document.getElementById('new-password')?.value;
            const confirmPassword = document.getElementById('confirm-password')?.value;
            const errorEl = document.getElementById('passwordError');
            
            if (!currentPassword) {
                if (errorEl) errorEl.textContent = 'لطفا رمز عبور فعلی را وارد کنید';
                return;
            }
            
            if (!newPassword || newPassword.length < 6) {
                if (errorEl) errorEl.textContent = 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد';
                return;
            }
            
            if (newPassword !== confirmPassword) {
                if (errorEl) errorEl.textContent = 'رمز عبور جدید و تکرار آن مطابقت ندارند';
                return;
            }
            
            if (errorEl) errorEl.textContent = '';
            
            closeModal(passwordModal);
            showSuccessModal('🔒 رمز عبور تغییر کرد', 'رمز عبور شما با موفقیت تغییر یافت.');
        });
    }
    
    // =============================================
    // ۴. مدیریت ذخیره اطلاعات پروفایل
    // =============================================
    
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function() {
            const firstName = document.getElementById('first-name')?.value.trim() || '';
            const lastName = document.getElementById('last-name')?.value.trim() || '';
            const province = document.getElementById('province')?.value || '';
            const gender = document.getElementById('gender')?.value || '';
            
            const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
            
            let avatar = savedProfile.avatar || getDefaultAvatar(gender);
            const defaultMale = '/Frontend/assets/images/profile-default-male.png';
            const defaultFemale = '/Frontend/assets/images/profile-default-female.png';
            
            if (avatar === defaultMale || avatar === defaultFemale || !avatar) {
                avatar = getDefaultAvatar(gender);
            }
            
            const profileData = {
                firstName,
                lastName,
                province,
                gender,
                email: savedProfile.email || 'amir.m.rajabi@gmail.com',
                avatar: avatar,
                city: province ? `${province}، ایران` : 'قزوین، ایران'
            };
            
            localStorage.setItem('userProfile', JSON.stringify(profileData));
            
            const nameEl = document.getElementById('profileName');
            const cityEl = document.getElementById('profileCity');
            if (nameEl) nameEl.textContent = `${firstName} ${lastName}`;
            if (cityEl) cityEl.textContent = profileData.city;
            
            const avatarImg = document.getElementById('profileAvatarImage');
            if (avatarImg) avatarImg.src = avatar;
            
            // بروزرسانی هدر
            updateHeaderAvatar(avatar);
            
            // ارسال event برای همگام‌سازی
            document.dispatchEvent(new CustomEvent('profile:avatar-updated', {
                detail: { src: avatar }
            }));
            
            if (province && window.updateWeatherForCity) {
                window.updateWeatherForCity(province);
            }
            
            showSuccessModal('✅ اطلاعات ذخیره شد', 'اطلاعات پروفایل شما با موفقیت ذخیره شد.');
        });
    }
    
    // =============================================
    // ۵. مدیریت خروج از حساب - با مودال
    // =============================================
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            openConfirmLogoutModal();
        });
    }
    
    // دکمه‌های مودال خروج
    const closeLogoutModal = document.getElementById('closeLogoutModal');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const logoutOverlay = document.getElementById('confirmLogoutModal')?.querySelector('.profile-modal__overlay');
    
    if (closeLogoutModal) closeLogoutModal.addEventListener('click', closeConfirmLogoutModal);
    if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', closeConfirmLogoutModal);
    if (logoutOverlay) logoutOverlay.addEventListener('click', closeConfirmLogoutModal);
    if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', performLogout);
    
    // =============================================
    // ۶. مدیریت تم (روشن/تاریک)
    // =============================================
    
    const themeToggle = document.getElementById('themeToggle');
    const themeStatus = document.getElementById('themeStatus');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.setAttribute('aria-pressed', 'true');
        if (themeStatus) themeStatus.textContent = 'حالت تاریک';
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
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
        });
    }
    
    // =============================================
    // ۷. مدیریت آپلود و حذف تصویر
    // =============================================
    
    setupImageUpload();
    
    // =============================================
    // ۸. مدیریت مودال موفقیت
    // =============================================
    
    const closeSuccessBtn = document.getElementById('closeSuccessModal');
    const successButton = document.getElementById('successModalButton');
    const successOverlay = document.getElementById('successModal')?.querySelector('.profile-modal__overlay');
    
    const closeSuccess = () => closeSuccessModal();
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeSuccess);
    if (successButton) successButton.addEventListener('click', closeSuccess);
    if (successOverlay) successOverlay.addEventListener('click', closeSuccess);
    
    // =============================================
    // ۹. بستن مودال‌ها با کلید Escape
    // =============================================
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.profile-modal[aria-hidden="false"]');
            modals.forEach(function(modal) {
                closeModal(modal);
            });
        }
    });
    
    console.log('Profile page initialized successfully');
}

// ==================================================
// تابع ریست مودال آواتار
// ==================================================

function resetAvatarModal() {
    const fileInput = document.getElementById('profile-image');
    const previewWrapper = document.getElementById('previewWrapper');
    const previewImage = document.getElementById('previewImage');
    const submitBtn = document.getElementById('submitImageBtn');
    const errorEl = document.getElementById('modalError');
    
    if (fileInput) fileInput.value = '';
    if (previewWrapper) previewWrapper.style.display = 'none';
    if (previewImage) previewImage.src = '';
    if (submitBtn) submitBtn.disabled = true;
    if (errorEl) errorEl.textContent = '';
}

// ==================================================
// تابع آپلود تصویر
// ==================================================

function setupImageUpload() {
    const fileInput = document.getElementById('profile-image');
    const previewWrapper = document.getElementById('previewWrapper');
    const previewImage = document.getElementById('previewImage');
    const submitBtn = document.getElementById('submitImageBtn');
    const removeBtn = document.getElementById('removeImageBtn');
    const errorEl = document.getElementById('modalError');
    const avatarModal = document.getElementById('avatarModal');
    const avatarImg = document.getElementById('profileAvatarImage');
    
    let selectedFile = null;
    
    if (!fileInput) {
        console.log('fileInput not found');
        return;
    }
    
    console.log('setupImageUpload initialized');
    console.log('removeBtn element:', removeBtn);
    
    // =============================================
    // دکمه حذف تصویر
    // =============================================
    
    if (removeBtn) {
        console.log('Remove button event listener attached');
        
        removeBtn.addEventListener('click', function() {
            console.log('Remove button clicked');
            
            const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
            const gender = savedProfile.gender || 'male';
            const defaultAvatar = getDefaultAvatar(gender);
            
            savedProfile.avatar = defaultAvatar;
            localStorage.setItem('userProfile', JSON.stringify(savedProfile));
            
            if (avatarImg) avatarImg.src = defaultAvatar;
            
            // بروزرسانی هدر
            updateHeaderAvatar(defaultAvatar);
            
            // ارسال event برای همگام‌سازی
            document.dispatchEvent(new CustomEvent('profile:avatar-updated', {
                detail: { src: defaultAvatar }
            }));
            
            resetAvatarModal();
            closeModal(avatarModal);
            showSuccessModal('🗑 تصویر حذف شد', 'تصویر پروفایل با موفقیت حذف و تصویر پیش‌فرض جایگزین شد.');
        });
    } else {
        console.log('Remove button not found!');
    }
    
    // =============================================
    // انتخاب فایل
    // =============================================
    
    fileInput.addEventListener('change', function(e) {
        console.log('File selected');
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) {
            if (errorEl) errorEl.textContent = 'حجم تصویر نباید بیشتر از ۲ مگابایت باشد';
            if (submitBtn) submitBtn.disabled = true;
            return;
        }
        
        if (!file.type.match(/image\/(jpeg|png|webp)/)) {
            if (errorEl) errorEl.textContent = 'فقط تصاویر با فرمت JPEG، PNG و WebP مجاز هستند';
            if (submitBtn) submitBtn.disabled = true;
            return;
        }
        
        if (errorEl) errorEl.textContent = '';
        selectedFile = file;
        
        const reader = new FileReader();
        reader.onload = function(ev) {
            if (previewImage) previewImage.src = ev.target.result;
            if (previewWrapper) previewWrapper.style.display = 'block';
            if (submitBtn) submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    });
    
    // =============================================
    // تایید و انتخاب تصویر جدید
    // =============================================
    
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const avatarUrl = ev.target.result;
                    
                    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
                    savedProfile.avatar = avatarUrl;
                    localStorage.setItem('userProfile', JSON.stringify(savedProfile));
                    
                    if (avatarImg) avatarImg.src = avatarUrl;
                    
                    // بروزرسانی هدر
                    updateHeaderAvatar(avatarUrl);
                    
                    // ارسال event برای همگام‌سازی
                    document.dispatchEvent(new CustomEvent('profile:avatar-updated', {
                        detail: { src: avatarUrl }
                    }));
                    
                    closeModal(avatarModal);
                    showSuccessModal('✅ تصویر تغییر کرد', 'تصویر پروفایل شما با موفقیت تغییر یافت.');
                };
                reader.readAsDataURL(selectedFile);
            }
        });
    }
}

// ==================================================
// توابع عمومی برای استفاده در سایر بخش‌ها
// ==================================================

export function getCurrentProvince() {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    return savedProfile.province || null;
}

export function getCurrentUserProfile() {
    return JSON.parse(localStorage.getItem('userProfile')) || null;
}