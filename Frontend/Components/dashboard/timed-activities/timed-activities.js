export function TimeActivies(){
    return `
        <section class="timed-activities">
  <div class="timed-activities__header">
    <h2 class="timed-activities__title">فعالیت‌های زمان‌دار</h2>

    <button
      type="button"
      class="timed-activities__add"
      aria-label="add timed-activity"
    >
      +
    </button>
  </div>

  <div class="timed-activities__content">
    <div class="timed-activities__list">
      <article class="timed-activity" data-duration="5720">
        <div
          class="timed-activity__indicator"
          style="--activity-color: #e6b84c"
        ></div>

        <div class="timed-activity__info">
          <h3 class="timed-activity__title">مطالعه ریاضی</h3>

          <span class="timed-activity__duration"> 01:35:20 </span>
        </div>

        <button
          type="button"
          class="timed-activity__start"
          style="--activity-color: #e6b84c"
        >
          <span class="timed-activity__start-icon">▶</span>
          <span>شروع</span>
        </button>
      </article>

      <article class="timed-activity" data-duration="3130">
        <div
          class="timed-activity__indicator"
          style="--activity-color: #4f8fc0"
        ></div>

        <div class="timed-activity__info">
          <h3 class="timed-activity__title">برنامه‌نویسی</h3>

          <span class="timed-activity__duration"> 00:52:10 </span>
        </div>

        <button
          type="button"
          class="timed-activity__start"
          style="--activity-color: #4f8fc0"
        >
          <span class="timed-activity__start-icon">▶</span>
          <span>شروع</span>
        </button>
      </article>

      <article class="timed-activity" data-duration="1900">
        <div
          class="timed-activity__indicator"
          style="--activity-color: #d96b6b"
        ></div>

        <div class="timed-activity__info">
          <h3 class="timed-activity__title">زبان انگلیسی</h3>

          <span class="timed-activity__duration"> 00:31:40 </span>
        </div>

        <button
          type="button"
          class="timed-activity__start"
          style="--activity-color: #d96b6b"
        >
          <span class="timed-activity__start-icon">▶</span>
          <span>شروع</span>
        </button>
      </article>

      <article class="timed-activity" data-duration="1260">
        <div
          class="timed-activity__indicator"
          style="--activity-color: #7fb86a"
        ></div>

        <div class="timed-activity__info">
          <h3 class="timed-activity__title">مطالعه کتاب</h3>

          <span class="timed-activity__duration"> 00:21:00 </span>
        </div>

        <button
          type="button"
          class="timed-activity__start"
          style="--activity-color: #7fb86a"
        >
          <span class="timed-activity__start-icon">▶</span>
          <span>شروع</span>
        </button>
      </article>

      <article class="timed-activity" data-duration="720">
        <div
          class="timed-activity__indicator"
          style="--activity-color: #9b7acb"
        ></div>

        <div class="timed-activity__info">
          <h3 class="timed-activity__title">تمرین پروژه</h3>

          <span class="timed-activity__duration"> 00:12:00 </span>
        </div>

        <button
          type="button"
          class="timed-activity__start"
          style="--activity-color: #9b7acb"
        >
          <span class="timed-activity__start-icon">▶</span>
          <span>شروع</span>
        </button>
      </article>
    </div>
  </div>

  <div class="timed-activities__scroll-hint" aria-hidden="true">
    <span></span>
  </div>
</section>

    `;
}