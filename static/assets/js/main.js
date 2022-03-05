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

      $("#start_date").datepicker({
        format: "dd/mm/yyyy",
        autoclose: true
      });
      $("#end_date").datepicker({
        format: "dd/mm/yyyy",
        autoclose: true
      });

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
          // $('#end_date')[0].focus();
        }
        if(ev.date.valueOf() > 0 && ev.date.valueOf() < now_milliseconds) {
          $(this).datepicker('hide');
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

        if(ev.date.valueOf() > 0 && ev.date.valueOf() < now_milliseconds) {
          $(this).datepicker('hide');
        }
      });

      // Deposit amount selection
      $('#deposit_amount_select').on('change', function(e){
        let select = this.value;

        let deposit_amount;
        let upper_limit = +$("#upper_limit").val()
        let lower_limit = +$("#lower_limit").val()
        let grid_quantity = +$("#grid_quantity").val()
        let quantity_per_grid = +$("#quantity_per_grid").val()
        
        if(select == '0') {
          deposit_amount = ((upper_limit + lower_limit) / 2 * grid_quantity - upper_limit) * quantity_per_grid
          
          if(deposit_amount > 0) {
            $("#deposit_amount").val(deposit_amount)
          } else {
            $("#deposit_amount").val("Invalid Parameters")
          }
        } else {
          deposit_amount = (grid_quantity - 1) * quantity_per_grid
          
          if(deposit_amount > 0) {
            $("#deposit_amount").val(deposit_amount)
          } else {
            $("#deposit_amount").val("Invalid Parameters")
          }
        }
      });

      // Upper limit and Lower limit validator
      $("#upper_limit").keyup(function(){
        let upper_limit = +$("#upper_limit").val()
        let lower_limit = +$("#lower_limit").val()

        if (upper_limit <= lower_limit) {
          $("#upper_limit_error").show();
        } else {
          $("#upper_limit_error").hide();
        }

        $('#deposit_amount_select').trigger('change');
      });

      $("#lower_limit").keyup(function(ev){
        let upper_limit = +$("#upper_limit").val()
        let lower_limit = +$("#lower_limit").val()

        if (upper_limit <= lower_limit || lower_limit <= 0) {
          $("#lower_limit_error").show();
        } else {
          $("#lower_limit_error").hide();
        }

        $('#deposit_amount_select').trigger('change');
      });

      // It is for grid quantity validator
      $("#grid_quantity").keyup(function(ev){
        let grid_quantity = +$("#grid_quantity").val()

        if (grid_quantity < 3) {
          $("#grid_quantity_error").show();
        } else {
          $("#grid_quantity_error").hide();
        }

        $('#deposit_amount_select').trigger('change');
      });

      // It is for quantity per grid
      $("#quantity_per_grid").keyup(function(ev){
        let quantity_per_grid = +$("#quantity_per_grid").val()

        if (quantity_per_grid <= 0) {
          $("#quantity_per_grid_error").show();
        } else {
          $("#quantity_per_grid_error").hide();
        }

        $('#deposit_amount_select').trigger('change');
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

        start_date = changeDateFormat(start_date);
        end_date = changeDateFormat(end_date);

        let overflow = quantity_per_grid*(grid_quantity-1) - deposit_amount;

        if(Date.parse(start_date) >= Date.parse(end_date)) {
          $("#end_date_error_1").show();
          return
        } else {
          $("#end_date_error_1").hide();
        }

        if (Date.parse(end_date) > Date.now() || Date.parse(start_date) > Date.now() || start_date == '' || end_date == '') {
          console.log(end_date)
          console.log(start_date)
          alert("Check Start Date and End Date");
          return
        }

        if (upper_limit <= lower_limit || lower_limit * grid_quantity * quantity_per_grid * deposit_amount <= 0 || overflow > 0) {
          return
        }

        $("#submit").prop('disabled', true);
        $("#spinner").show();
        $("#spinner_text").text("Calculating...");

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
          $("#spinner_text").text("Calculate");
          $("#spinner").hide();

          $("#total_profit").text(`$ ${res.profit}`);
          $("#apy").text(`${res.apy} %`);

          let idx = $("#log").children().length + 1;

          $("#log").append(
            `<tr>
              <th scope='row'>${idx}</th>
              <td>ETH / USDC</td>
              <td>${ res.labels[0] }</td>
              <td>${ res.labels[res.labels.length - 1] }</td>
              <td>$ ${ res.profit }</td>
              <td>${res.apy} %</td>
              <td>
                <!-- Button trigger modal -->
                <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#detail${idx}">
                    More
                </button>
                
                <!-- Modal -->
                <div class="modal fade" id="detail${idx}" tabindex="-1" aria-labelledby="detailTitle" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                        <h5 class="modal-title" id="detailTitle">Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <table class="table">
                                <thead>
                                    <tr style="vertical-align: middle;">
                                        <th>Trading Pair</th>
                                        <th>Upper Price Limit</th>
                                        <th>Lower Price Limit</th>
                                        <th>Deposit Amount</th>
                                        <th>Grid Quantity</th>
                                        <th>Quantity per Grid</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Profit($)</th>
                                        <th>APY(%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>ETH / USDC</td>
                                        <td>${upper_limit}</td>
                                        <td>${lower_limit}</td>
                                        <td>${deposit_amount}</td>
                                        <td>${grid_quantity}</td>
                                        <td>${quantity_per_grid}</td>
                                        <td>${start_date}</td>
                                        <td>${end_date}</td>
                                        <td>${ res.profit }</td>
                                        <td>${res.apy}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                    </div>
                </div>
            </td>
            </tr>` 
          );

          $('.modal').on('shown.bs.modal', function() {
            //Make sure the modal and backdrop are siblings (changes the DOM)
            $(this).before($('.modal-backdrop'));
            //Make sure the z-index is higher than the backdrop
            $(this).css("z-index", parseInt($('.modal-backdrop').css('z-index')) + 1);
          });
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

    function changeDateFormat(dateString) {
      let parts = dateString.split("/");
      if(parts.length == 3) {
        return parts[1] + "/" + parts[0] + "/" + parts[2]
      } else {
        return ""
      }
    }

    $('.modal').on('shown.bs.modal', function() {
      //Make sure the modal and backdrop are siblings (changes the DOM)
      $(this).before($('.modal-backdrop'));
      //Make sure the z-index is higher than the backdrop
      $(this).css("z-index", parseInt($('.modal-backdrop').css('z-index')) + 1);
    });

    // WOW active
    new WOW().init();
})();