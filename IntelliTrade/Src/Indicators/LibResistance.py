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

    Importance can also be analysed based on how many times the support/resistance line is crossed.

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

# data = pd.read_csv(r'E:\NotebookShare\Material\Python\Projects\KiteConnect\Data\HistoricalData\AXISBANK\DAILY\2MINUTE\2020\AXISBANK_2MINUTE_2020-11-25.csv') 
# dayDataFrame = data
# from Charts.CandleStickChart import plotCandleStickDayData
# resistanceLevelList = findResistanceLevels(dataframe=dayDataFrame, price_colname='high', groupsize=10, offset=5, resistance_validation_levels=3, value_thresholds=(1,2, 5), verbose=1, debug=0)
# resistanceLevelList = [item[0] for item in resistanceLevelList]
# plotCandleStickDayData(dayDataFrame=dayDataFrame, resistanceLevelList=resistanceLevelList, rLinecolor='Green')

# ----------------------------------------------------------------------------------------------------------------------