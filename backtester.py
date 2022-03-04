import asyncio
import aiohttp
class BackTester:
    def __init__(self, upper_limit, lower_limit, grid_quantity, quantity_per_grid, start_date, end_date, symbol = "ETHUSDC", interval = "5m"):
        self.upper_limit = upper_limit
        self.lower_limit = lower_limit
        self.grid_quantity = grid_quantity
        self.quantity_per_grid = quantity_per_grid
        self.start_date = start_date
        self.end_date = end_date

        self.symbol = symbol
        self.interval = interval

        self.historical_klines = []
        self.price_grid = []
        self.order_grid = []
        self.profit = ["0"]
        self.grid_width = (upper_limit - lower_limit) / (grid_quantity - 1)
        
        for i in range(grid_quantity):
            self.price_grid.append(lower_limit + self.grid_width * i)
            self.order_grid.append(0)

    def getHttpKlines(self):

        async def get(session):
            start = self.start_date
            while start < self.end_date:
                print(start)

                url = 'https://api.binance.com/api/v3/klines?symbol=' + self.symbol + '&interval=' + self.interval + '&startTime=' + str(start) + '&limit=1000'

                try:
                    async with session.get(url = url) as response:
                        historical_klines = await response.json()
                        
                        if len(historical_klines) > 1:

                            for kline in historical_klines:
                                self.historical_klines.append((
                                    float(kline[1]), # open price
                                    float(kline[4])  # close price
                                ))
                        else:
                            self.historical_klines = []

                except Exception as e:
                    print("Unable to get url {} due to {}.".format(url, e))
                
                start += 5 * 60 * 1000 * 1000
                

        async def main():
            async with aiohttp.ClientSession() as session:
                ret = await asyncio.gather(*[get(session)])
        
        asyncio.run(main())
    
    def init_order_grid(self):
        (start_price, _) = self.historical_klines[0]

        for (idx, price) in enumerate(self.price_grid):
            if price < start_price:
                self.order_grid[idx] = -1
            if price > start_price:
                self.order_grid[idx] = 1
    
    def simulate(self):
        self.getHttpKlines()
        if len(self.historical_klines) > 0:
            self.init_order_grid()

            total_buy = 0
            total_sell = 0
            profit = 0

            kline_count = 0
            for (open, close) in self.historical_klines:
                kline_count += 1

                if open > close:
                    for (idx, price) in enumerate(self.price_grid):

                        if idx == len(self.price_grid) - 1:
                            continue

                        if price <= open and price >= close:
                            if self.order_grid[idx] < 0:
                                total_buy += 1
                                self.order_grid[idx] = 0
                                self.order_grid[idx + 1] = 1
                else:
                    for (idx, price) in enumerate(self.price_grid):

                        if idx == 0:
                            continue

                        if price >= open and price <= close:
                            if self.order_grid[idx] > 0:
                                total_sell += 1
                                self.order_grid[idx] = 0
                                self.order_grid[idx - 1] = -1
                
                if kline_count % (12 * 24) == 0:
                    profit = str(round((min(total_buy, total_sell) * self.quantity_per_grid * self.grid_width) * 100) / 100)

                    self.profit.append(profit)

        return self.profit