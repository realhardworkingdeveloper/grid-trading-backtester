
function changeDateFormat(dateString) {
  let parts = dateString.split("/");
  if(parts.length == 3) {
    return parts[1] + "/" + parts[0] + "/" + parts[2]
  } else {
    return ""
  }
}

(function () {
    //===== Prealoder

    window.onload = function () {
      // It is for preloader
      window.setTimeout(fadeout, 500);

      var currentdate = new Date(); 
      var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear();
      
                $("#end_date").val(datetime);

      let saved_data = JSON.parse(localStorage.getItem("profit"));
      if (saved_data !== null)
        saved_data.forEach(backtest_data => {
          $("#log").append(
            `<tr>
              <th scope='row'>${ backtest_data[0] }</th>
              <td>${ backtest_data[1] }</td>
              <td>${ backtest_data[7] }</td>
              <td>${ backtest_data[8] }</td>
              <td>$ ${ backtest_data[9] }</td>
              <td>${ backtest_data[10] } %</td>
              <td>
                <!-- Button trigger modal -->
                <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#detail${backtest_data[0]}">
                    More
                </button>
                
                <!-- Modal -->
                <div class="modal fade" id="detail${backtest_data[0]}" tabindex="-1" aria-labelledby="detailTitle" aria-hidden="true">
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
                                        <th>Deposit Amount(USDC)</th>
                                        <th>Grid Quantity</th>
                                        <th>Quantity per Grid(ETH)</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Profit($)</th>
                                        <th>APY(%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${ backtest_data[1] }</td>
                                        <td>${ backtest_data[2] }</td>
                                        <td>${ backtest_data[3] }</td>
                                        <td>${ backtest_data[4] }</td>
                                        <td>${ backtest_data[5] }</td>
                                        <td>${ backtest_data[6] }</td>
                                        <td>${ backtest_data[7] }</td>
                                        <td>${ backtest_data[8] }</td>
                                        <td>${ backtest_data[9] }</td>
                                        <td>${ backtest_data[10] }</td>
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
        });

      // Init Chart

      const ctx1 = document.getElementById('profit').getContext('2d');

      const data1 = {
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

      const config1 = {
          type: 'line',
          data: data1,
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

      const profit_chart = new Chart(ctx1, config1);

      // It is for error message
      $(".text-danger").hide();
      $("#spinner").hide();
      $("#update_spinner").hide();

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
      $("#submit").click(function() {
        let deposit_amount = +$("#deposit_amount").val()
        let upper_limit = +$("#upper_limit").val()
        let lower_limit = +$("#lower_limit").val()
        let grid_quantity = +$("#grid_quantity").val()
        let quantity_per_grid = +$("#quantity_per_grid").val()
        let start_date = $("#start_date").val()
        let end_date= $("#end_date").val()

        start_date = changeDateFormat(start_date);
        end_date = changeDateFormat(end_date);

        let overflow = quantity_per_grid * (grid_quantity - 1) - deposit_amount;

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
        $("#spinner_text").text("Calculating...");

        $.getJSON('/simulate', {
            upper_limit: upper_limit,
            lower_limit: lower_limit,
            grid_quantity: grid_quantity,
            quantity_per_grid: quantity_per_grid,
            start_date: Date.parse(start_date),
            end_date: Date.parse(end_date),
        }, function(res) {
          removeData(profit_chart);
          addData(profit_chart, res.labels, res.profits)

          $("#submit").prop('disabled', false);
          $("#spinner_text").text("Calculate");
          $("#spinner").hide();

          $("#total_profit").text(`$ ${res.profit}`);
          $("#apy").text(`${res.apy} %`);

          let idx = $("#log").children().length + 1;

          const backtest_data = [idx, 'ETH / USDC', upper_limit, lower_limit, deposit_amount, grid_quantity, quantity_per_grid, start_date, end_date, res.profit, res.apy]
          
          let saved_data = JSON.parse(localStorage.getItem("profit"));
          
          if (saved_data === null) {
            saved_data = []
          }
          
          saved_data.push(backtest_data)
          localStorage.setItem("profit", JSON.stringify(saved_data));

          $("#log").append(
            `<tr>
              <th scope='row'>${ backtest_data[0] }</th>
              <td>${ backtest_data[1] }</td>
              <td>${ backtest_data[7] }</td>
              <td>${ backtest_data[8] }</td>
              <td>$ ${ backtest_data[9] }</td>
              <td>${ backtest_data[10] } %</td>
              <td>
                <!-- Button trigger modal -->
                <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#detail${backtest_data[0]}">
                    More
                </button>
                
                <!-- Modal -->
                <div class="modal fade" id="detail${backtest_data[0]}" tabindex="-1" aria-labelledby="detailTitle" aria-hidden="true">
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
                                        <th>Deposit Amount(USDC)</th>
                                        <th>Grid Quantity</th>
                                        <th>Quantity per Grid(ETH)</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Profit($)</th>
                                        <th>APY(%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${ backtest_data[1] }</td>
                                        <td>${ backtest_data[2] }</td>
                                        <td>${ backtest_data[3] }</td>
                                        <td>${ backtest_data[4] }</td>
                                        <td>${ backtest_data[5] }</td>
                                        <td>${ backtest_data[6] }</td>
                                        <td>${ backtest_data[7] }</td>
                                        <td>${ backtest_data[8] }</td>
                                        <td>${ backtest_data[9] }</td>
                                        <td>${ backtest_data[10] }</td>
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
          localStorage.removeItem('profit')
          $("#log").empty();
        } else {
          return
        }
      });

      $('.modal').on('shown.bs.modal', function() {
        //Make sure the modal and backdrop are siblings (changes the DOM)
        $(this).before($('.modal-backdrop'));
        //Make sure the z-index is higher than the backdrop
        $(this).css("z-index", parseInt($('.modal-backdrop').css('z-index')) + 1);
      });
    }

    function addData(chart, labels, profits) {
      labels.forEach(label => {
        chart.data.labels.push(label);
      });
      
      profits.forEach(profit => {
        let value = +profit;
        
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
})();

am5.ready(function() {

  var root = am5.Root.new("price-chart");

  root.setThemes([am5themes_Animated.new(root)]);

  var data = klines_;

  // Create chart
  var chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      focusable: true,
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX"
    })
  );

  // Create axes
  var xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      groupData: true,
      maxDeviation:0.5,
      baseInterval: { timeUnit: "day", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, {pan:"zoom"}),
      tooltip: am5.Tooltip.new(root, {})
    })
  );

  var yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation:1,
      renderer: am5xy.AxisRendererY.new(root, {pan:"zoom"})
    })
  );

  var color = root.interfaceColors.get("background");

  // Add series
  var series = chart.series.push(
    am5xy.CandlestickSeries.new(root, {
      fill: color,
      calculateAggregates: true,
      stroke: color,
      name: "ETH / USDT",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      openValueYField: "open",
      lowValueYField: "low",
      highValueYField: "high",
      valueXField: "date",
      lowValueYGrouped: "low",
      highValueYGrouped: "high",
      openValueYGrouped: "open",
      valueYGrouped: "close",
      legendValueText:
        "Open: {openValueY} Low: {lowValueY} High: {highValueY} Close: {valueY}",
      legendRangeValueText: "{valueYClose}",
      tooltip: am5.Tooltip.new(root, {
        pointerOrientation: "horizontal",
        labelText: "Open: {openValueY}\nLow: {lowValueY}\nHigh: {highValueY}\nClose: {valueY}"
      })
    })
  );

  // Add cursor
  var cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      xAxis: xAxis
    })
  );
  cursor.lineY.set("visible", true);

  // Stack axes vertically
  chart.leftAxesContainer.set("layout", root.verticalLayout);

  // Add scrollbar
  var scrollbar = am5xy.XYChartScrollbar.new(root, {
    orientation: "horizontal",
    height: 50
  });
  chart.set("scrollbarX", scrollbar);

  var sbxAxis = scrollbar.chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      groupData: true,
      groupIntervals: [{ timeUnit: "week", count: 1 }],
      baseInterval: { timeUnit: "day", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, {
        opposite: false,
        strokeOpacity: 0
      })
    })
  );

  var sbyAxis = scrollbar.chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    })
  );

  var sbseries = scrollbar.chart.series.push(
    am5xy.LineSeries.new(root, {
      xAxis: sbxAxis,
      yAxis: sbyAxis,
      valueYField: "value",
      valueXField: "date"
    })
  );

  // Add legend
  var legend = yAxis.axisHeader.children.push(am5.Legend.new(root, {}));

  legend.data.push(series);

  legend.markers.template.setAll({
    width: 10
  });

  legend.markerRectangles.template.setAll({
    cornerRadiusTR: 0,
    cornerRadiusBR: 0,
    cornerRadiusTL: 0,
    cornerRadiusBL: 0
  });

  var colorSet = am5.ColorSet.new(root, {});

  function drawGridLines(grid_price) {
    

    console.log(colorSet);

    var grid_series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Grid",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date" 
      })
    );

    grid_series.strokes.template.setAll({
      templateField: "strokeSettings",
      strokeWidth: 1
    });
    

    var grid = []
    data.forEach(value => {
      grid.push({
        date: value.date,
        value: grid_price,
        strokeSettings: {
          stroke: colorSet.getIndex(1)
        }
      })
    });


    grid_series.data.setAll(grid);
  }

  function updateGridLines() {
    let upper_limit = +$("#upper_limit").val()
    let lower_limit = +$("#lower_limit").val()
    let grid_quantity = +$("#grid_quantity").val()

    while(chart.series.length > 1) {
      chart.series.pop();
    }
    
    if (grid_quantity >= 3 && upper_limit > lower_limit) {
      let grid_width = (upper_limit - lower_limit) / (grid_quantity - 1);

      for(let grid = lower_limit, i = 0; i < grid_quantity ; i ++) {
        drawGridLines(grid);
        grid += grid_width;
      }
    }
  }

  updateGridLines()

  // set data
  series.data.setAll(data);
  sbseries.data.setAll(data);

  // Make stuff animate on load
  series.appear(1000);
  chart.appear(1000, 100);

  $("#update").click(function() {
    let start_date = $("#start_date").val()
    let end_date= $("#end_date").val()

    start_date = changeDateFormat(start_date);
    end_date = changeDateFormat(end_date);

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

    $("#update").prop('disabled', true);
    $("#update_spinner").show();
    $("#update_spinner_text").text("Updating...");

    $.getJSON('/update', {
      start_date: Date.parse(start_date),
      end_date: Date.parse(end_date),
    }, function(res) {
      
      data = res.klines;
      
      // set data
      series.data.setAll(data);
      sbseries.data.setAll(data);

      updateGridLines();

      // Make stuff animate on load
      series.appear(1000);
      chart.appear(1000, 100);

      $("#update").prop('disabled', false);
      $("#update_spinner").hide();
      $("#update_spinner_text").text("Update");
    });
  });

  // Upper limit and Lower limit validator
  $("#upper_limit").keyup(function(){
    updateGridLines();
  });

  $("#lower_limit").keyup(function(ev){
    updateGridLines();
  });

  $("#grid_quantity").keyup(function(ev){
    updateGridLines();
  });

}); // end am5.ready()