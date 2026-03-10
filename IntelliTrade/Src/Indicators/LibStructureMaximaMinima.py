import numpy as np
import pandas as pd


def checkLocalMaxima(column_series, index, threshold, n_points):
    """
    Function to check local Maxima by checking points around the index point. 
    Condition for a local Maxima:
        1. If all the points around the index point are smaller than than it
        2. If atleast one point on either side is more smaller than the threshold
    
    checkLocalMaxima(column_series=instrumentDF.SMA_3, index=12, threshold=10, n_points=4)
    """
    # Checking Condition-1
    try:
        for item_index in range(index-n_points, index+n_points+1):
            if column_series[item_index] <= column_series[index]:
                pass
            else:
                return False
        # 
        left_series = column_series[int(index-n_points):index]
        right_series = column_series[index+1:int(index+n_points)+1]
        # 
        if (column_series[index] - min(left_series) > threshold) and (column_series[index] - min(right_series) > threshold):
            pass
        else:
            return False
    except KeyError as k:
        return False
    # 
    return True


def findGroupMaxima(instrumentDF, column_name, group_size=8):
    """
    groupNMaximums = findGroupMaxima(instrumentDF=instrumentDF, column_name='SMA_3', group_size=8)
    """
    groupNMaximums= []
    column_series = instrumentDF[column_name]
    for index, value in column_series[group_size:].items():
        group = column_series[index-group_size+1: index+1]
        group = group.replace(np.nan, 0)
        max_value = max(group)
        max_index = group.idxmax()
        groupNMaximums.append((index, round(max_value, 2), max_index, instrumentDF.loc[max_index].trade_datetime, instrumentDF.loc[index].trade_datetime, instrumentDF.loc[index].trade_time))
    # 
    return groupNMaximums


def structureLocalMaximaOverIncrementalData_v1(instrumentDF, column_name, threshold_points):
    """
    Function to find the local maxima.
    Algorithm:
        1. An index-point becomes active when the highest_high - lowest_low > threshold_points, but 
        only when current_value is greater than previous highest_high. That is only when there is a 
        new highest_high. 
        2. highest_high_initialization_flag is used to re-initialize highest_high when 
        current_value - lowest_low > threshold_points. This is required only one time as post this
        maxima_active_index is set to true.
    # 
    structureLocalMaximaOverIncrementalData_v1(instrumentDF=instrumentDF[:30], column_name='SMA_3', threshold_points=25)
    structureLocalMaximaOverIncrementalData_v1(instrumentDF=instrumentDF, column_name='SMA_3', threshold_points=25)
    """
    lowest_low = instrumentDF[column_name].iloc[0]
    highest_high = instrumentDF[column_name].iloc[0]
    maxima_active_index = 0
    maxima_index_list = []
    # 
    for index, row in instrumentDF.iterrows():
        current_value = instrumentDF[column_name].iloc[index]
        # 
        if (current_value - lowest_low > threshold_points):
            if (highest_high is None) or (current_value >= highest_high):
                highest_high = current_value
                maxima_active_index = index
        # 
        if current_value <= lowest_low:
            lowest_low = current_value
        # 
        if (maxima_active_index is not None) and (highest_high - current_value >= threshold_points):
            maxima_index_list.append(maxima_active_index)
            maxima_active_index = None
            lowest_low = current_value
            highest_high = None
    # 
    return maxima_index_list


def structureLocalMinimaOverIncrementalData_v1(instrumentDF, column_name, threshold_points):
    """
    Function to find the local maxima.
    Algorithm:
        1. An index-point becomes active when the highest_high - lowest_low > threshold_points, but 
        only when current_value is greater than previous highest_high. That is only when there is a 
        new highest_high. 
        2. highest_high_initialization_flag is used to re-initialize highest_high when 
        current_value - lowest_low > threshold_points. This is required only one time as post this
        maxima_active_index is set to true.
    # 
    structureLocalMinimaOverIncrementalData_v1(instrumentDF=instrumentDF[:30], column_name='SMA_3', threshold_points=25)
    structureLocalMinimaOverIncrementalData_v1(instrumentDF=instrumentDF, column_name='SMA_3', threshold_points=25)
    """
    lowest_low = instrumentDF[column_name].iloc[0]
    highest_high = instrumentDF[column_name].iloc[0]
    minima_active_index = 0
    minima_index_list = []
    # 
    for index, row in instrumentDF.iterrows():
        current_value = instrumentDF[column_name].iloc[index]
        # 
        if (highest_high - current_value > threshold_points):
            if (lowest_low is None) or (current_value <= lowest_low):
                lowest_low = current_value
                minima_active_index = index
        # 
        if current_value >= highest_high:
            highest_high = current_value
        # 
        if (minima_active_index is not None) and (current_value - lowest_low >= threshold_points):
            minima_index_list.append(minima_active_index)
            minima_active_index = None
            highest_high = current_value
            lowest_low = None
    # 
    return minima_index_list


# --------------------------------------------------------------------------------------------------
# Development

# from LoadIndexHistoricalData import loadIndexHistoricalData

# trade_date = '20230113'
# instrumentDF = loadIndexHistoricalData(instrument_name='NIFTYBANK', start_date=trade_date, end_date=trade_date, interval='2MINUTE')
# addCCPCColumn(instrumentDF)
# addBodyMidPointColumn(instrumentDF)
# instrumentDF['SMA_3'] = talib.SMA(instrumentDF.body_midpoint, timeperiod=3)

# plotInstrumentChartWithSingleAxis(instrumentDF=instrumentDF, x_axis='trade_time', y_axis_1='body_midpoint', y_axis_2='SMA_3', color_2='black', linewidth_1=1)


# --------------------------------------------------------------------------------------------------

# groupNMaximums = findGroupMaxima(instrumentDF=instrumentDF, column_name='SMA_3', group_size=8)
# groupNMaximumsDF = pd.DataFrame.from_records(groupNMaximums)
# groupNMaximumsDF.columns = ['index', 'max_value', 'max_index', 'max_datetime', 'trade_datetime', 'trade_time']
# groupNMaximumsDF.max_value.unique()
# groupNMaximumsDF.max_index.unique()


# x_axis = 'trade_time'
# y_axis_1 = 'SMA_3'
# fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(9, 5))
# _x_axis = x_axis
# ax.set_xticks(ticks=instrumentDF.index, labels=instrumentDF[_x_axis], rotation=90, fontsize=8, minor=False)
# ax.grid(axis='both', color='black', linestyle='-', linewidth=0.1)
# # 
# x_axis = instrumentDF[_x_axis]
# y_axis = instrumentDF[y_axis_1]
# ax.plot(x_axis, y_axis, linewidth=0.4, alpha=0.5)
# ax.legend([y_axis_1])
# # 
# y_axis_1 = 'max_value'
# x_axis = groupNMaximumsDF[_x_axis]
# y_axis = groupNMaximumsDF[y_axis_1]
# ax.scatter(x_axis, y_axis, marker='.', color='green')
# ax.legend([y_axis_1])
# # 
# plt.show(block=False)



# groupNMaximumsDF['checkLocalMaxima'] = groupNMaximumsDF.max_index.apply(lambda x: checkLocalMaxima(column_series=instrumentDF.SMA_3, index=x, threshold=25, n_points=5))
# groupNMaximumsDFFiltered = groupNMaximumsDF[groupNMaximumsDF['checkLocalMaxima']]


# x_axis = 'trade_time'
# y_axis_1 = 'SMA_3'
# fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(9, 5))
# _x_axis = x_axis
# ax.set_xticks(ticks=instrumentDF.index, labels=instrumentDF[_x_axis], rotation=90, fontsize=8, minor=False)
# ax.grid(axis='both', color='black', linestyle='-', linewidth=0.1)
# # 
# x_axis = instrumentDF[_x_axis]
# y_axis = instrumentDF[y_axis_1]
# ax.plot(x_axis, y_axis, linewidth=0.4, alpha=0.5)
# ax.legend([y_axis_1])
# # 
# y_axis_1 = 'max_value'
# x_axis = groupNMaximumsDFFiltered[_x_axis]
# y_axis = groupNMaximumsDFFiltered['max_value']
# ax.scatter(x_axis, y_axis, marker='.', color='green')
# ax.legend([y_axis_1])
# # 
# plt.show(block=False)


# --------------------------------------------------------------------------------------------------

# maxima_index_list = structureLocalMaximaOverIncrementalData_v1(instrumentDF=instrumentDF.replace(np.nan, 0).copy(), column_name='SMA_3', threshold_points=25) # [2, 12, 37, 59, 127, 149]
# instrumentMaximaDF = instrumentDF.iloc[maxima_index_list]

# x_axis = 'trade_time'
# y_axis_1 = 'SMA_3'
# fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(9, 5))
# _x_axis = x_axis
# ax.set_xticks(ticks=instrumentDF.index, labels=instrumentDF[_x_axis], rotation=90, fontsize=8, minor=False)
# ax.grid(axis='both', color='black', linestyle='-', linewidth=0.1)
# # 
# x_axis = instrumentDF[_x_axis]
# y_axis = instrumentDF[y_axis_1]
# ax.plot(x_axis, y_axis, linewidth=0.4, alpha=0.5)
# ax.legend([y_axis_1])
# # 
# x_axis = instrumentMaximaDF[_x_axis]
# y_axis = instrumentMaximaDF['SMA_3']
# ax.scatter(x_axis, y_axis, marker='.', color='green')
# ax.legend([y_axis_1])
# # 
# plt.show(block=False)


# minima_index_list = structureLocalMinimaOverIncrementalData_v1(instrumentDF=instrumentDF.bfill().copy(), column_name='SMA_3', threshold_points=25)
# instrumentMinimaDF = instrumentDF.iloc[minima_index_list]

# x_axis = 'trade_time'
# y_axis_1 = 'SMA_3'
# fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(9, 5))
# _x_axis = x_axis
# ax.set_xticks(ticks=instrumentDF.index, labels=instrumentDF[_x_axis], rotation=90, fontsize=8, minor=False)
# ax.grid(axis='both', color='black', linestyle='-', linewidth=0.1)
# # 
# x_axis = instrumentDF[_x_axis]
# y_axis = instrumentDF[y_axis_1]
# ax.plot(x_axis, y_axis, linewidth=0.4, alpha=0.5)
# ax.legend([y_axis_1])
# # 
# x_axis = instrumentMaximaDF[_x_axis]
# y_axis = instrumentMaximaDF['SMA_3']
# ax.scatter(x_axis, y_axis, marker='.', color='green')
# ax.legend([y_axis_1])
# # 
# x_axis = instrumentMinimaDF[_x_axis]
# y_axis = instrumentMinimaDF['SMA_3']
# ax.scatter(x_axis, y_axis, marker='.', color='red')
# ax.legend([y_axis_1])
# # 
# plt.show(block=False)

# --------------------------------------------------------------------------------------------------

# def argrelextrema_v2(data, comparator, order=1, mode='clip', axis=0, ):
#     """
#     """
#     def _boolrelextrema(data, order=1, mode=mode, axis=axis, comparator=comparator):
#         datalen = data.shape[axis]
#         locs = np.arange(0, datalen)
#         results = np.ones(data.shape, dtype=bool)
#         main = data.take(locs, axis=axis, mode=mode)
#         for shift in range(1, order + 1):
#             plus = data.take(locs + shift, axis=axis, mode=mode)
#             minus = data.take(locs - shift, axis=axis, mode=mode)
#             results &= comparator(main, plus)
#             results &= comparator(main, minus)
#             if ~results.any():
#                 return results
#         return results
#     # 
#     results = _boolrelextrema(data=data, comparator=comparator, axis=axis, order=order, mode=mode)
#     return np.nonzero(results)


# max_index_list = argrelextrema_v2(data=instrumentDF.SMA_3.to_numpy(), comparator=np.greater, order=5)
# maximaDF = instrumentDF.take(list(max_index_list[0]))

# min_index_list = argrelextrema_v2(data=instrumentDF.SMA_3.to_numpy(), comparator=np.less, order=5)
# minimaDF = instrumentDF.take(list(min_index_list[0]))


# x_axis = 'trade_time'
# y_axis_1 = 'SMA_3'
# fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(9, 5))
# _x_axis = x_axis
# ax.set_xticks(ticks=instrumentDF.index, labels=instrumentDF[_x_axis], rotation=90, fontsize=8, minor=False)
# ax.grid(axis='both', color='black', linestyle='-', linewidth=0.1)
# # 
# x_axis = instrumentDF[_x_axis]
# y_axis = instrumentDF[y_axis_1]
# ax.plot(x_axis, y_axis, linewidth=0.4, alpha=0.5)
# ax.legend([y_axis_1])
# # 
# x_axis = maximaDF[_x_axis]
# y_axis = maximaDF[y_axis_1]
# ax.scatter(x_axis, y_axis, marker='.', color='green')
# ax.legend([y_axis_1])
# # 
# x_axis = minimaDF[_x_axis]
# y_axis = minimaDF[y_axis_1]
# ax.scatter(x_axis, y_axis, marker='.', color='red')
# ax.legend([y_axis_1])
# # 
# plt.show(block=False)


# # --------------------------------------------------------------------------------------------------

# def argrelextrema_v3(data, comparator, threshold, order=1, mode='clip', axis=0, ):
#     """
#     This means the different between the two consiquitive point should be greater than threshold. Which is not what is intended.
    
#     """
#     def _boolrelextrema(data, order=1, mode=mode, axis=axis, comparator=comparator):
#         datalen = data.shape[axis]
#         locs = np.arange(0, datalen)
#         results = np.ones(data.shape, dtype=bool)
#         main = data.take(locs, axis=axis, mode=mode)
#         for shift in range(1, order + 1):
#             plus = data.take(locs + shift, axis=axis, mode=mode)
#             minus = data.take(locs - shift, axis=axis, mode=mode)
#             results &= comparator(main, plus, threshold)
#             results &= comparator(main, minus, threshold)
#             if ~results.any():
#                 return results
#         return results
#     # 
#     results = _boolrelextrema(data=data, comparator=comparator, axis=axis, order=order, mode=mode)
#     return np.nonzero(results)


# def comparatorGreaterWithThreshold(x, y, threshold):
#     return x - y > threshold


# max_index_list = argrelextrema_v3(data=instrumentDF.SMA_3.to_numpy(), comparator=comparatorGreaterWithThreshold, threshold=10, order=1)
# maximaDF = instrumentDF.take(list(max_index_list[0]))

# --------------------------------------------------------------------------------------------------