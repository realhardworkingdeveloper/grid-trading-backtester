import asyncio
import aiohttp
import time

historical_klines = []
price_histogram = []

def getHttpKlines():
    global historical_klines

    async def get(session):
        start = 0
        end = time.time() * 1000
        while start < end:
            print(start)

            url = 'https://api.binance.com/api/v3/klines?symbol=ETHUSDC&interval=5m&startTime=' + str(start) + '&limit=1000'

            try:
                async with session.get(url = url) as response:
                    historical_klines = await response.json()
                    
                    if len(historical_klines) > 1:

                        for kline in historical_klines:
                            historical_klines.append((
                                float(kline[1]), # open price
                                float(kline[4])  # close price
                            ))
                    else:
                        historical_klines = []

            except Exception as e:
                print("Unable to get url {} due to {}.".format(url, e))
            
            start += 5 * 60 * 1000 * 1000
            

    async def main():
        async with aiohttp.ClientSession() as session:
            ret = await asyncio.gather(*[get(session)])
    
    asyncio.run(main())

def calculate_price_histogram():