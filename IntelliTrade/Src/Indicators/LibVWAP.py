import KiteConnectSysPath
from GlobalVariables import KITECONNECT_HISTORICAL_DATA_DIR
from LibKiteConnectHistoricalData import loadIntradayInstrumentData


minute_dataframe = loadIntradayInstrumentData(data_dir=KITECONNECT_HISTORICAL_DATA_DIR, instrument_name='ADANIPORTS', date='20210101', interval='MINUTE')


def calculateVWAP(dataframe):
    volume = dataframe.volume.values
    price = dataframe.close.values
    # 
    # return dataframe.assign(vwap=(volume*price).cumsum() / volume.cumsum())
    return (volume*price).cumsum() / volume.cumsum()


minute_dataframe['vwap'] = calculateVWAP(dataframe=minute_dataframe)



# df = df.assign(
#     vwap=df.eval(
#         'wgtd = price * quantity', inplace=False
#     ).groupby(df.index.date).cumsum().eval('wgtd / quantity')
# )