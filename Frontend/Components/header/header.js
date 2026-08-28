const HEADER_STORAGE_KEYS = {
  avatar: "profile:avatarSrc",
  theme: "profile:theme",
};

const HEADER_DEFAULT_AVATAR_MALE = "/Frontend/assets/images/profile-default-male.png";
const HEADER_DEFAULT_AVATAR_FEMALE = "/Frontend/assets/images/profile-default-female.png";

/* اعمال فوری تم ذخیره‌شده */
(function initHeaderTheme() {
  const theme = localStorage.getItem(HEADER_STORAGE_KEYS.theme) || "light";
  document.documentElement.classList.toggle("theme-dark", theme === "dark");
})();

// ==================================================
// تابع دریافت تصویر پیش‌فرض بر اساس جنسیت
// ==================================================

function getDefaultAvatar(gender) {
  if (gender === 'female') {
    return HEADER_DEFAULT_AVATAR_FEMALE;
  }
  return HEADER_DEFAULT_AVATAR_MALE;
}

// ==================================================
// تابع دریافت تصویر پروفایل از localStorage
// ==================================================

function getHeaderAvatar() {
  // ۱. اول از userProfile بخون (منبع اصلی)
  const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
  const gender = userProfile.gender || 'male';
  const defaultAvatar = getDefaultAvatar(gender);
  
  // ۲. اگر آواتار در userProfile هست، از اون استفاده کن
  if (userProfile.avatar) {
    // اگه آواتار یکی از تصاویر پیش‌فرضه، بر اساس جنسیت تنظیمش کن
    const defaultMale = '/Frontend/assets/images/profile-default-male.png';
    const defaultFemale = '/Frontend/assets/images/profile-default-female.png';
    
    if (userProfile.avatar === defaultMale || userProfile.avatar === defaultFemale) {
      // اگه تصویر پیش‌فرض هست ولی جنسیت عوض شده، تصویر مناسب رو بزار
      const correctDefault = getDefaultAvatar(gender);
      userProfile.avatar = correctDefault;
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      return correctDefault;
    }
    
    return userProfile.avatar;
  }
  
  // ۳. اگر نبود، از کلید قدیمی هدر بخون
  const oldAvatar = localStorage.getItem(HEADER_STORAGE_KEYS.avatar);
  if (oldAvatar) {
    // ذخیره در userProfile برای هماهنگی
    userProfile.avatar = oldAvatar;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    return oldAvatar;
  }
  
  // ۴. در نهایت تصویر پیش‌فرض بر اساس جنسیت
  return defaultAvatar;
}

export function Header(){
    const avatarSrc = getHeaderAvatar();

    return `
        <header class="header">
      <div class="header__container">
        <!-- Logo -->
        <a href="/" data-route="/" class="logo">
          <img src="assets/images/logo.png" alt="Planner" class="logo__image" />
        </a>


                <!-- Active Timer -->
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
        

        <!-- Navigation -->
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

        <!-- Profile -->
        <a href="/profile" data-route="/profile" class="profile">
          <img
            src="${avatarSrc}"
            alt="پروفایل کاربر"
            class="profile__image"
            id="headerProfileImage"
          />
        </a>
      </div>
    </header>
    `;
}


document.addEventListener('click', (event) => {
  // پیدا کردن نزدیکترین لینک منو
  const navLink = event.target.closest('.navigation__link');
  
  // اگر روی منو کلیک شد
  if (navLink) {
    // برداشتن active از همه لینک‌های منو
    document.querySelectorAll('.navigation__link').forEach(link => {
      link.classList.remove('navigation__link--active');
    });
    // اضافه کردن active به لینک کلیک شده
    navLink.classList.add('navigation__link--active');
    
    // حذف کلاس پروفایل (اگر فعال باشه)
    document.querySelector('.profile')?.classList.remove('profile--active');
    return;
  }
  
  // اگر روی لوگو کلیک شد
  if (event.target.closest('.logo')) {
    // برداشتن active از همه لینک‌های منو
    document.querySelectorAll('.navigation__link').forEach(link => {
      link.classList.remove('navigation__link--active');
    });
    // اضافه کردن active به داشبورد
    document.querySelector('.navigation__link[data-route="/"]')?.classList.add('navigation__link--active');
    
    // حذف کلاس پروفایل (اگر فعال باشه)
    document.querySelector('.profile')?.classList.remove('profile--active');
    return;
  }
  
  // اگر روی پروفایل کلیک شد
  if (event.target.closest('.profile')) {
    // برداشتن active از همه لینک‌های منو
    document.querySelectorAll('.navigation__link').forEach(link => {
      link.classList.remove('navigation__link--active');
    });
    
    // اضافه کردن کلاس به پروفایل (نام دلخواه)
    document.querySelector('.profile')?.classList.add('profile--active');
    return;
  }
});

// ==================================================
// تابع بروزرسانی تصویر هدر - با هماهنگی کامل
// ==================================================

export function updateHeaderAvatar(avatarSrc) {
  const headerAvatar = document.getElementById('headerProfileImage');
  
  // بروزرسانی تصویر هدر
  if (headerAvatar && avatarSrc) {
    headerAvatar.src = avatarSrc;
  }
  
  // ذخیره در هر دو مکان
  localStorage.setItem(HEADER_STORAGE_KEYS.avatar, avatarSrc);
  
  // بروزرسانی userProfile
  const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
  userProfile.avatar = avatarSrc;
  localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// ==================================================
// تابع همگام‌سازی کامل هدر با پروفایل
// ==================================================

export function syncHeaderWithProfile() {
  const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
  const gender = userProfile.gender || 'male';
  const defaultAvatar = getDefaultAvatar(gender);
  
  // تعیین آواتار صحیح
  let avatar = userProfile.avatar || defaultAvatar;
  
  // اگه آواتار یکی از تصاویر پیش‌فرضه ولی با جنسیت هماهنگ نیست، اصلاحش کن
  const defaultMale = '/Frontend/assets/images/profile-default-male.png';
  const defaultFemale = '/Frontend/assets/images/profile-default-female.png';
  
  if (avatar === defaultMale || avatar === defaultFemale) {
    // اگه تصویر پیش‌فرض هست ولی جنسیت عوض شده، تصویر مناسب رو بزار
    const correctDefault = getDefaultAvatar(gender);
    if (avatar !== correctDefault) {
      avatar = correctDefault;
      userProfile.avatar = avatar;
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }
  
  // بروزرسانی تصویر هدر
  const headerAvatar = document.getElementById('headerProfileImage');
  if (headerAvatar) {
    headerAvatar.src = avatar;
  }
  
  // ذخیره در کلید قدیمی برای هماهنگی
  localStorage.setItem(HEADER_STORAGE_KEYS.avatar, avatar);
}

// ==================================================
// گوش دادن به event بروزرسانی آواتار از صفحه پروفایل
// ==================================================

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

// ==================================================
// گوش دادن به تغییرات localStorage برای همگام‌سازی
// ==================================================

window.addEventListener('storage', (e) => {
  if (e.key === 'userProfile') {
    try {
      const newProfile = JSON.parse(e.newValue);
      if (newProfile) {
        const gender = newProfile.gender || 'male';
        const defaultAvatar = getDefaultAvatar(gender);
        let avatar = newProfile.avatar || defaultAvatar;
        
        // بررسی تصویر پیش‌فرض بر اساس جنسیت
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
        
        // بروزرسانی تصویر هدر
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

// ==================================================
// همگام‌سازی اولیه هنگام لود صفحه
// ==================================================

// وقتی صفحه لود شد، هدر رو با پروفایل همگام کن
document.addEventListener('DOMContentLoaded', function() {
  syncHeaderWithProfile();
});

// همچنین وقتی هدر رندر میشه، دوباره همگام کن
// این رو توی Header function هم میتونیم صدا بزنیم