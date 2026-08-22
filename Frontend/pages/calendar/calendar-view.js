export function CalendarView(){
    return `
        <!-- =========================================================
     CALENDAR PAGE
========================================================= -->

<section class="calendar-page">
  <!-- Header -->
  <header class="calendar-page__header">
    <div class="calendar-page__navigation">
      <button type="button" class="calendar-page__nav-btn" aria-label="ماه قبل">
        ‹
      </button>

      <div class="calendar-page__current-date">
        <span class="calendar-page__month">شهریور</span>
        <span class="calendar-page__year">۱۴۰۵</span>
      </div>

      <button type="button" class="calendar-page__nav-btn" aria-label="ماه بعد">
        ›
      </button>
    </div>

    <button type="button" class="calendar-page__today-btn">امروز</button>
  </header>

  <!-- Calendar -->
  <div class="calendar-page__calendar">
    <!-- Week Days -->
    <div class="calendar-page__weekdays">
      <span>شنبه</span>
      <span>یکشنبه</span>
      <span>دوشنبه</span>
      <span>سه‌شنبه</span>
      <span>چهارشنبه</span>
      <span>پنجشنبه</span>
      <span>جمعه</span>
    </div>

    <!-- Days -->
    <div class="calendar-page__days">
      <!-- ۱ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۱</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 23 Aug </span>

            <span class="calendar-day__hijri"> 10 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">8 از 12</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>

          <span
            class="calendar-day__session"
            style="--activity-color: #e0a458"
          ></span>
        </div>

        <span class="calendar-day__duration"> 02:45 </span>
      </article>

      <!-- ۲ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۲</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 24 Aug </span>

            <span class="calendar-day__hijri"> 11 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">12 از 12</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #d96b6b"
          ></span>
        </div>

        <span class="calendar-day__duration"> 01:20 </span>
      </article>

      <!-- ۳ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۳</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 25 Aug </span>

            <span class="calendar-day__hijri"> 12 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">7 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>

          <span
            class="calendar-day__session"
            style="--activity-color: #8b7cc4"
          ></span>
        </div>

        <span class="calendar-day__duration"> 03:10 </span>
      </article>

      <!-- ۴ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۴</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 26 Aug </span>

            <span class="calendar-day__hijri"> 13 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">13 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #e0a458"
          ></span>
        </div>

        <span class="calendar-day__duration"> 00:55 </span>
      </article>

      <!-- ۵ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۵</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 27 Aug </span>

            <span class="calendar-day__hijri"> 14 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">4 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>
        </div>

        <span class="calendar-day__duration"> 01:40 </span>
      </article>

      <!-- ۶ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۶</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 28 Aug </span>

            <span class="calendar-day__hijri"> 15 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">10 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #d96b6b"
          ></span>

          <span
            class="calendar-day__session"
            style="--activity-color: #e0a458"
          ></span>
        </div>

        <span class="calendar-day__duration"> 02:15 </span>
      </article>

      <!-- ۷ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۷</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 29 Aug </span>

            <span class="calendar-day__hijri"> 16 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">0 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>
        </div>

        <span class="calendar-day__duration"> 01:05 </span>
      </article>

      <!-- ۸ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۸</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 30 Aug </span>

            <span class="calendar-day__hijri"> 17 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">6 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #8b7cc4"
          ></span>
        </div>

        <span class="calendar-day__duration"> 00:40 </span>
      </article>

      <!-- ۹ امروز -->
      <article class="calendar-day calendar-day--today">
        <div class="calendar-day__top">
          <span class="calendar-day__number"> ۹ </span>

          <span class="calendar-day__today-label"> امروز </span>
          <div class="calendar-day__dates">

            <span class="calendar-day__gregorian"> 31 Aug </span>

            <span class="calendar-day__hijri"> 18 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">13 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>

          <span
            class="calendar-day__session"
            style="--activity-color: #e0a458"
          ></span>

          <span
            class="calendar-day__session"
            style="--activity-color: #d96b6b"
          ></span>
        </div>

        <span class="calendar-day__duration"> 05:38 </span>
      </article>

      <!-- ۱۰ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۱۰</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 1 Sep </span>

            <span class="calendar-day__hijri"> 19 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">9 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>
        </div>

        <span class="calendar-day__duration"> 01:30 </span>
      </article>

      <!-- ۱۱ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۱۱</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 2 Sep </span>

            <span class="calendar-day__hijri"> 20 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">0 از 19</div>

        <span class="calendar-day__empty"> بدون فعالیت </span>

        <span class="calendar-day__duration"> 00:00 </span>
      </article>

      <!-- ۱۲ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۱۲</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 3 Sep </span>

            <span class="calendar-day__hijri"> 21 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">5 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #8b7cc4"
          ></span>
        </div>

        <span class="calendar-day__duration"> 00:50 </span>
      </article>

      <!-- ۱۳ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۱۳</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 4 Sep </span>

            <span class="calendar-day__hijri"> 22 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">11 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #e0a458"
          ></span>
        </div>

        <span class="calendar-day__duration"> 01:15 </span>
      </article>

      <!-- ۱۴ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۱۴</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 5 Sep </span>

            <span class="calendar-day__hijri"> 23 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">8 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>

          <span
            class="calendar-day__session"
            style="--activity-color: #d96b6b"
          ></span>
        </div>

        <span class="calendar-day__duration"> 02:35 </span>
      </article>

      <!-- ۱۵ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۱۵</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 6 Sep </span>

            <span class="calendar-day__hijri"> 24 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">0 از 19</div>

        <span class="calendar-day__empty"> بدون فعالیت </span>

        <span class="calendar-day__duration"> 00:00 </span>
      </article>

      <!-- ۱۶ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۱۶</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 7 Sep </span>

            <span class="calendar-day__hijri"> 25 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">7 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>
        </div>

        <span class="calendar-day__duration"> 01:10 </span>
      </article>

      <!-- ۱۷ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۱۷</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 8 Sep </span>

            <span class="calendar-day__hijri"> 26 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">3 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #e0a458"
          ></span>
        </div>

        <span class="calendar-day__duration"> 00:45 </span>
      </article>

      <!-- ۱۸ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۱۸</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 9 Sep </span>

            <span class="calendar-day__hijri"> 27 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">12 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #d96b6b"
          ></span>
        </div>

        <span class="calendar-day__duration"> 01:25 </span>
      </article>

      <!-- ۱۹ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۱۹</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 10 Sep </span>

            <span class="calendar-day__hijri"> 28 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">0 از 19</div>

        <span class="calendar-day__empty"> بدون فعالیت </span>

        <span class="calendar-day__duration"> 00:00 </span>
      </article>

      <!-- ۲۰ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۲۰</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 11 Sep </span>

            <span class="calendar-day__hijri"> 29 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">14 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>
        </div>

        <span class="calendar-day__duration"> 02:00 </span>
      </article>

      <!-- ۲۱ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۲۱</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 12 Sep </span>

            <span class="calendar-day__hijri"> 30 ربیع‌الاول </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">9 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #8b7cc4"
          ></span>
        </div>

        <span class="calendar-day__duration"> 01:35 </span>
      </article>

      <!-- ۲۲ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۲۲</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 13 Sep </span>

            <span class="calendar-day__hijri"> 1 ربیع‌الثانی </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">5 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #e0a458"
          ></span>
        </div>

        <span class="calendar-day__duration"> 00:55 </span>
      </article>

      <!-- ۲۳ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۲۳</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 14 Sep </span>

            <span class="calendar-day__hijri"> 2 ربیع‌الثانی </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">15 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>

          <span
            class="calendar-day__session"
            style="--activity-color: #d96b6b"
          ></span>
        </div>

        <span class="calendar-day__duration"> 03:05 </span>
      </article>

      <!-- ۲۴ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۲۴</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 15 Sep </span>

            <span class="calendar-day__hijri"> 3 ربیع‌الثانی </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">0 از 19</div>

        <span class="calendar-day__empty"> بدون فعالیت </span>

        <span class="calendar-day__duration"> 00:00 </span>
      </article>

      <!-- ۲۵ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۲۵</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 16 Sep </span>

            <span class="calendar-day__hijri"> 4 ربیع‌الثانی </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">10 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>
        </div>

        <span class="calendar-day__duration"> 01:50 </span>
      </article>

      <!-- ۲۶ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۲۶</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 17 Sep </span>

            <span class="calendar-day__hijri"> 5 ربیع‌الثانی </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">18 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #8b7cc4"
          ></span>

          <span
            class="calendar-day__session"
            style="--activity-color: #e0a458"
          ></span>
        </div>

        <span class="calendar-day__duration"> 03:25 </span>
      </article>

      <!-- ۲۷ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۲۷</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 18 Sep </span>

            <span class="calendar-day__hijri"> 6 ربیع‌الثانی </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">2 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #d96b6b"
          ></span>
        </div>

        <span class="calendar-day__duration"> 00:35 </span>
      </article>

      <!-- ۲۸ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۲۸</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 19 Sep </span>

            <span class="calendar-day__hijri"> 7 ربیع‌الثانی </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">11 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>
        </div>

        <span class="calendar-day__duration"> 02:10 </span>
      </article>

      <!-- ۲۹ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۲۹</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 20 Sep </span>

            <span class="calendar-day__hijri"> 8 ربیع‌الثانی </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">0 از 19</div>

        <span class="calendar-day__empty"> بدون فعالیت </span>

        <span class="calendar-day__duration"> 00:00 </span>
      </article>

      <!-- ۳۰ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۳۰</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 21 Sep </span>

            <span class="calendar-day__hijri"> 9 ربیع‌الثانی </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">16 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>

          <span
            class="calendar-day__session"
            style="--activity-color: #e0a458"
          ></span>
        </div>

        <span class="calendar-day__duration"> 03:40 </span>
      </article>

      <!-- ۳۱ -->
      <article class="calendar-day">
        <div class="calendar-day__top">
          <span class="calendar-day__number">۳۱</span>

          <div class="calendar-day__dates">
            <span class="calendar-day__gregorian"> 22 Sep </span>

            <span class="calendar-day__hijri"> 10 ربیع‌الثانی </span>
          </div>
        </div>

        <div class="calendar-day__activity-progress">19 از 19</div>

        <div class="calendar-day__sessions">
          <span
            class="calendar-day__session"
            style="--activity-color: #4f9ea5"
          ></span>

          <span
            class="calendar-day__session"
            style="--activity-color: #d96b6b"
          ></span>

          <span
            class="calendar-day__session"
            style="--activity-color: #8b7cc4"
          ></span>
        </div>

        <span class="calendar-day__duration"> 04:20 </span>
      </article>
    </div>
  </div>
</section>

    `;
}