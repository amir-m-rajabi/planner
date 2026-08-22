export function DailyNote(){
    return `
        <section class="daily-notes">
  <!-- Header -->

  <header class="daily-notes__header">
    <h2 class="daily-notes__title">دفترچه امروز</h2>
  </header>

  <!-- Notebook -->

  <div class="daily-notes__content">
    <button
      type="button"
      class="daily-notebook"
      data-note-exists="false"
      aria-label="باز کردن دفترچه یادداشت امروز"
    >
      <!-- Notebook Cover -->

      <div class="daily-notebook__cover">
        <div class="daily-notebook__spine"></div>

        <div class="daily-notebook__label">
          <span class="daily-notebook__icon"> 📖 </span>

          <span class="daily-notebook__name"> یادداشت روزانه </span>
        </div>
      </div>

      <!-- Notebook Status -->

      <div class="daily-notebook__status">
        <span class="daily-notebook__message"> هنوز یادداشتی ننوشته‌اید </span>
      </div>
    </button>

    <!-- Note Action -->

    <button
      type="button"
      class="daily-notes__action"
      data-note-exists="false"
      aria-label="افزودن یادداشت امروز"
      title="افزودن یادداشت"
    >
      +
    </button>
  </div>
</section>

    `;
}