export function Clock() {
    return `
        <section class="clock">

            <div class="clock__body">

                <!-- Session Ring -->

                <div class="clock__session-ring">

                    <!--
                        Sessionها بعداً توسط JavaScript
                        بر اساس داده‌های واقعی ساخته می‌شوند.
                    -->

                    <div
                        class="clock__session clock__session--study"
                        style="--session-start: 8; --session-end: 10"
                    ></div>

                    <div
                        class="clock__session clock__session--programming"
                        style="--session-start: 11; --session-end: 13"
                    ></div>

                    <div
                        class="clock__session clock__session--language"
                        style="--session-start: 15; --session-end: 16.5"
                    ></div>

                </div>


                <!-- 24 Hour Clock Face -->

                <div class="clock__face">

                    <!-- Hour Numbers -->

                    <span class="clock__number clock__number--00">00</span>
                    <span class="clock__number clock__number--01">01</span>
                    <span class="clock__number clock__number--02">02</span>
                    <span class="clock__number clock__number--03">03</span>
                    <span class="clock__number clock__number--04">04</span>
                    <span class="clock__number clock__number--05">05</span>
                    <span class="clock__number clock__number--06">06</span>
                    <span class="clock__number clock__number--07">07</span>
                    <span class="clock__number clock__number--08">08</span>
                    <span class="clock__number clock__number--09">09</span>
                    <span class="clock__number clock__number--10">10</span>
                    <span class="clock__number clock__number--11">11</span>
                    <span class="clock__number clock__number--12">12</span>
                    <span class="clock__number clock__number--13">13</span>
                    <span class="clock__number clock__number--14">14</span>
                    <span class="clock__number clock__number--15">15</span>
                    <span class="clock__number clock__number--16">16</span>
                    <span class="clock__number clock__number--17">17</span>
                    <span class="clock__number clock__number--18">18</span>
                    <span class="clock__number clock__number--19">19</span>
                    <span class="clock__number clock__number--20">20</span>
                    <span class="clock__number clock__number--21">21</span>
                    <span class="clock__number clock__number--22">22</span>
                    <span class="clock__number clock__number--23">23</span>


                    <!-- Digital Clock -->

                    <div class="clock__digital" id="digitalClock">
                        10:27:42
                    </div>


                    <!-- Clock Hands -->

                    <div
                        class="clock__hand clock__hand--hour"
                        id="hourHand"
                    ></div>

                    <div
                        class="clock__hand clock__hand--minute"
                        id="minuteHand"
                    ></div>

                    <div
                        class="clock__hand clock__hand--second"
                        id="secondHand"
                    ></div>


                    <!-- Center -->

                    <div class="clock__center"></div>

                </div>

            </div>

        </section>
    `;
}