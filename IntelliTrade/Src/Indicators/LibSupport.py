def incrementSupportTupleImpValue(supportTuple):
    a,b,c,d = supportTuple
    d = d + 1
    supportTuple = (a,b,c,d)
    return supportTuple

def incrementSupportImpValue(support_levels):
    for index in range(0, len(support_levels)):
        support_levels[index] = incrementSupportTupleImpValue(support_levels[index])
    return support_levels


def findMinimumValueWithinGroups(price_index_tuple, groupsize, offset=0, verbose=0):
    """
    Function to break the data into groups and find the maximum values in each groups.
    offset is used to define the starting point in the price_index_tuple.
    """
    groupNMinimums= []
    print(len(price_index_tuple)) if verbose >=1 else None
    # Below line is to take care of case when there is no values for the last loop
    inc = 0 if len(price_index_tuple) % groupsize == 0 else 1
    for i in range(0, int((len(price_index_tuple)-offset)/groupsize)+inc):
        tuple_sublist = price_index_tuple[(i*groupsize+offset): (i*groupsize+groupsize+offset)]
        max_price_tuple = min(tuple_sublist)
        groupNMinimums.append(max_price_tuple)
        if verbose:
            print(max_price_tuple, tuple_sublist[0][2], tuple_sublist[-1][2])
    return groupNMinimums


def supportValidation_Rule1(dataframe, support_index, price_column, nLevels=1, verbose=1):
    """
    Observed that sometimes due to grouping False support is generated, which needs further validation.
    This rule-1 check the immeidate N neighhoods of the proposed Support and see if it a True Support level

    supportValidation_Rule1(dataframe=dataframe, Support_index=100, price_column='high')
    """
    print(support_index) if verbose >=1 else None
    price_column='low'
    support = dataframe[price_column][support_index]
    # Checking if the Support/index is the last tick on the dataframe
    if dataframe.index.values[-nLevels] <= support_index:
        # Returning false if the Support_index passed to check the validity is the last element of the current dataframe
        return False
    if support_index -nLevels < 0:
        # Returning True if the Support_index passsed is among the start of the dat-nLevels
        return True
    for n in range(1, nLevels+1):
        if support > dataframe[price_column][support_index-n] or support > dataframe[price_column][support_index+n]:
            return False
    return True




def findSupportLevels(dataframe, price_colname, groupsize=10, offset=5, support_validation_levels=1, value_thresholds=(1,2,5), time_thresholds=(5, 10, 15), verbose=0, debug=0):
    """
    Logic same as in findResistanceLevels

    Usage:
    findSupportLevels(dataframe=data3, price_colname='high', groupsize=10, offset=5, verbose=1, debug=0)
    findSupportLevels(dataframe=data3[:100], price_colname='high', groupsize=10, offset=5, verbose=1, debug=0)
    SupportLevelList = findSupportLevels(dataframe=dayDataFrame, price_colname='high', groupsize=10, offset=5, support_validation_levels=3, value_thresholds=(1,2, 5), verbose=1, debug=0)
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
    set1 = set(findMinimumValueWithinGroups(price_index_tuple, groupsize=groupsize, offset=0, verbose=verbose))
    set2 = set(findMinimumValueWithinGroups(price_index_tuple, groupsize=groupsize, offset=offset, verbose=verbose))
    groupNMinimums = [item for item in set1.union(set2)]
    groupNMinimums.sort(key = lambda x: x[0])
    groupNMinimums.reverse()
    #
    print(groupNMinimums) if verbose >=1 else None
    # 
    groupNMinimums_modified = []
    for support_tuple in groupNMinimums:
        if supportValidation_Rule1(dataframe=dataframe, support_index=support_tuple[1], price_column=price_column, nLevels=support_validation_levels):
            groupNMinimums_modified.append(support_tuple)
        else:
            print('removed Support_tuple:', support_tuple) if verbose >=1 else None
    # 
    groupNMinimums = groupNMinimums_modified
    print('After supportValidation_Rule1:', groupNMinimums) if verbose >=1 else None
    #
    support_levels = []
    support_levels.append(groupNMinimums.pop()+(0,))
    #
    length = len(groupNMinimums)
    # 
    for _ in range(0, length):
        input() if debug else None
        item = groupNMinimums.pop()
        print('item:', item) if verbose >=1 else None
        if (abs(item[0]-support_levels[-1][0]) <= value_threshold1) and (abs(item[1]-support_levels[-1][1]) <= time_threshold1):
            # discard (very close to existing Support and time)
            # return False
            print('Discard-Reason1') if verbose >=1 else None
        elif (abs(item[0]-support_levels[-1][0]) <= value_threshold1) and (abs(item[1]-support_levels[-1][1]) > time_threshold1):
            # Again diccard it as it is close in value, but increment the all the above Support importance because it is far in time (means tested again)
            support_levels = incrementSupportImpValue(support_levels)
            print('Discard-Reason2') if verbose >=1 else None
            # return False
        elif (abs(item[0]-support_levels[-1][0]) > value_threshold1) and (abs(item[0]-support_levels[-1][0]) <= value_threshold2) and (abs(item[1]-support_levels[-1][1]) > time_threshold1):
            # Keep it but with reduced importance but no need to increase the importance of ohters as this Support will be added with (-1) importance
            support_levels.append(item+(-1,))
            print('Keep-Reason3') if verbose >=1 else None
            #
        elif (abs(item[0]-support_levels[-1][0]) > value_threshold2):
            # Keep it and increment importance of all previous Supports
            support_levels = incrementSupportImpValue(support_levels)
            support_levels.append(item+(0,))
            print('Keep-Reason4') if verbose >=1 else None
            #
        else:
            # 1. Due to moderate close to values but discarded due to close in time. (Any Support which is too close in time should be discarded)
            print('Discard-Reason5') if verbose >=1 else None
    #
    return support_levels


# ----------------------------------------------------------------------------------------------------------------------

data = pd.read_csv(r'E:\NotebookShare\Material\Python\Projects\KiteConnect\Data\HistoricalData\AXISBANK\DAILY\2MINUTE\2020\AXISBANK_2MINUTE_2020-11-25.csv') 
dayDataFrame = data
from Charts.CandleStickChart import plotCandleStickDayData
supportLevelList = findSupportLevels(dataframe=dayDataFrame, price_colname='low', groupsize=10, offset=5, support_validation_levels=3, value_thresholds=(1,2, 5), verbose=1, debug=0)
supportLevelList = [item[0] for item in supportLevelList]
plotCandleStickDayData(dayDataFrame=dayDataFrame, supportLevelList=supportLevelList, sLinecolor='Red')


plotCandleStickDayData(dayDataFrame=dayDataFrame, resistanceLevelList=resistanceLevelList, rLinecolor='Green', supportLevelList=supportLevelList, sLinecolor='Red') 
# ----------------------------------------------------------------------------------------------------------------------