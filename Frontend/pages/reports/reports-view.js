export function ReportsView(){
    return `
        <section class="statistics">
  <!-- ================================
         Statistics Type
    ================================= -->

  <div class="statistics-type">
    <button
      type="button"
      class="statistics-type__item statistics-type__item--active"
      data-statistics-type="timed"
    >
      <span class="statistics-type__icon"> ◷ </span>

      <span class="statistics-type__content">
        <strong> فعالیت‌های زمان‌دار </strong>

        <small> زمان صرف‌شده و سشن‌ها </small>
      </span>
    </button>

    <button
      type="button"
      class="statistics-type__item"
      data-statistics-type="untimed"
    >
      <span class="statistics-type__icon"> ✓ </span>

      <span class="statistics-type__content">
        <strong> فعالیت‌های بدون زمان </strong>

        <small> میزان انجام و پیشرفت </small>
      </span>
    </button>
  </div>

  <!-- ================================
         Statistics Filters
    ================================= -->

  <section class="statistics-filters">
    <!-- Quick Range -->

    <div class="statistics-filters__quick">
      <span class="statistics-filters__label"> بازه سریع </span>

      <div class="statistics-filters__quick-list">
        <button
          type="button"
          class="statistics-filter-btn statistics-filter-btn--active"
          data-range="today"
        >
          امروز
        </button>

        <button type="button" class="statistics-filter-btn" data-range="week">
          هفته گذشته
        </button>

        <button type="button" class="statistics-filter-btn" data-range="month">
          ماه گذشته
        </button>
      </div>
    </div>

    <!-- Historical Selection -->

    <div class="statistics-filters__history">
      <span class="statistics-filters__label"> مشاهده سابقه </span>

      <div class="statistics-filters__selectors">
        <!-- Year -->

        <button
          type="button"
          class="statistics-selector"
          id="statisticsYearSelector"
        >
          <span class="statistics-selector__label"> سال </span>

          <strong class="statistics-selector__value"> ۱۴۰۵ </strong>

          <span class="statistics-selector__arrow"> ⌄ </span>
        </button>

        <!-- Month -->

        <button
          type="button"
          class="statistics-selector"
          id="statisticsMonthSelector"
        >
          <span class="statistics-selector__label"> ماه </span>

          <strong class="statistics-selector__value"> شهریور </strong>

          <span class="statistics-selector__arrow"> ⌄ </span>
        </button>

        <!-- Custom -->

        <button
          type="button"
          class="statistics-selector statistics-selector--custom"
          id="statisticsCustomRange"
        >
          <span class="statistics-selector__icon"> ▣ </span>

          <strong class="statistics-selector__value"> بازه دلخواه </strong>
        </button>
      </div>
    </div>
  </section>


  <!-- ================================
         TIMED STATISTICS
    ================================= -->

  <section
    class="statistics-content statistics-content--timed"
    data-statistics-content="timed"
  >
    <!-- Main Overview -->

    <div class="statistics-main-card">
      <div class="statistics-main-card__header">
        <div>
          <span class="statistics-main-card__eyebrow">
            فعالیت‌های زمان‌دار
          </span>

          <h2 class="statistics-main-card__title">توزیع زمان مفید</h2>
        </div>

        <div class="statistics-main-card__total">
          <span> مجموع زمان </span>

          <strong> 38:42 </strong>
        </div>
      </div>

      <div class="statistics-timed">
        <!-- Donut -->

        <div class="statistics-timed__chart">
          <div class="statistics-donut">
            <div class="statistics-donut__center">
              <strong> 38:42 </strong>

              <span> زمان مفید </span>
            </div>
          </div>
        </div>

        <!-- Activities -->

        <div class="statistics-timed__activities">
          <article class="statistics-activity">
            <span
              class="statistics-activity__color"
              style="--activity-color: #4f9ea5"
            ></span>

            <div class="statistics-activity__info">
              <strong> برنامه‌نویسی </strong>

              <span> 18 ساعت و 10 دقیقه </span>
            </div>

            <strong class="statistics-activity__percent"> 47٪ </strong>
          </article>

          <article class="statistics-activity">
            <span
              class="statistics-activity__color"
              style="--activity-color: #e0a458"
            ></span>

            <div class="statistics-activity__info">
              <strong> مطالعه </strong>

              <span> 12 ساعت و 35 دقیقه </span>
            </div>

            <strong class="statistics-activity__percent"> 33٪ </strong>
          </article>

          <article class="statistics-activity">
            <span
              class="statistics-activity__color"
              style="--activity-color: #d96b6b"
            ></span>

            <div class="statistics-activity__info">
              <strong> زبان انگلیسی </strong>

              <span> 8 ساعت و 12 دقیقه </span>
            </div>

            <strong class="statistics-activity__percent"> 20٪ </strong>
          </article>
        </div>
      </div>
    </div>

    <!-- Small Insights -->

    <div class="statistics-insights">
      <div class="statistics-insight">
        <span> بیشترین فعالیت </span>

        <strong> برنامه‌نویسی </strong>
      </div>

      <div class="statistics-insight">
        <span> میانگین روزانه </span>

        <strong> 02:02 </strong>
      </div>

      <div class="statistics-insight">
        <span> تعداد سشن </span>

        <strong> ۴۲ </strong>
      </div>
    </div>
  </section>
    `;
}

  // <!-- ================================
  //        UNTIMED STATISTICS
  //   ================================= -->

  // <section
  //   class="statistics-content statistics-content--untimed"
  //   data-statistics-content="untimed"
  //   hidden
  // >
  //   <div class="statistics-main-card">
  //     <div class="statistics-main-card__header">
  //       <div>
  //         <span class="statistics-main-card__eyebrow">
  //           فعالیت‌های بدون زمان
  //         </span>

  //         <h2 class="statistics-main-card__title">روند انجام فعالیت‌ها</h2>
  //       </div>

  //       <div class="statistics-main-card__total">
  //         <span> مجموع انجام‌شده </span>

  //         <strong> ۸۶ </strong>
  //       </div>
  //     </div>

      // <!-- Line Chart -->

      // <div class="statistics-line-chart">
      //   <div class="statistics-line-chart__y-axis">
      //     <span>۱۰۰</span>
      //     <span>۸۰</span>
      //     <span>۶۰</span>
      //     <span>۴۰</span>
      //     <span>۲۰</span>
      //     <span>۰</span>
      //   </div>

      //   <div class="statistics-line-chart__body">
      //     <div class="statistics-line-chart__grid">
      //       <span></span>
      //       <span></span>
      //       <span></span>
      //       <span></span>
      //       <span></span>
      //       <span></span>
      //     </div>

      //     <div class="statistics-line-chart__line">
      //       <span style="--point-x: 5%; --point-y: 72%"></span>
      //       <span style="--point-x: 20%; --point-y: 48%"></span>
      //       <span style="--point-x: 35%; --point-y: 58%"></span>
      //       <span style="--point-x: 50%; --point-y: 28%"></span>
      //       <span style="--point-x: 65%; --point-y: 42%"></span>
      //       <span style="--point-x: 80%; --point-y: 18%"></span>
      //       <span style="--point-x: 95%; --point-y: 30%"></span>
      //     </div>

      //     <div class="statistics-line-chart__days">
      //       <span>۱</span>
      //       <span>۵</span>
      //       <span>۱۰</span>
      //       <span>۱۵</span>
      //       <span>۲۰</span>
      //       <span>۲۵</span>
      //       <span>۳۰</span>
      //     </div>
      //   </div>
      // </div>

      // <!-- Activity Breakdown -->

  //     <div class="statistics-breakdown">
  //       <article class="statistics-activity">
  //         <span
  //           class="statistics-activity__color"
  //           style="--activity-color: #4f9ea5"
  //         ></span>

  //         <div class="statistics-activity__info">
  //           <strong> مطالعه کتاب </strong>

  //           <span> ۱۸ از ۲۰ مورد </span>
  //         </div>

  //         <strong class="statistics-activity__percent"> ۹۰٪ </strong>
  //       </article>

  //       <article class="statistics-activity">
  //         <span
  //           class="statistics-activity__color"
  //           style="--activity-color: #e0a458"
  //         ></span>

  //         <div class="statistics-activity__info">
  //           <strong> تمرین زبان </strong>

  //           <span> ۱۲ از ۱۵ مورد </span>
  //         </div>

  //         <strong class="statistics-activity__percent"> ۸۰٪ </strong>
  //       </article>

  //       <article class="statistics-activity">
  //         <span
  //           class="statistics-activity__color"
  //           style="--activity-color: #d96b6b"
  //         ></span>

  //         <div class="statistics-activity__info">
  //           <strong> حل تمرین </strong>

  //           <span> ۸ از ۱۰ مورد </span>
  //         </div>

  //         <strong class="statistics-activity__percent"> ۸۰٪ </strong>
  //       </article>
  //     </div>
  //   </div>

  //   <div class="statistics-insights">
  //     <div class="statistics-insight">
  //       <span> بهترین فعالیت </span>

  //       <strong> مطالعه کتاب </strong>
  //     </div>

  //     <div class="statistics-insight">
  //       <span> میانگین روزانه </span>

  //       <strong> ۴٫۵ مورد </strong>
  //     </div>

  //     <div class="statistics-insight">
  //       <span> مجموع اهداف </span>

  //       <strong> ۱۰۸ </strong>
  //     </div>
  //   </div>
  // </section>