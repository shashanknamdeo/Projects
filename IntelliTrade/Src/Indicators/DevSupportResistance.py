# https://towardsdatascience.com/programmatic-identification-of-support-resistance-trend-lines-with-python-d797a4a90530

import pandas as pd
from datetime import datetime
import findiff


import os

if __name__ == '__main__':
    # historical_data = fetchHistoricalData(instrument_token=1510401, from_date='2020-11-25', to_date='2020-11-25', interval='minute') 
    # df = pd.DataFrame(historical_data)
    # df.to_pickle('AXISBANK_20201125.pickle')
    # df = pd.read_pickle('AXISBANK_20201125.pickle')
    
    pickle_path = os.getenv('PICKLE_DATA_PATH', 'AXISBANK_20201125_2min.pickle')
    if os.path.exists(pickle_path):
        df = pd.read_pickle(pickle_path)
    else:
        print(f"Pickle data file not found: {pickle_path}")
        df = pd.DataFrame()


# Exponential Moving Average
df['ohlc_4'] = (df['open'] + df['high'] + df['low'] + df['close'])/4
df['ewm_ohlc'] = df.ohlc_4.ewm(com=0.5).mean() 
df['ewm_high'] = df.high.ewm(com=0.3).mean()
df['ewm_high2'] = df.high.ewm(com=0.4).mean()
df['ewm_high3'] = df.high.ewm(com=0.3).mean()


df.drop(['low', 'open', 'close', 'oi', 'volume', 'ewm_high2', 'ewm_high3'], axis='columns', inplace=True)
df.drop(['fx-fx1_h'], axis='columns', inplace=True)

dx = 3 # Grid spacing
d_dx = FinDiff(0, dx, 1)
numpy_array = d_dx(df.ewm_ohlc)
df['d_dx_ewm_ohlc'] = pd.Series(numpy_array)
df['d_dx_ewm_ohlc_abs'] = abs(df['d_dx_ewm_ohlc'])
df['d_dx_ewm_ohlc_flat'] = df['d_dx_ewm_ohlc_abs'] <= 0.01 




df['ewm_ohlc_diff_mean'] = df.ewm_ohlc_diff.rolling(7).apply(lambda x: x.mean())
df['flag'] = abs(df['ewm_ohlc_diff_mean']) <= 0.01 


pd.set_option('display.float_format', lambda x: '%.2f' % x)


df.drop(['ewm_ohlc_diff1'], axis='columns', inplace=True)


df['x'] = 0
df['x'][1:] = df.ewm_ohlc[1:].values -  df.ewm_ohlc[:-1].values

df['ewm_ohlc_diff1'] = np.append(np.array([-1]), np.array(df.ewm_ohlc[1:].values -  df.ewm_ohlc[:-1].values))
df['ewm_ohlc_diff2'] = np.append(np.array([-1, -1]), np.array(df.ewm_ohlc[2:].values -  df.ewm_ohlc[:-2].values))
df['ewm_ohlc_diff3'] = np.append(np.array([-1, -1, -1]), np.array(df.ewm_ohlc[3:].values -  df.ewm_ohlc[:-3].values))
df['ewm_ohlc_diff4'] = np.append(np.array([-1, -1, -1]), np.array(df.ewm_ohlc[3:].values -  df.ewm_ohlc[:-3].values))

df['ewm_ohlc_diff1'] = df.ewm_ohlc.diff(1)
df['ewm_ohlc_diff2'] = df.ewm_ohlc.diff(2)
df['ewm_ohlc_diff3'] = df.ewm_ohlc.diff(3)
df['ewm_ohlc_diff4'] = df.ewm_ohlc.diff(4)

df['mean1'] = df.ewm_ohlc_diff1.rolling(5).mean()
df['mean2'] = df.ewm_ohlc_diff2.rolling(5).mean()
df['mean3'] = df.ewm_ohlc_diff3.rolling(5).mean()
df['mean4'] = df.ewm_ohlc_diff4.rolling(5).mean()


df['mean1_r'] = round(df.mean1*2)
df['mean2_r'] = round(df.mean2*2)
df['mean3_r'] = round(df.mean3*2)
df['mean4_r'] = round(df.mean4*2)

df['flag'] = df['mean1_r'] + df['mean2_r'] + df['mean3_r'] + df['mean4_r']








df['fx_fx1_h'] = df.ewm_high.diff(1)
df['fx_fx2_2h'] = df.ewm_high.diff(2)/2
df['fx_fx3_3h'] = df.ewm_high.diff(3)/3



def function(x):
    if x <= 0.1 and x >= -0.1:
        return 0
    if x > 0.1 and x <= 1:
        return 1
    elif x > 1:
        return x
    elif x < -0.1 and x >= -1:
        return -1
    elif x < -1:
        return x


df['d1'] = df.fx_fx1_h.apply(lambda x: function(x)) 
df['d2'] = df.fx_fx2_2h.apply(lambda x: function(x)) 
df['d3'] = df.fx_fx3_3h.apply(lambda x: function(x)) 

df['d_sum'] = df['d1'] + df['d2'] + df['d3']


df['flag'] = df.d_sum.apply(lambda x: True if x ==0 else False)



# ----------------------------------------------------------------------------------------------------------------------

def incrementResistanceTupleImpValue(resistanceTuple):
    a,b,c,d = resistanceTuple
    d = d + 1
    resistanceTuple = (a,b,c,d)
    return resistanceTuple

def incrementResistanceImpValue(resistance_levels):
    for index in range(0, len(resistance_levels)):
        resistance_levels[index] = incrementResistanceTupleImpValue(resistance_levels[index])
    return resistance_levels


def findMaximumValueWithinGroups(price_index_tuple, groupsize, offset=0, verbose=0):
    """
    Function to break the data into groups and find the maximum values in each groups.
    offset is used to define the starting point in the price_index_tuple.
    """
    groupNMaximums= []
    print(len(price_index_tuple)) if verbose >=1 else None
    # Below line is to take care of case when there is no values for the last loop
    inc = 0 if len(price_index_tuple) % groupsize == 0 else 1
    for i in range(0, int((len(price_index_tuple)-offset)/groupsize)+inc):
        tuple_sublist = price_index_tuple[(i*groupsize+offset): (i*groupsize+groupsize+offset)]
        max_price_tuple = max(tuple_sublist)
        groupNMaximums.append(max_price_tuple)
        if verbose:
            print(max_price_tuple, tuple_sublist[0][2], tuple_sublist[-1][2])
    return groupNMaximums

def resistanceValidation_Rule1(dataframe, resistance_index, price_column, nLevels=1, verbose=1):
    """
    Observed that sometimes due to grouping False resistance is generated, which needs further validation.
    This rule-1 check the immeidate N neighhoods of the proposed resistance and see if it a True resistance level

    resistanceValidation_Rule1(dataframe=dataframe, resistance_index=100, price_column='high')
    """
    print(resistance_index) if verbose >=1 else None
    price_column='high'
    resistance = dataframe[price_column][resistance_index]
    # Checking if the resistance/index is the last tick on the dataframe
    if dataframe.index.values[-nLevels] <= resistance_index:
        # Returning false if the resistance_index passed to check the validity is the last element of the current dataframe
        return False
    if resistance_index -nLevels < 0:
        # Returning True if the resistance_index passsed is among the start of the dat-nLevels
        return True
    for n in range(1, nLevels+1):
        if resistance < dataframe[price_column][resistance_index-n] or resistance < dataframe[price_column][resistance_index+n]:
            return False
    return True




def findResistanceLevels(dataframe, price_colname, groupsize=10, offset=5, resistance_validation_levels=1, value_thresholds=(1,2,5), time_thresholds=(5, 10, 15), verbose=0, debug=0):
    """
    Function to find the resistance in a dataframe. Tested on day timeframe only.
    Algorithm:
    1. Divide the day data in group of groupsize and find the maximum within these groups. 
       Observed that some extreme points comes in such grouping (example strickly down/uptrend withing that group)
       To resolve the there were two options (I thought): 
            1-> To use another shifted group (with offset) and same groupsize. (Implemented in this code)
            2-> To use another different sizeed groupsize
        After the two group we merge them, removing the common items and sort them in order of resistance values
    2. Observed theat the above approach alone doen't give good result, as there were False resistance signals and too
       many close signals as well. 
       So then I intruduced some condition to eleminate close resistances based on value_thresholds and time_thresholds
       to keep them in different brackets and tried to give IMPORTANCE to them [NOT implemented & NOT tested fully]
    3. Later, extra validations are introduced to remove the False signals 
    
    PROPOSED MODIFICATIONS:
    Improve logic for assigning importance to resistance values
    High wick resistance analysis
    Importance besed on cluster value arond resistance
    
    Usage:
    findResistanceLevels(dataframe=data3, price_colname='high', groupsize=10, offset=5, verbose=1, debug=0)
    findResistanceLevels(dataframe=data3[:100], price_colname='high', groupsize=10, offset=5, verbose=1, debug=0)
    resistanceLevelList = findResistanceLevels(dataframe=dayDataFrame, price_colname='high', groupsize=10, offset=5, resistance_validation_levels=3, value_thresholds=(1,2, 5), verbose=1, debug=0)
    """
    price_values = dataframe[price_colname].values
    index_values = dataframe.index.values
    #
    dataframe['time'] = dataframe['date'].apply(lambda x: ':'.join(str(x).split()[1].split(':')[:2]))
    time_index = dataframe['time'].values
    price_index_tuple = [(item[0], item[1] ,item[2]) for item in zip(price_values, index_values, time_index)]
    #
    value_threshold1, value_threshold2, value_threshold3 = value_thresholds
    time_threshold1, time_threshold2, time_threshold3 = time_thresholds
    #
    set1 = set(findMaximumValueWithinGroups(price_index_tuple, groupsize=groupsize, offset=0, verbose=verbose))
    set2 = set(findMaximumValueWithinGroups(price_index_tuple, groupsize=groupsize, offset=offset, verbose=verbose))
    groupNMaximums = [item for item in set1.union(set2)]
    groupNMaximums.sort(key = lambda x: x[0])
    #
    print(groupNMaximums) if verbose >=1 else None
    # 
    groupNMaximums_modified = []
    for resistance_tuple in groupNMaximums:
        if resistanceValidation_Rule1(dataframe=dataframe, resistance_index=resistance_tuple[1], price_column=price_column, nLevels=resistance_validation_levels):
            groupNMaximums_modified.append(resistance_tuple)
        else:
            print('removed resistance_tuple:', resistance_tuple) if verbose >=1 else None
    # 
    groupNMaximums = groupNMaximums_modified
    print('After resistanceValidation_Rule1:', groupNMaximums) if verbose >=1 else None
    #
    resistance_levels = []
    resistance_levels.append(groupNMaximums.pop()+(0,))
    #
    length = len(groupNMaximums)
    # 
    for _ in range(0, length):
        input() if debug else None
        item = groupNMaximums.pop()
        print('item:', item) if verbose >=1 else None
        if (abs(item[0]-resistance_levels[-1][0]) <= value_threshold1) and (abs(item[1]-resistance_levels[-1][1]) <= time_threshold1):
            # discard (very close to existing resistance and time)
            # return False
            print('Discard-Reason1') if verbose >=1 else None
        elif (abs(item[0]-resistance_levels[-1][0]) <= value_threshold1) and (abs(item[1]-resistance_levels[-1][1]) > time_threshold1):
            # Again diccard it as it is close in value, but increment the all the above resistance importance because it is far in time (means tested again)
            resistance_levels = incrementResistanceImpValue(resistance_levels)
            print('Discard-Reason2') if verbose >=1 else None
            # return False
        elif (abs(item[0]-resistance_levels[-1][0]) > value_threshold1) and (abs(item[0]-resistance_levels[-1][0]) <= value_threshold2) and (abs(item[1]-resistance_levels[-1][1]) > time_threshold1):
            # Keep it but with reduced importance but no need to increase the importance of ohters as this resistance will be added with (-1) importance
            resistance_levels.append(item+(-1,))
            print('Keep-Reason3') if verbose >=1 else None
            #
        elif (abs(item[0]-resistance_levels[-1][0]) > value_threshold2):
            # Keep it and increment importance of all previous resistances
            resistance_levels = incrementResistanceImpValue(resistance_levels)
            resistance_levels.append(item+(0,))
            print('Keep-Reason4') if verbose >=1 else None
            #
        else:
            # 1. Due to moderate close to values but discarded due to close in time. (Any resistance which is too close in time should be discarded)
            print('Discard-Reason5') if verbose >=1 else None
    #
    return resistance_levels

# ----------------------------------------------------------------------------------------------------------------------

    data1_path = os.getenv('DATA1_PICKLE', '..\\Data\\AXISBANK_20201125_2min.pickle')
    if os.path.exists(data1_path):
        data1 = pd.read_pickle(data1_path)
        findResistanceLevels(dataframe=data1, price_colname='high', groupsize=10, offset=5, verbose=1, debug=1) # 13

    data2_path = os.getenv('DATA2_PICKLE', '..\\Data\\AXISBANK_20201124_2min.pickle')
    if os.path.exists(data2_path):
        data2 = pd.read_pickle(data2_path)
        findResistanceLevels(dataframe=data2, price_colname='high', groupsize=10, offset=5, verbose=1, debug=1)

    data3_path = os.getenv('DATA3_CSV', 'AXISBANK_2MINUTE_2020-11-23.csv')
    if os.path.exists(data3_path):
        data3 = pd.read_csv(data3_path) 
        findResistanceLevels(dataframe=data3, price_colname='high', groupsize=10, offset=5, verbose=1, debug=0)

    data_axis_path = os.getenv('DATA_AXIS_CSV', 'AXISBANK_2MINUTE_2020-11-25.csv')
    if os.path.exists(data_axis_path):
        data = pd.read_csv(data_axis_path) 
        dayDataFrame = data
        from Charts.CandleStickChart import plotCandleStickDayData
        resistanceLevelList = findResistanceLevels(dataframe=dayDataFrame, price_colname='high', groupsize=10, offset=5, resistance_validation_levels=3, value_thresholds=(1,2, 5), verbose=1, debug=0)
        resistanceLevelList = [item[0] for item in resistanceLevelList]
        plotCandleStickDayData(dayDataFrame=dayDataFrame, resistanceLevelList=resistanceLevelList)



# ----------------------------------------------------------------------------------------------------------------------

import pandas as pd

df = pd.read_pickle('AXISBANK_20201125.pickle')
data1 = pd.read_pickle('..\\Data\\AXISBANK_20201125_2min.pickle')

df['time'] = df['date'].apply(lambda x: ':'.join(str(x).split()[1].split(':')[:2])) 

>>> x = df.high.values 
>>> x = x.tolist() 
>>> i = df.index.values 
>>> i = i.tolist() 
>>> z = [(item[0], item[1]) for item in zip(x, i)]
z.sort(key = lambda x: x[0]) 
>>> z =z[::-1] 

resistance_list = []

import time
resistance_list.append(z.pop())
length = len(z)
value_threshold = 1
index_threshold = 15
for _ in range(0, length):
    item = z.pop()
    if valueDistance(resistance_list, item[0]) and indexDistance(resistance_list, item[1]):
        resistance_list.append(item)



max_array= []
for k in range(0, int(len(z)/5)):
    print(k*5, k*5+5)
    max_array.append(max(z[k*5: k*5+5]))

max_array.sort(key = lambda x: x[0])
z = max_array



# Needs improvement, as if value_threshold is k, then P-k will not be included byt then P-K-- will be included.
# How to handle these cases?


def findImportanceOfResistanceLevel(resistance, dataframe):
    """
    If a considerable amout of time has been spent on a resistance then it is probably a strong resistance
    If it is tested multiple time, or price went close to it and returned then --> strong resistance
    If it is just formed with a abrupt peak, them it might not be very strong resistance. (needs to alalyse later about these type of resistances)
    """
    pass


findMaximumValueWithinGroups(price_index_tuple, groupsize=10, offset=0, verbose=1)
(629.9, 4, '09:23') 09:15 09:33
(627.9, 16, '09:47') 09:35 09:53
(627.75, 20, '09:55') 09:55 10:13
(625.25, 34, '10:23') 10:15 10:33
(622.8, 40, '10:35') 10:35 10:53
(619.3, 50, '10:55') 10:55 11:13
(614.5, 69, '11:33') 11:15 11:33
(614.9, 70, '11:35') 11:35 11:53
(613.5, 80, '11:55') 11:55 12:13
(612.25, 90, '12:15') 12:15 12:33
(615.5, 108, '12:51') 12:35 12:53
(615.5, 119, '13:13') 12:55 13:13
(615.6, 120, '13:15') 13:15 13:33
(614.7, 133, '13:41') 13:35 13:53
(607.7, 141, '13:57') 13:55 14:13
(607.9, 157, '14:29') 14:15 14:33
(605.9, 161, '14:37') 14:35 14:53
(604.0, 171, '14:57') 14:55 15:13
(600.8, 181, '15:17') 15:15 15:29



max_set = ()
(629.7, 5, '09:25') 09:25 09:43

(625.6, 26, '10:07') 10:05 10:23
(624.95, 35, '10:25') 10:25 10:43
(619.7, 48, '10:51') 10:45 11:03
(615.1, 55, '11:05') 11:05 11:23
(614.9, 70, '11:35') 11:25 11:43
(613.5, 80, '11:55') 11:45 12:03
(612.9, 88, '12:11') 12:05 12:23
(614.45, 104, '12:43') 12:25 12:43
(615.5, 112, '12:59') 12:45 13:03
(615.6, 120, '13:15') 13:05 13:23
(614.7, 133, '13:41') 13:25 13:43
(613.6, 135, '13:45') 13:45 14:03
(605.8, 152, '14:19') 14:05 14:23
(607.9, 157, '14:29') 14:25 14:43
(605.55, 167, '14:49') 14:45 15:03
(601.4, 179, '15:13') 15:05 15:23
(599.1, 185, '15:25') 15:25 15:29

l1 = set(findMaximumValueWithinGroups(price_index_tuple, groupsize=10, offset=0, verbose=1))
l2 = set(findMaximumValueWithinGroups(price_index_tuple, groupsize=10, offset=5, verbose=1))
l3 = l1.union(l2)
l3 = [i for i in l3]

for l in l3:
    print(l)

def valueDistance(value, value_threshold1=1, value_threshold2=2, value_threshold3=3):
    for (k, item) in enumerate(resistance_levels):
        if abs(item[0] - value) <= value_threshold:
            return False
    return True

def timeDistance(index, time_threshold1=10, time_threshold2=20):
    for item in resistance_levels:
        if abs(item[1] - index) <= index_threshold:
            return False
    return True

(600.8, 181, '15:17')
(601.4, 179, '15:13')
(604.0, 171, '14:57')
(605.55, 167, '14:49')
(605.8, 152, '14:19')
(605.9, 161, '14:37')
(607.7, 141, '13:57')
(607.9, 157, '14:29')
(612.25, 90, '12:15')
(612.9, 88, '12:11')
(613.5, 80, '11:55')
(613.6, 135, '13:45')
(614.45, 104, '12:43')
(614.5, 69, '11:33')
(614.7, 133, '13:41')
(614.9, 70, '11:35')
(615.1, 55, '11:05')
(615.5, 108, '12:51')
(615.5, 112, '12:59')
(615.5, 119, '13:13')
(615.6, 120, '13:15')
(619.3, 50, '10:55')
(619.7, 48, '10:51')
(622.8, 40, '10:35')
(624.95, 35, '10:25')
(625.25, 34, '10:23')
(625.6, 26, '10:07')
(627.75, 20, '09:55')
(627.9, 16, '09:47')
(629.9, 4, '09:23')

resistance_levels = []
groupNMaximums = l3
resistance_levels.append(groupNMaximums.pop())
for item in 
item = groupNMaximums.pop()
if valueDistance(item[0]) indexDistance(item[0])




value_threshold1=1
value_threshold2=2
value_threshold3=3
time_threshold1=5
time_threshold2=10
time_threshold3=30


    (600.8, 181, '15:17')
    (601.4, 179, '15:13')
    (604.0, 171, '14:57')
        (605.55, 167, '14:49')
(605.8, 152, '14:19') -> Should not be considered a resistances but came due to it was highed in local group (needs to discard it later somehow)
        (605.9, 161, '14:37')
        (607.7, 141, '13:57')
(607.9, 157, '14:29')
        (612.25, 90, '12:15')
(612.9, 88, '12:11')
        (613.5, 80, '11:55')
        (613.6, 135, '13:45')
        (614.45, 104, '12:43')
(614.5, 69, '11:33')
        (614.7, 133, '13:41')
        (614.9, 70, '11:35')
        (615.1, 55, '11:05')
        (615.5, 108, '12:51')
        (615.5, 112, '12:59')
        (615.5, 119, '13:13')
(615.6, 120, '13:15')
        (619.3, 50, '10:55')
(619.7, 48, '10:51')
(622.8, 40, '10:35')
        (624.95, 35, '10:25')
        (625.25, 34, '10:23')
(625.6, 26, '10:07')
        (627.75, 20, '09:55')
    (627.9, 16, '09:47', -1)
(629.9, 4, '09:23')


[(629.9, 4, '09:23', 24), (627.9, 16, '09:47', 18), (625.6, 26, '10:07', 18), (622.8, 40, '10:35', 15), (619.7, 48, '10:51', 14), (615.6, 120, '13:15', 13), (614.5, 69, '11:33', 7), (612.9, 88, '12:11', 4), (607.9, 157, '14:29', 4), (605.8, 152, '14:19', 2), (604.0, 171, '14:57', 0), (601.4, 179, '15:13', 0)]
[(629.9, 4, '09:23', 20), (627.9, 16, '09:47', 19), (625.6, 26, '10:07', 19), (622.8, 40, '10:35', 16), (619.7, 48, '10:51', 15), (615.6, 120, '13:15', 14), (614.5, 69, '11:33', 8), (612.9, 88, '12:11', 5), (607.9, 157, '14:29', 5), (605.8, 152, '14:19', 3), (604.0, 171, '14:57', 1), (601.4, 179, '15:13', 1), (599.1, 185, '15:25', 0)]
len(resistance_levels) -> 12






findResistanceLevels(dataframe=df, price_colname='high', groupsize=10, offset=5) 

[(629.9, 9), (627.9, 32), (625.25, 68), (619.7, 96), (615.6, 240), (614.5, 139), (612.9, 176), (610.55, 199), (607.9, 315), (605.6, 293), (604.0, 343)]
[(629.9, 9), (627.75, 40), (625.25, 68), (619.7, 96), (615.6, 240), (613.5, 160), (610.55, 199), (607.9, 315), (605.6, 293), (601.4, 358)]
[(629.9, 4, '09:23', 20), (627.9, 16, '09:47', 19), (625.6, 26, '10:07', 19), (622.8, 40, '10:35', 16), (619.7, 48, '10:51', 15), (615.6, 120, '13:15', 14), (614.5, 69, '11:33', 8), (612.9, 88, '12:11', 5), (607.9, 157, '14:29', 5), (605.8, 152, '14:19', 3), (604.0, 171, '14:57', 1), (601.4, 179, '15:13', 1), (599.1, 185, '15:25', 0)]





def findSupportLevels(dataframe, price_colname, groupsize):
    price_values = dataframe[price_colname].values
    index_values = dataframe.index.values
    price_index_tuple = [(item[0], item[1]) for item in zip(price_values, index_values)]
    #
    def valueDistance(value, value_threshold=1):
        for (k, item) in enumerate(support_levels):
            if abs(item[0] - value) <= value_threshold:
                # Increasing the importance of this resistance
                support_levels[k]= incrementTupleValue(item)
                return False
        return True
    #
    def indexDistance(index, index_threshold=20):
        for item in support_levels:
            if abs(item[1] - index) <= index_threshold:
                return False
        return True
    #
    # groupsize = 15
    groupNMinimums= []
    # creting groups and finding maximum of groups
    for i in range(0, int(len(price_index_tuple)/groupsize)):
        groupNMinimums.append(min(price_index_tuple[i*groupsize: i*groupsize+groupsize]))
    # 
    groupNMinimums.sort(key = lambda x: x[0])
    groupNMinimums.reverse()
    # 
    print(groupNMinimums)
    # 
    support_levels = []
    support_levels.append(groupNMinimums.pop()+(0,))
    length = len(groupNMinimums)
    # 
    for _ in range(0, length):
        item = groupNMinimums.pop()
        if valueDistance(item[0]) and indexDistance(item[1]):
            support_levels.append(item+(0,))
    return support_levels


findSupportLevels(df, 'low', groupsize=15) 
[(597.25, 366, 1), (602.5, 331, 5), (605.4, 278, 1), (608.4, 191, 2), (610.5, 152, 8), (613.0, 232, 4), (616.55, 89, 0), (623.0, 56, 4), (625.6, 19, 1)]
[(596.05, 373, 0), (602.5, 331, 4), (607.25, 186, 0), (610.2, 123, 6), (613.0, 232, 2), (616.55, 89, 0), (623.0, 56, 2)]


# Also needs some overlapping window for the groups.

df = pd.read_pickle('AXISBANK_20201124_2min.pickle')

findResistanceLevels(df, 'high', groupsize=10)
[(622.55, 171, 0), (617.5, 80, 6), (614.7, 113, 1), (612.0, 47, 1), (608.0, 23, 2)]

findSupportLevels(df, 'low', groupsize=10) 
findSupportLevels(df, 'low', groupsize=20) 
[(601.25, 0, 2), (606.55, 31, 1), (609.35, 52, 3), (611.9, 110, 4), (614.05, 86, 2), (618.45, 170, 0)]
[(601.25, 0, 1), (606.7, 41, 0), (609.5, 67, 1), (612.1, 121, 2), (614.35, 165, 0)]




# Not very relianbe but can be used for confirmations:
df.low.rolling(20).max().value_counts()
