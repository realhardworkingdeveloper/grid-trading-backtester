(function () {
    //===== Prealoder

    window.onload = function () {
      // It is for preloader
      window.setTimeout(fadeout, 500);

      // Init Chart

      const ctx = document.getElementById('profit').getContext('2d');

      const data = {
          labels: [],
          datasets: [{
              label: 'ETH / USDC',
              backgroundColor: 'rgb(255, 99, 132)',
              borderColor: 'rgb(255, 99, 132)',
              data: [],
              pointRadius: 0,
              pointHoverRadius: 0
          }]
      };

      const config = {
          type: 'line',
          data: data,
          options: {
              plugins: {
                  filler: {
                      propagate: false,
                  },
              },
              interaction: {
                  intersect: false,
              }
          },
      };

      const myChart = new Chart(ctx, config);

      // It is for error message
      $(".text-danger").hide();
      $("#spinner").hide();

      // It is for DatePicker
      var nowTemp = new Date();
      var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

      var startDate = $('#start_date').datepicker({

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
        let now_milliseconds = now.getTime() - (now.getTimezoneOffset() * 60000)
        if(ev.date.valueOf() >= now_milliseconds) {
          $("#start_date_error").show();
        } else {
          $("#start_date_error").hide();
          $('#end_date')[0].focus();
        }
      });

      var endDate = $('#end_date').datepicker({
        beforeShowDay: function(date) {
          return date.valueOf() >= now.valueOf();
        },
        autoclose: true

      }).on('changeDate', function(ev) {
        let now_milliseconds = now.getTime()
        if(ev.date.valueOf() >= now_milliseconds) {
          $("#end_date_error_0").show();
        } else {
          $("#end_date_error_0").hide();
        }
      });

      // Upper limit and Lower limit validator
      $("#upper_limit").change(function(){
        let upper_limit = +$("#upper_limit").val()
        let lower_limit = +$("#lower_limit").val()

        if (upper_limit <= lower_limit) {
          $("#upper_limit_error").show();
        } else {
          $("#upper_limit_error").hide();
        }
      });

      $("#lower_limit").change(function(ev){
        let upper_limit = +$("#upper_limit").val()
        let lower_limit = +$("#lower_limit").val()

        if (upper_limit <= lower_limit || lower_limit <= 0) {
          $("#lower_limit_error").show();
        } else {
          $("#lower_limit_error").hide();
        }
      });

      // It is for Deposit Amount validator
      $("#deposit_amount").change(function(ev){
        let deposit_amount = +$("#deposit_amount").val()

        if (deposit_amount <= 0) {
          $("#deposit_amount_error").show();
        } else {
          $("#deposit_amount_error").hide();
        }
      });

      // It is for grid quantity validator
      $("#grid_quantity").change(function(ev){
        let quantity_per_grid = +$("#quantity_per_grid").val()
        let grid_quantity = +$("#grid_quantity").val()
        let deposit_amount = +$("#deposit_amount").val()

        if (grid_quantity < 3) {
          $("#grid_quantity_error").show();
        } else {
          $("#grid_quantity_error").hide();
        }

        let overflow = quantity_per_grid*(grid_quantity-1) - deposit_amount;
        if (overflow > 0) {
          $("#deposit_more_error").text(`${overflow} ETH should be deposited more`).show();
        } else {
          $("#deposit_more_error").hide();
        }
      });

      // It is for quantity per grid
      $("#quantity_per_grid").change(function(ev){
        let quantity_per_grid = +$("#quantity_per_grid").val()
        let grid_quantity = +$("#grid_quantity").val()
        let deposit_amount = +$("#deposit_amount").val()

        if (quantity_per_grid <= 0) {
          $("#quantity_per_grid_error").show();
        } else {
          $("#quantity_per_grid_error").hide();
        }

        let overflow = quantity_per_grid*(grid_quantity-1) - deposit_amount;
        if (overflow > 0) {
          $("#deposit_more_error").text(`${overflow} ETH should be deposited more`).show();
        } else {
          $("#deposit_more_error").hide();
        }
      });

      // It is for submit button
      $("#submit").click(function(){
        let deposit_amount = +$("#deposit_amount").val()
        let upper_limit = +$("#upper_limit").val()
        let lower_limit = +$("#lower_limit").val()
        let grid_quantity = +$("#grid_quantity").val()
        let quantity_per_grid = +$("#quantity_per_grid").val()
        let start_date = $("#start_date").val()
        let end_date= $("#end_date").val()

        let overflow = quantity_per_grid*(grid_quantity-1) - deposit_amount;

        if(Date.parse(start_date) >= Date.parse(end_date)) {
          $("#end_date_error_1").show();
          return
        } else {
          $("#end_date_error_1").hide();
        }

        if (Date.parse(end_date) > Date.now() || Date.parse(start_date) > Date.now() || start_date == '' || end_date == '') {
          alert("Check Start Date and End Date");
          return
        }

        if (upper_limit <= lower_limit || lower_limit * grid_quantity * quantity_per_grid * deposit_amount <= 0 || overflow > 0) {
          return
        }

        $("#submit").prop('disabled', true);
        $("#spinner").show();
        $("#spinner_text").text("SIMULATING...");

        $.getJSON('/simulate', {
            upper_limit: upper_limit,
            lower_limit: lower_limit,
            grid_quantity: grid_quantity,
            quantity_per_grid: quantity_per_grid,
            start_date: Date.parse(start_date),
            end_date: Date.parse(end_date),
        }, function(res) {
          removeData(myChart);
          addData(myChart, res.labels, res.profits)

          $("#submit").prop('disabled', false);
          $("#spinner_text").text("SIMULATE");
          $("#spinner").hide();

          $("#total_profit").text(`$ ${res.profit}`);
          $("#apy").text(`${res.apy} %`);

          $("#log").append(
            `<tr><th scope='row'>${ $("#log").children().length + 1 }</th>\
            <td>ETH / USDC</td>\
            <td>${ res.labels[0] }</td>\
            <td>${ res.labels[res.labels.length - 1] }</td>\
            <td>$ ${ res.profit }</td>\
            <td>${res.apy} %</td></tr>` 
          );
        });
      });

      $("#delete").click(function(){
        console.log("OK");
        if (confirm("Delete Log?") == true) {
          $.getJSON('/delete', {},
          function(res) {
            alert("Delete Successfully.")
            $("#log").empty();
          });
        } else {
          return
        }
      });
    }

    function addData(chart, labels, profits) {
      labels.forEach(label => {
        chart.data.labels.push(label);
      });
      
      profits.forEach(profit => {
        let value = +profit;
        console.log(value)
        chart.data.datasets.forEach((dataset) => {
          dataset.data.push(value);
        });
      });

      chart.update();
    }

    function removeData(chart) {
      chart.data.labels = []
      chart.data.datasets.forEach((dataset) => {
        dataset.data = [];
      });
      chart.update();
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