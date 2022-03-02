/*
Template Name: CryptoLand - Crypto Currency Landing Page Template.
Author: GrayGrids
*/

(function () {
    //===== Prealoder

    window.onload = function () {
        window.setTimeout(fadeout, 500);

        var nowTemp = new Date();
        var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

        var startDate = $('#StartDate').datepicker({

          beforeShowDay: function(date) {
            return date.valueOf() >= now.valueOf();
          },
          autoclose: true

        }).on('changeDate', function(ev) {
          if (ev.date.valueOf() > endDate.datepicker("getDate").valueOf() || !endDate.datepicker("getDate").valueOf()) {

            var newDate = new Date(ev.date);
            newDate.setDate(newDate.getDate() + 1);
            endDate.datepicker("update", newDate);

          }
          $('#EndDate')[0].focus();
        });


        var endDate = $('#EndDate').datepicker({
          beforeShowDay: function(date) {
            if (!startDate.datepicker("getDate").valueOf()) {
              return date.valueOf() >= new Date().valueOf();
            } else {
              return date.valueOf() > startDate.datepicker("getDate").valueOf();
            }
          },
          autoclose: true

        }).on('changeDate', function(ev) {});
    }

    function fadeout() {
        document.querySelector('.preloader').style.opacity = '0';
        document.querySelector('.preloader').style.display = 'none';
    }

    // WOW active
    new WOW().init();

    //===== mobile-menu-btn
    let navbarToggler = document.querySelector(".mobile-menu-btn");
    navbarToggler.addEventListener('click', function () {
        navbarToggler.classList.toggle("active");
    });


})();