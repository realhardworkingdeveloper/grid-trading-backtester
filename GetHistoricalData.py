import asyncio
import aiohttp
import time
import math
import os

class GetHistoricaData():
    def __init__(self, start_date, end_date, symbol = "ETHUSDC", interval = "5m"):
        self.historical_klines = []
        
        self.start_date = start_date
        self.end_date = end_date

        self.symbol = symbol
        self.interval = interval

    def getHttpKlines(self):
        async def get(session):
            start = self.start_date

            end = self.end_date
            
            while start < end:
                print(start)

                url = 'https://api.binance.com/api/v3/klines?symbol=' + self.symbol + '&interval=' + self.interval + '&startTime=' + str(start) + '&limit=1000'

                try:
                    async with session.get(url = url) as response:
                        historical_klines_tmp = await response.json()

                        if len(historical_klines_tmp) > 1:

                            for (idx, kline) in enumerate(historical_klines_tmp):
                                self.historical_klines.append((
                                    float(kline[2]), # open price
                                    float(kline[3])  # close price
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

    def run(self):
        price_histogram = [0] * 10000
        price_label = []

        self.getHttpKlines()

        for (high_price, low_price) in self.historical_klines:

            low_price = math.ceil(low_price)
            high_price = math.floor(high_price)
            
            if low_price > high_price:
                continue
            
            for i in range(low_price, high_price):
                price_histogram[i] += 1
        
        for st in range(len(price_histogram)):
            if price_histogram[st] > 0:
                break
        for en in range(len(price_histogram)):
            if price_histogram[-(en+1)] > 0:
                break

        en = len(price_histogram) - en
        price_histogram = price_histogram[st:en]
        
        for i in range(st, en):
            price_label.append(str(i))
        
        return (price_histogram, price_label)