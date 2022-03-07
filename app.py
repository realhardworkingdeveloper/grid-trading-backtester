from flask import *
from BackTester import BackTester
from GetHistoricalData import GetHistoricaData
from time import time, sleep
from datetime import datetime
import os
from threading import Thread
  
app = Flask(__name__) #creating the Flask class object   
 
@app.route('/')
def home():
    price_hist = []
    price_val = []
    
    return render_template('home.html')

@app.route('/simulate', methods=['GET'])
def report():
    upper_limit = request.args.get('upper_limit', type=float)
    lower_limit = request.args.get('lower_limit', type=float)
    grid_quantity = int(round(request.args.get('grid_quantity', type=float)))
    quantity_per_grid = request.args.get('quantity_per_grid', type=float)
    start_date = int(request.args.get('start_date', type=float))
    end_date = int(request.args.get('end_date', type=float))

    start = time()

    backTester = BackTester(upper_limit, lower_limit, grid_quantity, quantity_per_grid, start_date, end_date)
    profits = backTester.simulate()

    labels = []
    for i in range(len(profits)):
        timestamp = start_date + 24 * 60 * 60 * 1000 * i
        labels.append(datetime.fromtimestamp(timestamp / 1000).strftime("%m/%d/%Y"))
    end = time()

    print(end - start)

    profit = float(profits[-1])
    amount_for_bot_usage = ((upper_limit + lower_limit) / 2 * grid_quantity - upper_limit) * quantity_per_grid
    # apy = round((profit / amount_for_bot_usage) * 10000) / 100
    if len(labels) > 0:
        apy = round((profit / len(labels)) * 365 * 10000 / amount_for_bot_usage) / 100
    else:
        apy = 0
    
    return jsonify(profits = profits, labels = labels, profit = profit, apy = apy)

@app.route('/update', methods=['GET'])
def update():
    start_date = int(request.args.get('start_date', type=float))
    end_date = int(request.args.get('end_date', type=float))

    get_historical_data = GetHistoricaData(start_date, end_date)
    (price_hist, price_label) = get_historical_data.run()
    
    return jsonify(price_hist = price_hist, price_label = price_label)
  

if __name__ =='__main__':
    app.run(debug = True, host = '0.0.0.0', port = 5000)