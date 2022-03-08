import asyncio
import aiohttp
import time
import math
import os

class GetHistoricaData():
    def __init__(self, start_date, end_date, symbol = "ETHUSDC", interval = "1d"):
        self.historical_klines = []
        
        self.start_date = start_date
        self.end_date = end_date

        self.symbol = symbol
        self.interval = interval

    def run(self):
        async def get(session):
            start = self.start_date

            end = self.end_date

            one_day = 24 * 60 * 60 * 1000
            
            while start < end:
                print(start)

                limit = 1
                if start + one_day * 1000 < end:
                    limit = 1000
                elif start + one_day * 500 < end:
                    limit = 500
                elif start + one_day * 250 < end:
                    limit = 250
                elif start + one_day * 100 < end:
                    limit = 100
                elif start + one_day * 50 < end:
                    limit = 50
                elif start + one_day * 10 < end:
                    limit = 10

                url = 'https://api.binance.com/api/v3/klines?symbol=' + self.symbol + '&interval=' + self.interval + '&startTime=' + str(start) + '&limit=' + str(limit)

                try:
                    async with session.get(url = url) as response:
                        historical_klines_tmp = await response.json()

                        if len(historical_klines_tmp) > 0:

                            for kline in historical_klines_tmp:
                                self.historical_klines.append({
                                    'date': int(kline[0]),
                                    'open': float(kline[1]),
                                    'high': float(kline[2]), 
                                    'low': float(kline[3]),
                                    'value': float(kline[4])
                                })
                        
                except Exception as e:
                    print("Unable to get url {} due to {}.".format(url, e))
            
                start += one_day * limit
                

        async def main():
            async with aiohttp.ClientSession() as session:
                ret = await asyncio.gather(*[get(session)])
        
        asyncio.run(main())

        return self.historical_klines