import asyncio
import aiohttp
import time
import math

historical_klines = []
price_histogram = [0] * 10000

def getHttpKlines():
    global historical_klines

    async def get(session):
        global historical_klines

        start = 1544844000000
        end = time.time() * 1000
        while start < end:
            print(start)

            url = url = 'https://api.binance.com/api/v3/klines?symbol=ETHUSDC&interval=1m&startTime=' + str(start) + '&limit=1000'

            try:
                async with session.get(url = url) as response:
                    historical_klines_tmp = await response.json()

                    if len(historical_klines_tmp) > 1:

                        for kline in historical_klines_tmp:
                            historical_klines.append((
                                float(kline[1]), # open price
                                float(kline[4])  # close price
                            ))
                    else:
                        historical_klines = []

            except Exception as e:
                print("Unable to get url {} due to {}.".format(url, e))
        
            start += 60 * 1000 * 1000
            

    async def main():
        async with aiohttp.ClientSession() as session:
            ret = await asyncio.gather(*[get(session)])
    
    asyncio.run(main())

def calculate_price_histogram():
    global price_histogram
    global historical_klines

    getHttpKlines()

    for (open, close) in historical_klines:
        start = min(open, close)
        end = max(open, close)
        start = math.ceil(start)
        end = math.floor(end)
        for i in range(start, end):
            price_histogram[i] += 1
    
    if len(historical_klines) > 0:
        for st in range(len(price_histogram)):
            if price_histogram[st] > 0:
                break
        for en in range(len(price_histogram)):
            if price_histogram[-(en+1)] > 0:
                break
        
        price_histogram = price_histogram[st:-(en+1)]
        price_histogram.insert(0, st)
        price_histogram.append(st + len(price_histogram) - 2)

        # for i in range(len(price_histogram)):
        #     price_histogram[i] /= len(historical_klines)
        
        print(len(historical_klines))
        
calculate_price_histogram()
with open("pricehistogram.txt", "w") as f:
    data = ','.join(str(e) for e in price_histogram)
    f.write(data)
    f.close()