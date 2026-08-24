export function Header(){
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
            src="assets/images/Profile.jpg"
            alt="پروفایل کاربر"
            class="profile__image"
          />
        </a>
      </div>

      <!-- <div class="auth-actions">
        <a href="#" class="auth-actions__login"> ورود </a>

        <a href="#" class="auth-actions__register"> ثبت‌نام </a>
      </div> -->
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