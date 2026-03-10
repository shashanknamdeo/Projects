# https://towardsdatascience.com/programmatic-identification-of-support-resistance-trend-lines-with-python-d797a4a90530
# https://towardsdatascience.com/algorithmically-drawing-trend-lines-on-a-stock-chart-414ed66d0055

import os
import pandas as pd 
from datetime import datetime

from GlobalVariables import KITECONNECT_INSTRUMENT_TICKDATA_DIR
from LibKiteConnectTickData import tickDataColumnList_FULL

instrument = 'ADANIENT'
mode = 'MODE_FULL'
today_date = datetime.now().strftime('%Y%m%d') 
tick_data_dir = os.path.join(KITECONNECT_INSTRUMENT_TICKDATA_DIR, today_date, instrument)


stock-date '09-Dec AXISBANK'

# tick_data = pd.read_csv(r'E:\NotebookShare\Material\Python\Projects\KiteConnect\Data\HistoricalData\AXISBANK\DAILY\MINUTE\2020\AXISBANK_MINUTE_2020-12-09.csv', header=None, names=tickDataColumnList_FULL)
trendline_data = pd.read_csv(r'E:\NotebookShare\Material\Python\Projects\KiteConnect\Data\HistoricalData\AXISBANK\DAILY\MINUTE\2020\AXISBANK_MINUTE_2020-12-09.csv')

trendline_data = pd.read_csv(r'E:\NotebookShare\Material\Python\Projects\KiteConnect\Data\HistoricalData\ADANIENT\DAILY\MINUTE\2020\ADANIENT_MINUTE_2020-12-24.csv')


# AP1. Let try to find the best fit line

import numpy as np 
x = trendline_data.index.values
y = trendline_data.high.values
slope, intercept = np.polyfit(x, y, 1)
x0 =trendline_data.date[0]
y0 = intercept
x1 =trendline_data.date[374]
y1 = slope*374 + intercept
item_high = (x0, y0, x1, y1, 'Black')


x = trendline_data.index.values
y = trendline_data.low.values
slope, intercept = np.polyfit(x, y, 1)
x0 =trendline_data.date[0]
y0 = intercept
x1 =trendline_data.date[374]
y1 = slope*374 + intercept
item_low = (x0, y0, x1, y1, 'Blue')


# plotCandleStickDayData(dayDataFrame=trendline_data)
plotCandleStickDayData(dayDataFrame=trendline_data, line_list=[item_high, item_low])
# ----------------------------------------------------------------------------------------------------------------------
def plotCandleStickDayData(dayDataFrame, line_list):
    """
    from Charts.CandleStickChart import plotCandleStickDayData
    plotCandleStickDayData(data3)
    plotCandleStickDayData(data3, [612.1, 608.2, 605.85, 602.95, 600.65, 597.6])

    plotCandleStickDayData(dayDataFrame=trendline_data, x0=x0, y0=y0, x1=x1, y1=y1)
    plotCandleStickDayData(dayDataFrame=trendline_data, line_list=[(x0, y0, x1, y1)])

    plotCandleStickDayData(dayDataFrame=trendline_data, line_list=[item_high, item_low])
    """
    import plotly.graph_objects as go
    from plotly.graph_objs import Layout
        # 
    layout = Layout(
        plot_bgcolor='rgba(0,0,0,0)'
    )
    # 
    fig = go.Figure(data=[go.Candlestick(x=dayDataFrame['date'],
                        open=dayDataFrame['open'],
                        high=dayDataFrame['high'],
                        low=dayDataFrame['low'],
                        close=dayDataFrame['close'],
                        increasing_line_color= 'green', 
                        decreasing_line_color= 'red')], 
                    layout=layout)
    # 
    fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor='LightGrey')
    fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor='LightGrey')
    # 
    fig2 = go.Figure(data=go.Scatter(x=dayDataFrame['date'], y=dayDataFrame['low']))
    # 
    # without rangeslider
    fig.update_layout(xaxis_rangeslider_visible=False)
    # 
    for line_item in line_list:
        fig.add_shape(type="line",
            x0=line_item[0], y0=line_item[1], x1=line_item[2], y1=line_item[3],
           line=dict(color=line_item[4], width=1)
        )  
    fig.show()



fig2 = go.Figure(data=go.Scatter(x=dayDataFrame['date'], y=dayDataFrame['low']))
fig2.show()



trendline_data['low_mean10'] = trendline_data.low.rolling(10).mean()
trendline_data['low_min10'] = trendline_data.low.rolling(10).min()
fig3 = go.Figure(data=go.Scatter(x=trendline_data['date'], y=trendline_data['low_min10']))
fig3.show()





# https://plotly.com/python/shapes/ ------------------------------------------------------------------------------------
# https://community.plotly.com/t/arc-shape-with-path/7205/5

# Set axes ranges
fig.update_xaxes(range=[0, 7])
fig.update_yaxes(range=[0, 2.5])

fig.add_shape(type="line",
    x0=1, y0=0, x1=1, y1=2,
    line=dict(color="RoyalBlue",width=3)
)

fig.add_shape(type="line",
    x0=2, y0=2, x1=5, y1=2,
    line=dict(
        color="LightSeaGreen",
        width=4,
        dash="dashdot",
    )
)

fig.add_shape(type="line",
    x0=4, y0=0, x1=6, y1=2,
    line=dict(
        color="MediumPurple",
        width=4,
        dash="dot",
    )
)

fig.update_shapes(dict(xref='x', yref='y')) ??

https://plotly.com/python/shapes/

https://coderzcolumn.com/tutorials/data-science/candlestick-chart-in-python-mplfinance-plotly-bokeh

import cufflinks as cf
trendline_data.iplot(kind="candle",
                          keys=["open", "high", "low", "close"],
                          rangeslider=True
                          )


# ----------------------------------------------------------------------------------------------------------------------


from GlobalVariables import KITECONNECT_HISTORICAL_DATA_DIR
from LibStrategyUtils import findIndexFromTimeStamp
from LibKiteConnectHistoricalData import loadIntradayInstrumentData
minute_dataframe = loadIntradayInstrumentData(data_dir=KITECONNECT_HISTORICAL_DATA_DIR, instrument_name='TECHM', date='20210104', interval='MINUTE')


findIndexFromTimeStamp('')

data = minute_dataframe[195:240+1]
data = minute_dataframe[111:240+1]
data_ri = data[['date', 'close']].reset_index()

from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

model = LinearRegression()
x=np.array(data_ri.index).reshape(-1, 1)
y=np.array(data_ri.close).reshape(-1, 1)
model.fit(x, y)
close_pred = model.predict(x)
data_ri['close_pred'] = model.predict(x)
model.intercept_
model.coef_
mean_squared_error(data_ri.close, data_ri.close_pred)


# For the trendline, close of all the points should not be used in final trendline, as if price can bounces high from the 
# trend-line, and for all those points, the mean_squared_error can be high.


minute_dataframe = loadIntradayInstrumentData(data_dir=KITECONNECT_HISTORICAL_DATA_DIR, instrument_name='NIFTY BANK', date='20201222', interval='MINUTE')
data = minute_dataframe[196:323+1] 
data_ri = data[['date', 'close']].reset_index()

model.intercept_
array([29119.58137718])
model.coef_
array([[4.22197757]])

mean_squared_error(data_ri.close, data_ri.close_pred)
2407.334389779935

data_ri['flag'] = data_ri.apply(lambda x: True if x.close_pred > x.close else False, axis=1)
data_ri.shape
(128, 5)

data_ri[data_ri.flag == True].shape
(61, 5)


data_ri = data_ri[data_ri.flag == True]

# Iteration:2

model.intercept_
array([29059.62069235]) -> Intercept is changes because this time there would be a different line
>>> model.coef_
array([[4.53305431]])
>>> mean_squared_error(data_ri.close, data_ri.close_pred)
721.7852121138658 -> Becomes lower

>>> data_ri.shape
(61, 5)
>>> data_ri[data_ri.flag == True].shape
(27, 5)


model.intercept_
array([29023.85313617])
>>> model.coef_
array([[4.71824027]])
>>> mean_squared_error(data_ri.close, data_ri.close_pred)
260.6485065054994

data_ri.shape
(27, 5)
>>>
>>> data_ri[data_ri.flag == True].shape
(10, 5)
>>>
>>> data_ri = data_ri[data_ri.flag == True]


After 3 iterations
     index                       date     close    close_pred  flag
0      196  2020-12-22 12:31:00+05:30  29007.45  29023.853136  True
2      198  2020-12-22 12:33:00+05:30  29018.25  29033.289617  True
3      199  2020-12-22 12:34:00+05:30  29035.30  29038.007857  True
59     255  2020-12-22 13:30:00+05:30  29269.35  29302.229312  True
60     256  2020-12-22 13:31:00+05:30  29274.95  29306.947552  True
61     257  2020-12-22 13:32:00+05:30  29311.00  29311.665792  True
62     258  2020-12-22 13:33:00+05:30  29298.60  29316.384033  True
78     274  2020-12-22 13:49:00+05:30  29365.35  29391.875877  True
125    321  2020-12-22 14:36:00+05:30  29606.50  29613.633170  True
126    322  2020-12-22 14:37:00+05:30  29592.25  29618.351410  True



4th:
>>> model.intercept_
array([29009.39721814])
>>> model.coef_
array([[4.66150663]])
>>> mean_squared_error(data_ri.close, data_ri.close_pred)
115.7289560562115

>>> data_ri.shape
(10, 5)
>>> data_ri[data_ri.flag == True].shape
(6, 5)
>>> data_ri = data_ri[data_ri.flag == True]
>>> data_ri
     index                       date     close    close_pred  flag
0      196  2020-12-22 12:31:00+05:30  29007.45  29009.397218  True
2      198  2020-12-22 12:33:00+05:30  29018.25  29018.720231  True
59     255  2020-12-22 13:30:00+05:30  29269.35  29284.426109  True
60     256  2020-12-22 13:31:00+05:30  29274.95  29289.087616  True
78     274  2020-12-22 13:49:00+05:30  29365.35  29372.994735  True
126    322  2020-12-22 14:37:00+05:30  29592.25  29596.747053  True



>>> model.intercept_
array([29004.61371185])
>>> model.coef_
array([[4.61513147]])
>>> mean_squared_error(data_ri.close, data_ri.close_pred)
27.648137179209527 -> Seems a trend line.


from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
def calculateTrendLineBtwTwoPoints(data, start_index, end_index):
    """
    """
    data_ri=data[start_index:end_index+1].reset_index()
    # 
    while data_ri.shape[0] > 6:
        model = LinearRegression()
        index=np.array(data_ri.index).reshape(-1, 1)
        low_price=np.array(data_ri.low).reshape(-1, 1)
        # 
        model.fit(index, low_price)
        data_ri['low_pred'] = model.predict(index)
        mse = mean_squared_error(data_ri.low, data_ri.low_pred)
        print('intercept_: ', model.intercept_)
        print('coef_: ',model.coef_)
        print('mean_squared_error: ', mse)
        # 
        data_ri = data_ri[data_ri.low_pred > data_ri.low]
    # 
    print(data_ri)
    return data_ri


minute_dataframe = loadIntradayInstrumentData(data_dir=KITECONNECT_HISTORICAL_DATA_DIR, instrument_name='NIFTY BANK', date='20201222', interval='MINUTE')
calculateTrendLineBtwTwoPoints(data=minute_dataframe, start_index=196, end_index=323)
     index                       date      open      high       low     close  volume  oi    close_pred
0      196  2020-12-22 12:31:00+05:30  29000.00  29007.45  28977.65  29007.45       0   0  29009.397218
2      198  2020-12-22 12:33:00+05:30  29036.70  29036.70  29005.05  29018.25       0   0  29018.720231
59     255  2020-12-22 13:30:00+05:30  29316.55  29316.70  29236.40  29269.35       0   0  29284.426109
60     256  2020-12-22 13:31:00+05:30  29273.95  29284.60  29264.55  29274.95       0   0  29289.087616
78     274  2020-12-22 13:49:00+05:30  29388.65  29396.70  29343.65  29365.35       0   0  29372.994735
126    322  2020-12-22 14:37:00+05:30  29606.20  29621.10  29592.25  29592.25       0   0  29596.747053
# Looks Good.



minute_dataframe = loadIntradayInstrumentData(data_dir=KITECONNECT_HISTORICAL_DATA_DIR, instrument_name='TECHM', date='20210104', interval='MINUTE')
calculateTrendLineBtwTwoPoints(data=minute_dataframe, start_index=194, end_index=241)

