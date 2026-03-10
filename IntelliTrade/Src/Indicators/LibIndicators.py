
import inspect
import numpy as np
import pandas as pd
from talib import SMA
from talib import EMA
from talib import BBANDS
from talib import MA_Type

# -------------------------------------------------------------------------------------------------

def indicatorSMA(source_df, source, lookback):
    """
    indicatorSMA(source_df=df, source='high', lookback=2)
    source = 'high', 'low', 'close', 'open'
    """
    trade_datetime_array = np.array(source_df['trade_datetime'])
    source_array      = np.array(source_df[source])
    sma_array        = SMA(source_array, lookback)
    sma_array        = np.round(sma_array, decimals=2)
    # 
    sma_df = pd.DataFrame({'trade_datetime' : trade_datetime_array, 'sma' : sma_array}, columns = ['trade_datetime', 'sma'])
    # 
    return sma_df

# -----------------------------------------------

def indicatorEMA(source_df, source, lookback):
    """
    """
    trade_datetime_array = np.array(source_df['trade_datetime'])
    source_array         = np.array(source_df[source])
    ema_array            = EMA(source_array, lookback)
    ema_array            = np.round(ema_array, decimals=2)
    # 
    ema_df = pd.DataFrame({'trade_datetime' : trade_datetime_array, 'ema' : ema_array}, columns = ['trade_datetime', 'ema'])
    # 
    return ema_df

# -------------------------------------------------------------------------------------------------

def getDMIValues(hlc_df, lookback):
    """
    getDMIValues(hlc_df=main_df, lookback=lookbook)
    """
    hlc_df.reset_index(inplace = True, drop = True)
    # 
    high = hlc_df['high']
    low = hlc_df['low']
    close = hlc_df['close']
    # 
    plus_dm = high.diff()
    minus_dm = low.diff()
    plus_dm[plus_dm < 0] = 0
    minus_dm[minus_dm > 0] = 0
    # 
    tr1 = pd.DataFrame(high - low)
    tr2 = pd.DataFrame(abs(high - close.shift(1)))
    tr3 = pd.DataFrame(abs(low - close.shift(1)))
    # 
    frames = [tr1, tr2, tr3]
    tr = pd.concat(frames, axis = 1, join = 'inner').max(axis = 1)
    atr = tr.rolling(lookback).mean()
    # 
    plus_di = 100 * (plus_dm.ewm(alpha = 1/lookback).mean() / atr)
    minus_di = abs(100 * (minus_dm.ewm(alpha = 1/lookback).mean() / atr))
    dx = (abs(plus_di - minus_di) / abs(plus_di + minus_di)) * 100
    adx = ((dx.shift(1) * (lookback - 1)) + dx) / lookback
    adx_smooth = adx.ewm(alpha = 1/lookback).mean()
    # 
    dmi_df = pd.DataFrame()
    # 
    dmi_df['trade_datetime'] = hlc_df['trade_datetime']
    dmi_df['plus_di']   = pd.DataFrame(plus_di).rename(columns = {0:'plus_di'})
    dmi_df['minus_di']  = pd.DataFrame(minus_di).rename(columns = {0:'minus_di'})
    dmi_df['adx']       = pd.DataFrame(adx_smooth).rename(columns = {0:'adx'})
    return dmi_df

# -----------------------------------------------

def indicatorDMI_v1(**kwargs):
    return getDMIValues(hlc_df=kwargs['hlc_df'], lookback=kwargs['lookback'])[['trade_datetime', 'plus_di', 'minus_di']]

# -----------------------------------------------

def indicatorADX_v1(**kwargs):
    return getDMIValues(hlc_df=kwargs['hlc_df'], lookback=kwargs['lookback'])[['trade_datetime', 'adx']]

# -----------------------------------------------

def indicatorDMI(**kwargs):
    function = eval(inspect.currentframe().f_code.co_name+'_'+kwargs['version'])
    return function(**kwargs)[['trade_datetime', 'plus_di', 'minus_di']]

# -----------------------------------------------

def indicatorADX(**kwargs):
    function = eval(inspect.currentframe().f_code.co_name+'_'+kwargs['version'])
    return function(**kwargs)[['trade_datetime', 'adx']]

# -------------------------------------------------------------------------------------------------

def hafltrendStrategy(current_trend, low_price_pre_1, low_price_pre_2, high_price_pre_1, high_price_pre_2, close, high_ma, low_ma):
    """
    function for indicatorHalfTrend_v1
    """
    if current_trend == 1 or current_trend == 0:
        max_low_price = max(low_price_pre_1, min(low_price_pre_1, low_price_pre_2))
        # 
        if high_ma < max_low_price and close < low_price_pre_1:
            # trend = -ve
            # nextTrend = +ve
            # minHighPrice = highPrice
            # return new_trend 
            return -1
        return current_trend
    # 
    elif current_trend == -1 or current_trend == 0:
        min_high_price = min(high_price_pre_1, max(high_price_pre_1, high_price_pre_2))
        # 
        if low_ma > min_high_price and close > high_price_pre_1:
            # trend = +ve
            # nextTrend = -ve1
            # maxLowPrice = lowPrice
            # return new_trend 
            return 1
        return current_trend

# -----------------------------------------------

def indicatorHalfTrend_v1(hlc_df):
    """
    indicatorHalfTrend_v1
    """
    # 
    amplitude = 2
    # 
    current_trend = 0
    # 
    arr_high = hlc_df["high"].to_numpy()
    arr_low = hlc_df["low"].to_numpy()
    # 
    arr_high_ma = SMA(arr_high, amplitude)
    arr_low_ma  = SMA(arr_low, amplitude)
    # 
    indictor_dict = {}
    for i in range(amplitude+1, len(hlc_df.axes[0])):
        trend = hafltrendStrategy(current_trend=current_trend, 
            low_price_pre_1 = hlc_df._get_value(i-3, 'low'),   low_price_pre_2=hlc_df._get_value(i-3, 'low'), 
            high_price_pre_1=hlc_df._get_value(i-2, 'high'),    high_price_pre_2=hlc_df._get_value(i-2, 'high'), 
            close=hlc_df._get_value(i, 'close'),       high_ma=arr_high_ma[i], low_ma=arr_low_ma[i])
        # 
        indictor_dict[hlc_df._get_value(i, 'trade_datetime')] = trend
        # 
        if trend != current_trend:
            current_trend = trend
    # 
    halftrend = pd.DataFrame(list(indictor_dict.items()), columns = ['trade_datetime', 'halftrend'])
    return halftrend

# -----------------------------------------------

def indicatorHalfTrend_v2(hlc_df):
    """
    Tradingview version
    indicatorHalfTrend_v2(hlc_df=df)
    """
    hlc_df.reset_index(inplace = True, drop = True)
    amplitude = 2
        # 
    highPrice = hlc_df.rolling(amplitude, min_periods=1)['high'].max()
    lowPrice = hlc_df.rolling(amplitude, min_periods=1)['low'].min()
    # 
    high_sma_df = indicatorSMA(source_df=hlc_df, source='high', lookback=amplitude)
    low_sma_df = indicatorSMA(source_df=hlc_df, source='low', lookback=amplitude)
    # 
    maxLowPrice  = hlc_df._get_value(0, 'low')
    minHighPrice = hlc_df._get_value(0, 'high')
    # 
    indictor_dict = {}
    # value_list    = []
    current_trend = 0
    # 
    for i in range(amplitude-1, len(hlc_df.axes[0])):
        # value_dict = {'trade_datetime' : hlc_df._get_value(i, 'trade_datetime'), 'high_ma' : high_sma_df._get_value(i, 'sma'), 'low_ma' : low_sma_df._get_value(i, 'sma'),
        #                 'maxLowPrice' : maxLowPrice, 'minHighPrice' : minHighPrice, 'prev_HighPrice' : highPrice[i] , 'prev_LowPrice' : lowPrice[i]}
        # value_list.append(value_dict)
        if current_trend == 1 or current_trend == 0:
            maxLowPrice = max(lowPrice[i], maxLowPrice)
            # 
            if high_sma_df._get_value(i, 'sma') < maxLowPrice and hlc_df._get_value(i, 'close') < hlc_df._get_value(i-1, 'low'):
                current_trend = -1
                minHighPrice =  highPrice[i]
        # 
        if current_trend == -1 or current_trend == 0:
            minHighPrice = min(highPrice[i], minHighPrice)
            # 
            if low_sma_df._get_value(i, 'sma') > minHighPrice and hlc_df._get_value(i, 'close') > hlc_df._get_value(i-1, 'high'):
                current_trend = 1
                maxLowPrice =  lowPrice[i]
        # 
        indictor_dict[hlc_df._get_value(i, 'trade_datetime')] = current_trend
    # 
    # value_df = pd.DataFrame.from_records(value_list)
    halftrend = pd.DataFrame(list(indictor_dict.items()), columns = ['trade_datetime', 'halftrend'])
    return halftrend

# -----------------------------------------------

def indicatorHalfTrend_v3(hlc_df):
    """
    indicatorHalfTrend_v3(hlc_df=df)
    """
    hlc_df.reset_index(inplace = True, drop = True)
    amplitude = 2
    # 
    highPrice = hlc_df.rolling(amplitude, min_periods=1)['high'].max()
    lowPrice = hlc_df.rolling(amplitude, min_periods=1)['low'].min()
    # 
    high_sma_df = indicatorSMA(source_df=hlc_df, source='high', lookback=amplitude)
    low_sma_df = indicatorSMA(source_df=hlc_df, source='low', lookback=amplitude)
    # 
    indictor_dict = {}
    current_trend = 0
    for i in range(amplitude, len(hlc_df.axes[0])):
        maxLowPrice  = hlc_df._get_value(i-1, 'low')
        minHighPrice = hlc_df._get_value(i-1, 'high')
        # 
        if current_trend == 1 or current_trend == 0:
            # _maxLowPrice = max(lowPrice[i], maxLowPrice)
            _maxLowPrice = max(highPrice[i-1], maxLowPrice)
            # print('_maxLowPrice :', _maxLowPrice, 'highPrice[i] :', highPrice[i],' maxLowPrice :', maxLowPrice)
            # 
            if high_sma_df._get_value(i, 'sma') < _maxLowPrice and hlc_df._get_value(i, 'close') < maxLowPrice:
                current_trend = -1
        # 
        if current_trend == -1 or current_trend == 0:
            # _minHighPrice = min(highPrice[i], minHighPrice)
            _minHighPrice = min(lowPrice[i-1], minHighPrice)
            # print('_minHighPrice :', _minHighPrice, 'lowPrice[i] :', lowPrice[i],' minHighPrice :', minHighPrice)
            # 
            if low_sma_df._get_value(i, 'sma') > _minHighPrice and hlc_df._get_value(i, 'close') > minHighPrice:
                current_trend = 1
        # 
        indictor_dict[hlc_df._get_value(i, 'trade_datetime')] = current_trend
    # 
    halftrend = pd.DataFrame(list(indictor_dict.items()), columns = ['trade_datetime', 'halftrend'])
    return halftrend

# -----------------------------------------------

def indicatorHalfTrend(**kwargs):
    """
    indicatorHalfTrend(function_version='indicatorHalfTrend_v2', hlc_df=instrumentDF)
    """
    function = eval(inspect.currentframe().f_code.co_name+'_'+kwargs['version'])
    return function(hlc_df=kwargs['hlc_df'])

# -------------------------------------------------------------------------------------------------

def indicatorRSI_v1(hlc_df, lookback, source):
    """See source https://github.com/peerchemist/finta
    and fix https://www.tradingview.com/wiki/Talk:Relative_Strength_Index_(RSI)
    Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements.
    RSI oscillates between zero and 100. Traditionally, and according to Wilder, RSI is considered overbought when above 70 and oversold when below 30.
    Signals can also be generated by looking for divergences, failure swings and centerline crossovers.
    RSI can also be used to identify the general trend."""
    delta = hlc_df[source].diff()
    up, down = delta.copy(), delta.copy()
    up[up < 0] = 0
    down[down > 0] = 0
    _gain = up.ewm(com=(lookback - 1), min_periods=lookback).mean()
    _loss = down.abs().ewm(com=(lookback - 1), min_periods=lookback).mean()
    rsi = 100 - (100 / (1 + (_gain / _loss)))
    # 
    rsi_df = pd.DataFrame()
    rsi_df['trade_datetime'] = hlc_df['trade_datetime']
    rsi_df['rsi']   = pd.DataFrame(rsi).rename(columns = {0:'rsi'})
    return rsi_df

# -----------------------------------------------

def indicatorRSI_v2(hlc_df, lookback, source=None):
    """
    indicatorRSI_v2 give RSI Dataframe with column having RSI value for source (source can be 'high', 'low', 'close')
    """
    rsi_df = pd.DataFrame()
    rsi_df['trade_datetime'] = hlc_df['trade_datetime']
    # 
    rsi_high_df = indicatorRSI_v1(hlc_df=hlc_df, lookback=lookback, source='high')
    rsi_high_df.rename(columns = {'rsi':'rsi_high'}, inplace = True)
    rsi_df = rsi_df.merge(rsi_high_df[['rsi_high', 'trade_datetime']], on = 'trade_datetime', how = 'left')
    # 
    rsi_low_df = indicatorRSI_v1(hlc_df=hlc_df, lookback=lookback, source='low')
    rsi_low_df.rename(columns = {'rsi':'rsi_low'}, inplace = True)
    rsi_df = rsi_df.merge(rsi_low_df[['rsi_low', 'trade_datetime']], on = 'trade_datetime', how = 'left')
    # 
    return rsi_df

# -----------------------------------------------

def indicatorRSI(**kwargs):
    function = eval(inspect.currentframe().f_code.co_name+'_'+kwargs['version'])
    return function(hlc_df=kwargs['hlc_df'], lookback=kwargs['lookback'], source=kwargs['source'])

# -------------------------------------------------------------------------------------------------

def indicatorBB(source_df, source, lookback, stddev_upper=2, stddev_lower=2, ma_type='sma'):
    """
    indicatorBB(source_df=df, source='high', lookback=2)
    source = 'high', 'low', 'close', 'open'
    """
    if ma_type == 'sma':
        matype = MA_Type.SMA
    elif ma_type == 'ema':
        matype = MA_Type.EMA
    # 
    trade_datetime_array = np.array(source_df['trade_datetime'])
    source_array         = np.array(source_df[source])
    # 
    bb_array = BBANDS(real=source_array, timeperiod=lookback, nbdevup=stddev_upper, nbdevdn=stddev_lower, matype=matype)
    # 
    bb_upper_array  = bb_array[0]
    bb_mid_array    = bb_array[1]
    bb_lower_array  = bb_array[2]
    # 
    bb_upper_array  = np.round(bb_upper_array, decimals=2)
    bb_mid_array    = np.round(bb_mid_array, decimals=2)
    bb_lower_array  = np.round(bb_lower_array, decimals=2)
    # 
    bb_df = pd.DataFrame({'trade_datetime' : trade_datetime_array, 'bb_upper' : bb_upper_array, 'bb_mid' : bb_mid_array, 'bb_lower' : bb_lower_array}, columns = ['trade_datetime', 'bb_upper', 'bb_mid', 'bb_lower'])
    # 
    return bb_df