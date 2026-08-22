export function Header(){
    return `
        <header class="header">
      <div class="header__container">
        <!-- Logo -->
        <a href="/" data-route="/" class="logo">
          <img src="assets/images/logo.png" alt="Planner" class="logo__image" />
        </a>

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