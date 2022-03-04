from flask import *
from backtester import BackTester
from time import time
from datetime import datetime
import os
  
app = Flask(__name__) #creating the Flask class object   
 
@app.route('/')
def home():
    logs = []
    try:
        f = open("log.txt", "r")
        for line in f.readlines():
            logs.insert(0, line.split(','))
    except:
        pass
    return render_template('home.html', logs = logs)

@app.route('/delete', methods=['GET'])
def delete():
    os.remove("log.txt")
    return jsonify(res = "ok")

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
    apy = round((profit / amount_for_bot_usage) * 10000) / 100

    with open("log.txt", "a") as f:
        f.write("ETH/USDC," + labels[0] + "," + labels[-1] + "," + str(profit) + "," + str(apy) + "\n")
        f.close()
    
    return jsonify(profits = profits, labels = labels, profit = profit, apy = apy)
  
if __name__ =='__main__':
    app.run(debug = True)