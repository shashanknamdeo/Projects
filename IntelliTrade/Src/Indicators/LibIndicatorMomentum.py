import os
import sys

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)

import talib
import pandas as pd
import KiteConnectSysPath

from LibKiteConnectUtils import addBodyHighColumn
from LibKiteConnectUtils import addBodyLowColumn
from LibKiteConnectUtils import addCCPCColumn
from LibKiteConnectUtils import addBodyMidPointColumn

import matplotlib.pyplot as plt
from functools import reduce
# --------------------------------------------------------------------------------------------------
# Development

from LibIndicators import getDMIValues

from LoadIndexHistoricalData import loadIndexHistoricalData

from LibInstrumentCharts import plotInstrumentChart
from LibInstrumentCharts import plotCandleStickChart
from LibInstrumentCharts import plotInstrumentChartWithSingleAxis


trade_date = '20240118'
instrumentDF = loadIndexHistoricalData(instrument_name='NIFTYBANK', start_date=trade_date, end_date=trade_date, interval='3MINUTE')
dmiDF = getDMIValues(hlc_df=instrumentDF, lookback=20)
instrumentDF = reduce(lambda df1, df2 : pd.merge(df1, df2, left_on='trade_datetime', right_on='trade_datetime', how='left'), [instrumentDF, dmiDF])
addBodyHighColumn(instrumentDF)
addBodyLowColumn(instrumentDF)
instrumentDF['clpl'] = instrumentDF.body_low.shift(1) - instrumentDF.body_low
instrumentDF['clpl_SMA'] = talib.SMA(instrumentDF.clpl, timeperiod=5)

# plotInstrumentChart(instrumentDF=instrumentDF)
# plotInstrumentChartWithSingleAxis(instrumentDF=instrumentDF, x_axis='trade_time', y_axis_1='body_low', candlestick=True)
# plotInstrumentChartWithSingleAxis(instrumentDF=instrumentDF, x_axis='trade_time', y_axis_1='body_high', candlestick=True)

# x_axis = 'trade_time'
# fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(9, 5))
# ax = plotCandleStickChart(ax, instrumentDF)
# _x_axis = x_axis
# ax.set_xticks(ticks=instrumentDF.index, labels=instrumentDF[_x_axis], rotation=90, fontsize=8, minor=False)
# ax.grid(axis='both', color='black', linestyle='-', linewidth=0.1)


fig = plt.figure()
ax1 = plt.subplot2grid(shape=(6, 1), loc=(0, 0), rowspan=4, colspan=1)
ax2 = plt.subplot2grid(shape=(6, 1), loc=(4, 0), rowspan=2, colspan=1, sharex=ax1)
ax1 = plotCandleStickChart(ax=ax1, instrumentDF=instrumentDF)
ax1.set_xticks(ticks=instrumentDF.index, labels=instrumentDF['trade_time'], rotation=90, fontsize=8, minor=False)
ax1.grid(axis='both', color='black', linestyle='-', linewidth=0.1)

# ax2.plot(instrumentDF.trade_time, instrumentDF.clpl)
ax2.plot(instrumentDF.trade_time, instrumentDF.clpl_SMA)
# ax2.plot(instrumentDF.trade_time, instrumentDF.minus_di, color='red', linewidth=0.5)
# ax2.plot(instrumentDF.trade_time, instrumentDF.plus_di, color='green', linewidth=0.5)
ax2.axhline(y=0, color='black', linestyle = '-', linewidth=0.2)
ax2.set_xticks(ticks=instrumentDF.index, labels=instrumentDF['trade_time'], rotation=90, fontsize=8, minor=False)
ax2.grid(axis='both', color='black', linestyle='-', linewidth=0.1)
plt.show(block=False)

# --------------------------------------------------------------------------------------------------